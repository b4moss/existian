# 競合制御（排他・stale・timeout）

- **状態**: 方針確定
- **マイルストーン**: v0.1.0
- **依存**: [03-debounce-request.md](./03-debounce-request.md)

## 目的

高速入力と遅延 response を前提に、並列 request の暴走と古い結果による上書きを防ぐ。

## 範囲

### Request 排他

前の request が完了するまで、次の debounce 由来 request を発火しない（待機する）。

### Stale response 無視

request ごとに識別子を持ち、現在の状態に対応しない古い response は無視する。

### Timeout

- `data-ex-timeout`（ms）
- 超過は失敗として扱う

### エラー区別

ネットワークエラー / HTTP エラー / timeout を区別できる設計（UI は持たない。DOM 状態へ反映できること）。

## やらぬこと

- エラーメッセージ文言の決定や表示コンポーネント

## 受け入れ

- 進行中 request がある間、追加 request が並列で増えない
- A→B の順で開始し B→A の順で返っても、A が B の結果を上書きしない
- timeout 超過で失敗状態になる

## テスト方針

- 遅延 mock / 順序入れ替え mock を重点的に（このスライスが品質の本丸）

----

以上
