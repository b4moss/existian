# v0.2.0 計画索引

- **状態**: 方針確定
- **マイルストーン**: v0.2.0
- **ブランチ**: `dev-v0.2.0` / `feat-*`
- **テスト仕様**: [../../tests/hooks.md](../../tests/hooks.md) · [../../tests/lifecycle.md](../../tests/lifecycle.md)

v0.1.0 の宣言的パスを壊さず、複雑なケースを JS 側で逃がす。

## 実装順

| 順 | 計画 | 概要 |
|----|------|------|
| 1 | [01-build-request-hook.md](./01-build-request-hook.md) | `buildRequest` / カスタム `fetch` |
| 2 | [02-lifecycle-unbind.md](./02-lifecycle-unbind.md) | `unbind` と runner 無効化 |
| 3 | [03-destroy-refresh-init-dx.md](./03-destroy-refresh-init-dx.md) | `destroy` / `refresh` / Handle 戻り値 |
| 4 | [04-tests-docs-playground.md](./04-tests-docs-playground.md) | ドキュメント・playground |

## やらないこと（v0.2.0）

- 属性内テンプレート / 任意式 DSL
- ドキュメントサイト（→ v0.3.0）

----

以上
