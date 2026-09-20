# state

`applyStatus` が `data-ex-status`（prefix 連動）を入力・state 共有・target へ書く。

- 値: `idle` | `pending` | `success` | `invalid` | `error`
- error 時は `{prefix}-error`
- pending 時は `{prefix}-pending-active`（`data-ex-pending` 値）

詳細は [../tests/state.md](../tests/state.md)。

----

以上
