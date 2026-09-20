# @b4moss/existian 開発ロードマップ

仕様ハブ: [main.md](./main.md)  
計画詳細: [plans/](./plans/)

状態凡例: `未着手` / `進行中` / `完了`

---

## v0.1.0 — MVP（宣言的非同期チェック）

状態: **完了**（ブランチ `dev-v0.1.0`）  
仕様: [specs/](./specs/) · テスト仕様: [tests/](./tests/)

受け入れ:

- [x] npm パッケージとして build / test できる（Vite + TS + Vitest）
- [x] `data-ex-*` で入力 → debounce → request → 状態反映が一通り動く
- [x] request 排他・stale 無視・timeout がある
- [x] response 判定（property / value / match）と state / pending / target が使える
- [x] playground でデモでき、利用向け README の最小がある

---

## v0.2.0 — JS フックとライフサイクル

状態: **未着手**  
計画: [plans/v0.2.0/](./plans/v0.2.0/)

受け入れ（短く）:

- [ ] 複雑な body / headers を JS 側で渡せる（属性 DSL は作らない）
- [ ] unbind / destroy などライフサイクル API
- [ ] プレフィックス変更・複数ルート初期化の DX を整える

---

## v0.3.0 — 配布・ドキュメント整備

状態: **未着手**  
計画: [plans/v0.3.0/](./plans/v0.3.0/)

受け入れ（短く）:

- [ ] CDN（unpkg / jsDelivr）利用手順が明確
- [ ] ドキュメントサイトまたは同等の公開ドキュメントがある
- [ ] エラー種別・状態遷移の仕様が `specs/` に昇格済み

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
