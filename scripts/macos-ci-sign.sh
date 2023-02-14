set -e

rcodesign sign --remote-signer --remote-public-key-pem-file /tmp/signing_public_key.pem --code-signature-flags runtime --entitlements-xml-path resources/entitlements.plist release/Bob.app
