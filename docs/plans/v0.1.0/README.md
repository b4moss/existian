# v0.1.0 計画索引

- **状態**: 方針確定
- **マイルストーン**: v0.1.0
- **ブランチ**: `dev-v0.1.0` / `feat-*`

README（引き継ぎメモ）に列挙された v0.1 属性と、競合対策（debounce / 排他 / stale / timeout）を MVP とする。

## 実装順

| 順 | 計画 | 概要 |
|----|------|------|
| 1 | [01-package-bootstrap.md](./01-package-bootstrap.md) | package.json / Vite / TS / Vitest / CI 骨格 |
| 2 | [02-core-bind.md](./02-core-bind.md) | init・属性読取・イベント監視・check / method / events |
| 3 | [03-debounce-request.md](./03-debounce-request.md) | debounce と request 発火 |
| 4 | [04-concurrency.md](./04-concurrency.md) | 排他・stale 無視・timeout・エラー区別 |
| 5 | [05-response-and-state.md](./05-response-and-state.md) | response 判定と state / pending / target |
| 6 | [06-playground-docs-tests.md](./06-playground-docs-tests.md) | playground・利用 README・tests 仕様 |

依存: 上から順。4 は 3 の後、5 は 4 の後が必須。1 は全スライスの前提。

## やらないこと（v0.1.0）

- body / headers の複雑な JS フック（→ v0.2.0）
- ドキュメントサイト（→ v0.3.0）
- UI / DSL / フォーム FW（永続スコープ外）

----

以上
