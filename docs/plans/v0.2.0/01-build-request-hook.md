# buildRequest フック

- **状態**: 方針確定
- **マイルストーン**: v0.2.0
- **テスト仕様**: [../../tests/hooks.md](../../tests/hooks.md)

## 目的

HTML 属性 DSL なしで、body / headers / URL を JS から差し替える。

## 範囲

- `InitOptions.buildRequest`
- `InitOptions.fetch`
- runner が fetch 直前にフックを呼び、`init` を浅くマージ（`body` / `headers` はフック優先）
- `signal` はランナーが再付与

## 受け入れ

- フック未使用時は v0.1 と同一
- カスタム body / URL / fetch が使える
- フック throw / 不正戻り値でも runner が壊れない

----

以上
