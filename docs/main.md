# @b4moss/existian

HTML の `data-*` 属性で、入力値に対する非同期チェックを宣言的に書くための小さな JavaScript ライブラリ。

## 目的

入力 → debounce → 非同期チェック → 結果に応じた状態表示までを、HTML 側の最低限の宣言だけで扱えるようにする。

HTTP API そのものを抽象化するライブラリではなく、**DOM イベントと非同期チェックをつなぐ薄いレイヤー**として設計する。

## 主な用途

- ユーザー名の存在確認
- メールアドレスの重複確認
- 招待コードの有効性確認
- その他、入力値に応じた API ベースの非同期チェック

## スコープ

### 担当する

- DOM イベントの監視
- debounce
- 非同期リクエスト
- request の排他制御
- stale response の無視
- timeout
- response の判定
- state 属性の更新

### 担当しない

- UI デザイン / メッセージ表示 / CSS
- テンプレートエンジン
- HTML 属性内で任意式を評価する DSL
- 複雑な API レスポンス変換
- フォーム全体のバリデーションフレームワーク

## 技術方針

- パッケージ名: `@b4moss/existian`
- Vite + TypeScript
- 属性プレフィックス既定: `data-ex-*`（変更可能）
- UI は持たない。状態を DOM に反映し、見た目は利用側 CSS の責務
- ブラウザ向け npm パッケージ（ESM / CJS / IIFE）。構成は `@b4moss/jp-local-gov-id` / `@b4moss/cachian` を参考にする
- TDD（氷山パターン）。薄い DDD は意識するが、CRUD / Repository は持たない（パッケージ向け例外）

## 索引

| 文書 | 役割 |
|------|------|
| [roadmap.md](./roadmap.md) | SemVer・マイルストーン一覧 |
| [plans/](./plans/) | 未実装の計画 |
| [specs/](./specs/) | 現行機能の仕様正本（実装後） |
| [charter/](./charter/) | 開発憲章 |
| [override-charter.md](./override-charter.md) | 憲章オーバーライド |

引き継ぎメモの詳細はリポジトリ直下の [README.md](../README.md) を参照。利用向け README は v0.1.0 実装に合わせて整備する。

----

以上
