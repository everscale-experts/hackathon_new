### Goals  
- [X] Create the list of advantages and disadvantages of atomic-swap approach;  
- [ ] Compate with ZKP approach;  
- [ ] Decide whether we should use it instead;  
  
### Links  
- [ ] https://atomex.me  
  - [ ] https://atomex.me/delegation  
  - [ ] https://leastauthority.com/static/publications/LeastAuthority_Tezos_foundation_Atomex_Smart_Contracts_Audit_Report.pdf  
  - [ ] https://leastauthority.com/static/publications/LeastAuthority_Tezos_Foundation_Atomex_Core_Library_and_Desktop_Client_Audit_Report.pdf  
  - [X] https://blockgeeks.com/guides/atomic-swaps/ - What Are Atomic Swaps? The Most Comprehensive Guide Ever!  
    In July 2012, a developer by the name of Sergio Demian Lerner created the first draft of a trustless exchange protocol.  
    May 2013, when TIer Nolan provided the first full account of a procedure for atomic swaps. 
  Tier Nolan is widely credited as the inventor of atomic swaps.  
    On September 20, 2017, Decred and Litecoin did the first known successful implementation of the atomic swap.  
    __HTLC__ - Hashed Timelock Contracts  
    We want to implement On-Chain Atomic Swaps which takes place on either currency’s blockchain. 
    In order to do this though, both currencies must:  
    - Support HTLC  
    - Have the same hashing algorithm  
    Examples: Komodo, Blockchain.io
  
### Advantages of Atomic Swaps  
copied from https://blockgeeks.com/guides/atomic-swaps/  
- Interoperability between the different assets is a huge problem right now in cryptocurrencies. 
Atomic swaps are going to bring users of all these different coins together to help them interact with each other.
- Atomic swap makes the crypto ecosystem more “currency agnostic”. Because people with different crypto holdings will 
now be able to interact with each other, it is pretty likely that people will be more open to diversifying 
their holdings instead of just depending on a few coins.
- Atomic Swaps will open the doors to trustless and fee-less decentralized exchanges.
- Central exchanges are centralized and hence open to a host of attacks. Atomic swaps remove the need 
for having a 3rd party and makes the trade as direct as possible.
- External attacks aside, centralized exchanges are also suspect to internal maintenance issues and corruption. 
Wallet maintenance” or disabled withdrawals are especially two big problems. Atomic swaps are going to give you 
complete control over your money.
- Direct wallet-to-wallet trading epitomizes decentralization in its purest form. 
Exchanges are constantly targeted for regulation purposes which makes the whole trading process increasingly centralized.
- Since atomic swap directly connects two wallets to each other, it removes all the steps and 
confirmations required by centralized exchanges. It is a faster option.
- One of the best features of cross swap is the removal of intermediary tokens. Eg. if you have LTC and want 
to buy Decred in a normal exchange, you will have to sell your LTC for BTC and then buy your decred tokens. 
Via atomic swaps, you can get this trade done in one go.
- Exchange usually levy a lot of fees and charges, especially when you are trying to withdraw 
your coins back to your wallet. Some exchanges also have pretty questionable fee-structures.  

### Limitations of Atomic Swaps  
copied from https://blockgeeks.com/guides/atomic-swaps/  
1) Adoption  
The first limitation that atomic swaps face in its current iteration is that three conditions need to be met 
for two cryptocurrencies to engage in atomic swaps.  
  - The cryptocurrencies must have a hash algorithm which is inherent to both of them  
  - Both the cryptos must be capable of initiating hashed timelock contracts  
  - Must have specialized programming functionalities.  
2) Speed  
Yes, we realize that we have listed “speed” as one of the advantages, but here us out.  
In its current iteration, atomic swap still needs tons of refinement and enhancement before it becomes fast enough 
to handle large volumes of data. This one area where the lightning network can aid atomic swaps in a major way.  
3) Lack of Compatibility  
It is true that more wallets are coming out which are going to adopt atomic swap technology, however, 
the fact remains that the total number of compatible wallet and exchanges is still really low. Greater support 
from more exchanges will inevitably lead to more broad scale use and research.  
  
    
      
  
  