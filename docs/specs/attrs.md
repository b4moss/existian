# attrs

`readAttrs(element, prefix)` が `data-*` からチェック設定を読む。

- 必須相当: `{prefix}-check`（無ければ `check: null`）
- 既定: `method=GET`, `events=["input"]`, `responseMatch=exact`
- 数値属性の不正値は `null`（未設定）

詳細な検証観点は [../tests/attrs.md](../tests/attrs.md)。

----

以上
