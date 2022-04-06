import { TezosToolkit } from '@taquito/taquito'
import { importKey } from '@taquito/signer'
const acc = require('./acc.json')


const provider = 'https://hangzhounet.api.tez.ie'

async function deploy() {
 const tezos = new TezosToolkit(provider)
 await importKey(
   tezos,
   'ornuxbwr.unviuobi@teztnets.xyz', //mail
   '5HllvNGeG4', //password
   [
    'chat',
		'boring',
		'town',
		'fall',
		'donkey',
		'elite',
		'rely',
		'frost',
		'post',
		'nut',
		'spider',
		'attend',
		'wisdom',
		'snake',
		'duck', //passphrase
   ].join(' '),
   'edskRxqRARbqUGY8RjDWJhNKXpTqFBfhY7xdx46zrPLKvLsZphzn9YM8j5SNPNr5dUsfQ3X1ttXP1KGP1swVMDdj4T7f7TuxPc'//private key
 )
 try {
     const op = await tezos.contract.originate({
       //smart contract code
       code: `{ parameter
           (or (or (or %admin (or (unit %confirm_admin) (bool %pause)) (address %set_admin))
                   (or %assets
                      (or (pair %balance_of
                             (list %requests (pair (address %owner) (nat %token_id)))
                             (contract %callback
                                (list (pair (pair %request (address %owner) (nat %token_id)) (nat %balance)))))
                          (list %transfer
                             (pair (address %from_)
                                   (list %txs (pair (address %to_) (pair (nat %token_id) (nat %amount)))))))
                      (list %update_operators
                         (or (pair %add_operator (address %owner) (pair (address %operator) (nat %token_id)))
                             (pair %remove_operator (address %owner) (pair (address %operator) (nat %token_id)))))))
               (or %tokens
                  (list %burn_tokens (pair (address %owner) (nat %amount)))
                  (list %mint_tokens (pair (address %owner) (nat %amount))))) ;
         storage
           (pair (pair (pair %admin (pair (address %admin) (bool %paused)) (option %pending_admin address))
                       (pair %assets
                          (pair (big_map %ledger address nat)
                                (big_map %operators (pair address (pair address nat)) unit))
                          (pair (big_map %token_metadata nat (pair (nat %token_id) (map %token_info string bytes)))
                                (nat %total_supply))))
                 (big_map %metadata string bytes)) ;
         code { PUSH string "FA2_TOKEN_UNDEFINED" ;
                PUSH string "FA2_INSUFFICIENT_BALANCE" ;
                LAMBDA
                  (pair address (big_map address nat))
                  nat
                  { UNPAIR ; GET ; IF_NONE { PUSH nat 0 } {} } ;
                DUP 3 ;
                DUP 3 ;
                DUP 3 ;
                PAIR 3 ;
                LAMBDA
                  (pair (pair (lambda (pair address (big_map address nat)) nat) (pair string string))
                        (pair (pair (list (pair (option address) (list (pair (option address) (pair nat nat)))))
                                    (lambda
                                       (pair (pair address address) (pair nat (big_map (pair address (pair address nat)) unit)))
                                       unit))
                              (pair (pair (big_map address nat) (big_map (pair address (pair address nat)) unit))
                                    (pair (big_map nat (pair nat (map string bytes))) nat))))
                  (pair (list operation)
                        (pair (pair (big_map address nat) (big_map (pair address (pair address nat)) unit))
                              (pair (big_map nat (pair nat (map string bytes))) nat)))
                  { UNPAIR ;
                    UNPAIR 3 ;
                    DIG 3 ;
                    UNPAIR ;
                    UNPAIR ;
                    DUP 3 ;
                    CAR ;
                    CAR ;
                    DUP 4 ;
                    CAR ;
                    CDR ;
                    PAIR ;
                    DUG 2 ;
                    DUP ;
                    DUG 3 ;
                    DIG 2 ;
                    UNPAIR ;
                    SWAP ;
                    DIG 2 ;
                    ITER { DUP ;
                           DUG 2 ;
                           CDR ;
                           ITER { SWAP ;
                                  PUSH nat 0 ;
                                  DUP 3 ;
                                  GET 3 ;
                                  COMPARE ;
                                  NEQ ;
                                  IF { DROP 2 ; DUP 8 ; FAILWITH }
                                     { DUP 3 ;
                                       CAR ;
                                       IF_NONE
                                         {}
                                         { DUP 5 ;
                                           DUP 4 ;
                                           GET 3 ;
                                           PAIR ;
                                           SENDER ;
                                           DUP 3 ;
                                           PAIR ;
                                           PAIR ;
                                           DUP 7 ;
                                           SWAP ;
                                           EXEC ;
                                           DROP ;
                                           SWAP ;
                                           DUP 3 ;
                                           GET 4 ;
                                           DIG 2 ;
                                           DUP 3 ;
                                           SWAP ;
                                           DUP ;
                                           DUG 2 ;
                                           PAIR ;
                                           DUP 11 ;
                                           SWAP ;
                                           EXEC ;
                                           DIG 2 ;
                                           SWAP ;
                                           SUB ;
                                           ISNAT ;
                                           IF_NONE
                                             { DROP 2 ; DUP 8 ; FAILWITH }
                                             { PUSH nat 0 ;
                                               SWAP ;
                                               DUP ;
                                               DUG 2 ;
                                               COMPARE ;
                                               EQ ;
                                               IF { DROP ; NONE nat ; SWAP ; UPDATE }
                                                  { DIG 2 ; SWAP ; SOME ; DIG 2 ; UPDATE } } } ;
                                       SWAP ;
                                       DUP ;
                                       DUG 2 ;
                                       CAR ;
                                       IF_NONE
                                         { SWAP ; DROP }
                                         { SWAP ;
                                           DIG 2 ;
                                           GET 4 ;
                                           DIG 2 ;
                                           DUP 3 ;
                                           SWAP ;
                                           DUP ;
                                           DUG 2 ;
                                           PAIR ;
                                           DUP 10 ;
                                           SWAP ;
                                           EXEC ;
                                           DIG 2 ;
                                           ADD ;
                                           PUSH nat 0 ;
                                           SWAP ;
                                           DUP ;
                                           DUG 2 ;
                                           COMPARE ;
                                           EQ ;
                                           IF { DROP ; NONE nat ; SWAP ; UPDATE }
                                              { DIG 2 ; SWAP ; SOME ; DIG 2 ; UPDATE } } } } ;
                           SWAP ;
                           DROP } ;
                    SWAP ;
                    DIG 2 ;
                    DIG 5 ;
                    DIG 6 ;
                    DIG 7 ;
                    DROP 5 ;
                    DUP 3 ;
                    CDR ;
                    DUP 4 ;
                    CAR ;
                    CDR ;
                    DIG 2 ;
                    PAIR ;
                    PAIR ;
                    DUG 2 ;
                    DROP 2 ;
                    NIL operation ;
                    PAIR } ;
                SWAP ;
                APPLY ;
                LAMBDA
                  (list (pair address nat))
                  nat
                  { PUSH nat 0 ; SWAP ; ITER { CDR ; ADD } } ;
                LAMBDA
                  (pair (pair address bool) (option address))
                  unit
                  { CAR ;
                    CAR ;
                    SENDER ;
                    COMPARE ;
                    NEQ ;
                    IF { PUSH string "NOT_AN_ADMIN" ; FAILWITH } { UNIT } } ;
                DIG 6 ;
                UNPAIR ;
                IF_LEFT
                  { DIG 3 ;
                    DIG 6 ;
                    DROP 2 ;
                    IF_LEFT
                      { DIG 3 ;
                        DIG 4 ;
                        DIG 5 ;
                        DROP 3 ;
                        SWAP ;
                        DUP ;
                        DUG 2 ;
                        CAR ;
                        CAR ;
                        SWAP ;
                        IF_LEFT
                          { IF_LEFT
                              { DIG 3 ;
                                DROP 2 ;
                                DUP ;
                                CDR ;
                                IF_NONE
                                  { DROP ; PUSH string "NO_PENDING_ADMIN" ; FAILWITH }
                                  { SENDER ;
                                    COMPARE ;
                                    EQ ;
                                    IF { NONE address ; SWAP ; CAR ; CDR ; SENDER ; PAIR ; PAIR }
                                       { DROP ; PUSH string "NOT_A_PENDING_ADMIN" ; FAILWITH } } ;
                                NIL operation ;
                                PAIR }
                              { SWAP ;
                                DUP ;
                                DUG 2 ;
                                DIG 4 ;
                                SWAP ;
                                EXEC ;
                                DROP ;
                                SWAP ;
                                DUP ;
                                DUG 2 ;
                                CDR ;
                                SWAP ;
                                DIG 2 ;
                                CAR ;
                                CAR ;
                                PAIR ;
                                PAIR ;
                                NIL operation ;
                                PAIR } }
                          { SWAP ;
                            DUP ;
                            DUG 2 ;
                            DIG 4 ;
                            SWAP ;
                            EXEC ;
                            DROP ;
                            SOME ;
                            SWAP ;
                            CAR ;
                            PAIR ;
                            NIL operation ;
                            PAIR } ;
                        UNPAIR ;
                        DUP 3 ;
                        CDR ;
                        DIG 3 ;
                        CAR ;
                        CDR ;
                        DIG 3 ;
                        PAIR ;
                        PAIR ;
                        SWAP ;
                        PAIR }
                      { DIG 2 ;
                        DROP ;
                        SWAP ;
                        DUP ;
                        DUG 2 ;
                        CAR ;
                        CAR ;
                        CAR ;
                        CDR ;
                        IF { PUSH string "PAUSED" ; FAILWITH } {} ;
                        SWAP ;
                        DUP ;
                        DUG 2 ;
                        CAR ;
                        CDR ;
                        SWAP ;
                        IF_LEFT
                          { IF_LEFT
                              { DIG 3 ;
                                DROP ;
                                SWAP ;
                                DUP ;
                                DUG 2 ;
                                CAR ;
                                CAR ;
                                SWAP ;
                                DUP ;
                                CAR ;
                                MAP { PUSH nat 0 ;
                                      SWAP ;
                                      DUP ;
                                      DUG 2 ;
                                      CDR ;
                                      COMPARE ;
                                      NEQ ;
                                      IF { DROP ; DUP 6 ; FAILWITH }
                                         { DUP 3 ;
                                           SWAP ;
                                           DUP ;
                                           DUG 2 ;
                                           CAR ;
                                           PAIR ;
                                           DUP 7 ;
                                           SWAP ;
                                           EXEC ;
                                           SWAP ;
                                           PAIR } } ;
                                DIG 2 ;
                                DIG 5 ;
                                DIG 6 ;
                                DROP 3 ;
                                SWAP ;
                                CDR ;
                                PUSH mutez 0 ;
                                DIG 2 ;
                                TRANSFER_TOKENS ;
                                SWAP ;
                                NIL operation ;
                                DIG 2 ;
                                CONS ;
                                PAIR }
                              { DIG 4 ;
                                DIG 5 ;
                                DROP 2 ;
                                MAP { DUP ;
                                      CDR ;
                                      MAP { DUP ; GET 4 ; SWAP ; DUP ; DUG 2 ; GET 3 ; DIG 2 ; CAR ; SOME ; PAIR 3 } ;
                                      SWAP ;
                                      CAR ;
                                      SOME ;
                                      PAIR } ;
                                SWAP ;
                                LAMBDA
                                  (pair (pair address address) (pair nat (big_map (pair address (pair address nat)) unit)))
                                  unit
                                  { UNPAIR ;
                                    UNPAIR ;
                                    DIG 2 ;
                                    UNPAIR ;
                                    DUP 4 ;
                                    DUP 4 ;
                                    COMPARE ;
                                    EQ ;
                                    IF { DROP 4 ; UNIT }
                                       { DIG 3 ;
                                         PAIR ;
                                         DIG 2 ;
                                         PAIR ;
                                         MEM ;
                                         IF { UNIT } { PUSH string "FA2_NOT_OPERATOR" ; FAILWITH } } } ;
                                DIG 2 ;
                                PAIR ;
                                PAIR ;
                                DIG 2 ;
                                SWAP ;
                                EXEC } }
                          { DIG 3 ;
                            DIG 4 ;
                            DIG 5 ;
                            DROP 3 ;
                            SWAP ;
                            DUP ;
                            DUG 2 ;
                            CAR ;
                            CDR ;
                            SWAP ;
                            SENDER ;
                            DUG 2 ;
                            ITER { SWAP ;
                                   DUP 3 ;
                                   DUP 3 ;
                                   IF_LEFT {} {} ;
                                   CAR ;
                                   COMPARE ;
                                   EQ ;
                                   IF {} { PUSH string "FA2_NOT_OWNER" ; FAILWITH } ;
                                   SWAP ;
                                   IF_LEFT
                                     { SWAP ;
                                       UNIT ;
                                       SOME ;
                                       DUP 3 ;
                                       GET 4 ;
                                       DUP 4 ;
                                       GET 3 ;
                                       PAIR ;
                                       DIG 3 ;
                                       CAR ;
                                       PAIR ;
                                       UPDATE }
                                     { DUP ;
                                       DUG 2 ;
                                       GET 4 ;
                                       DUP 3 ;
                                       GET 3 ;
                                       PAIR ;
                                       DIG 2 ;
                                       CAR ;
                                       PAIR ;
                                       NONE unit ;
                                       SWAP ;
                                       UPDATE } } ;
                            SWAP ;
                            DROP ;
                            SWAP ;
                            DUP ;
                            DUG 2 ;
                            CDR ;
                            SWAP ;
                            DIG 2 ;
                            CAR ;
                            CAR ;
                            PAIR ;
                            PAIR ;
                            NIL operation ;
                            PAIR } ;
                        UNPAIR ;
                        DUP 3 ;
                        CDR ;
                        DIG 2 ;
                        DIG 3 ;
                        CAR ;
                        CAR ;
                        PAIR ;
                        PAIR ;
                        SWAP ;
                        PAIR } }
                  { DIG 5 ;
                    DIG 7 ;
                    DROP 2 ;
                    SWAP ;
                    DUP ;
                    DUG 2 ;
                    CAR ;
                    CAR ;
                    DIG 3 ;
                    SWAP ;
                    EXEC ;
                    DROP ;
                    SWAP ;
                    DUP ;
                    DUG 2 ;
                    CAR ;
                    CDR ;
                    SWAP ;
                    IF_LEFT
                      { DUP ;
                        MAP { NIL (pair (option address) (pair nat nat)) ;
                              SWAP ;
                              DUP ;
                              DUG 2 ;
                              CDR ;
                              PUSH nat 0 ;
                              NONE address ;
                              PAIR 3 ;
                              CONS ;
                              SWAP ;
                              CAR ;
                              SOME ;
                              PAIR } ;
                        DUP 3 ;
                        LAMBDA
                          (pair (pair address address) (pair nat (big_map (pair address (pair address nat)) unit)))
                          unit
                          { DROP ; UNIT } ;
                        DIG 2 ;
                        PAIR ;
                        PAIR ;
                        DIG 5 ;
                        SWAP ;
                        EXEC ;
                        UNPAIR ;
                        DIG 2 ;
                        DIG 5 ;
                        SWAP ;
                        EXEC ;
                        DIG 3 ;
                        CDR ;
                        CDR ;
                        SUB ;
                        ISNAT ;
                        IF_NONE { DIG 3 ; FAILWITH } { DIG 4 ; DROP } ;
                        DUP 3 ;
                        CDR ;
                        CAR ;
                        PAIR ;
                        DIG 2 ;
                        CAR ;
                        PAIR ;
                        SWAP ;
                        PAIR }
                      { DIG 5 ;
                        DROP ;
                        DUP ;
                        MAP { DUP ; CDR ; PUSH nat 0 ; DIG 2 ; CAR ; SOME ; PAIR 3 } ;
                        DUP 3 ;
                        LAMBDA
                          (pair (pair address address) (pair nat (big_map (pair address (pair address nat)) unit)))
                          unit
                          { DROP ; UNIT } ;
                        NIL (pair (option address) (list (pair (option address) (pair nat nat)))) ;
                        DIG 3 ;
                        NONE address ;
                        PAIR ;
                        CONS ;
                        PAIR ;
                        PAIR ;
                        DIG 5 ;
                        SWAP ;
                        EXEC ;
                        UNPAIR ;
                        DIG 2 ;
                        DIG 5 ;
                        SWAP ;
                        EXEC ;
                        DIG 3 ;
                        CDR ;
                        CDR ;
                        ADD ;
                        DUP 3 ;
                        CDR ;
                        CAR ;
                        PAIR ;
                        DIG 2 ;
                        CAR ;
                        PAIR ;
                        SWAP ;
                        PAIR } ;
                    UNPAIR ;
                    DUP 3 ;
                    CDR ;
                    DIG 2 ;
                    DIG 3 ;
                    CAR ;
                    CAR ;
                    PAIR ;
                    PAIR ;
                    SWAP ;
                    PAIR } } }
                    `,
       //storage state
       init: `0`,
     })

     //beginning to deploy
     console.log('Awaiting confirmation...')
     const contract = await op.contract()
     //deployment report: amount of used gas, storage state
     console.log('Gas Used', op.consumedGas)
     console.log('Storage', await contract.storage())
     //operation hash one can use to find the contract in the explorer
     console.log('Operation hash:', op.hash)
     console.log("Adress: ",contract.address)
   } catch (ex) {
     console.error(ex)
   }
 }

 deploy()
