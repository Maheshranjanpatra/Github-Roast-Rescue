import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { buildRecruiterPrompt } from '../prompts/recruiterAnalysis.js';

const genAI = config.geminiApiKey ? new GoogleGenerativeAI(config.geminiApiKey) : null;

const MODEL_TIMEOUT_MS = 25000;
const MAX_MODELS_TO_TRY = 2;

const IMPACTS = { high: 'High', medium: 'Medium', low: 'Low' };
const PRIORITIES = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };

const str = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Gemini should return bare JSON, but be tolerant of code fences or stray text around it
const parseJson = (text) => {
  const cleaned = String(text || '')
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end <= start) throw new Error('AI response contained no JSON object.');
    return JSON.parse(cleaned.slice(start, end + 1));
  }
};

// Guarantees the shape the frontend expects. Any field that is missing or malformed becomes null
// so the controller can fall back to the deterministic version of just that field.
const sanitizeAnalysis = (raw, repoNames) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const allowedTargets = new Set([...repoNames, 'Profile']);

  const headline = str(raw.roast?.headline, 300);
  const punchline = str(raw.roast?.punchline, 800);
  const verdict = str(raw.roast?.verdict, 160);
  const roast = headline && punchline && verdict ? { headline, punchline, verdict } : null;

  const evidence = (Array.isArray(raw.evidence) ? raw.evidence : [])
    .map((item) => ({
      repo: str(item?.repo, 120),
      issue: str(item?.issue, 300),
      impact: IMPACTS[str(item?.impact, 20).toLowerCase()] || 'Medium'
    }))
    .filter((item) => item.issue && allowedTargets.has(item.repo))
    .slice(0, 8);

  const rescuePlan = (Array.isArray(raw.rescuePlan) ? raw.rescuePlan : [])
    .map((task) => ({
      priority: PRIORITIES[str(task?.priority, 20).toLowerCase()] || 'MEDIUM',
      title: str(task?.title, 160),
      targetRepo: str(task?.targetRepo, 120),
      action: str(task?.action, 600),
      before: str(task?.before, 1500),
      after: str(task?.after, 4000)
    }))
    .filter((task) => task.title && task.action && allowedTargets.has(task.targetRepo))
    .slice(0, 6)
    .map((task, i) => ({ id: `task-${i + 1}`, ...task }));

  if (!roast && evidence.length === 0 && rescuePlan.length === 0) return null;

  return {
    roast,
    evidence: evidence.length ? evidence : null,
    rescuePlan: rescuePlan.length ? rescuePlan : null
  };
};

export const generateAIAnalysis = async (normalizedData, scores) => {
  if (!genAI) return null;

  const prompt = buildRecruiterPrompt(normalizedData, scores);
  const repoNames = normalizedData.repositories.map((r) => r.name);

  for (const modelName of config.geminiModels.slice(0, MAX_MODELS_TO_TRY)) {
    try {
      const model = genAI.getGenerativeModel(
        {
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' }
        },
        { timeout: MODEL_TIMEOUT_MS }
      );

      const result = await model.generateContent(prompt);
      const analysis = sanitizeAnalysis(parseJson(result.response.text()), repoNames);

      if (analysis) return analysis;
      console.error(`[AI Service] ${modelName} returned unusable JSON.`);
    } catch (error) {
      console.error(`[AI Service Error] ${modelName}:`, error.message);
    }
  }

  return null; // Graceful fallback to deterministic output
};
