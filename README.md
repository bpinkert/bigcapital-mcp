# Bigcapital MCP Integration

A Model Context Protocol (MCP) server that exposes the
[Bigcapital](https://github.com/bigcapitalhq/bigcapital) REST API as tools
usable from Claude Desktop, Claude Code, or any MCP client. Generated from
Bigcapital's OpenAPI spec via [openapi-mcp-generator](https://github.com/harsha-iiiv/openapi-mcp-generator)
with hand-applied patches for JWT auth and tenant scoping.

Point it at your own Bigcapital instance and you can ask an LLM to draft an
invoice, look up a customer balance, categorize bank transactions, or pull a
profit-and-loss statement — in natural language, against your real books.

## What is Bigcapital?

[Bigcapital](https://bigcapital.app) is open-source accounting and inventory
software for small and medium businesses — a self-hostable alternative to
QuickBooks, Xero, and Wave. It is built on a real double-entry ledger, so
invoices, bills, expenses, and payments all post to accounts and roll up into
standard financial statements rather than living as flat records.

Feature areas include sales invoices, estimates and receipts, vendor bills and
credits, expenses, inventory items with landed-cost allocation and multiple
warehouses, bank feeds via Plaid with rule-based categorization, multi-currency
support, sales tax, and a reporting suite (balance sheet, P&L, general ledger,
trial balance, cash flow, A/R and A/P aging, and more).

The project is written in TypeScript, licensed **AGPL-3.0**, and maintained at
[github.com/bigcapitalhq/bigcapital](https://github.com/bigcapitalhq/bigcapital).
Self-host it with Docker using the
[deployment guide](https://docs.bigcapital.app/deployment/docker).

This MCP server is an independent community integration. It is not affiliated
with or endorsed by the Bigcapital project.

### Bigcapital resources

| | |
|---|---|
| Source code | https://github.com/bigcapitalhq/bigcapital |
| Website | https://bigcapital.app |
| Documentation | https://docs.bigcapital.app |
| API reference | https://docs.bigcapital.app/api-reference |
| Self-hosting (Docker) | https://docs.bigcapital.app/deployment/docker |
| Bug tracker | https://github.com/bigcapitalhq/bigcapital/issues |
| Community (Discord) | https://discord.com/invite/c8nPBJafeb |

You need a running Bigcapital instance before this server is of any use — it
talks to an existing deployment, it does not bundle or install one. The Docker
guide above is the fastest route to a local instance.

## What this server exposes

Roughly 340 tools, one per API operation, covering the full surface of the
Bigcapital REST API:

- **Sales** — invoices, estimates, receipts, credit notes, payments received,
  payment links, and Stripe integration.
- **Purchases** — bills, vendor credits, bill payments, landed-cost allocation.
- **Contacts** — customers, vendors, opening balances.
- **Accounting** — chart of accounts, manual journals, expenses, currencies and
  exchange rates, tax rates, transaction locking.
- **Banking** — bank accounts, Plaid connections, transaction categorization,
  matching, exclusion rules.
- **Inventory** — items, categories, adjustments, warehouses and transfers.
- **Reports** — balance sheet, profit and loss, general ledger, journal, trial
  balance, cash flow, A/R and A/P aging, inventory valuation, sales and
  purchases by item, customer and vendor balance summaries, sales tax liability.
- **Admin** — organization settings, users, roles and permissions, branches,
  PDF templates, import/export.

Because these tools write to real accounting records, treat access the same way
you would treat handing someone your books. Use a dedicated Bigcapital user with
only the permissions you actually need, and prefer a test organization while you
are getting a feel for it.

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
git clone https://github.com/bpinkert/bigcapital-mcp.git
cd bigcapital-mcp/server
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
      "args": ["/absolute/path/to/bigcapital-mcp/server/build/index.js"],
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
claude mcp add bigcapital -- node /absolute/path/to/bigcapital-mcp/server/build/index.js
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

The spec lives at `shared/sdk-ts/openapi.json` in the
[Bigcapital repo](https://github.com/bigcapitalhq/bigcapital).

```bash
# Pull fresh spec from a local checkout of bigcapitalhq/bigcapital
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

## Provenance

`openapi.json` is a lightly patched copy of the OpenAPI spec shipped by
[bigcapitalhq/bigcapital](https://github.com/bigcapitalhq/bigcapital), which is
licensed AGPL-3.0; that file carries its upstream terms. The `server/` code is
generated by [openapi-mcp-generator](https://github.com/harsha-iiiv/openapi-mcp-generator)
(MIT) from that spec, plus the local patches described above.
