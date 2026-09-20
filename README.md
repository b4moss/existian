# @b4moss/existian — Cursor 引き継ぎメモ

## 概要

`@b4moss/existian` は、HTMLの `data-*` 属性を使って、入力値に対する非同期チェックを宣言的に記述するための小さなJavaScriptライブラリ。

主な用途は、

- ユーザー名の存在確認
- メールアドレスの重複確認
- 招待コードの有効性確認
- その他、入力値に応じたAPIベースの非同期チェック

など。

思想としては、

> 「HTML側に最低限の宣言を書くだけで、入力 → debounce → 非同期チェック → 結果に応じた状態表示までを扱える」

ことを目的とする。

HTTP APIそのものを抽象化するライブラリではなく、**DOMイベントと非同期チェックをつなぐ薄いレイヤー**として設計する。

---

# パッケージ

```text
@b4moss/existian
```

Vite + TypeScript/JavaScriptで利用することを想定。

---

# 基本方針

## 1. Declarative

HTML属性によって動作を指定する。

属性プレフィックスはデフォルトで、

```text
data-ex-*
```

とする。

ただし、プレフィックスはユーザー側で変更可能にする。

---

## 2. 小さく保つ

existian自身が以下を担当する：

- DOMイベントの監視
- debounce
- 非同期リクエスト
- requestの排他制御
- stale responseの無視
- timeout
- responseの判定
- state属性の更新

一方で、以下は担当しない：

- UIデザイン
- メッセージの表示方法
- CSS
- テンプレートエンジン
- 任意の式をHTML属性内で評価するDSL
- 複雑なAPIレスポンス変換
- フォーム全体のバリデーションフレームワーク

---

# 基本的なHTML

イメージ：

```html
<input
  type="text"
  data-ex-check="/api/users/exists"
  data-ex-debounce="300"
  data-ex-state="username-state"
>

<p
  id="username-state"
  data-ex-state="username-state"
>
  ...
</p>
```

APIの結果に応じて入力要素などにstateを設定し、表示・非表示や見た目はCSS側で制御する。

---

# State

`data-ex-state` を利用して状態を表現する。

入力側とメッセージ側の双方に同じstate名を指定できる。

例：

```html
<input
  data-ex-check="/api/users/exists"
  data-ex-state="username"
>

<p data-ex-state="username">
  ...
</p>
```

existianは状態そのものをDOM属性等に反映する。

どの状態を表示するか、どのような見た目にするかはCSSの責務。

existianがUIコンポーネントやメッセージ表示システムを持つことは避ける。

---

# debounce

入力イベントを直接APIリクエストに変換しない。

```text
input
  ↓
debounce
  ↓
request
```

`data-ex-debounce` で待機時間を指定する。

単位はミリ秒。

例：

```html
<input
  data-ex-check="/api/users/exists"
  data-ex-debounce="300"
>
```

---

# Request排他

重要な仕様。

**前のrequestが完了するまで、次のdebounceによるrequestを発火させない。**

つまり、

```text
input
 ↓
debounce
 ↓
request ──────────────┐
                      │
input                 │
 ↓                    │
debounce              │
 ↓                    │
待機                   │
                      │
                 request完了
                      │
                      ↓
                 次のrequest
```

という動作にする。

リクエストが大量に並列実行される状態は避ける。

---

# Stale Response

非同期requestでは、古いrequestのresponseが後から返ってくる可能性がある。

そのため、requestごとに識別子を持たせるなどして、

> 現在の状態に対応しない古いresponseは無視する

ようにする。

目的は、

```text
request A
request B
```

の順番で開始した場合に、

```text
response B
response A
```

の順で返ってきても、Aの結果によってBの状態を上書きしないこと。

---

# Timeout

各requestにはtimeoutを設定できる。

```html
<input
  data-ex-check="/api/users/exists"
  data-ex-timeout="5000"
>
```

timeoutを超えたrequestは失敗として扱う。

---

# Attributes

v0.1では以下の属性を中心に実装する。

```text
data-ex-check
data-ex-method
data-ex-debounce
data-ex-timeout
data-ex-pending
data-ex-response-property
data-ex-response-value
data-ex-response-match
data-ex-target
data-ex-events
data-ex-state
```

---

## data-ex-check

チェック先URL。

```html
<input
  data-ex-check="/api/users/exists"
>
```

---

## data-ex-method

HTTP method。

例：

```html
data-ex-method="GET"
```

デフォルトは `GET`。

必要に応じて、

```text
GET
POST
PUT
PATCH
DELETE
```

などを扱える設計にする。

---

## data-ex-debounce

debounce時間。

単位はms。

```html
data-ex-debounce="300"
```

---

## data-ex-timeout

request timeout。

単位はms。

```html
data-ex-timeout="5000"
```

---

## data-ex-pending

request中であることを表すstate等を指定するための属性。

pending状態をUI側で扱えるようにする。

実際の表示方法はCSS側に任せる。

---

## data-ex-response-property

JSON responseのどのpropertyを判定対象にするか。

例えばAPIが、

```json
{
  "exists": true
}
```

を返す場合：

```html
data-ex-response-property="exists"
```

---

## data-ex-response-value

判定対象となる値。

例：

```html
data-ex-response-property="exists"
data-ex-response-value="true"
```

---

## data-ex-response-match

responseの判定方法。

例えば、

```text
exact
regex
```

など。

`response-property` で取り出した値に対して判定する。

複雑なresponse変換や任意コード実行のためのDSLにはしない。

---

# target

`data-ex-target` によって、結果を反映する対象DOMを指定できる。

入力要素自身だけではなく、メッセージ等の別要素を対象にできる設計。

---

# events

`data-ex-events` によって監視するDOMイベントを指定できる。

デフォルトイベントを用意しつつ、必要な場合はユーザー側で変更できるようにする。

例：

```html
data-ex-events="input"
```

---

# Request Body / Headers

単純なケースはHTML属性から扱えるようにする。

ただし、HTML属性だけでJSONオブジェクトの構築や任意の式を表現しようとはしない。

複雑なbodyが必要な場合は、JavaScript側で構築して扱えるようにする。

例えば、

```js
const body = {
  username,
  organizationId,
  options,
};
```

のような複雑なpayloadをJavaScriptで作る。

**HTML属性にテンプレートエンジンや独自式言語を持ち込まない。**

---

# Template Engine / DSL

existianではテンプレートエンジンを導入しない。

また、

```html
data-ex-body="{{ username }}"
```

のような独自テンプレート構文や、

```html
data-ex-body="user.name + ':' + organization.id"
```

のような任意式DSLも作らない。

理由：

- 実装が複雑になる
- HTML属性がプログラム言語化する
- XSS等のセキュリティ上の問題を増やす
- デバッグしづらい
- ライブラリの責務が大きくなる

existianは**宣言的な非同期チェックのための薄いライブラリ**に留める。

---

# UI

existianはUIを持たない。

例えば、

```text
pending
valid
invalid
error
```

などの状態をDOMへ反映するが、

```text
赤文字にする
アイコンを出す
メッセージを表示する
スピナーを出す
```

などはCSS / HTML側の責務。

これにより、Bootstrap、Tailwind、独自CSSなどに依存しない。

---

# 非同期処理の状態

基本的には、

```text
idle
 ↓
pending
 ↓
success / invalid / error
```

のような状態遷移を想定する。

入力値が変更された場合は、新しいチェックへ移行する。

---

# Concurrency / Race Condition

existianでは非同期処理の競合を明示的に扱う。

最低限、

1. debounce
2. request排他
3. stale response無視
4. timeout

を組み合わせる。

特に、

```text
ユーザー入力
 ↓
debounce
 ↓
request
 ↓
response
```

という単純な実装ではなく、

```text
入力が高速に変化する
↓
requestが遅延する
↓
古いresponseが返る
```

ケースを前提に設計する。

---

# Error Handling

ネットワークエラー、HTTPエラー、timeout等は区別できる設計にする。

ただし、existian側でエラーUIを決めない。

エラー状態をDOMへ反映し、UIは利用
