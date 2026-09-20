# state

チェック状態を DOM 属性へ反映する。見た目は CSS の責務。

---

### applyStatus

- 状態値: `idle` | `pending` | `success` | `invalid` | `error`
- 対象:
  1. バインド元の入力要素
  2. 同じ `data-ex-state`（prefix 連動）名を持つ要素群
  3. `data-ex-target` が示す要素（セレクタまたは id 解決）
- 各対象に `{prefix}-status` 属性（例: `data-ex-status`）へ状態文字列を書き込む
- `error` のとき、区別用に `{prefix}-error` 属性へ `network` | `http` | `timeout`（および必要なら http の status）を載せる。非 error では当該属性を除去または空にする
- `pending` 時、設定に `pending` トークン（`data-ex-pending`）があれば、CSS フックとして追加反映する（例: `{prefix}-pending` 属性にその値を書く）。pending 終了時は取り除く
- 遷移の典型: `idle` → `pending` → `success` | `invalid` | `error`

#### テスト：正常系

- 入力に `data-ex-state="username"`、別要素 `<p data-ex-state="username">` があるとき、`applyStatus(..., "success")` で両方に `data-ex-status="success"` が付く
- `data-ex-target="#msg"` があり `#msg` が存在するとき、入力と `#msg` の双方（および state 共有要素）に status が付く
- `pending` 適用後に `success` を適用すると、status が `success` に変わり、pending 用フック属性は消える

#### テスト: 異常系

- `data-ex-target` が解決できない（要素なし）でも throw せず、解決できた要素だけ更新する
- `data-ex-state` 共有要素が0件でも、入力要素自身の status は更新する
- 未知の status 文字列を渡した場合は無視するか `error` 扱いにし、DOM を壊す例外は出さない
- `error` 以外へ遷移したあと、`data-ex-error` が残らない（前回の error 種別がリークしない）

----

以上
