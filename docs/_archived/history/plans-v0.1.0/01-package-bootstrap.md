# パッケージブートストラップ

- **状態**: 方針確定
- **マイルストーン**: v0.1.0
- **依存**: なし（最初に着手）

## 目的

`@b4moss/existian` を npm パッケージとして build / test / 公開できる骨格を作る。

## 範囲

- `package.json`（`@b4moss/existian`、`type: module`、`exports`、ESM/CJS、types、unpkg/jsDelivr）
- TypeScript（`tsconfig.json`）
- Vite library build（ESM + CJS）+ CDN IIFE（通常 / minify）— `@b4moss/cachian` / `jp-local-gov-id` 相当
- `scripts/build.mjs`
- Vitest（氷山パターン。初期カバレッジ目安 50%）
- `.gitignore` / 必要なら `.editorconfig`
- CI 骨格（`.github/workflows/`。最低: test + build）

## やらぬこと

- ランタイム本体の振る舞い実装（後続スライス）
- npm への実 publish（タグは main 上で versioning-rule に従う。v0.1.0 完了時）

## 受け入れ

- `npm test` と `npm run build` が通る（中身は空に近い smoke で可）
- `dist/` に ESM / CJS / d.ts（および IIFE）が出る

## テスト方針

- このスライスではビルドが通ることの確認を優先。ロジックテストは後続で `docs/tests/` を書いてから Red→Green。

----

以上
