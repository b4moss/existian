# request

チェック用 HTTP リクエストの発火、値の載せ方、排他、stale 無視、timeout、エラー種別。

---

### createCheckRunner

- 1 要素（または1バインド）あたり1 runner を想定する
- `schedule(value: string)` でチェックを予約する。実際の fetch は debounce 後に本ロジックへ来る前提でも、runner 単体テストでは `schedule` 直呼びで検証してよい
- **送信規約（v0.1.0）**
  - URL は属性の `check`
  - `GET` / `DELETE`: クエリ `value=<入力値>` を付与（既存クエリがあればマージ）
  - `POST` / `PUT` / `PATCH`: body は `{"value":"<入力値>"}`、`Content-Type: application/json`
- **排他**: 前の request が完了するまで、次の request を発火しない。完了後に、待機中の最新 `value` があれば続けて1回発火する
- **stale**: request ごとに世代（識別子）を持ち、完了時に現行世代でなければ結果を採用しない（コールバック／状態更新を行わない）
- **timeout**: `timeoutMs` 指定時、超過は失敗。`AbortController` 等で中断してよい
- **エラー種別**: 少なくとも `network` / `http` / `timeout` を区別して完了結果に載せる。HTTP 非2xx は `http`（status code も保持）
- 成功時は JSON パース結果（または raw）を後段 `matchResponse` に渡せる形で返す

#### テスト：正常系

- `GET` で `check="/api/x"`、`value="alice"` のとき、fetch が `/api/x` に `value=alice` クエリ付き・method `GET` で1回呼ばれる
- `POST` のとき、method `POST`、JSON body `{"value":"alice"}`、`Content-Type: application/json` で呼ばれる
- in-flight 中に `schedule` を複数回しても、同時 in-flight は最大1。完了後、最後の value に対する request が追加で1回走る

#### テスト: 異常系

- fetch が network 失敗（reject）したとき、結果種別 `network` となり、後続の状態更新対象になる（stale でなければ）
- HTTP 500 等の非2xx のとき、種別 `http` と status code が分かる
- `timeoutMs` 内に完了しないとき、種別 `timeout` となり、その request の遅い成功応答は採用されない（stale または abort 済み）
- request A のあとに B を開始し、B 完了後に A が返っても、A の結果では状態を更新しない
- JSON でない 2xx ボディは、match 不能として失敗（例: 種別 `http` または専用の parse 失敗）にでき、throw でランナーを壊さない

---

### createCheckRunner（v0.2.0 拡張）

- オプションに `buildRequest?` と `fetchImpl?`（または `fetch?`）を受け取れる
- fetch 直前に `buildRequest` を呼び、戻りで URL / RequestInit を上書きできる（詳細は [hooks.md](./hooks.md)）
- unbound 後は結果を採用しない（[lifecycle.md](./lifecycle.md) の unbind と連携）

#### テスト：正常系

- runner 作成時に `buildRequest` を渡すと、`schedule` 後の fetch 引数にフック結果が反映される
- `fetchImpl` を渡すと、その関数だけが呼ばれる

#### テスト: 異常系

- `buildRequest` が throw しても runner は後続 `schedule` を受け付け、結果は失敗として `onResult` に渡る
- unbound（または世代無効）後の完了は `onResult` を呼ばない

----

以上
