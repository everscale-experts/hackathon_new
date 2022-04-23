#!/usr/bin/env csh
ng build --base-href http://bridge.everangers.com
#if [ ! -d "../../docs/assets"]; then
[ ! -d "../../docs/assets" ] && mkdir ../../docs/assets
#fi
rm ../../docs/main.*.js
rm ../../docs/polyfills.*.js
rm ../../docs/runtime.*.js
rm ../../docs/styles.*.css
#rm ../../docs/assets/img/*
rm -rf ../../docs/assets/*
mv dist/bridge/assets/* ../../docs/assets/
rmdir dist/bridge/assets
mv dist/bridge/* ../../docs/
rmdir dist/bridge
rmdir dist
