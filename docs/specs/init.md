# init

`init({ prefix?, root?, buildRequest?, fetch? })` が root 配下の `{prefix}-check` 要素を bind し、`ExistianHandle` を返す。

- 既定 prefix: `data-ex`
- イベント → debounce → request → match → `applyStatus`
- 同一要素は WeakSet で二重 bind しない（複数 `init` でも最初に bind した側が保持）
- フック未使用時の宣言的パスと既定送信規約は維持する
- Handle API は [lifecycle.md](./lifecycle.md)、フックは [hooks.md](./hooks.md)

詳細は [../tests/init.md](../tests/init.md)。

----

以上
