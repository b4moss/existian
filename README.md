# @b4moss/existian

Declarative async checks for input values via HTML `data-*` attributes.

Bind an input, debounce, request an API, and reflect `idle` / `pending` / `success` / `invalid` / `error` onto the DOM. Styling is left to your CSS.

## Install

```bash
npm install @b4moss/existian
```

```ts
import { init } from "@b4moss/existian";

const handle = init();
// init({ prefix: "data-ex", root: document });
// handle.unbind(el); handle.refresh(); handle.destroy();
```

CDN (after build / publish):

```html
<script src="https://unpkg.com/@b4moss/existian/dist/existian.iife.min.js"></script>
<script>
  Existian.init();
</script>
```

## Minimal example

```html
<input
  type="text"
  data-ex-check="/api/users/exists"
  data-ex-debounce="300"
  data-ex-timeout="5000"
  data-ex-state="username"
  data-ex-response-property="exists"
  data-ex-response-value="false"
/>

<p data-ex-state="username"></p>

<script type="module">
  import { init } from "@b4moss/existian";
  init();
</script>
```

```css
[data-ex-status="pending"] { opacity: 0.6; }
[data-ex-status="success"] { outline: 2px solid green; }
[data-ex-status="invalid"] { outline: 2px solid red; }
[data-ex-status="error"] { outline: 2px solid purple; }
```

## Attributes (prefix `data-ex`, configurable)

| Attribute | Role |
|-----------|------|
| `data-ex-check` | Check URL (required to bind) |
| `data-ex-method` | HTTP method (default `GET`) |
| `data-ex-debounce` | Debounce ms |
| `data-ex-timeout` | Request timeout ms |
| `data-ex-events` | Event names, space-separated (default `input`) |
| `data-ex-state` | Shared state name for status targets |
| `data-ex-pending` | Extra pending CSS hook value |
| `data-ex-target` | CSS selector for an extra status target |
| `data-ex-response-property` | JSON property to judge |
| `data-ex-response-value` | Expected value (`exact` / `regex`) |
| `data-ex-response-match` | `exact` (default) or `regex` |

Status is written to `data-ex-status`. Errors also set `data-ex-error` (`network` / `http` / `http:<code>` / `timeout`).

### Value transport (v0.1 defaults)

- `GET` / `DELETE`: query `value=<input>`
- `POST` / `PUT` / `PATCH`: JSON body `{"value":"<input>"}`

### JS hooks & lifecycle (v0.2)

```ts
const handle = init({
  buildRequest: (ctx) => ({
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer …" },
      body: JSON.stringify({ username: ctx.value, orgId: 1 }),
    },
  }),
  // fetch: customFetch,
});

handle.refresh(); // bind newly added [data-ex-check] under root
handle.unbind(inputEl);
handle.destroy();
```

No attribute template DSL — complex payloads stay in JS.

## Concurrency

- Debounce before request
- At most one in-flight request per bound element (latest value queued)
- Stale responses ignored via generation id
- Timeout supported

## Out of scope

- UI components / message copy / CSS frameworks
- Attribute template DSL / expression language
- Full form validation framework

## Doc site

Public smoke page: [https://existian.oss.b4m.jp/](https://existian.oss.b4m.jp/)

```bash
npm run build:doc-site
# serve doc-site/ (needs vendor/existian.iife.min.js from the build)
```

Deploy: merge/push to the `doc-site` branch (GitHub Pages).

## Develop

```bash
npm install
npm test
npm run build
npm run build:doc-site
```

Docs: [docs/main.md](./docs/main.md) · [docs/roadmap.md](./docs/roadmap.md)

## Release / npm

- Delivery branch: `release` (charter)
- Publish: GitHub Release for `v*` whose commit is on `release` ancestry (`.github/workflows/publish.yml`)
- Requires repository secret `NPM_TOKEN` for the first publish

## License

MIT
