# MCP Servers

このハーネスでは、Obsidian と MDN の MCP server を使う前提を置く。

## Obsidian

用途:

- プロジェクト内 `docs/` のコピーを Obsidian vault に保存する。
- 蓄積した設計、タスク、レビュー、decisions を横断検索する。
- 過去の設計、タスク、decisions を検索し、次回以降の設計やレビューに使う。

想定設定:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "<obsidian-mcp-server-package>"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "<absolute-path-to-your-obsidian-vault>",
        "OBSIDIAN_API_KEY": "<optional-local-rest-api-key-if-required>"
      }
    }
  }
}
```

実際の package 名、API key、vault path は利用する Obsidian MCP server の実装に合わせて設定する。

## MDN

用途:

- Web API、HTML、CSS、JavaScript などの一次情報を確認する。
- フロントエンドやブラウザ API に関わる設計レビューで参照する。
- 古い知識や曖昧な API 仕様を、MDN の情報で補正する。

想定設定:

```json
{
  "mcpServers": {
    "mdn": {
      "command": "npx",
      "args": ["-y", "<mdn-mcp-server-package>"],
      "env": {}
    }
  }
}
```

## Configuration File

テンプレートは次に置く。

- `mcp-configs/obsidian-mdn.mcp.example.json`

Claude Code のプロジェクト MCP 設定として使う場合は、利用環境に合わせて `.mcp.json` などの実設定にコピーし、package 名と env を埋める。

## Security

- Obsidian vault path は絶対パスで指定する。
- API key や token はリポジトリに commit しない。
- MCP server はローカル vault や外部情報へアクセスできるため、信頼できる実装だけを使う。
- MCP server の tool permission は必要最小限にする。
