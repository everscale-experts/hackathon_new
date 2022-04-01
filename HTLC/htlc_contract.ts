export const htlc_contract =`{ parameter
  (or (or (pair %createLockWithCoins (bytes %hash) (address %dest)) (unit %default))
      (pair %openLock (address %dest) (bytes %seed_f))) ;
storage
  (pair (pair (pair (timestamp %date) (address %dest)) (pair (bytes %hash) (address %sender)))
        (pair (bool %unused) (mutez %value))) ;
code { UNPAIR ;
       IF_LEFT
         { IF_LEFT
             { UNPAIR ;
               PUSH mutez 1000000 ;
               BALANCE ;
               COMPARE ;
               LT ;
               IF { PUSH string "Error balance HTLC contract" ; FAILWITH } {} ;
               DIG 2 ;
               CDR ;
               CAR ;
               NOT ;
               IF { PUSH string "This contract has already been used." ; FAILWITH } {} ;
               BALANCE ;
               PUSH bool False ;
               PAIR ;
               SENDER ;
               DIG 2 ;
               PAIR ;
               DIG 2 ;
               PUSH int 86400 ;
               NOW ;
               ADD ;
               PAIR ;
               PAIR ;
               PAIR ;
               NIL operation ;
               PAIR }
             { DROP ; NIL operation ; PAIR } }
         { UNPAIR ;
           DUP 3 ;
           CDR ;
           CAR ;
           IF { PUSH string "The chest was already open" ; FAILWITH } {} ;
           DUP 3 ;
           CDR ;
           CDR ;
           PUSH bool True ;
           PAIR ;
           DIG 3 ;
           CAR ;
           PAIR ;
           SENDER ;
           CONTRACT unit ;
           IF_NONE { PUSH string "Not a contract" ; FAILWITH } {} ;
           DIG 2 ;
           CONTRACT unit ;
           IF_NONE { PUSH string "Not a contract" ; FAILWITH } {} ;
           DUP 3 ;
           CAR ;
           CAR ;
           CAR ;
           NOW ;
           COMPARE ;
           LT ;
           IF { DIG 3 ;
                DROP 2 ;
                SWAP ;
                DUP ;
                DUG 2 ;
                CDR ;
                CDR ;
                UNIT ;
                TRANSFER_TOKENS ;
                DROP ;
                UNIT }
              { DUP 3 ;
                CAR ;
                CDR ;
                CAR ;
                DIG 4 ;
                SHA256 ;
                COMPARE ;
                EQ ;
                IF { SWAP ;
                     DROP ;
                     SWAP ;
                     DUP ;
                     DUG 2 ;
                     CDR ;
                     CDR ;
                     UNIT ;
                     TRANSFER_TOKENS ;
                     DROP ;
                     UNIT }
                   { DROP ;
                     SWAP ;
                     DUP ;
                     DUG 2 ;
                     CDR ;
                     CDR ;
                     UNIT ;
                     TRANSFER_TOKENS ;
                     DROP ;
                     UNIT } } ;
           DROP ;
           NIL operation ;
           PAIR } } }
`