# テスト仕様書索引

憲章 [tdd.md](../charter/tdd.md) に従う。実装前の入力であり、対応コードは `src/`、現行仕様昇格先は `docs/specs/`（同ドメイン分割）。

## v0.1.0（実装済み）

| ドメイン | ファイル | 主なロジック |
|----------|----------|----------------|
| attrs | [attrs.md](./attrs.md) | `readAttrs` |
| init | [init.md](./init.md) | `init`（v0.1 挙動） |
| debounce | [debounce.md](./debounce.md) | `createDebouncer` |
| request | [request.md](./request.md) | `createCheckRunner` |
| match | [match.md](./match.md) | `matchResponse` |
| state | [state.md](./state.md) | `applyStatus` |

## v0.2.0（未実装・本仕様が入力）

計画スタブ: [../plans/v0.2.0/](../plans/v0.2.0/)

| ドメイン | ファイル | 主なロジック |
|----------|----------|----------------|
| hooks | [hooks.md](./hooks.md) | `buildRequest` / カスタム `fetch` |
| lifecycle | [lifecycle.md](./lifecycle.md) | `unbind` / `destroy` / `refresh` |
| init | [init.md](./init.md)（追記） | `init` が `ExistianHandle` を返す |

----

以上
