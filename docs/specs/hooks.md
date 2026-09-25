# hooks

`InitOptions.buildRequest` / `InitOptions.fetch` で request を JS から差し替える。属性 DSL は持たない。

- フック未使用時は既定の送信規約（GET/DELETE は `value` クエリ、POST/PUT/PATCH は JSON `{ value }`）
- runner は fetch 直前に `buildRequest` を呼ぶ。戻り `url` / `init` は個別に差し替え可。`void` / `undefined` なら既定のまま
- 返した `init` は浅くマージ。`body` / `headers` はフック優先（完全指定可）
- `signal`（AbortController）はランナーが管理し、フックが欠落させても再付与する
- `buildRequest` の throw は当該チェックを `error` とし、runner は壊れず次の `schedule` を受け付ける
- 不正な戻り値（`null` / 配列など）は throw せず既定の `url` / `init` にフォールバック
- `init({ fetch })` でカスタム fetch を渡せる（関数以外は無視）

詳細は [../tests/hooks.md](../tests/hooks.md)。

----

以上
