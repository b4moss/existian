# init

公開 API。指定ルート配下のチェック対象要素を検出し、イベント購読を開始する。

---

### init

- オプション: `prefix?: string`（既定 `"data-ex"`）、`root?: ParentNode`（既定 `document`）、`buildRequest?`、`fetch?`
- 戻り値は `ExistianHandle`（`unbind` / `destroy` / `refresh`）。詳細は [lifecycle.md](./lifecycle.md)
- `root` 配下で `{prefix}-check` 属性を持つ要素を検出し、各要素に対して属性読取とイベント購読を行う
- 購読イベントは `readAttrs` の `events`（既定 `input`）
- イベント発火時、当該要素の現在値を後段（debounce → check runner）へ渡すパイプラインを接続する
- 同一要素を二重に bind しない（再 `init` 時は既存購読を増やさない、または冪等）
- フック未使用時の宣言的パスと既定送信規約は維持する。フック詳細は [hooks.md](./hooks.md)
- 複数 `init` はそれぞれ独立した Handle を持つ（同一要素は最初に bind した側が保持し、他方はスキップ）

#### テスト：正常系

- `data-ex-check` 付き input が1つあるとき、`init()` 後に `input` イベントでパイプラインが呼ばれる（値変化がハンドラまで届く）
- `prefix: "data-my"` を渡すと `data-my-check` のみ対象になり、`data-ex-check` だけの要素は bind されない
- `root` に部分木を渡すと、その外の `data-ex-check` 要素は bind されない
- `init()` の戻り値に `unbind` / `destroy` / `refresh` がある
- `buildRequest` を渡して init した Handle 経由のチェックでは、フックが適用される（[hooks.md](./hooks.md)）
- 異なる `root` で2回 `init` すると、それぞれの Handle が自分の root 配下だけを制御できる

#### テスト: 異常系

- `data-ex-check` が一つも無い root でも throw せず、何も購読しない
- check 属性の無い通常 input は bind 対象外
- 不正なオプション（例: `prefix` が空文字）は既定 prefix にフォールバックするか、明確に無視して既定動作する（throw しない）
- 同じ root で `init` を2回呼んでも、同一要素への listener が増殖してハンドラが二重発火しない
- 戻り値を無視しても bind 自体は動作する
- 同一要素を含む重複 root で2回 `init` しても、listener 二重化は起きない
- `buildRequest` / `fetch` に関数以外を渡した場合は無視して既定動作する（throw しない）

----

以上
