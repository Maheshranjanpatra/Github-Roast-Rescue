import { MOCK_PRESETS } from '../data/mockPresets.js';
import { normalizeGitHubData } from '../services/githubDataNormalizer.js';
import { calculateScores } from '../services/scoringEngine.js';
import { generateAIAnalysis } from '../services/aiService.js';
import { HttpError } from '../middleware/errorHandler.js';

// GitHub usernames: 1-39 chars, letters/digits/single hyphens, no leading or trailing hyphen
const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

const CACHE_TTL_AI_MS = 10 * 60 * 1000;
const CACHE_TTL_FALLBACK_MS = 60 * 1000;
const CACHE_MAX_ENTRIES = 200;

const cache = new Map(); // key -> { expiresAt, payload }
const inFlight = new Map(); // key -> Promise

const getCached = (key) => {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.payload;
};

const setCached = (key, payload, ttl) => {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    cache.delete(cache.keys().next().value); // evict oldest
  }
  cache.set(key, { expiresAt: Date.now() + ttl, payload });
};

const buildFallbackEvidence = (normalizedData) => {
  const items = [];
  for (const r of normalizedData.repositories) {
    if (r.readmeStatus === 'missing') {
      items.push({ repo: r.name, issue: 'README.md is missing', impact: 'High' });
    } else if (r.readmeStatus === 'unavailable') {
      items.push({ repo: r.name, issue: 'README could not be checked because GitHub did not return it', impact: 'Low' });
    } else if (r.hasBoilerplateReadme) {
      items.push({
        repo: r.name,
        issue: `README is only ${r.readmeLength} characters long`,
        impact: 'Medium'
      });
    }
    if (!r.description) {
      items.push({ repo: r.name, issue: 'No repository description provided', impact: 'Medium' });
    }
  }
  return items.slice(0, 8);
};

const buildFallbackRescuePlan = (normalizedData) => {
  const { profile, repositories } = normalizedData;
  const tasks = [];

  repositories
    .filter((r) => r.readmeStatus === 'missing')
    .slice(0, 2)
    .forEach((r) => {
      tasks.push({
        priority: 'HIGH',
        title: `Write a README for ${r.name}`,
        targetRepo: r.name,
        action: 'Add a project overview, a screenshot, the tech stack and setup steps.',
        before: '(no README)',
        after: `# ${r.name}\n\n${r.description || 'One-sentence summary of what this project does.'}\n\n## Tech Stack\n- ${r.language || 'List your main technologies here'}\n\n## Getting Started\n1. Clone the repository\n2. Install dependencies\n3. Run the project\n\n## Screenshots\nAdd one or two screenshots here.`
      });
    });

  if (!profile.hasBio) {
    tasks.push({
      priority: 'HIGH',
      title: 'Add a profile bio',
      targetRepo: 'Profile',
      action: 'Write one line covering your role, your main stack and what you are looking for.',
      before: '(no bio)',
      after: 'Student Developer | React, Node.js, Python | Building web apps | Open to internships'
    });
  }

  const noDescription = repositories.find((r) => r.readmeStatus === 'ok' && r.hasReadme && !r.description);
  if (noDescription) {
    tasks.push({
      priority: 'MEDIUM',
      title: `Add a description to ${noDescription.name}`,
      targetRepo: noDescription.name,
      action: 'Set a one-line description in the repository settings so it shows up in your profile grid.',
      before: '(no description)',
      after: 'One clear sentence: what it does, for whom, and the main technology.'
    });
  }

  return tasks.slice(0, 5).map((t, i) => ({ id: `task-${i + 1}`, ...t }));
};

const runAnalysis = async (username) => {
  // 1. Fetch & normalize live GitHub data
  const normalizedData = await normalizeGitHubData(username);

  // 2. Compute deterministic baseline scores
  const scores = calculateScores(normalizedData);

  // 3. Ask Gemini for the roast and rescue plan (null if it fails)
  const aiAnalysis = await generateAIAnalysis(normalizedData, scores);

  // 4. Assemble the response, falling back per field to deterministic output
  const { profile, metrics } = normalizedData;

  const fallbackRoast = {
    headline: `Public Profile Audit for @${profile.username}`,

    punchline:
      `Found ${profile.originalReposCount} original projects. ` +
      `Your recruiter-readiness score is ${scores.overall}/100, ` +
      `with Documentation at ${scores.documentation}/100 and ` +
      `Technical Signal at ${scores.technical}/100.`,

    verdict:
      scores.overall >= 85
        ? 'Strong Interview Material'
        : scores.overall >= 70
          ? 'Worth a Closer Look'
          : scores.overall >= 55
            ? 'Needs Portfolio Polish'
            : 'Needs Rescue Intervention'
  };

  const data = {
    profile,
    scores,
    roast: aiAnalysis?.roast || fallbackRoast,
    evidence: aiAnalysis?.evidence || buildFallbackEvidence(normalizedData),
    rescuePlan: aiAnalysis?.rescuePlan || buildFallbackRescuePlan(normalizedData)
  };

  return {
    source: aiAnalysis ? 'live_gemini_ai' : 'live_github_api',
    data,
    ttl: aiAnalysis ? CACHE_TTL_AI_MS : CACHE_TTL_FALLBACK_MS
  };
};

export const analyzeProfile = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { username, isPreset, presetType } = body;

    // 1. Fast-path offline preset handling for Judge Demos
    if (isPreset === true) {
      if (typeof presetType !== 'string' || !Object.hasOwn(MOCK_PRESETS, presetType)) {
        throw new HttpError(400, 'Unknown preset.');
      }
      return res.status(200).json({
        success: true,
        source: 'cached_preset',
        data: MOCK_PRESETS[presetType]
      });
    }

    // 2. Validate username before it goes anywhere near a URL
    if (typeof username !== 'string' || !username.trim()) {
      throw new HttpError(400, 'GitHub username is required.');
    }
    const cleanUsername = username.trim();
    if (!USERNAME_REGEX.test(cleanUsername)) {
      throw new HttpError(400, 'That is not a valid GitHub username.');
    }

    // 3. Serve from cache, or share one in-flight request between identical callers
    const key = cleanUsername.toLowerCase();

    const cached = getCached(key);
    if (cached) {
      return res.status(200).json({ success: true, source: cached.source, cached: true, data: cached.data });
    }

    let pending = inFlight.get(key);
    if (!pending) {
      pending = runAnalysis(cleanUsername)
        .then((result) => {
          setCached(key, { source: result.source, data: result.data }, result.ttl);
          return result;
        })
        .finally(() => inFlight.delete(key));
      inFlight.set(key, pending);
    }

    const result = await pending;
    return res.status(200).json({ success: true, source: result.source, cached: false, data: result.data });
  } catch (error) {
    return next(error);
  }
};
