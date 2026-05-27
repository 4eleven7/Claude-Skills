# GitHub CLI Reference

Quick reference for `gh` commands used during finalization and CI workflows.

## Pull Requests

```bash
# Check CI status on a PR
gh pr checks <number>

# View PR details
gh pr view <number>

# Create a PR
gh pr create --title "title" --body "body"
```

## CI Runs

```bash
# List recent workflow runs
gh run list --limit 10

# View a specific run (shows which steps failed)
gh run view <run-id>

# View logs for failed steps only
gh run view <run-id> --log-failed
```

## API Queries

```bash
# Get PR with specific fields
gh api repos/{owner}/{repo}/pulls/<number> --jq '.title, .state, .user.login'
```

## JSON Output

Most commands support `--json` for structured output with `--jq` filtering:

```bash
gh issue list --json number,title --jq '.[] | "\(.number): \(.title)"'
gh pr list --json number,title,state --jq '.[] | select(.state == "OPEN")'
```

## Notes

- When not in a git directory, add `--repo owner/repo` to commands.
- Use `gh api` for data not available through subcommands.
