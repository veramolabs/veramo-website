---
id: react_setup_resolver
title: React Setup & Resolver
sidebar_label: Setup & Resolver
---

Veramo core runs natively in the browser. The plugins you use also need to be browser compatible. This guide sets up
a DID resolver in a [Vite](https://vite.dev/) React application.
It is possible to add your own identity, key management, and storage plugins that are browser compatible.

### Initialize app

Scaffold a new Vite project with the React TypeScript template:

```bash
npm create vite@latest veramo-react-app -- --template react-ts
cd veramo-react-app
npm install
```

Install veramo core, DIDResolverPlugin and some specific DID resolver implementations:

```bash
npm install @veramo/core @veramo/did-resolver ethr-did-resolver web-did-resolver
```

### Create agent setup file

Create a setup file in `src/veramo/setup.ts` and add the following code, replacing the `INFURA_PROJECT_ID` with your
own.

```ts
import { createAgent } from '@veramo/core'
import type { IResolver } from '@veramo/core'

import { DIDResolverPlugin } from '@veramo/did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = '<your PROJECT_ID here>'

export const agent = createAgent<IResolver>({
  plugins: [
    new DIDResolverPlugin({
      ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
      ...webDidResolver(),
    }),
  ],
})
```

### Add styles

Open `src/App.css` and add the following styles to the top of the file:

```css
pre {
  font-family: monospace;
  white-space: pre;
}

#result {
  text-align: left;
  width: 900px;
  background-color: #24232d;
  color: #25c2a0;
  padding: 15px;
  overflow: scroll;
}
```

### Update App component

Open `src/App.tsx` and replace with the following code:

```tsx
import { useEffect, useState } from 'react'
import './App.css'

import { agent } from './veramo/setup'

function App() {
  const [didDoc, setDidDoc] = useState<any>()

  const resolve = async () => {
    const doc = await agent.resolveDid({
      didUrl: 'did:ethr:sepolia:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
    })

    setDidDoc(doc)
  }

  useEffect(() => {
    resolve()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <pre id="result">{didDoc && JSON.stringify(didDoc, null, 2)}</pre>
      </header>
    </div>
  )
}

export default App
```

And that's it! When you `npm run dev` you should see a DID document being resolved instead of the default landing page.

## Troubleshooting

### Dependency issues

Some of the Veramo packages that have to do with Verifiable Credentials (like `@veramo/credential-ld`) depend on a set
of libraries from the `jsonld` ecosystem which weren't designed with the same multi-platform targets in mind. Forks of
these dependencies exist, that work in all environments where Veramo should work, but you have to aid your package
manager in finding them.

The solution is to add an `overrides` block to your `package.json` file and replacing the problematic dependencies:

```json5
// filename: package.json
{
  // ...
  overrides: {
    jsonld: 'npm:@digitalcredentials/jsonld@^6.0.0',
  },
}
```

Take a look at the [`Troubleshooting page`](../troubleshooting.md) for additional options.
