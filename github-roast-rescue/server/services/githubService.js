import { config } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';

const GITHUB_API_BASE = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 10000;
const DEFAULT_PER_PAGE = 100;

// If GitHub rejects the configured token (401), stop sending it for the rest of the process.
let tokenRejected = false;

const getHeaders = (accept = 'application/vnd.github+json') => {
  const headers = {
    Accept: accept,
    'User-Agent': 'GitHub-Roast-Rescue-App',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (config.githubToken && !tokenRejected) {
    headers.Authorization = `Bearer ${config.githubToken}`;
  }
  return headers;
};

const isRateLimited = (response) =>
  response.status === 429 ||
  (response.status === 403 &&
    (response.headers.get('x-ratelimit-remaining') === '0' || response.headers.has('retry-after')));

const rateLimitError = (response) => {
  const reset = Number(response.headers.get('x-ratelimit-reset'));
  const minutes = reset ? Math.max(1, Math.ceil((reset * 1000 - Date.now()) / 60000)) : null;
  const hint = config.githubToken
    ? ''
    : ' Add a GITHUB_TOKEN to .env to raise the limit from 60 to 5000 requests/hour.';
  return new HttpError(
    429,
    `GitHub API rate limit reached${minutes ? ` (resets in about ${minutes} min)` : ''}.${hint}`
  );
};

const ghFetch = async (path, accept) => {
  const attempt = () =>
    fetch(`${GITHUB_API_BASE}${path}`, {
      headers: getHeaders(accept),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

  try {
    let response = await attempt();

    if (response.status === 401 && config.githubToken && !tokenRejected) {
      console.warn('[GitHub] GITHUB_TOKEN was rejected (401). Retrying without it.');
      tokenRejected = true;
      response = await attempt();
    }

    return response;
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new HttpError(504, 'GitHub took too long to respond. Please try again.');
    }
    throw new HttpError(502, 'Could not reach the GitHub API. Check your internet connection.');
  }
};

export const fetchUserProfile = async (username) => {
  const response = await ghFetch(`/users/${encodeURIComponent(username)}`);

  if (response.status === 404) {
    throw new HttpError(404, `GitHub user '${username}' not found.`);
  }
  if (isRateLimited(response)) throw rateLimitError(response);
  if (!response.ok) {
    throw new HttpError(502, `GitHub API error (${response.status}) while loading the profile.`);
  }

  return response.json();
};

// Fetch one repository page. Pagination is handled by fetchAllUserRepositories below.
export const fetchUserRepositoriesPage = async (username, page = 1, perPage = DEFAULT_PER_PAGE) => {
  const response = await ghFetch(
    `/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=pushed&direction=desc&type=owner`
  );

  if (response.status === 404) {
    throw new HttpError(404, `GitHub user '${username}' not found.`);
  }
  if (isRateLimited(response)) throw rateLimitError(response);
  if (!response.ok) {
    throw new HttpError(502, `GitHub API error (${response.status}) while loading repositories.`);
  }

  return response.json();
};

// Fetch all public repositories instead of silently stopping at the first 100.
export const fetchAllUserRepositories = async (username, expectedPublicRepos = null) => {
  const allRepos = [];
  const perPage = DEFAULT_PER_PAGE;
  let page = 1;
  const maxPages = 100; // Safety guard for unusually large accounts.

  while (page <= maxPages) {
    const repos = await fetchUserRepositoriesPage(username, page, perPage);
    allRepos.push(...repos);

    if (repos.length < perPage) break;
    if (Number.isFinite(expectedPublicRepos) && allRepos.length >= expectedPublicRepos) break;

    page += 1;
  }

  return allRepos;
};

// Fetch README while preserving the distinction between missing and unavailable.
export const fetchRepoReadme = async (owner, repoName) => {
  try {
    const response = await ghFetch(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/readme`,
      'application/vnd.github.raw+json'
    );

    if (isRateLimited(response)) throw rateLimitError(response);

    if (response.status === 404) {
      return { status: 'missing', content: null };
    }

    if (!response.ok) {
      return { status: 'unavailable', content: null };
    }

    return { status: 'ok', content: await response.text() };
  } catch (error) {
    if (error instanceof HttpError && error.status === 429) throw error;
    if (error instanceof HttpError) {
      return { status: 'unavailable', content: null };
    }
    return { status: 'unavailable', content: null };
  }
};
