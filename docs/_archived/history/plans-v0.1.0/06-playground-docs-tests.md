# playground・利用ドキュメント・テスト仕様

- **状態**: 方針確定
- **マイルストーン**: v0.1.0
- **依存**: [05-response-and-state.md](./05-response-and-state.md)（並行着手可な部分あり）

## 目的

MVP を手元で確認でき、利用者が入れ、TDD の入力となるテスト仕様が残っている状態にする。

## 範囲

- `playground/` … 最小 HTML デモ（mock API または固定エンドポイント想定で可）
- 利用向け README（インストール、属性一覧、最小例、スコープ外の明示）
- `docs/tests/` … v0.1.0 ドメインのテスト仕様（憲章フォーマット）
- 必要なら `docs/specs/` への昇格は **実装完了後に main/develop 側で**行う（doc-rule）

## やらぬこと

- 本格ドキュメントサイト（→ v0.3.0）
- E2E 必須化

## 受け入れ

- playground で「入力 → pending → success/invalid/error」が見える
- README からコピペで始められる
- 主要ロジックに対応する `docs/tests/` がある
- `npm test` が CI 相当で緑

----

以上
