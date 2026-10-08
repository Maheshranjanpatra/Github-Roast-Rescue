import assert from 'node:assert/strict';
import { calculateScores } from '../services/scoringEngine.js';

const repo = (overrides = {}) => ({
  name: 'demo',
  language: 'JavaScript',
  stars: 0,
  forks: 0,
  sizeKb: 50,
  description: 'A project',
  hasReadme: true,
  readmeStatus: 'ok',
  readmeLength: 500,
  topics: ['web'],
  homepage: 'https://example.com',
  hasLicense: true,
  pushedAt: new Date().toISOString(),
  ...overrides
});

// Activity must come from the profile-wide metric, not the five deep-audited repos.
{
  const detailed = Array.from({ length: 5 }, (_, i) => repo({ name: `repo-${i}` }));
  const scores = calculateScores({
    profile: { publicRepos: 100, originalReposCount: 100, forkReposCount: 0, hasBio: true, blog: null, location: null },
    metrics: {
      totalStars: 0,
      totalForks: 0,
      activity: { totalOriginalRepos: 100, recent30: 1, recent90: 2, recent180: 5, oldestPushDays: 900 }
    },
    repositories: detailed
  });

  assert.equal(scores.scoreDetails.activity.totalAnalyzed, 100);
  assert.equal(scores.scoreDetails.activity.recent30, 1);
  assert.ok(scores.activity < 20, 'mostly inactive profiles should not score as highly active');
}

// Unknown README checks must not become false "missing README" evidence.
{
  const scores = calculateScores({
    profile: { publicRepos: 1, originalReposCount: 1, forkReposCount: 0, hasBio: false, blog: null, location: null },
    metrics: { activity: { totalOriginalRepos: 1, recent30: 0, recent90: 0, recent180: 0, oldestPushDays: 400 } },
    repositories: [repo({ readmeStatus: 'unavailable', hasReadme: false, readmeLength: 0 })]
  });

  assert.equal(scores.scoreDetails.documentation.unknownReadmes, 1);
  assert.equal(scores.scoreDetails.documentation.readmeRatio, 0);
}

// Profile-wide originality must use public repo count, not the number returned by one page.
{
  const scores = calculateScores({
    profile: { publicRepos: 250, originalReposCount: 200, forkReposCount: 50, hasBio: true, blog: null, location: null },
    metrics: { activity: { totalOriginalRepos: 200, recent30: 0, recent90: 0, recent180: 0, oldestPushDays: 500 } },
    repositories: [repo()]
  });

  assert.equal(scores.scoreDetails.portfolio.originalRepoRatio, 80);
}

console.log('scoringEngine tests passed');
