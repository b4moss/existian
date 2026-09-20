# match

`matchResponse(body, { property, value, match })` が success / invalid を返す。

- `property` 未指定 → success（HTTP 成功前提）
- `exact` / `regex`。未知モードは invalid

詳細は [../tests/match.md](../tests/match.md)。

----

以上
