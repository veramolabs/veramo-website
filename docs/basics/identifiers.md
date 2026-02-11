---
id: identifiers
title: Identifiers
---

`Decentralized Identifier` or `DID` is a critical component of verifiable data. A `DID` is a new type of unique
identifier which can be created independent of a central authority. The subject that the `DID` refers to can prove
control over the `DID` using cryptographic proofs. In a verifiable data context, a `DID` can be used to verify the
provenance and ownership of the data by linking to the verification method for the attached proof.

## Decentralized Identifier

Different flavors of `DIDs` exist today. The flavor of a `DID` or more accurately the `DID Method` defines how C.R.U.D.
operations for that `DID` type are executed. Each `DID Method` has different tradeoffs in specific use cases.
For example, a `did:web` can be created without a Blockchain but `DID Methods` exist that have a dependency on a
Blockchain. All of them are valid `DIDs` but have different guarantees.

The example below shows how a `did:web` for [veramo.io](https://veramo.io) might look like.

```
did:web:veramo.io
```

### DID Creation

When a `DID` is created, it is typically associated with a private and public key pair. The public key will be visible
in the `DID Document`. This allows the controller/subject of the `DID` to generate proofs that are verifiable by anyone
that has the corresponding `DID Document` for that `DID`. The process of retrieving the `DID Document` from a `DID` is
called `DID Resolution`.

### DID Resolution

A `DID Resolver` can take `DID` as input and resolve the `DID Document`. This is an important concept in how data flows
in verifiable data systems.

### DID Document

Every `DID` has a `DID Document` that describes the `DID` subject. In the case of `did:web` the `DID Document` is hosted
on the website in the following format. It contains essential cryptographic information and also services that the `DID`
has available. This is the foundation of how `DIDs` can start to communicate with each other.

```json5
// https://veramo.io/.well-known/did.json

{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/v2",
    "https://w3id.org/security/suites/secp256k1recovery-2020/v2",
    "https://w3id.org/security/suites/ed25519-2018/v1"
  ],
  "id": "did:web:veramo.io",
  "verificationMethod": [
    {
      "id": "did:web:veramo.io#root-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:web:veramo.io",
      "publicKeyHex": "042b0af9b3ae6c7c3a90b01a3879d9518081bc0dcdf038488db9cb109b082a77d97ea3373e3dfde0eccd9adbdce11d0302ea5c098dbb0b310234c86895c8641622"
    },
    {
      "id": "did:web:veramo.io#root-2",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:web:veramo.io",
      "publicKeyBase58": "ZG6NM2qB1CwADHmJsbGqWVhwmGLrVACBu7xmXJNMWLH"
    },
    {
      "id": "did:web:veramo.io#root-3",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:web:veramo.io",
      "publicKeyMultibase": "z6Mkf1X8xbHGWYhQGi8TzSZ7gc3hmLYCGNQYsv2tboGPGj7f"
    }
  ],
  "authentication": ["did:web:veramo.io#root-1", "did:web:veramo.io#root-2", "did:web:veramo.io#root-3"],
  "assertionMethod": ["did:web:veramo.io#root-1", "did:web:veramo.io#root-2", "did:web:veramo.io#root-3"],
  "keyAgreement": ["did:web:veramo.io#root-2", "did:web:veramo.io#root-3"],
  "service": []
}
```

### DID Methods

Explainer on what a DID method is and links to supported [DID Methods](../veramo_agent/did_methods.md) page
