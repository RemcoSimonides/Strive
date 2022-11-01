#!/bin/sh
set -eo pipefail

gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" --output ./.github/secrets/Strive_Journal.mobileprovision.mobileprovision ./.github/secrets/Strive_Journal.mobileprovision.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" --output ./.github/secrets/strive_p12.p12 ./.github/secrets/strive_p12.p12.gpg

mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

cp ./.github/secrets/Strive_Journal.mobileprovision.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/Strive_Journal.mobileprovision.mobileprovision


security create-keychain -p "" build.keychain
security import ./.github/secrets/strive_p12.p12 -t agg -k ~/Library/Keychains/build.keychain -P "" -A

security list-keychains -s ~/Library/Keychains/build.keychain
security default-keychain -s ~/Library/Keychains/build.keychain
security unlock-keychain -p "" ~/Library/Keychains/build.keychain

security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/build.keychain