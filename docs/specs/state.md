# state

`applyStatus` が `{prefix}-status` を入力・state 共有・target へ書く。

- 値: `idle` | `pending` | `success` | `invalid` | `error`
- error 時は `{prefix}-error`（`network` / `timeout` / `http:<status>`）
- pending 時は `{prefix}-pending-active`（属性 `{prefix}-pending` の値）
- state / target の解決は `document` 全体（`init` の `root` には限定しない）
- `{prefix}-target` は CSS セレクタのみ（`querySelector`）

詳細は [../tests/state.md](../tests/state.md)。

----

以上
