#!/usr/bin/env csh
ng build --base-href http://bridge.everangers.com
#if [ ! -d "../../assets"]; then
[ ! -d "../../assets" ] && mkdir ../../assets
#fi
rm ../../main.*.js
rm ../../polyfills.*.js
rm ../../runtime.*.js
rm ../../styles.*.css
rm ../../assets/*
mv dist/bridge/assets/* ../../assets/
rmdir dist/bridge/assets
mv dist/bridge/* ../../
rmdir dist/bridge
rmdir dist
