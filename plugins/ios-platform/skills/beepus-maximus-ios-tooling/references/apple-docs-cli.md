# Apple Docs CLI (xcdocs)

Local Apple-framework documentation lookup without leaving the terminal. Use during implementation to verify symbol names, check API shapes, explore new frameworks, and fix compile errors.

## Requirements

- macOS 26 or later, Apple silicon
- Xcode 26.3 RC or newer installed locally
- `xcdocs` available in the agent environment

## Commands

### Search

Semantic search against local Xcode documentation:

```bash
xcdocs search "swift testing" --limit 5 --omit-content --json
```

Flags:

| Flag | Purpose |
|---|---|
| `--framework <name>` | Constrain to one or more frameworks (repeatable). |
| `--kind <kind>` | Constrain to `article`, `symbol`, or `topic` (repeatable). |
| `--limit <n>` | Max results (default 10). |
| `--omit-content` | Skip full document bodies in results. |
| `--json` | Machine-readable output. |

### Get

Fetch the full documentation entry using its URI from search results:

```bash
xcdocs get /documentation/Testing --json
```

### Version

```bash
xcdocs version
```

## JSON Shapes

Search response (`search --json`):

```json
{
  "documents": [
    {
      "uri": "/documentation/Testing",
      "contents": null,
      "score": 0.75,
      "title": "Swift Testing"
    }
  ]
}
```

Get response (`get --json`):

```json
{
  "id": "/documentation/Testing",
  "framework": "Swift Testing",
  "kind": "symbol",
  "title": "Swift Testing",
  "content": "..."
}
```

## Recommended Flow

1. Search broadly: `xcdocs search "query" --omit-content --json`.
2. Add `--framework` or `--kind` when results are noisy.
3. Use `documents[].uri` as the canonical identifier for `get`.
4. Fetch the full entry: `xcdocs get <uri> --json`.
5. Apply what you find: fix symbol names, choose the right overload, adjust availability guards, or switch to the documented API.

## Common Uses

- Fix compile failures by verifying the actual symbol name and signature.
- Explore a newly released framework before wiring it into code.
- Distinguish between a symbol, a broader topic page, and an article with setup guidance.
- Find adjacent types or concepts after locating one relevant entry.

## Troubleshooting

- Availability error: verify macOS and Xcode version requirements.
- Noisy results: add `--framework` before tweaking the query text.
- Empty results: remove filters and broaden the natural-language query.
