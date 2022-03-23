import {CONSTANTS} from "https://everscale-connect.svoi.dev/everscale/getProvider.mjs";

/**
 * TIP-3.1 contract implementation for Everscale Connect
 * @class TIP31Wallet
 */
class TIP31Wallet {
    /**
     *
     * @param {EverscaleWallet} ton
     */
    constructor(ton) {
        this.ton = ton;
        this.contract = null;
        this.address = null;
    }


    async init(address) {
        this.address = address;
        this.contract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP31_WALLET, address);
        return this;
    }

    /**
     * Get wallet token balance
     * @returns {Promise<number>}
     */
    async getBalance() {
        return (await this.contract.balance({answerId: 0})).value0;
    }

    /**
     * Check is contract deployed
     * @returns {Promise<boolean>}
     */
    async isDeployed() {
        try {
            await this.getBalance();
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Send tokens to another wallet
     * @param {string} dest
     * @param {string|number} amount
     * @param {string|object} payload
     * @param {string} remainingGasTo
     * @param {boolean} notify
     * @returns {Promise<string|object>}
     */
    async transferPayload(dest, amount, payload, remainingGasTo = this.address, notify = true) {

        return await this.contract.transferToWallet.payload({
            amount: amount,
            recipientTokenWallet: dest,
            remainingGasTo: remainingGasTo,
            notify: notify,
            payload: payload
        })
    }

}


export default TIP31Wallet;
