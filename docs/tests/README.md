# テスト仕様書索引

憲章 [tdd.md](../charter/tdd.md) に従う。対応コードは `src/`、現行仕様正本は `docs/specs/`（同ドメイン分割）。

| ドメイン | ファイル | 主なロジック |
|----------|----------|----------------|
| attrs | [attrs.md](./attrs.md) | `readAttrs` |
| init | [init.md](./init.md) | `init` → `ExistianHandle` |
| debounce | [debounce.md](./debounce.md) | `createDebouncer` |
| request | [request.md](./request.md) | `createCheckRunner` |
| match | [match.md](./match.md) | `matchResponse` |
| state | [state.md](./state.md) | `applyStatus` |
| hooks | [hooks.md](./hooks.md) | `buildRequest` / カスタム `fetch` |
| lifecycle | [lifecycle.md](./lifecycle.md) | `unbind` / `destroy` / `refresh` |

----

以上
