---
id: sdr_request
title: Selective Disclosure Request
---

Users being at the centre of information systems is one of the foundational concepts behind Self Sovereign Identity or
SSI. When users or individuals are placed at the centre of information systems they need a way to share their
information selectively. This is referred to a selective disclosure. The concept is to encourage and promote privacy and
data control for the subjects. There are many use cases documented for this but the simple examples are KYC compliance,
legal age requirements and or banking credit history. If we take the legal age example, a subject may wish to share that
they are of legal age to access a service but should not have to share their actual date of birth, home address, contact
number and other personally identifying information (PII).

```mermaid
flowchart LR
    A[SDR Request] --> B[Agent Message Handler]
    B --> C[Get Credentials for Request]
    C --> D[Select Credentials to Share]
    D --> E[Create Verifiable Presentation]
    E --> F[SDR Response (DIDComm)]
```

A Selective Disclosure Request is a Veramo message type that is created and signed by a DID. It contains a request for
specific Verifiable Credential claims and can specify the issuer(s) of those credentials along with other criteria. The
subject of the request can respond by creating and signing a Verifiable Presentation to include the requested claims.
