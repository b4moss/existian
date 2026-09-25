# lifecycle

`init` が返す Handle で、購読と内部 runner を解放・再スキャンする。

公開 API:

```ts
type ExistianHandle = {
  unbind(element: Element): void;
  destroy(): void;
  refresh(): void;
};

init(options?: InitOptions): ExistianHandle;
```

- 「同一要素は二重 bind しない」は維持する
- `unbind` は listener 解除・debouncer cancel・当該要素を再 bind 可能にする
- `destroy` は当該 `init` 呼び出しが bind した要素をすべて `unbind` 相当にする
- `refresh` は同じ `prefix` / `root` / フック設定で、未 bind の `{prefix}-check` 要素だけ追加 bind する

---

### unbind

- 引数の要素に付与したイベント listener を外す
- 保留中の debounce を cancel する
- in-flight request はそのまま完了してよいが、完了後の状態更新は行わない（世代無効化または unbound フラグ）
- `WeakSet`（または同等）から外し、以降の `refresh` / `init` で再 bind できる

#### テスト：正常系

- bind 済み input を `unbind` したあと `input` イベントを発火しても fetch が走らない
- `unbind` 後に同じ要素へ再度 `refresh`（または同じ Handle 経由の再 bind）すると、再びイベントで fetch が走る
- `unbind` 中に in-flight だった request が後から成功しても、`data-ex-status` は更新されない

#### テスト: 異常系

- 一度も bind していない要素を `unbind` しても throw しない
- 同じ要素を連続 `unbind` しても throw しない
- `unbind` 後に要素が DOM から削除されていても throw しない

---

### destroy

- 当該 Handle が把握している全 bind を解除する（`unbind` 相当をすべて）
- 解除後、その Handle の `refresh` は空振りまたは再 bind 可能な初期状態（実装は「options を保持し refresh で再スキャン可」とする）

#### テスト：正常系

- 複数要素を bind したあと `destroy` すると、どの要素のイベントでも fetch が走らない
- `destroy` 後に `refresh` を呼ぶと、root 内の check 要素が再び bind される
- `destroy` を1回呼べば、内部に残っていた debounce タイマーは発火しない

#### テスト: 異常系

- `destroy` を連続呼び出ししても throw しない
- `destroy` 後の `unbind(任意要素)` は no-op で throw しない
- 他の `init()` 呼び出しが作った Handle の bind には影響しない（Handle は独立）

---

### refresh

- 現在の Handle の `root` / `prefix` / `buildRequest` / `fetch` を使い、未 bind の check 要素だけ bind する
- 既に bind 済みの要素は触らない（二重 listener にしない）

#### テスト：正常系

- `init` 後に DOM へ新しい `data-ex-check` 要素を追加し `refresh` すると、その要素の入力で fetch が走る
- 既存 bind 要素は `refresh` しても listener が増えず、1回の input で fetch が1回だけになる
- `refresh` は Handle 作成時の `prefix` を使い、別 prefix の要素は bind しない

#### テスト: 異常系

- 追加要素に `check` が無い場合は bind 対象外のまま
- `root` 外に追加した要素は `refresh` しても bind されない
- `destroy` 前と後で `refresh` の対象集合が Handle のルールに従う（destroy 後は再スキャンで全 check を bind し直せる）

----

以上
