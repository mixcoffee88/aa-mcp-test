# Google Analytics Data API MCP Server セットアップガイド

このガイドでは、Google Analytics Data API用のMCPサーバーをセットアップする手順を説明します。

## 1. Google Cloud プロジェクトのセットアップ

### 1.1 Google Cloudプロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセスします
2. 「プロジェクトの選択」をクリックし、「新しいプロジェクト」を選択します
3. プロジェクト名を入力し、「作成」をクリックします

### 1.2 Google Analytics Data APIの有効化

1. [APIライブラリ](https://console.cloud.google.com/apis/library)に移動します
2. 検索バーで「Google Analytics Data API」を検索します
3. APIを選択し、「有効にする」をクリックします

## 2. サービスアカウントの作成と設定

### 2.1 サービスアカウントの作成

1. [サービスアカウント](https://console.cloud.google.com/iam-admin/serviceaccounts)ページに移動します
2. 「サービスアカウントを作成」をクリックします
3. サービスアカウント名を入力し、「作成して続行」をクリックします
4. 「ロールを選択」で「閲覧者」ロールを選択します
5. 「完了」をクリックします

### 2.2 サービスアカウントキーの作成

1. 作成したサービスアカウントをクリックします
2. 「キー」タブを選択します
3. 「鍵を追加」→「新しい鍵を作成」をクリックします
4. キーのタイプとして「JSON」を選択し、「作成」をクリックします
5. JSONキーファイルがダウンロードされます。このファイルは安全に保管してください

## 3. Google Analyticsでのアクセス権の設定

### 3.1 GA4プロパティIDの確認

1. [Google Analytics](https://analytics.google.com/)にアクセスします
2. 左側のメニューから「管理」をクリックします
3. 「プロパティ設定」をクリックします
4. 「プロパティID」をメモします（例: 123456789）

### 3.2 サービスアカウントにアクセス権を付与

1. Google Analyticsの「管理」ページで、「プロパティのアクセス管理」をクリックします
2. 「+」ボタンをクリックし、「ユーザーを追加」を選択します
3. サービスアカウントのメールアドレスを入力します（例: service-account@project-id.iam.gserviceaccount.com）
4. 「閲覧者」ロールを選択します
5. 「追加」をクリックします

## 4. MCPサーバーのインストールと設定

### 4.1 リポジトリのクローン

```bash
git clone https://github.com/eno-graph/mcp-server-google-analytics.git
cd mcp-server-google-analytics
```

### 4.2 依存関係のインストール

```bash
npm install
```

### 4.3 環境変数の設定

以下の環境変数を設定します：

```bash
export GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="your-private-key"
export GA_PROPERTY_ID="your-ga4-property-id"
```

または、`.env`ファイルを作成して設定することもできます：

```
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your-private-key
GA_PROPERTY_ID=your-ga4-property-id
```

### 4.4 ビルドと実行

```bash
npm run build
npm start
```

または、提供されているスクリプトを使用することもできます：

```bash
./run-server.sh
```

## 5. Claude Desktopでの設定

### 5.1 設定ファイルの編集

Claude Desktopの設定ファイルを編集します：

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

### 5.2 MCPサーバーの設定を追加

以下の設定を追加します（パスは絶対パスに変更してください）：

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
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### 5.3 Claude Desktopの再起動

設定を適用するために、Claude Desktopを再起動します。

## 6. 動作確認

Claude Desktopで以下のようなプロンプトを試してみてください：

```
Google Analyticsから過去7日間のアクティブユーザー数とページビュー数を日付別に取得してください。
```

正しく設定されていれば、Claudeは`get_report`ツールを使用してデータを取得し、結果を表示します。

## トラブルシューティング

### サーバーが起動しない場合

- 環境変数が正しく設定されているか確認してください
- サービスアカウントキーが有効か確認してください
- Google Analytics Data APIが有効になっているか確認してください

### 認証エラーが発生する場合

- サービスアカウントにGoogle Analyticsプロパティへのアクセス権があるか確認してください
- GOOGLE_PRIVATE_KEYの形式が正しいか確認してください（改行文字が含まれている場合があります）

### データが取得できない場合

- GA_PROPERTY_IDが正しいか確認してください
- 指定したメトリクスとディメンションがGA4で利用可能か確認してください