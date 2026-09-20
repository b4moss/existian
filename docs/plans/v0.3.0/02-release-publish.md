# release / npm publish

- **状態**: 方針確定
- **マイルストーン**: v0.3.0

## 目的

`release` をパッケージ配信ブランチとし、`v*` タグ（release 系譜）の GitHub Release 公開で npm publish する。

## 範囲

- `release` ブランチ作成
- `.github/workflows/publish.yml`（`NPM_TOKEN`、release 祖先チェック）
- v0.3.0 完了後に `0.3.0` として初回 npm 公開

----

以上
