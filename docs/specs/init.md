# init

`init({ prefix?, root? })` が root 配下の `{prefix}-check` 要素を bind する。

- 既定 prefix: `data-ex`
- イベント → debounce → request → match → `applyStatus`
- 同一要素は WeakSet で二重 bind しない
- v0.1 に unbind / destroy は無い

詳細は [../tests/init.md](../tests/init.md)。

----

以上
