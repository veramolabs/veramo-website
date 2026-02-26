---
id: package_overview
title: Package Overview
sidebar_label: Package Overview
---

Veramo is published as a collection of focused packages. The [Plugins](./plugins.md) page
covers the most commonly used ones. This page fills in the rest — one entry per package with
a summary, typical use case, and a link to the generated API reference.

## Credential Formats

These packages provide `CredentialProvider` implementations that plug into
[`CredentialPlugin`](../api/credential-w3c.md) (v7+).

### `@veramo/credential-w3c`

The core credential plugin. Provides `CredentialPlugin`, which accepts an array of
`CredentialProvider` instances and exposes `createVerifiableCredential` /
`verifyCredential` on the agent. See [Plugins](./plugins.md) for details.

[API Reference](../api/credential-w3c.md)

### `@veramo/credential-jwt`

Provides `CredentialProviderJWT`, which issues and verifies W3C Verifiable Credentials
using a compact JWT proof (`JwtProof2020`). This is the most common proof format and the
one used in all Node tutorials.

```typescript
import { CredentialProviderJWT } from '@veramo/credential-jwt'
import { CredentialPlugin } from '@veramo/credential-w3c'

const jwtCredentialPlugin = new CredentialPlugin([new CredentialProviderJWT()])
```

[API Reference](../api/credential-jwt.md)

### `@veramo/credential-ld`

Provides `CredentialProviderLD`, which issues and verifies W3C Verifiable Credentials
using JSON-LD / Linked Data Proofs. Use this when you need interoperability with systems
that require JSON-LD context processing or specific LD signature suites such as
`Ed25519Signature2018`.

[API Reference](../api/credential-ld.md)

### `@veramo/credential-eip712`

Provides `CredentialProviderEIP712`, which issues credentials with an
`EthereumEIP712Signature2021` proof — a typed-data signature defined by EIP-712. Use this
in Ethereum-native applications where credentials must be verifiable using standard
`eth_signTypedData` tooling.

```typescript
import { CredentialProviderEIP712 } from '@veramo/credential-eip712'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { CredentialProviderJWT } from '@veramo/credential-jwt'

const eip712CredentialPlugin = new CredentialPlugin([
  new CredentialProviderJWT(),
  new CredentialProviderEIP712(),
])
```

[API Reference](../api/credential-eip712.md)

### `@veramo/credential-status`

Provides `CredentialStatusPlugin`, which implements `ICredentialStatusVerifier`. It
aggregates pluggable status checkers (e.g. StatusList2021) so that
`verifyCredential` can also validate whether a credential has been revoked or suspended.
Add it to the agent alongside `CredentialPlugin` when your application needs revocation
support.

[API Reference](../api/credential-status.md)

---

## DID Methods

### `@veramo/did-provider-ethr` / `@veramo/did-provider-web` / `@veramo/did-provider-key`

The three most commonly used DID providers. See [Plugins](./plugins.md) and
[DID Methods](./did_methods.md) for details.

### `@veramo/did-provider-ion`

Provides `IonDIDProvider` for creating and managing `did:ion` identifiers. ION is a
Bitcoin-anchored DID network built by Microsoft; DIDs are long-form by default (no
network round-trip required to resolve) and can be published to the ION node network for
shorter form resolution.

```typescript
import { IonDIDProvider } from '@veramo/did-provider-ion'

const ionProvider = new IonDIDProvider({ defaultKms: 'local' })
```

[API Reference](../api/did-provider-ion.md)

### `@veramo/did-provider-jwk`

Provides `JwkDIDProvider` for `did:jwk` identifiers. A `did:jwk` DID encodes the public
key directly in the DID string as a base64url-encoded JWK, making it entirely
self-contained — no resolver network needed.

```typescript
import { JwkDIDProvider } from '@veramo/did-provider-jwk'

const jwkProvider = new JwkDIDProvider({ defaultKms: 'local' })
```

[API Reference](../api/did-provider-jwk.md)

### `@veramo/did-provider-peer`

Provides `PeerDIDProvider` for `did:peer` identifiers (num_algo 0 and 2). Peer DIDs
require no ledger and are designed for private, peer-to-peer DID exchange — ideal for
DIDComm messaging between two parties that do not need public resolvability.

```typescript
import { PeerDIDProvider } from '@veramo/did-provider-peer'

const peerProvider = new PeerDIDProvider({ defaultKms: 'local' })
```

[API Reference](../api/did-provider-peer.md)

### `@veramo/did-provider-pkh`

Provides `PkhDIDProvider` for `did:pkh` identifiers. A `did:pkh` DID is derived directly
from a blockchain account address (e.g. `did:pkh:eip155:1:0xabc…`), making it easy to
bridge an existing Web3 wallet into the DID ecosystem without creating any new key
material.

```typescript
import { PkhDIDProvider } from '@veramo/did-provider-pkh'

const pkhProvider = new PkhDIDProvider({ defaultKms: 'local' })
```

[API Reference](../api/did-provider-pkh.md)

---

## Storage

### `@veramo/data-store`

The primary storage plugin, backed by TypeORM (SQLite, Postgres, etc.). See
[Plugins](./plugins.md) for details.

### `@veramo/data-store-json`

Provides `DataStoreJson` — a lighter alternative to `@veramo/data-store` that stores all
agent data in a single in-memory JSON object. An update callback fires on every write so
you can persist the JSON anywhere (file, localStorage, S3, etc.). Use it for tests, CLI
tools, browser extensions, or any environment where SQLite is unavailable.

```typescript
import { DataStoreJson, DIDStoreJson, KeyStoreJson, PrivateKeyStoreJson } from '@veramo/data-store-json'
import type { VeramoJsonStore } from '@veramo/data-store-json'

const jsonCache: VeramoJsonStore = {
  notifyUpdate: async () => { /* persist here */ },
}

const dataStore = new DataStoreJson(jsonCache)
const didStore = new DIDStoreJson(jsonCache)
const keyStore = new KeyStoreJson(jsonCache)
const privateKeyStore = new PrivateKeyStoreJson(jsonCache)
```

[API Reference](../api/data-store-json.md)

---

## Key Management

### `@veramo/key-manager` / `@veramo/kms-local`

The standard key management stack. See [Plugins](./plugins.md) for details.

### `@veramo/kms-web3`

Provides `Web3KeyManagementSystem`, a KMS implementation that uses the account addresses
of a connected Web3 wallet (MetaMask, WalletConnect, etc.) as key identifiers. All
signing operations are delegated to the wallet — the agent never has access to the private
key material. Use this for browser-based agents where the user's existing Ethereum wallet
should be the signing authority.

[API Reference](../api/kms-web3.md)

---

## Messaging & Resolution

### `@veramo/message-handler` / `@veramo/did-comm`

The core messaging pipeline and DIDComm encrypted messaging. See [Message Handlers](./message_handlers.md)
and [Plugins](./plugins.md) for details.

### `@veramo/did-jwt`

Provides `JwtMessageHandler`, a plugin for the `MessageHandler` chain that detects and
verifies JWTs in incoming messages. Add it to the handler chain before any handlers that
expect a decoded message payload.

```typescript
import { JwtMessageHandler } from '@veramo/did-jwt'

const jwtHandler = new JwtMessageHandler()
```

[API Reference](../api/did-jwt.md)

### `@veramo/did-discovery`

Provides `DIDDiscovery`, which searches for DIDs across multiple pluggable discovery
providers. Providers can query local stores, name registries, or any custom source.
Results from all providers are merged and returned as a ranked list of matches.

```typescript
import { DIDDiscovery } from '@veramo/did-discovery'

const discovery = new DIDDiscovery({ providers: [] })
```

[API Reference](../api/did-discovery.md)

### `@veramo/url-handler`

Provides `UrlMessageHandler`, a plugin for the `MessageHandler` chain that extracts a raw
message from a URL. It handles two cases: the message is embedded in the URL query string,
or the URL points to a remote resource that is fetched via HTTP. Use it when your agent
needs to process messages delivered as links (e.g. QR code flows).

```typescript
import { UrlMessageHandler } from '@veramo/url-handler'

const urlHandler = new UrlMessageHandler()
```

[API Reference](../api/url-handler.md)

---

## Infrastructure

### `@veramo/remote-server` / `@veramo/remote-client` / `@veramo/did-resolver`

Remote agent exposure, remote agent client, and DID resolution. See [Plugins](./plugins.md)
for details.

### `@veramo/utils`

A collection of helper functions used internally by all Veramo plugins. Import directly
when building custom plugins. Key utilities include:

- **Key conversion**: `convertEd25519PublicKeyToX25519`, `convertIdentifierEncryptionKeys`,
  `extractPublicKeyHex`, `compressIdentifierSecp256k1Keys`
- **Encoding**: `hexToBytes`, `bytesToHex`, `encodeBase64url`, `decodeBase64url`,
  `encodeJoseBlob`, `decodeJoseBlob`
- **DID helpers**: `mapIdentifierKeysToDoc`, `dereferenceDidKeys`, `resolveDidOrThrow`,
  `extractIssuer`, `removeDIDParameters`
- **Credential helpers**: `decodeCredentialToObject`, `decodePresentationToObject`,
  `computeEntryHash`

```typescript
import { hexToBytes, bytesToHex, encodeBase64url, decodeBase64url } from '@veramo/utils'

const bytes = hexToBytes('deadbeef')
const hex = bytesToHex(bytes)
const encoded = encodeBase64url('hello world')
const decoded = decodeBase64url(encoded)
```

[API Reference](../api/utils.md)
