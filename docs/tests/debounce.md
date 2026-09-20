# debounce

入力イベントを直接 request にせず、指定ミリ秒の静止後に1回だけ後続を実行する。

---

### createDebouncer

- 引数: `waitMs: number`、`callback: (...args) => void`
- 返す関数（またはオブジェクトの `schedule`）を連続呼び出ししても、最後の呼び出しから `waitMs` 経過後に `callback` が1回だけ走る
- 新しい呼び出しは、未発火のタイマーをリセットする（trailing debounce）
- `waitMs` が `0` のときは、可能な限り即座に（同一タスクまたは次マイクロタスク相当で）1回走る挙動でよい
- キャンセル手段（例: `cancel`）を持ち、キャンセル後は保留中の callback を呼ばない

#### テスト：正常系

- `waitMs=300` で 100ms 間隔の呼び出しを3回すると、最後から 300ms 後に callback がちょうど1回だけ呼ばれ、引数は最後の呼び出しのものになる
- 呼び出しが1回だけのとき、`waitMs` 後に1回 callback が呼ばれる
- `cancel` 後は、経過しても callback が呼ばれない

#### テスト: 異常系

- `waitMs` が負数のときは `0` 相当として扱う（throw しない）
- callback が throw しても、debouncer 自体は再利用可能な状態を保つ（次の schedule を受け付ける）
- `cancel` を複数回呼んでも throw しない

----

以上
