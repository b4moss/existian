# テスト仕様書索引（v0.1.0）

憲章 [tdd.md](../charter/tdd.md) に従う。実装前の入力であり、対応コードは `src/`、現行仕様昇格先は `docs/specs/`（同ドメイン分割）。

設計の固定事項は完了計画および [../plans/v0.1.0/](../plans/v0.1.0/) を参照。

| ドメイン | ファイル | 主なロジック |
|----------|----------|----------------|
| attrs | [attrs.md](./attrs.md) | `readAttrs` |
| init | [init.md](./init.md) | `init` |
| debounce | [debounce.md](./debounce.md) | `createDebouncer` |
| request | [request.md](./request.md) | `createCheckRunner`（発火・排他・stale・timeout） |
| match | [match.md](./match.md) | `matchResponse` |
| state | [state.md](./state.md) | `applyStatus` |

----

以上
