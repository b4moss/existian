# doc-site

- **状態**: 方針確定
- **マイルストーン**: v0.3.0

## 目的

WWW から existian をスモークできる静的 1 ページを `https://existian.oss.b4m.jp/` で公開する。

## 範囲

- `playground/` を廃止し `doc-site/` を新設
- ネイティブ HTML/CSS/JS。ビルド済み IIFE を読み込む
- JSON ベタ書きモック API + available 文字列の事前ガイダンス
- `/en`・`/ja` でロケール分割。ルートは JS でブラウザ言語を判定し切替（`ja` 以外は `en` へフォールバック）
- `doc-site` ブランチへの push/merge で GitHub Pages デプロイ

----

以上
