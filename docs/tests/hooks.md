# hooks（v0.2.0）

属性 DSL を使わず、JS 側で request の URL / init（body・headers 等）を組み立てる。

固定 API 形（計画）:

```ts
type BuildRequestContext = {
  value: string;
  element: Element;
  attrs: CheckAttrs;
  url: string;
  init: RequestInit;
};

type BuildRequestResult = {
  url?: string;
  init?: RequestInit;
};

init({
  buildRequest?: (ctx: BuildRequestContext) => BuildRequestResult | void;
  fetch?: typeof fetch;
});
```

- フック未指定時は v0.1.0 の送信規約のまま
- `init` 戻り値のマージ: 返した `init` は浅くマージ。`body` / `headers` はフックが返した値を優先（完全指定可）
- `signal`（AbortController）はランナー側が管理し、フックが消してもランナーが再付与してよい

---

### buildRequest

- `createCheckRunner`（または同等）が fetch 直前に呼び出す
- 引数 `ctx` には、v0.1 規約で組み立てた `url` / `init` と、入力 `value`・要素・attrs が入る
- 戻り値が `void` / `undefined` のときは `ctx.url` / `ctx.init` をそのまま使う
- `url` のみ返すと URL だけ差し替え、`init` のみなら init だけ差し替え
- カスタム `fetch` が `init({ fetch })` で渡されていれば、グローバル `fetch` の代わりにそれを使う

#### テスト：正常系

- `buildRequest` 未指定の GET は、従来どおり `value` クエリ付き URL でグローバル fetch が呼ばれる
- `buildRequest` が `{ init: { body: JSON.stringify({ username: ctx.value, orgId: 1 }), headers: { "Content-Type": "application/json", "X-Token": "t" } } }` を返すと、その body / headers で fetch される（POST 属性時など）
- `buildRequest` が `{ url: "/api/custom" }` だけ返すと、method 等は既定 init のまま URL だけ `/api/custom` になる
- `init({ fetch: customFetch })` を渡すと、チェック発火時に `customFetch` が呼ばれ、グローバル `fetch` は呼ばれない

#### テスト: 異常系

- `buildRequest` が throw してもランナーを壊さず、当該チェックは `error`（種別は `network` 相当、または専用でもよいが DOM には `error`）として扱われ、次の schedule を受け付けられる
- `buildRequest` が `null` や不正な形（配列など）を返しても throw せず、既定の `ctx.url` / `ctx.init` にフォールバックする
- フックが `init.signal` を欠落させても、timeout / abort 用の signal が付いた状態で fetch される
- カスタム `fetch` が reject したとき、従来どおり `network`（または abort なら timeout）として結果が載る

----

以上
