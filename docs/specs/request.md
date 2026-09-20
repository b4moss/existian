# request

`createCheckRunner` が fetch・排他・世代・timeout・エラー種別を扱う。

- GET/DELETE: `value` クエリ
- POST/PUT/PATCH: JSON `{ value }`
- in-flight 中は最新 value を1つだけ待機
- 結果は `network` / `http` / `timeout` を区別

詳細は [../tests/request.md](../tests/request.md)。

----

以上
