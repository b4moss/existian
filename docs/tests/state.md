# state

チェック状態を DOM 属性へ反映する。見た目は CSS の責務。

---

### applyStatus

- 状態値: `idle` | `pending` | `success` | `invalid` | `error`
- 対象:
  1. バインド元の入力要素
  2. 同じ `{prefix}-state` 名を持つ要素群（`document` 全体から `querySelectorAll`）
  3. `{prefix}-target` が示す要素（**CSS セレクタ**のみ。`querySelector`。裸の id 文字列は解決しない）
- 各対象に `{prefix}-status` 属性（例: `data-ex-status`）へ状態文字列を書き込む
- `error` のとき `{prefix}-error` へ `network` | `timeout` | `http:<status>`（例: `http:500`）を載せる。非 error では当該属性を除去する
- `pending` 時、設定に `pending` トークン（属性 `{prefix}-pending`）があれば、CSS フックとして **`{prefix}-pending-active`** にその値を書く。pending 終了時は取り除く
- 遷移の典型: `idle` → `pending` → `success` | `invalid` | `error`

#### テスト：正常系

- 入力に `data-ex-state="username"`、別要素 `<p data-ex-state="username">` があるとき、`applyStatus(..., "success")` で両方に `data-ex-status="success"` が付く
- `data-ex-target="#msg"` があり `#msg` が存在するとき、入力と `#msg` の双方（および state 共有要素）に status が付く
- `data-ex-pending="busy"` で `pending` 適用時、対象に `data-ex-pending-active="busy"` が付く
- `pending` 適用後に `success` を適用すると、status が `success` に変わり、`data-ex-pending-active` は消える
- HTTP 失敗で `errorKind: "http"` と `httpStatus: 500` のとき、`data-ex-error="http:500"` になる

#### テスト: 異常系

- `data-ex-target` が解決できない（要素なし・不正セレクタ）でも throw せず、解決できた要素だけ更新する
- `data-ex-state` 共有要素が0件でも、入力要素自身の status は更新する
- 未知の status 文字列を渡した場合は無視し、DOM を壊す例外は出さない
- `error` 以外へ遷移したあと、`data-ex-error` が残らない（前回の error 種別がリークしない）

----

以上
