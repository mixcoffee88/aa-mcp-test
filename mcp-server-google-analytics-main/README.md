# Google Analytics Data API MCP Server

Model Context Protocol (MCP) サーバーを使用して、Google Analytics Data APIにアクセスするためのインターフェースを提供します。

## 機能

このMCPサーバーは、Google Analytics Data APIの主要な機能にアクセスするためのツールとリソースを提供します：

### ツール

- **get_report**: 指定した日付範囲、メトリクス、ディメンションに基づいてレポートを取得します
- **get_realtime_data**: リアルタイムデータを取得します

### リソース

- **ga4://property/{propertyId}/metadata**: Google Analyticsプロパティのメタデータにアクセスします

## セットアップ

### 前提条件

1. Google Cloudプロジェクトを作成し、Analytics Data APIを有効にします
2. サービスアカウントを作成し、認証情報JSONファイルをダウンロードします
3. サービスアカウントにGA4プロパティへの適切なアクセス権を付与します

詳細なセットアップ手順については、[セットアップガイド](docs/setup-guide.md)を参照してください。

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/eno-graph/mcp-server-google-analytics.git
cd mcp-server-google-analytics

# 依存関係をインストール
npm install

# ビルド
npm run build
```

### 環境変数の設定

以下の環境変数を設定する必要があります：

```bash
export GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="your-private-key"
export GA_PROPERTY_ID="your-ga4-property-id"
```

## 使用方法

### サーバーの起動

```bash
npm start
```

または、提供されているスクリプトを使用することもできます：

```bash
./run-server.sh
```

### Claude Desktopでの設定

Claude Desktopの設定ファイルに以下を追加します：

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "node",
      "args": ["/path/to/mcp-server-google-analytics/build/index.js"],
      "env": {
        "GOOGLE_CLIENT_EMAIL": "your-service-account@project.iam.gserviceaccount.com",
        "GOOGLE_PRIVATE_KEY": "your-private-key",
        "GA_PROPERTY_ID": "your-ga4-property-id"
      }
    }
  }
}
```

詳細な設定例については、[claude-desktop-config-sample.json](claude-desktop-config-sample.json)を参照してください。

## ツールの使用例

### レポートの取得

```
get_report ツールを使用して、過去7日間のアクティブユーザー数とページビュー数を取得します。

引数:
{
  "startDate": "7daysAgo",
  "endDate": "today",
  "metrics": ["activeUsers", "screenPageViews"],
  "dimensions": ["date"],
  "limit": 10
}
```

### リアルタイムデータの取得

```
get_realtime_data ツールを使用して、現在アクティブなユーザー数を取得します。

引数:
{
  "metrics": ["activeUsers"],
  "dimensions": ["deviceCategory"],
  "limit": 10
}
```

## リソースの使用例

```
ga4://property/123456789/metadata リソースにアクセスして、利用可能なメトリクスとディメンションを確認します。
```

## 使用例

Claudeでの使用例については、[Claude使用例](examples/claude-usage-examples.md)を参照してください。

## ライセンス

MIT
