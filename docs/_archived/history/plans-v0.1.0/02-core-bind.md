# コア bind と属性

- **状態**: 方針確定
- **マイルストーン**: v0.1.0
- **依存**: [01-package-bootstrap.md](./01-package-bootstrap.md)

## 目的

対象 DOM を走査・監視し、`data-ex-*` 宣言を読み取ってチェック対象としてバインドする。

## 範囲

- 公開 API の骨格（名称は実装時に確定。例: `init` / `bind`）
- 属性プレフィックス既定 `data-ex-*`（ユーザー変更可能）
- `data-ex-check` … チェック先 URL
- `data-ex-method` … HTTP method（既定 `GET`。GET/POST/PUT/PATCH/DELETE を扱える設計）
- `data-ex-events` … 監視イベント（既定 `input` など）
- 入力要素の検出とイベント購読の開始/対象の管理

## やらぬこと

- debounce・fetch・状態反映の本実装（後続）
- 属性内 DSL / テンプレート

## 受け入れ

- プレフィックス付き属性を持つ要素に bind できる
- 指定イベントで「値が変わった」ことをコアが受け取れる（この時点では request 未接続でも可）
- プレフィックスを変更して属性名が追従する

## テスト方針

- 実装前に `docs/tests/` へ当該ロジックのテスト仕様を書く
- jsdom 等で属性読取・イベント購読の単体/結合を厚めに（氷山の水面以上）

----

以上
