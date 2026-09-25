# lifecycle

`init()` は `ExistianHandle`（`unbind` / `destroy` / `refresh`）を返す。Handle は呼び出しごとに独立する。

- `unbind(element)`: listener 解除・debounce cancel・in-flight 完了後の DOM 更新を止め、グローバル二重 bind 防止から外して再 bind 可能にする
- `destroy()`: 当該 Handle が bind した要素をすべて `unbind` 相当にする。他 Handle の bind には影響しない
- `refresh()`: 同じ `prefix` / `root` / フック設定で、未 bind の `{prefix}-check` だけ追加 bind する（既 bind は触らない）
- `destroy` 後の `refresh` は再スキャンで再 bind できる

詳細は [../tests/lifecycle.md](../tests/lifecycle.md)。

----

以上
