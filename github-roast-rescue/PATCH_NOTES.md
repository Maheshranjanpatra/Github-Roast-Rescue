# Logic Patch Notes

## Fixed

- Repository pagination: analysis no longer silently stops at the first 100 repositories.
- Activity scoring: uses all original repositories instead of the five deep-audited repositories.
- Deep audit selection: keeps recent projects but also selects high-signal older projects instead of simply using the newest five.
- README state: missing and unavailable README responses are now distinct.
- Documentation scoring: an API failure no longer becomes a false missing README.
- Portfolio originality: uses the user's profile-wide public repository count.
- Shipping score: homepage and license are separated instead of treating a license as proof that a project is shipped.
- Fallback roast/rescue logic: does not falsely claim a README is missing when GitHub could not check it.
- Removed duplicate unused `server/services/scoringEngine(c).js`.
- Added deterministic scoring regression tests.

## Deliberate design

Only a small set of repositories are deeply inspected because README fetching is more expensive. Profile-wide metrics are calculated from all fetched public repositories. This prevents expensive per-repository README analysis from becoming a hidden limit on activity/originality scoring.
