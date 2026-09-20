# attrs

属性プレフィックス付き `data-*` から、1 要素分のチェック設定を読み取る。

---

### readAttrs

- 第1引数の `Element` から、第2引数の prefix（既定相当 `data-ex`）に基づく属性を読む
- 返す設定には少なくとも次を含む: `check`（URL）, `method`, `debounceMs`, `timeoutMs`, `events`, `state`, `pending`, `target`, `responseProperty`, `responseValue`, `responseMatch`
- 欠落時の既定: `method` は `GET`、`events` は `["input"]`、`responseMatch` は `"exact"`。数値系欠落は「未設定」（呼び出し側が既定を補ってよい）
- `data-ex-events` は空白区切りで複数イベントに分割する
- `check` 属性が無い場合は設定として無効（呼び出し側が bind 対象外にする）

#### テスト：正常系

- prefix `data-ex` で `data-ex-check="/api/x"` のみある要素から、`check` が `"/api/x"`、`method` が `"GET"`、`events` が `["input"]`、`responseMatch` が `"exact"` になる
- `data-ex-method="POST"`、`data-ex-debounce="300"`、`data-ex-timeout="5000"`、`data-ex-events="input change"`、`data-ex-state="username"`、`data-ex-pending="busy"`、`data-ex-target="#msg"`、`data-ex-response-property="exists"`、`data-ex-response-value="true"`、`data-ex-response-match="regex"` をすべて正しくパースする
- prefix を `data-my` に変えると `data-my-check` 等を読み、`data-ex-check` は無視する

#### テスト: 異常系

- `data-ex-check` が無い要素では、無効（例: `check` が空または `null`）と分かる結果になる
- `data-ex-debounce="abc"` や空文字など非数値は、未設定または無効値として扱い、例外で落とさない
- `data-ex-method` が空文字のときは既定 `GET` にフォールバックする
- 未知の `data-ex-response-match` 値は読み取り結果にそのまま載せてもよいが、後段 `matchResponse` が失敗扱いにできるよう文字列として返す（ここで throw しない）

----

以上
