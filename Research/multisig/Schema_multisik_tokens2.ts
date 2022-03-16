export const msig_tokens2=`parameter (or
  (or (or (address %add_user_proposal) (unit %default))
      (or (nat %execute_proposal)
          (or (nat %expiration_time_proposal)
              (lambda %lambda_proposal unit (list operation)))))
  (or (or (nat %minimum_votes_proposal) (address %remove_user_proposal))
      (or (pair %transfer_mutez_proposal (mutez %mutez_amount) (address %destination))
          (or
            (pair %transfer_token_proposal (address %token_contract)
                                           (pair (nat %token_id)
                                                 (pair (nat %token_amount)
                                                       (address %destination))))
            (pair %vote_proposal (nat %proposal_id) (bool %approval))))));
storage (pair (pair (nat %counter) (pair (nat %expiration_time) (big_map %metadata string bytes)))
    (pair
      (pair (nat %minimum_votes)
            (big_map %proposals nat
                                (pair (string %type)
                                      (pair (bool %executed)
                                            (pair (address %issuer)
                                                  (pair (timestamp %timestamp)
                                                        (pair (nat %positive_votes)
                                                              (pair
                                                                (option %mutez_amount mutez)
                                                                (pair
                                                                  (option %token_contract address)
                                                                  (pair
                                                                    (option %token_id nat)
                                                                    (pair
                                                                      (option %token_amount nat)
                                                                      (pair
                                                                        (option %destination address)
                                                                        (pair
                                                                          (option %minimum_votes nat)
                                                                          (pair
                                                                            (option %expiration_time nat)
                                                                            (pair
                                                                              (option %user address)
                                                                              (option %lambda_function (lambda
                                                                                                        unit
                                                                                                        (list operation))))))))))))))))))
      (pair (set %users address) (big_map %votes (pair nat address) bool))));
code { UNPAIR ;
IF_LEFT
{ IF_LEFT
   { IF_LEFT
       { SWAP ;
         DUP ;
         DUG 2 ;
         GET 5 ;
         SENDER ;
         MEM ;
         IF
           {}
           { PUSH string "This can only be executed by one of the wallet users" ; FAILWITH } ;
         SWAP ;
         DUP ;
         DUG 2 ;
         GET 5 ;
         SWAP ;
         DUP ;
         DUG 2 ;
         MEM ;
         IF { PUSH string "The proposed address is in the users list" ; FAILWITH } {} ;
         SWAP ;
         DUP ;
         DUG 2 ;
         UNPAIR ;
         SWAP ;
         UNPAIR ;
         UNPAIR ;
         SWAP ;
         NONE (lambda unit (list operation)) ;
         DUP 6 ;
         SOME ;
         NONE nat ;
         NONE nat ;
         NONE address ;
         NONE nat ;
         NONE nat ;
         NONE address ;
         NONE mutez ;
         PUSH nat 0 ;
         NOW ;
         SENDER ;
         PUSH bool False ;
         PUSH string "add_user" ;
         PAIR 14 ;
         DIG 5 ;
         DROP ;
         SOME ;
         DIG 5 ;
         CAR ;
         CAR ;
         UPDATE ;
         SWAP ;
         PAIR ;
         PAIR ;
         SWAP ;
         UNPAIR ;
         PUSH nat 1 ;
         ADD ;
         PAIR ;
         PAIR }
       { DROP } ;
     NIL operation }
   { IF_LEFT
       { SWAP ;
         DUP ;
         DUG 2 ;
         GET 5 ;
         SENDER ;
         MEM ;
         IF
           {}
           { PUSH string "This can only be executed by one of the wallet users" ; FAILWITH } ;
         SWAP ;
         DUP ;
         DUG 2 ;
         GET 3 ;
         CDR ;
         SWAP ;
         DUP ;
         DUG 2 ;
         MEM ;
         IF {} { PUSH string "The proposal doesn't exist" ; FAILWITH } ;
         SWAP ;
         DUP ;
         DUG 2 ;
         GET 3 ;
         CDR ;
         SWAP ;
         DUP ;
         DUG 2 ;
         GET ;
         IF_NONE { PUSH int 109 ; FAILWITH } {} ;
         GET 3 ;
         IF { PUSH string "The proposal has been executed" ; FAILWITH } {} ;
         PUSH int 60 ;
         DUP ;
         PUSH int 24 ;
         DUP 5 ;
         CAR ;
         GET 3 ;
         INT ;
         MUL ;
         MUL ;
         MUL ;
         DUP 3 ;
         GET 3 ;
         CDR ;
         DUP 3 ;
         GET ;
         IF_NONE { PUSH int 109 ; FAILWITH } {} ;
         GET 7 ;
         ADD ;
         NOW ;
         COMPARE ;
         GT ;
         IF { PUSH string "The proposal has expired" ; FAILWITH } {} ;
         SWAP ;
         DUP ;
         GET 3 ;
         CAR ;
         SWAP ;
         DUP ;
         DUG 3 ;
         GET 3 ;
         CDR ;
         DUP 3 ;
         GET ;
         IF_NONE { PUSH int 330 ; FAILWITH } {} ;
         GET 9 ;
         COMPARE ;
         GE ;
         IF
           {}
           { PUSH string "The proposal didn't receive enough positive votes" ; FAILWITH } ;
         SWAP ;
         UNPAIR ;
         SWAP ;
         UNPAIR ;
         UNPAIR ;
         SWAP ;
         DUP ;
         DUP 6 ;
         DUP ;
         DUG 2 ;
         GET ;
         IF_NONE { PUSH int 335 ; FAILWITH } {} ;
         PUSH bool True ;
         UPDATE 3 ;
         SOME ;
         SWAP ;
         UPDATE ;
         SWAP ;
         PAIR ;
         PAIR ;
         SWAP ;
         PAIR ;
         SWAP ;
         PUSH string "transfer_mutez" ;
         DUP 3 ;
         GET 3 ;
         CDR ;
         DUP 3 ;
         GET ;
         IF_NONE { PUSH int 330 ; FAILWITH } {} ;
         CAR ;
         COMPARE ;
         EQ ;
         IF
           { NIL operation ;
             DUP 3 ;
             GET 3 ;
             CDR ;
             DUP 3 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 19 ;
             IF_NONE { PUSH int 338 ; FAILWITH } {} ;
             CONTRACT unit ;
             IF_NONE { PUSH int 338 ; FAILWITH } {} ;
             DUP 4 ;
             GET 3 ;
             CDR ;
             DUP 4 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 11 ;
             IF_NONE { PUSH int 338 ; FAILWITH } {} ;
             UNIT ;
             TRANSFER_TOKENS ;
             CONS }
           { NIL operation } ;
         PUSH string "transfer_token" ;
         DUP 4 ;
         GET 3 ;
         CDR ;
         DUP 4 ;
         GET ;
         IF_NONE { PUSH int 330 ; FAILWITH } {} ;
         CAR ;
         COMPARE ;
         EQ ;
         IF
           { DUP 3 ;
             GET 3 ;
             CDR ;
             DUP 3 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 13 ;
             IF_NONE { PUSH int 342 ; FAILWITH } {} ;
             CONTRACT %transfer (list (pair address (list (pair address (pair nat nat))))) ;
             IF_NONE { PUSH int 378 ; FAILWITH } {} ;
             PUSH mutez 0 ;
             NIL (pair address (list (pair address (pair nat nat)))) ;
             NIL (pair address (pair nat nat)) ;
             DUP 7 ;
             GET 3 ;
             CDR ;
             DUP 7 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 17 ;
             IF_NONE { PUSH int 342 ; FAILWITH } {} ;
             DUP 8 ;
             GET 3 ;
             CDR ;
             DUP 8 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 15 ;
             IF_NONE { PUSH int 342 ; FAILWITH } {} ;
             DUP 9 ;
             GET 3 ;
             CDR ;
             DUP 9 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 19 ;
             IF_NONE { PUSH int 338 ; FAILWITH } {} ;
             PAIR 3 ;
             CONS ;
             SELF_ADDRESS ;
             PAIR ;
             CONS ;
             TRANSFER_TOKENS ;
             CONS }
           {} ;
         PUSH string "minimum_votes" ;
         DUP 4 ;
         GET 3 ;
         CDR ;
         DUP 4 ;
         GET ;
         IF_NONE { PUSH int 330 ; FAILWITH } {} ;
         CAR ;
         COMPARE ;
         EQ ;
         IF
           { NIL address ;
             DUP 4 ;
             GET 5 ;
             ITER { CONS } ;
             NIL address ;
             SWAP ;
             ITER { CONS } ;
             SIZE ;
             DUP 4 ;
             GET 3 ;
             CDR ;
             DUP 4 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 21 ;
             IF_NONE { PUSH int 350 ; FAILWITH } {} ;
             COMPARE ;
             LE ;
             IF
               {}
               { PUSH string "The minimum_votes parameter cannot be higher than the number of users" ;
                 FAILWITH } ;
             DUP 3 ;
             UNPAIR ;
             SWAP ;
             UNPAIR ;
             CDR ;
             DIG 5 ;
             GET 3 ;
             CDR ;
             DUP 6 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 21 ;
             IF_NONE { PUSH int 350 ; FAILWITH } {} ;
             PAIR ;
             PAIR ;
             SWAP ;
             PAIR ;
             DUG 2 }
           {} ;
         PUSH string "expiration_time" ;
         DUP 4 ;
         GET 3 ;
         CDR ;
         DUP 4 ;
         GET ;
         IF_NONE { PUSH int 330 ; FAILWITH } {} ;
         CAR ;
         COMPARE ;
         EQ ;
         IF
           { DUP 3 ;
             UNPAIR ;
             UNPAIR ;
             SWAP ;
             CDR ;
             DIG 5 ;
             GET 3 ;
             CDR ;
             DUP 6 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 23 ;
             IF_NONE { PUSH int 355 ; FAILWITH } {} ;
             PAIR ;
             SWAP ;
             PAIR ;
             PAIR ;
             DUG 2 }
           {} ;
         PUSH string "add_user" ;
         DUP 4 ;
         GET 3 ;
         CDR ;
         DUP 4 ;
         GET ;
         IF_NONE { PUSH int 330 ; FAILWITH } {} ;
         CAR ;
         COMPARE ;
         EQ ;
         IF
           { DUP 3 ;
             DUP ;
             GET 5 ;
             PUSH bool True ;
             DIG 5 ;
             GET 3 ;
             CDR ;
             DUP 6 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 25 ;
             IF_NONE { PUSH int 358 ; FAILWITH } {} ;
             UPDATE ;
             UPDATE 5 ;
             DUG 2 }
           {} ;
         PUSH string "remove_user" ;
         DUP 4 ;
         GET 3 ;
         CDR ;
         DUP 4 ;
         GET ;
         IF_NONE { PUSH int 330 ; FAILWITH } {} ;
         CAR ;
         COMPARE ;
         EQ ;
         IF
           { PUSH nat 1 ;
             NIL address ;
             DUP 5 ;
             GET 5 ;
             ITER { CONS } ;
             NIL address ;
             SWAP ;
             ITER { CONS } ;
             SIZE ;
             COMPARE ;
             GT ;
             IF {} { PUSH string "The last user cannot be removed" ; FAILWITH } ;
             DUP 3 ;
             DUP ;
             GET 5 ;
             PUSH bool False ;
             DIG 5 ;
             GET 3 ;
             CDR ;
             DUP 6 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 25 ;
             IF_NONE { PUSH int 358 ; FAILWITH } {} ;
             UPDATE ;
             UPDATE 5 ;
             DUG 2 ;
             NIL address ;
             DUP 4 ;
             GET 5 ;
             ITER { CONS } ;
             NIL address ;
             SWAP ;
             ITER { CONS } ;
             SIZE ;
             DUP 4 ;
             GET 3 ;
             CAR ;
             COMPARE ;
             GT ;
             IF
               { DUP 3 ;
                 UNPAIR ;
                 SWAP ;
                 UNPAIR ;
                 CDR ;
                 NIL address ;
                 DIG 6 ;
                 GET 5 ;
                 ITER { CONS } ;
                 NIL address ;
                 SWAP ;
                 ITER { CONS } ;
                 SIZE ;
                 PAIR ;
                 PAIR ;
                 SWAP ;
                 PAIR ;
                 DUG 2 }
               {} }
           {} ;
         PUSH string "lambda" ;
         DUP 4 ;
         GET 3 ;
         CDR ;
         DUP 4 ;
         GET ;
         IF_NONE { PUSH int 330 ; FAILWITH } {} ;
         CAR ;
         COMPARE ;
         EQ ;
         IF
           { DUP 3 ;
             GET 3 ;
             CDR ;
             DIG 2 ;
             GET ;
             IF_NONE { PUSH int 330 ; FAILWITH } {} ;
             GET 26 ;
             IF_NONE { PUSH int 370 ; FAILWITH } {} ;
             UNIT ;
             EXEC ;
             ITER { CONS } }
           { SWAP ; DROP } }
       { IF_LEFT
           { SWAP ;
             DUP ;
             DUG 2 ;
             GET 5 ;
             SENDER ;
             MEM ;
             IF
               {}
               { PUSH string "This can only be executed by one of the wallet users" ;
                 FAILWITH } ;
             DUP ;
             PUSH nat 1 ;
             SWAP ;
             COMPARE ;
             GE ;
             IF
               {}
               { PUSH string "The expiration_time parameter cannot be smaller than 1 day" ;
                 FAILWITH } ;
             SWAP ;
             DUP ;
             DUG 2 ;
             UNPAIR ;
             SWAP ;
             UNPAIR ;
             UNPAIR ;
             SWAP ;
             NONE (lambda unit (list operation)) ;
             NONE address ;
             DUP 7 ;
             SOME ;
             NONE nat ;
             NONE address ;
             NONE nat ;
             NONE nat ;
             NONE address ;
             NONE mutez ;
             PUSH nat 0 ;
             NOW ;
             SENDER ;
             PUSH bool False ;
             PUSH string "expiration_time" ;
             PAIR 14 ;
             DIG 5 ;
             DROP ;
             SOME ;
             DIG 5 ;
             CAR ;
             CAR ;
             UPDATE ;
             SWAP ;
             PAIR ;
             PAIR ;
             SWAP ;
             UNPAIR ;
             PUSH nat 1 ;
             ADD ;
             PAIR ;
             PAIR }
           { SWAP ;
             DUP ;
             DUG 2 ;
             GET 5 ;
             SENDER ;
             MEM ;
             IF
               {}
               { PUSH string "This can only be executed by one of the wallet users" ;
                 FAILWITH } ;
             SWAP ;
             DUP ;
             DUG 2 ;
             UNPAIR ;
             SWAP ;
             UNPAIR ;
             UNPAIR ;
             SWAP ;
             DUP 5 ;
             SOME ;
             NONE address ;
             NONE nat ;
             NONE nat ;
             NONE address ;
             NONE nat ;
             NONE nat ;
             NONE address ;
             NONE mutez ;
             PUSH nat 0 ;
             NOW ;
             SENDER ;
             PUSH bool False ;
             PUSH string "lambda" ;
             PAIR 14 ;
             DIG 5 ;
             DROP ;
             SOME ;
             DIG 5 ;
             CAR ;
             CAR ;
             UPDATE ;
             SWAP ;
             PAIR ;
             PAIR ;
             SWAP ;
             UNPAIR ;
             PUSH nat 1 ;
             ADD ;
             PAIR ;
             PAIR } ;
         NIL operation } } }
{ IF_LEFT
   { IF_LEFT
       { SWAP ;
         DUP ;
         DUG 2 ;
         GET 5 ;
         SENDER ;
         MEM ;
         IF
           {}
           { PUSH string "This can only be executed by one of the wallet users" ; FAILWITH } ;
         DUP ;
         PUSH nat 1 ;
         SWAP ;
         COMPARE ;
         GE ;
         IF
           {}
           { PUSH string "The minimum_votes parameter cannot be smaller than 1" ; FAILWITH } ;
         SWAP ;
         DUP ;
         DUG 2 ;
         UNPAIR ;
         SWAP ;
         UNPAIR ;
         UNPAIR ;
         SWAP ;
         NONE (lambda unit (list operation)) ;
         NONE address ;
         NONE nat ;
         DUP 8 ;
         SOME ;
         NONE address ;
         NONE nat ;
         NONE nat ;
         NONE address ;
         NONE mutez ;
         PUSH nat 0 ;
         NOW ;
         SENDER ;
         PUSH bool False ;
         PUSH string "minimum_votes" ;
         PAIR 14 ;
         DIG 5 ;
         DROP ;
         SOME ;
         DIG 5 ;
         CAR ;
         CAR ;
         UPDATE ;
         SWAP ;
         PAIR ;
         PAIR ;
         SWAP ;
         UNPAIR ;
         PUSH nat 1 ;
         ADD ;
         PAIR ;
         PAIR }
       { SWAP ;
         DUP ;
         DUG 2 ;
         GET 5 ;
         SENDER ;
         MEM ;
         IF
           {}
           { PUSH string "This can only be executed by one of the wallet users" ; FAILWITH } ;
         SWAP ;
         DUP ;
         DUG 2 ;
         GET 5 ;
         SWAP ;
         DUP ;
         DUG 2 ;
         MEM ;
         IF
           {}
           { PUSH string "The proposed address is not in the users list" ; FAILWITH } ;
         SWAP ;
         DUP ;
         DUG 2 ;
         UNPAIR ;
         SWAP ;
         UNPAIR ;
         UNPAIR ;
         SWAP ;
         NONE (lambda unit (list operation)) ;
         DUP 6 ;
         SOME ;
         NONE nat ;
         NONE nat ;
         NONE address ;
         NONE nat ;
         NONE nat ;
         NONE address ;
         NONE mutez ;
         PUSH nat 0 ;
         NOW ;
         SENDER ;
         PUSH bool False ;
         PUSH string "remove_user" ;
         PAIR 14 ;
         DIG 5 ;
         DROP ;
         SOME ;
         DIG 5 ;
         CAR ;
         CAR ;
         UPDATE ;
         SWAP ;
         PAIR ;
         PAIR ;
         SWAP ;
         UNPAIR ;
         PUSH nat 1 ;
         ADD ;
         PAIR ;
         PAIR } }
   { IF_LEFT
       { SWAP ;
         DUP ;
         DUG 2 ;
         GET 5 ;
         SENDER ;
         MEM ;
         IF
           {}
           { PUSH string "This can only be executed by one of the wallet users" ; FAILWITH } ;
         SWAP ;
         DUP ;
         DUG 2 ;
         UNPAIR ;
         SWAP ;
         UNPAIR ;
         UNPAIR ;
         SWAP ;
         NONE (lambda unit (list operation)) ;
         NONE address ;
         NONE nat ;
         NONE nat ;
         DUP 9 ;
         CDR ;
         SOME ;
         NONE nat ;
         NONE nat ;
         NONE address ;
         DUP 13 ;
         CAR ;
         SOME ;
         PUSH nat 0 ;
         NOW ;
         SENDER ;
         PUSH bool False ;
         PUSH string "transfer_mutez" ;
         PAIR 14 ;
         DIG 5 ;
         DROP ;
         SOME ;
         DIG 5 ;
         CAR ;
         CAR ;
         UPDATE ;
         SWAP ;
         PAIR ;
         PAIR ;
         SWAP ;
         UNPAIR ;
         PUSH nat 1 ;
         ADD ;
         PAIR ;
         PAIR }
       { IF_LEFT
           { SWAP ;
             DUP ;
             DUG 2 ;
             GET 5 ;
             SENDER ;
             MEM ;
             IF
               {}
               { PUSH string "This can only be executed by one of the wallet users" ;
                 FAILWITH } ;
             SWAP ;
             DUP ;
             DUG 2 ;
             UNPAIR ;
             SWAP ;
             UNPAIR ;
             UNPAIR ;
             SWAP ;
             NONE (lambda unit (list operation)) ;
             NONE address ;
             NONE nat ;
             NONE nat ;
             DUP 9 ;
             GET 6 ;
             SOME ;
             DUP 10 ;
             GET 5 ;
             SOME ;
             DUP 11 ;
             GET 3 ;
             SOME ;
             DUP 12 ;
             CAR ;
             SOME ;
             NONE mutez ;
             PUSH nat 0 ;
             NOW ;
             SENDER ;
             PUSH bool False ;
             PUSH string "transfer_token" ;
             PAIR 14 ;
             DIG 5 ;
             DROP ;
             SOME ;
             DIG 5 ;
             CAR ;
             CAR ;
             UPDATE ;
             SWAP ;
             PAIR ;
             PAIR ;
             SWAP ;
             UNPAIR ;
             PUSH nat 1 ;
             ADD ;
             PAIR ;
             PAIR }
           { SWAP ;
             DUP ;
             DUG 2 ;
             GET 5 ;
             SENDER ;
             MEM ;
             IF
               {}
               { PUSH string "This can only be executed by one of the wallet users" ;
                 FAILWITH } ;
             SWAP ;
             DUP ;
             DUG 2 ;
             GET 3 ;
             CDR ;
             SWAP ;
             DUP ;
             DUG 2 ;
             CAR ;
             MEM ;
             IF {} { PUSH string "The proposal doesn't exist" ; FAILWITH } ;
             SWAP ;
             DUP ;
             DUG 2 ;
             GET 3 ;
             CDR ;
             SWAP ;
             DUP ;
             DUG 2 ;
             CAR ;
             GET ;
             IF_NONE { PUSH int 109 ; FAILWITH } {} ;
             GET 3 ;
             IF { PUSH string "The proposal has been executed" ; FAILWITH } {} ;
             PUSH int 60 ;
             DUP ;
             PUSH int 24 ;
             DUP 5 ;
             CAR ;
             GET 3 ;
             INT ;
             MUL ;
             MUL ;
             MUL ;
             DUP 3 ;
             GET 3 ;
             CDR ;
             DUP 3 ;
             CAR ;
             GET ;
             IF_NONE { PUSH int 109 ; FAILWITH } {} ;
             GET 7 ;
             ADD ;
             NOW ;
             COMPARE ;
             GT ;
             IF { PUSH string "The proposal has expired" ; FAILWITH } {} ;
             SWAP ;
             DUP ;
             DUG 2 ;
             GET 6 ;
             SENDER ;
             DUP 3 ;
             CAR ;
             PAIR ;
             GET ;
             IF_NONE { PUSH bool False } {} ;
             IF
               { SWAP ;
                 DUP ;
                 DUG 2 ;
                 UNPAIR ;
                 SWAP ;
                 UNPAIR ;
                 UNPAIR ;
                 SWAP ;
                 DUP ;
                 DUP 6 ;
                 CAR ;
                 DUP ;
                 DUG 2 ;
                 GET ;
                 IF_NONE { PUSH int 306 ; FAILWITH } {} ;
                 PUSH nat 1 ;
                 DIG 8 ;
                 GET 3 ;
                 CDR ;
                 DUP 9 ;
                 CAR ;
                 GET ;
                 IF_NONE { PUSH int 303 ; FAILWITH } {} ;
                 GET 9 ;
                 SUB ;
                 ISNAT ;
                 IF_NONE { PUSH int 306 ; FAILWITH } {} ;
                 UPDATE 9 ;
                 SOME ;
                 SWAP ;
                 UPDATE ;
                 SWAP ;
                 PAIR ;
                 PAIR ;
                 SWAP ;
                 PAIR ;
                 SWAP }
               {} ;
             DUP ;
             CDR ;
             IF
               { SWAP ;
                 UNPAIR ;
                 SWAP ;
                 UNPAIR ;
                 UNPAIR ;
                 SWAP ;
                 DUP ;
                 DUP 6 ;
                 CAR ;
                 DUP ;
                 DUG 2 ;
                 GET ;
                 IF_NONE { PUSH int 310 ; FAILWITH } {} ;
                 DUP ;
                 GET 9 ;
                 PUSH nat 1 ;
                 ADD ;
                 UPDATE 9 ;
                 SOME ;
                 SWAP ;
                 UPDATE ;
                 SWAP ;
                 PAIR ;
                 PAIR ;
                 SWAP ;
                 PAIR ;
                 SWAP }
               {} ;
             SWAP ;
             DUP ;
             GET 6 ;
             DUP 3 ;
             CDR ;
             SOME ;
             SENDER ;
             DIG 4 ;
             CAR ;
             PAIR ;
             UPDATE ;
             UPDATE 6 } } } ;
 NIL operation } ;
NIL operation ;
SWAP ;
ITER { CONS } ;
PAIR }`
  
