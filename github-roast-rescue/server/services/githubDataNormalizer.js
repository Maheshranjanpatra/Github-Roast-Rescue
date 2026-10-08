import {
  fetchUserProfile,
  fetchAllUserRepositories,
  fetchRepoReadme
} from './githubService.js';

const DEEP_AUDIT_LIMIT = 5;
const RECENT_PROJECT_LIMIT = 3;
const README_EXCERPT_CHARS = 600;
const BOILERPLATE_README_CHARS = 120;

const daysSince = (isoDate) => {
  if (!isoDate) return null;
  const timestamp = new Date(isoDate).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, (Date.now() - timestamp) / (1000 * 60 * 60 * 24));
};

const selectDetailedRepositories = (originalRepos) => {
  if (originalRepos.length <= DEEP_AUDIT_LIMIT) return originalRepos;

  // Keep recent work visible, but reserve the remaining slots for projects
  // with stronger portfolio signals. This avoids making "latest 5" equal "best 5".
  const recent = originalRepos.slice(0, RECENT_PROJECT_LIMIT);
  const recentIds = new Set(recent.map((repo) => repo.id));

  const scoredCandidates = originalRepos
    .filter((repo) => !recentIds.has(repo.id))
    .map((repo) => {
      const ageDays = daysSince(repo.pushed_at);
      const recencyScore = ageDays === null ? 0 : Math.max(0, 20 - ageDays / 45);
      const popularityScore = Math.log1p(repo.stargazers_count || 0) * 4 + Math.log1p(repo.forks_count || 0) * 2;
      const presentationScore =
        (repo.description ? 8 : 0) +
        (repo.homepage ? 8 : 0) +
        (Array.isArray(repo.topics) && repo.topics.length ? 5 : 0) +
        (repo.license ? 4 : 0);

      return {
        repo,
        selectionScore: recencyScore + popularityScore + presentationScore
      };
    })
    .sort((a, b) => b.selectionScore - a.selectionScore);

  return [
    ...recent,
    ...scoredCandidates.slice(0, DEEP_AUDIT_LIMIT - recent.length).map((item) => item.repo)
  ];
};

const buildRepoMetadata = async (profileLogin, repo) => {
  const readmeResult = await fetchRepoReadme(profileLogin, repo.name);
  const readmeAvailable = readmeResult.status !== 'unavailable';
  const trimmed = readmeResult.content ? readmeResult.content.trim() : '';
  const readmeLength = trimmed.length;

  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || null,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    openIssues: repo.open_issues_count || 0,
    language: repo.language || null,
    sizeKb: repo.size || 0,
    archived: Boolean(repo.archived),
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    readmeStatus: readmeResult.status,
    readmeAvailable,
    hasReadme: readmeResult.status === 'ok' && readmeLength > 0,
    readmeExcerpt: trimmed.slice(0, README_EXCERPT_CHARS),
    readmeLength,
    hasBoilerplateReadme:
      readmeResult.status === 'ok' && readmeLength > 0 && readmeLength < BOILERPLATE_README_CHARS,
    htmlUrl: repo.html_url,
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    homepage: repo.homepage && repo.homepage.trim() ? repo.homepage.trim() : null,
    hasLicense: Boolean(repo.license)
  };
};

export const normalizeGitHubData = async (username) => {
  const profile = await fetchUserProfile(username);
  const rawRepos = await fetchAllUserRepositories(username, profile.public_repos);

  const originalRepos = rawRepos.filter((repo) => !repo.fork);
  const detailedSourceRepos = selectDetailedRepositories(originalRepos);

  const detailedRepos = await Promise.all(
    detailedSourceRepos.map((repo) => buildRepoMetadata(profile.login, repo))
  );

  const totalStars = originalRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = originalRepos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  const reposWithoutDescription = originalRepos.filter((r) => !r.description).length;
  const bio = profile.bio && profile.bio.trim() ? profile.bio.trim() : null;

  const activityRepos = originalRepos.map((repo) => ({
    pushedAt: repo.pushed_at,
    archived: Boolean(repo.archived)
  }));

  const recent30 = activityRepos.filter((r) => {
    const days = daysSince(r.pushedAt);
    return days !== null && days <= 30;
  }).length;
  const recent90 = activityRepos.filter((r) => {
    const days = daysSince(r.pushedAt);
    return days !== null && days <= 90;
  }).length;
  const recent180 = activityRepos.filter((r) => {
    const days = daysSince(r.pushedAt);
    return days !== null && days <= 180;
  }).length;
  const pushAges = activityRepos.map((r) => daysSince(r.pushedAt)).filter((d) => d !== null);

  return {
    profile: {
      username: profile.login,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
      bio: bio || 'No bio provided.',
      hasBio: Boolean(bio),
      publicRepos: profile.public_repos || 0,
      fetchedReposCount: rawRepos.length,
      originalReposCount: originalRepos.length,
      forkReposCount: rawRepos.filter((repo) => repo.fork).length,
      followers: profile.followers || 0,
      following: profile.following || 0,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      location: profile.location || null,
      blog: profile.blog && profile.blog.trim() ? profile.blog.trim() : null
    },
    metrics: {
      totalStars,
      totalForks,
      reposWithoutDescription,
      deepAuditCount: detailedRepos.length,
      deepAuditNames: detailedRepos.map((repo) => repo.name),
      reposWithoutReadme: detailedRepos.filter((r) => r.readmeStatus === 'missing').length,
      reposWithUnreadableReadme: detailedRepos.filter((r) => r.readmeStatus === 'unavailable').length,
      activity: {
        totalOriginalRepos: originalRepos.length,
        recent30,
        recent90,
        recent180,
        oldestPushDays: pushAges.length ? Math.round(Math.max(...pushAges)) : null
      }
    },
    repositories: detailedRepos
  };
};
