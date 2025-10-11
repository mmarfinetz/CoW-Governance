# MCP Server Setup Complete ✓

Successfully configured 7 MCP servers for Claude Desktop tailored to your CoW Protocol Governance Dashboard project.

## What Was Installed

### 🔗 Blockchain & DeFi Servers (New)

1. **Dune MCP** (`@modelcontextprotocol/server-dune`)
   - Query your existing Dune dashboards directly from Claude
   - Uses your existing API key: `UnAK6FzAyfSrSWzQwMgXKfZnuMomp6OP`
   - Perfect for: Treasury data, solver metrics, revenue analytics

2. **CoinGecko MCP** (`@coingecko/mcp-server`)
   - Real-time crypto prices, market caps, DEX data via GeckoTerminal
   - Uses your existing API key: `CG-CeTpPjN5tsmzy7SMKiVdQZLN`
   - Perfect for: Price panels, token metrics, market data

3. **DeFiLlama MCP** (`mcp-server-defillama`)
   - Protocol TVL, fees, chain statistics
   - No API key required
   - Perfect for: CoW Protocol metrics, competitor analysis

### 🛠 Development Tools (New)

4. **Playwright MCP** (`@playwright/mcp`)
   - Browser automation for testing
   - Perfect for: E2E tests, scraping with consent

5. **AntV Chart MCP** (`@antv/mcp-server-chart`)
   - Generate 20+ chart types from data
   - Perfect for: Quick dashboard prototyping

6. **Fetch MCP** (`@modelcontextprotocol/server-fetch`)
   - Simple HTTP/JSON fetcher for any public API
   - Perfect for: CoW API, Safe API, Snapshot queries

### 📦 Existing Servers (Preserved)

7. **claude-code** - Claude Code MCP integration
8. **railway-mcp** - Railway deployment tools

---

## 🚀 Next Steps

### 1. Restart Claude Desktop

**IMPORTANT:** You must restart Claude Desktop for the new servers to load.

```bash
# On macOS, fully quit Claude Desktop
# Cmd + Q or right-click dock icon → Quit
# Then relaunch Claude Desktop
```

### 2. Verify Servers Are Running

After restart, you can ask Claude:

```
Show me the available MCP servers
```

You should see all 8 servers listed.

### 3. Test Your New Powers

Try these queries to test each server:

**Dune:**
```
Query my Dune dashboard for CoW Protocol treasury balance
```

**CoinGecko:**
```
What's the current price of COW token? Show me the 24h change.
```

**DeFiLlama:**
```
Get the current TVL for CoW Protocol and compare it to Uniswap
```

**Playwright:**
```
Use Playwright to navigate to cow.fi and take a screenshot
```

**Charts:**
```
Create a bar chart of the top 5 DEXs by volume
```

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `~/Library/Application Support/Claude/claude_desktop_config.json` | Active MCP configuration |
| `~/Library/Application Support/Claude/claude_desktop_config.backup.json` | Backup of your original config |
| `~/.mcp.env` | Reference file with all your API keys |

---

## 🔐 Security Notes

### API Keys Are Inline (Current Setup)

Your API keys are currently stored directly in `claude_desktop_config.json`:

**Pros:**
- Works immediately, no extra configuration
- Claude Desktop loads them automatically

**Cons:**
- Keys visible in plain text in the JSON file
- If you share your config, you'll expose keys

### To Use External .mcp.env File (Optional)

If you prefer to reference keys from `~/.mcp.env`:

1. Install `dotenv-cli`:
   ```bash
   npm install -g dotenv-cli
   ```

2. Update each server's command in `claude_desktop_config.json`:
   ```json
   {
     "command": "dotenv",
     "args": ["-e", "/Users/mitch/.mcp.env", "--", "npx", "-y", "@coingecko/mcp-server"],
     "env": {}
   }
   ```

---

## 🧪 Advanced: Add EVM MCP Server (Optional)

For direct on-chain contract queries (not via Dune/APIs), you can add the EVM MCP server.

### Prerequisites

You'll need a free Ethereum RPC URL:
- **Alchemy** (recommended): https://www.alchemy.com/ → 300M compute units/month free
- **Infura**: https://www.infura.io/ → 100k requests/day free

### Installation

1. **Install the EVM MCP server:**
   ```bash
   cd ~/
   git clone https://github.com/mcpdotdirect/evm-mcp-server.git
   cd evm-mcp-server
   npm install
   npm run build
   ```

2. **Get your Alchemy key:**
   - Sign up at https://www.alchemy.com/
   - Create a new app for "Ethereum Mainnet"
   - Copy your API key (looks like: `abc123...`)

3. **Add to `claude_desktop_config.json`:**
   ```json
   {
     "mcpServers": {
       "evm": {
         "command": "node",
         "args": ["/Users/mitch/evm-mcp-server/dist/index.js"],
         "env": {
           "RPC_URL_MAINNET": "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE"
         }
       }
     }
   }
   ```

4. **Test it:**
   ```
   Query the COW token contract at 0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB for total supply
   ```

---

## 🛟 Troubleshooting

### Server Won't Start

1. **Check Claude Desktop logs:**
   ```bash
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

2. **Test servers manually:**
   ```bash
   # Test Dune MCP
   DUNE_API_KEY=UnAK6FzAyfSrSWzQwMgXKfZnuMomp6OP npx -y @modelcontextprotocol/server-dune

   # Test CoinGecko MCP
   COINGECKO_API_KEY=CG-CeTpPjN5tsmzy7SMKiVdQZLN npx -y @coingecko/mcp-server
   ```

### API Key Issues

If a server reports "Invalid API Key":

1. Verify the key in your `.env`:
   ```bash
   cat ~/Desktop/govdashboard/.env | grep API_KEY
   ```

2. Test the key directly:
   ```bash
   # Test Dune API
   curl -H "x-dune-api-key: UnAK6FzAyfSrSWzQwMgXKfZnuMomp6OP" \
     https://api.dune.com/api/v1/queries
   ```

### Restore Backup

If something breaks:

```bash
cp ~/Library/Application\ Support/Claude/claude_desktop_config.backup.json \
   ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Then restart Claude Desktop.

---

## 📚 Server Documentation

| Server | Docs |
|--------|------|
| Dune | https://github.com/kukapay/dune-analytics-mcp |
| CoinGecko | https://docs.coingecko.com/docs/mcp-server |
| DeFiLlama | https://github.com/dcSpark/mcp-server-defillama |
| Playwright | https://github.com/microsoft/playwright-mcp |
| AntV Chart | https://www.augmentcode.com/mcp/mcp-server-chart |
| Fetch | https://github.com/modelcontextprotocol/servers |

---

## 🎯 Use Cases for Your Project

### CoW Protocol Governance Dashboard

Now you can ask Claude:

1. **Real-time metrics:**
   ```
   Get the latest COW price from CoinGecko and compare it to the volume
   from my Dune dashboard query
   ```

2. **Cross-protocol analysis:**
   ```
   Compare CoW Protocol's TVL, fees, and volume to Uniswap and 1inch using DeFiLlama
   ```

3. **Chart generation:**
   ```
   Create a line chart showing COW token price over the last 7 days
   ```

4. **Data pipeline:**
   ```
   Fetch Snapshot proposals, get current COW price, query Dune for treasury balance,
   and generate a summary dashboard
   ```

5. **Testing:**
   ```
   Use Playwright to test the Proposals tab and verify it loads without React errors
   ```

---

## 🔄 Updating Servers

MCP servers installed via `npx -y` automatically use the latest version each time they start.

To pin a version, update the config:
```json
{
  "args": ["-y", "@coingecko/mcp-server@1.2.3"]
}
```

---

## 📞 Getting Help

- **MCP Inspector** (test servers): https://modelcontextprotocol.io/docs/tools/inspector
- **Claude Code Issues**: https://github.com/anthropics/claude-code/issues
- **MCP Spec**: https://modelcontextprotocol.io/

---

Happy vibing! 🚀 Your Claude can now access real-time blockchain data, market metrics, and analytics tools.
