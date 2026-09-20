# destroy / refresh / init DX

- **状態**: 方針確定
- **マイルストーン**: v0.2.0
- **テスト仕様**: [../../tests/lifecycle.md](../../tests/lifecycle.md) · [../../tests/init.md](../../tests/init.md)

## 目的

`init` が Handle を返し、SPA 想定の一括解除と動的要素の追加 bind を可能にする。

## 範囲

- `init(): ExistianHandle`
- `destroy()` / `refresh()`
- Handle ごとに独立（他 init の bind に影響しない）

----

以上
