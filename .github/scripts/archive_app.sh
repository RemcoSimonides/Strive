#!/bin/bash

set -eo pipefail

xcodebuild -workspace App.xcworkspace \
            -scheme App\ iOS \
            -sdk iphoneos \
            -configuration AppStoreDistribution \
            -archivePath $PWD/build/App.xcarchive \
            clean archive | xcpretty