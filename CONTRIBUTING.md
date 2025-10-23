# Contributing to Primal Ape

Thanks for wanting to contribute — contributions that clearly explain the problem and value are easiest to review and merge.

## How to get started

1. Check existing issues to avoid duplication. If none exist, open an issue describing the problem or feature you'd like to add.
2. Create a clear branch name:

```bash
git checkout -b feat/short-description
```

3. Implement your change. Keep changes focused and split large work into multiple PRs when possible.

## Pull request checklist

When opening a PR, please include:

- A short, descriptive title.
- A one-paragraph summary explaining the problem and why your change matters to users (the impact).
- A list of changed files and the core implementation idea.
- Manual steps to verify the change locally (commands to run, example messages to send to the bot).
- Any tests you added or notes about why tests aren't included.

Example PR description:

- Problem: Users had to manually update a JSON file to reset balances after testing.
- Solution: Added a `resetBalances` command that atomically updates the file and validates input.
- Impact: Makes testing easier and prevents partial writes that previously required manual fixes.

## Code style & testing

- Keep command handlers small and focused.
- Validate inputs and provide helpful error messages to users.
- Add tests for core logic where practical. If you add a command, include at least one unit test for the handler logic.

## How to run locally

1. Install dependencies:

```cmd
npm install
```

2. Start the bot locally:

```cmd
node prime.js
```

(Inspect `prime.js` to see required environment variables or flags.)

## Adding a new command

- Place new command files under `commands/<category>/`.
- Follow the existing handler convention used by other commands in that folder.
- Validate arguments and check permission/role requirements where applicable.
- Add or update tests that exercise the command logic (not necessarily platform I/O).

## Writing better PR descriptions

When describing your change, focus on:

- The problem you solved (what was wrong or missing).
- The approach you took (concise implementation notes).
- The impact for users (what's better now).

This is not bragging — it's useful context that helps reviewers and future maintainers understand why a change was made.

## Review & merge

- Maintainers will review PRs for correctness, clarity, and tests.
- We may ask for small changes; please respond to review comments promptly.

If you have questions or need help, open an issue and mention the maintainer(s) in the thread.
