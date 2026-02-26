#!/usr/bin/env bash

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CODEBLOCKS_DIR="$REPO_ROOT/temp/codeblocks"

mkdir -p "$CODEBLOCKS_DIR"

# Bootstrap or refresh the isolated package environment
if [ ! -f "$CODEBLOCKS_DIR/package.json" ]; then
  echo "Initialising package environment in $CODEBLOCKS_DIR..."
  echo '{"name":"codeblock-checker","version":"1.0.0","type":"module","private":true}' > "$CODEBLOCKS_DIR/package.json"

  pnpm add --dir "$CODEBLOCKS_DIR" \
    @veramo/core@latest \
    @veramo/core-types@latest \
    @veramo/credential-w3c@latest \
    @veramo/credential-jwt@latest \
    @veramo/credential-ld@latest \
    @veramo/credential-eip712@latest \
    @veramo/credential-status@latest \
    @veramo/data-store@latest \
    @veramo/data-store-json@latest \
    @veramo/did-comm@latest \
    @veramo/did-discovery@latest \
    @veramo/did-jwt@latest \
    @veramo/did-manager@latest \
    @veramo/did-provider-ethr@latest \
    @veramo/did-provider-ion@latest \
    @veramo/did-provider-jwk@latest \
    @veramo/did-provider-key@latest \
    @veramo/did-provider-peer@latest \
    @veramo/did-provider-pkh@latest \
    @veramo/did-provider-web@latest \
    @veramo/did-resolver@latest \
    @veramo/key-manager@latest \
    @veramo/kms-local@latest \
    @veramo/kms-web3@latest \
    @veramo/message-handler@latest \
    @veramo/remote-client@latest \
    @veramo/remote-server@latest \
    @veramo/selective-disclosure@latest \
    @veramo/url-handler@latest \
    @veramo/utils@latest \
    ethr-did-resolver@latest \
    web-did-resolver@latest \
    express@^4 \
    typeorm@latest
fi

exec pnpm tsx "$REPO_ROOT/scripts/extract-and-check.ts" "$@"
