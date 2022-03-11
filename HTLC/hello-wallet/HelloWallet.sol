
/**
 * This file was generated by TONDev.
 * TONDev is a part of TON OS (see http://ton.dev).
 */
pragma ton-solidity >= 0.35.0;
pragma AbiHeader expire;

// This is class that describes you smart contract.
contract HelloWallet {
    // Error codes:
    uint constant ERROR_NO_PUBKEY = 101;
    uint constant ERROR_SENDER_IS_NOT_OWNER = 102;
    uint constant ERROR_BAD_ASSURANCE = 103;

    // Contract can have an instance variables.
    // In this example instance variable `timestamp` is used to store the time of `constructor` or `touch`
    // function call
    uint32 public timestamp;

    // Contract can have a `constructor` – function that will be called when contract will be deployed to the blockchain.
    // In this example constructor adds current time to the instance variable.
    // All contracts need call tvm.accept(); for succeeded deploy
    constructor() public {
        // Check that contract's public key is set
        require(tvm.pubkey() != 0, ERROR_NO_PUBKEY);
        // Check that message has signature (msg.pubkey() is not zero) and
        // message is signed with the owner's private key
        require(msg.pubkey() == tvm.pubkey(), ERROR_SENDER_IS_NOT_OWNER);
        // The current smart contract agrees to buy some gas to finish the
        // current transaction. This actions required to process external
        // messages, which bring no value (henceno gas) with themselves.
        tvm.accept();

        timestamp = now;
    }

    function renderHelloWorld () public pure returns (string) {
        return 'helloWorld';
    }

    // Updates variable `timestamp` with current blockchain time.
    function touch() external {
        // Skip signature check
        // require(msg.pubkey() == tvm.pubkey(), ERROR_SENDER_IS_NOT_OWNER);

        // Tells to the TVM that we accept this message.
        tvm.accept();
        // Update timestamp
        timestamp = now;
    }

    // Function returns value of state variable `timestamp`
    function getTimestamp() public view returns (uint) {
        return timestamp;
    }

    // Send specified amount of tokens to the specified address
    function sendValue(address dest, uint128 amount, bool bounce) public view {
        require(msg.pubkey() == tvm.pubkey(), ERROR_SENDER_IS_NOT_OWNER);
        tvm.accept();
        // It allows to make a transfer with arbitrary settings
        dest.transfer(amount, bounce, 0);
    }


    /*********************************************************************************************/

    /// @dev Event emitted when ... .
    /// @param secret The secret value that must be used to open the lock.
    event IgotTheKey(string secret);
    event TheLockIsAdded(address dest);

    struct Lock {
        address sender;
        address dest;
        uint256 hash;
        uint128 value;
        uint32 expiredTimestamp;
    }

    mapping(address => Lock) public locker;

    function createLockWithCoins(address dest, uint256 hash, uint32 timeout) internal {
        require(msg.value > 1 Ever);    // Min value should be more than 1 Ever
        require(!locker.exists(dest));  // to avoid broke existing lock

        Lock lock = Lock({
            sender: msg.sender,
            dest:   dest,
            hash:   hash,
            value:  msg.value - 0.1 Ever,   // FIXME: Comission
            expiredTimestamp: now + timeout
        });
        bool isAdded = locker.add(dest, lock);

        if(isAdded) {
            tvm.log("The lock is added.");
            emit TheLockIsAdded(dest);
        }
    }

    // this method should be called by tip3 account, so the notification for account should be set up
    function createLockWithTokens(uint256 hash) public {
    }

    function openLock(address dest, string secret) public {
        tvm.log(secret);

        optional(Lock) lockInfo = locker.fetch(dest);
        require(lockInfo.hasValue());
        Lock lock = lockInfo.get();
        if(now > lock.expiredTimestamp) {
            tvm.accept();

            lock.sender.transfer(lock.value);
        } else {
            require(lock.hash == tvm.hash(secret));
            tvm.accept();

            emit IgotTheKey(secret);
            lock.dest.transfer(lock.value);
        }
        delete locker[dest];
    }
}
