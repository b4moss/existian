# unbind ライフサイクル

- **状態**: 方針確定
- **マイルストーン**: v0.2.0
- **テスト仕様**: [../../tests/lifecycle.md](../../tests/lifecycle.md)

## 目的

要素単位で listener / debounce / 状態更新を止める。

## 範囲

- `ExistianHandle.unbind(element)`
- dispose 後の in-flight 結果は DOM に載せない
- グローバル二重 bind 防止から要素を外し、再 bind 可能にする

----

以上
