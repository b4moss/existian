# debounce と request 発火

- **状態**: 方針確定
- **マイルストーン**: v0.1.0
- **依存**: [02-core-bind.md](./02-core-bind.md)

## 目的

入力を直接 API に流さず、debounce 後に非同期 request を発火する。

## 範囲

- `data-ex-debounce`（ms）
- 流れ: `input → debounce → request`
- `fetch` による request（method / URL。body・headers の複雑構築は v0.2.0）
- 単純な成功/失敗の受け取り口（詳細判定・state は後続でも、最低限の完了コールバックは持つ）

## やらぬこと

- 排他・stale・timeout（→ [04-concurrency.md](./04-concurrency.md)）
- response-property 判定（→ [05-response-and-state.md](./05-response-and-state.md)）

## 受け入れ

- debounce 時間内の連続入力では request が連打されない
- debounce 後に `data-ex-check` へ request が飛ぶ
- method 既定が GET である

## テスト方針

- fake timers で debounce
- fetch mock で発火回数・URL・method を検証

----

以上
