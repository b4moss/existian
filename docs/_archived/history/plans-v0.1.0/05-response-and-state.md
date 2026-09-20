# response 判定と state 反映

- **状態**: 方針確定
- **マイルストーン**: v0.1.0
- **依存**: [04-concurrency.md](./04-concurrency.md)

## 目的

JSON response を単純ルールで判定し、入力側・メッセージ側 DOM に状態を載せる。見た目は CSS の責務。

## 範囲

### Response

- `data-ex-response-property`
- `data-ex-response-value`
- `data-ex-response-match`（例: `exact` / `regex`）
- 複雑な変換や任意コード実行 DSL にはしない

### State

想定遷移: `idle → pending → success / invalid / error`

- `data-ex-state` … 入力とメッセージ側で同名を共有可
- `data-ex-pending` … request 中の状態表現用
- `data-ex-target` … 結果反映先 DOM の指定

existian は状態を DOM 属性等へ反映するのみ。

## やらぬこと

- 赤文字・スピナー・文言テンプレートなどの UI
- Bootstrap / Tailwind への依存

## 受け入れ

- 例: `{ "exists": true }` に対し property/value で success または invalid を区別できる
- pending 中に pending 用 state が付く
- target / state 名で別要素へ状態が伝播する
- CSS だけで表示切替できる属性（または同等のフック）が残る

## テスト方針

- 判定ロジックは単体で厚め
- DOM 反映は jsdom 結合で代表ケース

----

以上
