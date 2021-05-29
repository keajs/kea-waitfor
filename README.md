[![NPM Version](https://img.shields.io/npm/v/kea-waitfor.svg)](https://www.npmjs.com/package/kea-waitfor)
[![minified](https://badgen.net/bundlephobia/min/kea-waitfor)](https://bundlephobia.com/result?p=kea-waitfor)
[![minified + gzipped](https://badgen.net/bundlephobia/minzip/kea-waitfor)](https://bundlephobia.com/result?p=kea-waitfor)
[![Backers on Open Collective](https://opencollective.com/kea/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/kea/sponsors/badge.svg)](#sponsors)

# kea-waitfor

Promise that waits for an action

## What and why?

Use in tests or with SSR to wait for a specific action

## Getting started

Add the package:

```sh
yarn add kea-waitfor
```

... then add it to kea's plugins list:

```js
import { waitForPlugin } from 'kea-waitfor'

resetContext({
  plugins: [waitForPlugin]
})
```

## Sample usage

[Read the documentation](https://kea.js.org/docs/plugins/waitfor)
