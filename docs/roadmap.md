# @b4moss/existian 開発ロードマップ

仕様ハブ: [main.md](./main.md)  
計画詳細: [plans/](./plans/)

状態凡例: `未着手` / `進行中` / `完了`

---

## v0.1.0 — MVP（宣言的非同期チェック）

状態: **完了**  
仕様: [specs/](./specs/) · テスト仕様: [tests/](./tests/)

受け入れ:

- [x] npm パッケージとして build / test できる（Vite + TS + Vitest）
- [x] `data-ex-*` で入力 → debounce → request → 状態反映が一通り動く
- [x] request 排他・stale 無視・timeout がある
- [x] response 判定（property / value / match）と state / pending / target が使える
- [x] playground でデモでき、利用向け README の最小がある

---

## v0.2.0 — JS フックとライフサイクル

状態: **完了**  
仕様: [specs/hooks.md](./specs/hooks.md) · [specs/lifecycle.md](./specs/lifecycle.md) · [specs/init.md](./specs/init.md) · テスト仕様: [tests/hooks.md](./tests/hooks.md) / [tests/lifecycle.md](./tests/lifecycle.md) / [tests/init.md](./tests/init.md)

受け入れ:

- [x] 複雑な body / headers を JS 側で渡せる（属性 DSL は作らない）
- [x] unbind / destroy などライフサイクル API
- [x] プレフィックス変更・複数ルート初期化の DX を整える

---

## v0.3.0 — 配布・ドキュメント整備

状態: **完了**  
利用向け: [../README.md](../README.md)

受け入れ:

- [x] doc-site（`https://existian.oss.b4m.jp/`）で WWW スモーク可能
- [x] `doc-site` ブランチ → GitHub Pages デプロイ
- [x] `release` ブランチ + npm publish ワークフロー
- [x] `0.3.0` として npmjs 初回公開

---

## v1.0.0 — GA

状態: **未着手**（PO 判断）  
計画: [plans/unscheduled/ga-v1.md](./plans/unscheduled/ga-v1.md)

破壊的変更を抑え、公開 API と仕様書が安定した時点で PO が判断する。

---

## 版に含めない（明示的スコープ外）

- UI コンポーネント / メッセージ表示システム
- 属性内テンプレート・任意式 DSL
- フォーム全体バリデーション FW
- E2E / ビジュアルリグレッション（MVP では必須としない。憲章どおり後期検討）

----

以上
