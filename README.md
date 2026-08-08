# Bigcapital MCP Integration

A Model Context Protocol (MCP) server that exposes the Bigcapital REST API as
tools usable from Claude Desktop, Claude Code, or any MCP client. Generated
from Bigcapital's OpenAPI spec via [openapi-mcp-generator](https://github.com/harsha-iiiv/openapi-mcp-generator)
with hand-applied patches for JWT auth and tenant scoping.

## What's in here

- `openapi.json` — patched copy of Bigcapital's OpenAPI 3 spec (adds `servers`
  and a `bearerAuth` security scheme that were missing upstream).
- `server/` — the generated TypeScript MCP server, with local edits:
  - `src/auth.ts` — caches a JWT obtained from `/api/auth/signin` using
    `BIGCAPITAL_EMAIL` / `BIGCAPITAL_PASSWORD`, refreshes ~60s before `exp`,
    and force-refreshes once on any 401.
  - Auto-injects `Authorization: Bearer` and `organization-id` headers from
    the cached auth instead of forcing every tool call to pass them.
  - Fixes a TS type narrowing bug on `response.headers['content-type']`.
- `.mcp.json` — Claude Code project-scope MCP config pointing at `server/run.sh`.

## Setup on a new machine

Prereqs: Node.js 20+, a running Bigcapital instance you can reach over HTTP.

```bash
git clone <this-repo>
cd bigcapital-integration/server
npm install
npm run build
```

Create `server/.env`:

```
API_BASE_URL=http://<your-bigcapital-host>
BIGCAPITAL_EMAIL=<you>@example.com
BIGCAPITAL_PASSWORD='<your-password>'
# Optional. If unset, organization_id is taken from the signin response.
BIGCAPITAL_ORGANIZATION_ID=
```

The server signs in on startup and force-refreshes once on any 401, so you
never paste a JWT by hand. If your password contains `#`, single-quote it —
dotenv treats `#` as a comment marker otherwise.

If you'd rather use a static token (e.g. an API key prefixed with `bc_`), set
`BIGCAPITAL_BEARER_TOKEN=<token>` instead of email/password — but a static JWT
will not be auto-refreshed and will start returning 401s after ~24h.

## Wire it into Claude

### Claude Desktop

Edit `claude_desktop_config.json`:
- Linux: `~/.config/Claude/claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bigcapital": {
      "command": "node",
      "args": ["/absolute/path/to/bigcapital-integration/server/build/index.js"],
      "env": {
        "API_BASE_URL": "http://<your-bigcapital-host>",
        "BIGCAPITAL_EMAIL": "<you>@example.com",
        "BIGCAPITAL_PASSWORD": "<your-password>",
        "BIGCAPITAL_ORGANIZATION_ID": "<org-id, optional>"
      }
    }
  }
}
```

Restart Claude Desktop. New tools appear under the "bigcapital" server.

### Claude Code

From this directory:

```bash
claude mcp add bigcapital -- node /absolute/path/to/bigcapital-integration/server/build/index.js
```

Or use the project-scoped `.mcp.json` already in this repo (Claude Code picks
it up automatically when you `cd` here). Either way you'll need `.env` populated.

## Network reachability

`API_BASE_URL` needs to be reachable from wherever Claude runs. If your
Bigcapital instance is on a private LAN and you want to use it from a remote
machine, either:
- Expose it publicly (and put a proper auth layer in front).
- Run a tunnel — Tailscale and cloudflared both work fine here.

## Regenerating

If Bigcapital's OpenAPI spec changes:

```bash
# Pull fresh spec from Bigcapital repo
cp /path/to/bigcapital/shared/sdk-ts/openapi.json .
# Re-apply servers + securityScheme patches
jq '.servers = [{"url": "http://<your-host>"}] |
    .components.securitySchemes = {"bearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}} |
    .security = [{"bearerAuth": []}]' openapi.json > tmp && mv tmp openapi.json
# Regenerate
npx openapi-mcp-generator@latest -i ./openapi.json -o ./server -n bigcapital-mcp --force
# Re-apply the two local patches in server/src/index.ts (see commit history)
cd server && npm install && npm run build
```
