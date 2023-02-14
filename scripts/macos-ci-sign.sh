set -e

if command -v rcodesign &> /dev/null; then
    # If rcodesign is in PATH, call it directly
    program="rcodesign"
else
    # If not, check if a path was provided as first argument
    if [[ -n "$1" && "$1" == *rcodesign ]]; then
        # If a path was provided, call rcodesign with that path
        program="$1"
    else
        # If no path was provided, print an error message
        echo "Error: rcodesign not found in PATH and no path provided as argument" >&2
        echo "Usage: ./macos-ci-sign.sh [</path/to/rcodesign>]" >&2
        exit 1
    fi
fi

entitlements="`pwd`/resources/entitlements.plist"
release_dir="`pwd`/release/Bob.app"

echo "using rcodesign: $program"
echo "using entitlements: $entitlements"
echo "using release_dir: $release_dir"

# Sign
echo "[*] Signing..."
$program sign --remote-signer --remote-public-key-pem-file /tmp/signing_public_key.pem --code-signature-flags runtime --entitlements-xml-path $entitlements $release_dir

# Notarize
echo "[*] Notarizing..."
$program notary-submit --api-key-path /tmp/appstoreconnect_key.json --staple $release_dir

echo "[*] Done."
