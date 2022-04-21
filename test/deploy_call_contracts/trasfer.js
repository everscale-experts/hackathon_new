"use strict";
//импортируем методы Taquito и файл с данными тестового аккаунта acc.json
exports.__esModule = true;
var taquito_1 = require("@taquito/taquito");
var signer_1 = require("@taquito/signer");
var acc = require('./account1.json');
var token_transfer = /** @class */ (function () {
    function token_transfer(rpcUrl) {
        this.tezos = new taquito_1.TezosToolkit(rpcUrl);
        this.rpcUrl = rpcUrl;
        //считываем почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
        this.tezos.setSignerProvider(signer_1.InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')));
    }
    // объявляем метод transfer, который принимает параметры:
    //
    // 1) contract — адрес контракта;
    // 2) sender — адрес отправителя;
    // 3) receiver — адрес получателя;
    // 4) amount — количество токенов для отправки.
    token_transfer.prototype.transfer = function (contract, sender, receiver, amount, id) {
        this.tezos.contract
            .at(contract) //обращаемся к контракту по адресу
            .then(function (contract) {
            console.log("Sending " + amount + " from " + sender + " to " + receiver + "...");
            //обращаемся к точке входа transfer, передаем ей адреса отправителя и получателя, а также количество токенов для отправки.
            return contract.methods.transfer([{
                    from_: sender,
                    txs: [
                        {
                            to_: receiver,
                            token_id: id,
                            amount: amount
                        }
                    ]
                }]).send();
        })
            .then(function (op) {
            console.log("Awaiting for " + op.hash + " to be confirmed...");
            return op.confirmation(1).then(function () { return op.hash; }); //ждем одно подтверждение сети
        })
            .then(function (hash) { return console.log("Hash: https://hangzhou.tzstats.com/" + hash); }) //получаем хеш операции
        ["catch"](function (error) { return console.log("Error: " + JSON.stringify(error, null, 2)); });
    };
    return token_transfer;
}());
exports.token_transfer = token_transfer;
