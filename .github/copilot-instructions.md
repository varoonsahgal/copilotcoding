# Repository instructions

This repository is a Node.js Express service used for a GitHub Copilot coding agent lab.

## Goals
- Keep changes minimal and production-oriented.
- Prefer small, targeted fixes over broad rewrites.
- Preserve existing public API behavior unless issue requirements explicitly say otherwise.

## Build and validation
Before considering work complete:
1. Run `npm test`
2. Ensure retry behavior is covered with tests
3. Do not remove existing tests unless they are replaced with stronger ones

## Coding expectations
- Use modern ESM JavaScript
- Favor readable, maintainable code
- Add helper functions if they improve clarity
- Avoid excessive abstraction
- Include comments only where they add real value

## Incident-specific guidance
For retry logic:
- Respect `Retry-After` when handling 429 responses
- Avoid retrying on all 4xx responses
- Retry only where behavior is sensible and safe
- Keep logging useful but not excessively noisy
