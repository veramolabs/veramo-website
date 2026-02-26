---
id: versioning
title: Versioning
sidebar_label: Versioning
---

Veramo is a production-ready framework. We want to make sure that the road is as smooth as possible for anyone
building applications on Veramo. If you are planning on deploying an application in
production please [contact us here](https://github.com/decentralized-identity/veramo/discussions) and talk
with us about your plans.

Veramo packages are released under multiple tags to allow usage of the cutting edge or experimental features alongside
official releases. The default tag is `@latest`

```bash
yarn add @veramo/core
# equivalent to
yarn add @veramo/core@latest
# installs a version like @veramo/core@7.x.x
```

The upcoming release is published under the `@next` tag:

```bash
yarn add @veramo/core@next
# installs a version like @veramo/core@7.x.x-next.41
```

Occasionally we may publish experimental code under the `unstable` tag.

```bash
yarn add @veramo/core@unstable
```
