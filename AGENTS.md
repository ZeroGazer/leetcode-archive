# AGENTS.md

## Commands

```bash
yarn start  # Run archive script (uses tsx)
yarn build # TypeScript compile
```

## Required env vars

- `LEETCODE_COOKIE` - LeetCode session cookie (required for API)
- `AUTHOR` - Git author name
- `AUTHOR_EMAIL` - Git author email

## Architecture

- Entry: `src/index.ts`
- Fetches accepted LeetCode submissions newer than last commit in `./leetcode` directory
- Writes code files to `leetcode/{titleSlug}/{language}` and commits with original timestamp
- Requires external repo cloned at `leetcode/`: `git clone https://github.com/ZeroGazer/leetcode leetcode`

## CI

- Runs daily at midnight (self-hosted runner)
- See `.github/workflows/github-actions.yml`