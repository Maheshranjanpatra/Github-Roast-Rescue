const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(Number(value) || 0, min), max);

const round = (value) => Math.round(Number(value) || 0);

const ratio = (count, total) => {
  if (!total) return 0;
  return clamp(count / total, 0, 1);
};

const daysSince = (isoDate) => {
  if (!isoDate) return null;
  const timestamp = new Date(isoDate).getTime();
  if (!Number.isFinite(timestamp)) return null;
  const days = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  return Number.isFinite(days) ? Math.max(0, days) : null;
};

const getReadmeQuality = (repo) => {
  if (!repo) return 0;

  // An unavailable README is an unknown, not a missing README.
  if (repo.readmeStatus === 'unavailable') return null;
  if (!repo.hasReadme) return 0;

  if (repo.readmeSignals) {
    const signals = repo.readmeSignals;
    const checks = [
      Boolean(signals.hasInstallation),
      Boolean(signals.hasUsage),
      Boolean(signals.hasFeatures),
      Boolean(signals.hasTechStack),
      Boolean(signals.hasScreenshots),
      Boolean(signals.hasDemo),
      Boolean(signals.hasLicenseSection)
    ];
    return clamp(35 + checks.filter(Boolean).length * 8, 35, 91);
  }

  const length = Number(repo.readmeLength) || 0;
  if (length < 120) return 35;
  if (length < 300) return 45;
  if (length < 600) return 58;
  if (length < 1000) return 70;
  if (length < 1600) return 82;
  return 90;
};

const getRepoCompleteness = (repo) => {
  if (!repo) return 0;
  let score = 0;
  if (repo.description) score += 20;
  if (repo.hasReadme) score += 25;
  if (repo.topics?.length > 0) score += 15;
  if (repo.homepage) score += 20;
  if (repo.hasLicense) score += 20;
  return clamp(score);
};

const getSubstantialProjectSignal = (repo) => {
  let points = 0;
  const sizeKb = Number(repo.sizeKb) || 0;
  const stars = Number(repo.stars) || 0;

  if (sizeKb >= 100) points += 20;
  else if (sizeKb >= 40) points += 14;
  else if (sizeKb >= 10) points += 8;

  if (repo.description) points += 10;
  if (repo.hasReadme) points += 10;
  if (getReadmeQuality(repo) >= 60) points += 10;
  if (repo.topics?.length > 0) points += 5;
  if (stars > 0) points += 10;

  return clamp(points);
};

const calculateTechnicalSignal = (repositories, metrics) => {
  const total = repositories.length;
  if (!total) return { score: 15, details: { languageCount: 0, languages: [], languageScore: 0, substanceScore: 0, engineeringSignalScore: 0, shippedScore: 0, tractionScore: 0 } };

  const languages = new Set(repositories.map((repo) => repo.language).filter(Boolean));
  const languageCount = languages.size;
  const languageScore = languageCount >= 4 ? 20 : languageCount === 3 ? 18 : languageCount === 2 ? 14 : languageCount === 1 ? 9 : 0;

  const substanceAverage = repositories.reduce((sum, repo) => sum + getSubstantialProjectSignal(repo), 0) / total;
  const substanceScore = substanceAverage * 0.30;

  const completenessAverage = repositories.reduce((sum, repo) => sum + getRepoCompleteness(repo), 0) / total;
  const engineeringSignalScore = completenessAverage * 0.20;

  // "Shipping" is deliberately limited to evidence the GitHub API actually exposes.
  // A homepage is stronger evidence than a license, so they are weighted separately.
  const homepageCount = repositories.filter((repo) => Boolean(repo.homepage)).length;
  const licenseCount = repositories.filter((repo) => Boolean(repo.hasLicense)).length;
  const shippedScore = ratio(homepageCount, total) * 10 + ratio(licenseCount, total) * 5;

  const stars = Number(metrics.totalStars) || 0;
  const forks = Number(metrics.totalForks) || 0;
  const tractionScore = clamp(Math.log1p(stars) * 3 + Math.log1p(forks) * 2, 0, 15);

  const totalScore = round(languageScore + substanceScore + engineeringSignalScore + shippedScore + tractionScore);

  return {
    score: clamp(totalScore),
    details: {
      languageCount,
      languages: [...languages],
      languageScore: round(languageScore),
      substanceScore: round(substanceScore),
      engineeringSignalScore: round(engineeringSignalScore),
      shippedScore: round(shippedScore),
      tractionScore: round(tractionScore)
    }
  };
};

const calculateDocumentation = (repositories) => {
  const total = repositories.length;
  if (!total) {
    return { score: 10, details: { readmeRatio: 0, descriptionRatio: 0, averageReadmeQuality: 0, screenshotCount: 0, demoCount: 0, unknownReadmes: 0 } };
  }

  const knownRepos = repositories.filter((repo) => repo.readmeStatus !== 'unavailable');
  const denominator = knownRepos.length || total;
  const withReadme = knownRepos.filter((repo) => repo.hasReadme);
  const withDescription = repositories.filter((repo) => repo.description);
  const unknownReadmes = repositories.filter((repo) => repo.readmeStatus === 'unavailable').length;

  const readmeRatio = ratio(withReadme.length, denominator);
  const descriptionRatio = ratio(withDescription.length, total);
  const qualityValues = knownRepos.map(getReadmeQuality).filter((value) => value !== null);
  const averageReadmeQuality = qualityValues.length
    ? qualityValues.reduce((sum, value) => sum + value, 0) / qualityValues.length
    : 0;

  const screenshotCount = repositories.filter((repo) => repo.readmeSignals?.hasScreenshots).length;
  const demoCount = repositories.filter((repo) => repo.readmeSignals?.hasDemo || repo.homepage).length;

  const score = round(
    readmeRatio * 35 +
    (averageReadmeQuality / 100) * 30 +
    descriptionRatio * 20 +
    ratio(screenshotCount + demoCount, total * 2) * 15
  );

  return {
    score: clamp(score),
    details: {
      readmeRatio: round(readmeRatio * 100),
      descriptionRatio: round(descriptionRatio * 100),
      averageReadmeQuality: round(averageReadmeQuality),
      screenshotCount,
      demoCount,
      unknownReadmes
    }
  };
};

const calculateActivity = (metrics) => {
  const activity = metrics?.activity || {};
  const total = Number(activity.totalOriginalRepos) || 0;

  if (!total) {
    return { score: 10, details: { recent30: 0, recent90: 0, recent180: 0, oldestPushDays: null, totalAnalyzed: 0 } };
  }

  const recent30 = Number(activity.recent30) || 0;
  const recent90 = Number(activity.recent90) || 0;
  const recent180 = Number(activity.recent180) || 0;

  const score =
    ratio(recent30, total) * 50 +
    ratio(recent90, total) * 35 +
    ratio(recent180, total) * 15;

  return {
    score: clamp(round(score)),
    details: {
      recent30,
      recent90,
      recent180,
      oldestPushDays: activity.oldestPushDays ?? null,
      totalAnalyzed: total
    }
  };
};

const calculatePortfolio = (profile, repositories) => {
  const total = repositories.length;

  let profileScore = 0;
  if (profile.hasBio) profileScore += 15;
  if (profile.blog) profileScore += 10;
  if (profile.location) profileScore += 5;

  const publicRepos = Number(profile.publicRepos) || 0;
  const original = Number(profile.originalReposCount) || 0;
  const forkCount = Number(profile.forkReposCount) || Math.max(0, publicRepos - original);
  const originalRatio = publicRepos > 0 ? clamp(original / publicRepos) : 1;
  const originalityScore = originalRatio * 20;

  let curatedRepos = 0;
  for (const repo of repositories) {
    const hasPresentation = Boolean(repo.description) || Boolean(repo.hasReadme);
    const hasProof = Boolean(repo.homepage) || Boolean(repo.topics?.length) || Boolean(repo.stars);
    if (hasPresentation && hasProof) curatedRepos++;
  }

  const curationScore = ratio(curatedRepos, total) * 40;
  const score = round(profileScore + originalityScore + curationScore);

  return {
    score: clamp(score),
    details: {
      hasBio: Boolean(profile.hasBio),
      hasBlog: Boolean(profile.blog),
      hasLocation: Boolean(profile.location),
      originalRepoRatio: round(originalRatio * 100),
      curatedRepos,
      publicRepos,
      originalRepos: original,
      forkRepos: forkCount
    }
  };
};

const getScoreBand = (score) => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Developing';
  return 'Needs Work';
};

export const calculateScores = (normalizedData) => {
  const safeRepositories = Array.isArray(normalizedData?.repositories) ? normalizedData.repositories : [];
  const profile = normalizedData?.profile || {};
  const metrics = normalizedData?.metrics || {};

  const technicalResult = calculateTechnicalSignal(safeRepositories, metrics);
  const documentationResult = calculateDocumentation(safeRepositories);
  const activityResult = calculateActivity(metrics);
  const portfolioResult = calculatePortfolio(profile, safeRepositories);

  const overall = round(
    technicalResult.score * 0.30 +
    documentationResult.score * 0.30 +
    activityResult.score * 0.20 +
    portfolioResult.score * 0.20
  );

  return {
    overall: clamp(overall, 15, 98),
    technical: clamp(technicalResult.score),
    documentation: clamp(documentationResult.score),
    activity: clamp(activityResult.score),
    portfolio: clamp(portfolioResult.score),
    scoreBands: {
      overall: getScoreBand(overall),
      technical: getScoreBand(technicalResult.score),
      documentation: getScoreBand(documentationResult.score),
      activity: getScoreBand(activityResult.score),
      portfolio: getScoreBand(portfolioResult.score)
    },
    scoreDetails: {
      technical: technicalResult.details,
      documentation: documentationResult.details,
      activity: activityResult.details,
      portfolio: portfolioResult.details
    }
  };
};
