curl -X 'POST' \
  'https://token-indexer.broxus.com/v1/balances' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "limit": 10,
  "offset": 0,
  "ordering": "amountdescending",
  "ownerAddress": "0:8b8e726e75e532c004cda463ed7c40d726c0f67bb57e229c7e0d32c209ee5a2f"
}'

curl -X 'POST' \
  'https://token-indexer-test.broxus.com/v1/balances' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "limit": 10,
  "offset": 0,
  "ordering": "amountdescending",
  "ownerAddress": "0:f594f640f53058c65b1b196303f9f72096c28a9871a8c16b66b4d611266123ab"
}'


{"balances":[{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"5","rootAddress":"0:dfc359dc7df75fd90beb956cfb202d5c467e65994efa7df8327fcf8e11437791","token":"SHUJAA","blockTime":1643747714000,"tokenStandard":"OldTip3v4"},{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"0.358996989000","rootAddress":"0:a49cd4e158a9a15555e624759e2e4e766d22600b7800d891e46f9291f044a93d","token":"WEVER","blockTime":1645171866000,"tokenStandard":"Tip3"},{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"0","rootAddress":"0:a453e9973010fadd4895e0d37c1ad15cba97f4fd31ef17663343f79768f678d9","token":"BRIDGE","blockTime":1635096564000,"tokenStandard":"OldTip3v4"},{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"0","rootAddress":"0:751b6e22687891bdc1706c8d91bf77281237f7453d27dc3106c640ec165a2abf","token":"USDT","blockTime":1634923723000,"tokenStandard":"OldTip3v4"},{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"0","rootAddress":"0:cf98f44a7b459ffd553d4e6faceb8e64f9e6ca455fc5cd86be00819c44c98fbd","token":"TONSWAP-LP-WTON-DAI","blockTime":1638023634000,"tokenStandard":"OldTip3v4"},{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"0","rootAddress":"0:1ad0575f0f98f87a07ec505c39839cb9766c70a11dadbfc171f59b2818759819","token":"USDC","blockTime":1634930314000,"tokenStandard":"OldTip3v4"},{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"0","rootAddress":"0:45f682b7e783283caef3f268e10073cf08842bce20041d5224c38d87df9f2e90","token":"WETH","blockTime":1639202370000,"tokenStandard":"OldTip3v4"},{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"0","rootAddress":"0:54214f59a86f886bd1e9b427b7fc1c231b42260d3dd952196525cf6cf2a06050","token":"TONSWAP-LP-WTON-WETH","blockTime":1639202842000,"tokenStandard":"OldTip3v4"},{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"0","rootAddress":"0:251a96c96d0b66ef44490be51b125422eff0025c0d41b6a73ce6e82d0fcbce80","token":"TONSWAP-LP-WBTC-BRIDGE","blockTime":1635146401000,"tokenStandard":"OldTip3v4"},{"ownerAddress":"0:9b435a6aaa0ee37296445bfb115dc89ee36a4803b24702c2424dfc718987b64b","amount":"0","rootAddress":"0:53c8de16a74fa56c86c56eeac7374b7c6f024629ca69d9fd535704e68bec7434","token":"TONSWAP-LP-WTON-USDT","blockTime":1634924261000,"tokenStandard":"OldTip3v4"}],"offset":0,"limit":10,"totalCount":28}root@vm3235453:/var/games/ever/hackathon_new/test/webpage/simplepage#
