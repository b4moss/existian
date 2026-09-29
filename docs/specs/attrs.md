# attrs

`readAttrs(element, prefix)` が `data-*` からチェック設定を読む。

- 必須相当: `{prefix}-check`（欠落・空白のみなら `check: null`）
- 既定: `method=GET`, `events=["input"]`, `responseMatch=exact`
- `method` は大文字化。未知のメソッド文字列も `GET` にフォールバック
- 数値属性の不正値は `null`（未設定）。`debounce` 未設定は呼び出し側で 0ms 相当

詳細な検証観点は [../tests/attrs.md](../tests/attrs.md)。

----

以上
