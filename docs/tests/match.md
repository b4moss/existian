# match

JSON response から property を取り出し、設定に従って success / invalid を判定する。

---

### matchResponse

- 引数: パース済み JSON（object 等）、設定 `{ property?: string; value?: string; match?: "exact" | "regex" }`
- `property` 未指定のとき: HTTP 成功前提の呼び出しでは判定を成功（`success`）とする（呼び出し側が非2xx を既に error にしている）
- `property` 指定時: そのキーの値を取り出し、`match`（既定 `exact`）と `value` で比較する
  - `exact`: 取り出し値を文字列化した結果と `value` が一致すれば `success`、否则 `invalid`
  - `regex`: 取り出し値の文字列に対し `value` を正規表現として試し、マッチすれば `success`、否则 `invalid`
- boolean 等は文字列化して比較する（例: `true` ↔ `"true"`）
- 戻り値は少なくとも `{ status: "success" | "invalid" }`（必要なら詳細メッセージは持たない）

#### テスト：正常系

- body `{ "exists": true }`、`property="exists"`、`value="true"`、`match="exact"` → `success`
- 同上で `value="false"` → `invalid`
- `property` 未指定 → `success`
- `match="regex"`、`property="code"`、body `{ "code": "AB-12" }`、`value="^AB-"` → `success`

#### テスト: 異常系

- `property` が body に存在しない → `invalid`（throw しない）
- `match="regex"` で `value` が不正な正規表現 → `invalid` または安全な失敗（throw で呼び出し元を壊さない）
- body が `null` / 非 object で `property` 指定あり → `invalid`
- 未知の `match` 種別 → `invalid`（または exact へフォールバックせず失敗として明示）

----

以上
