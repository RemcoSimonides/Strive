#!/bin/bash

set -eo pipefail

xcodebuild -archivePath $PWD/build/App.xcarchive \
            -exportOptionsPlist App/App\ iOS/exportOptions.plist \
            -exportPath $PWD/build \
            -allowProvisioningUpdates \
            -exportArchive | xcpretty