import {CONSTANTS, UTILS as utils} from "https://everscale-connect.svoi.dev/everscale/getProvider.mjs";
import TIP31Wallet from "./TIP31Wallet.mjs";

/**
 * TIP-3.1 contract implementation for Everscale Connect
 * @class TIP31Root
 */
class TIP31Root {
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
        this.contract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP31_ROOT, address);
        return this;
    }

    /**
     * Return token info
     * @returns {Promise<{symbol: *, totalSupply: number, decimals: number, name: *, icon: null}>}
     */
    async getTokenInfo() {
        try {
            let name = (await this.contract.name({answerId: 0})).value0;
            let symbol = (await this.contract.symbol({answerId: 0})).value0;
            let decimals = (await this.contract.decimals({answerId: 0})).value0;
            let totalSupply = (await this.contract.totalSupply({answerId: 0})).value0;


            return {
                decimals: Number(decimals),
                name: (name),
                symbol: (symbol),
                totalSupply: Number(totalSupply),
                icon: null
            };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    /**
     * Get wallet address by owner address
     * @param {string} walletOwner Owner address
     * @returns {Promise<*>}
     */
    async getWalletAddressByMultisig(walletOwner) {

        return (await this.contract.walletOf({
            answerId: 0,
            walletOwner
        })).value0;
    }


    /**
     * Get wallet instance by wallet address
     * @param {string} walletOwner
     * @returns {Promise<TIP31Wallet>}
     */
    async getWalletByMultisig(walletOwner) {
        let walletAddress = await this.getWalletAddressByMultisig(walletOwner);
        return await (new TIP31Wallet(this.ton)).init(walletAddress);
    }

    /**
     * Create deploy wallet payload
     * @param {string} ownerAddress
     * @param {string|number} deployWalletValue
     * @returns {Promise<*>}
     */
    async deployWalletPayload(ownerAddress, deployWalletValue = 5e8) {
        return await this.contract.deployWallet.payload({
            answerId: 0,
            deployWalletValue: deployWalletValue,
            walletOwner: ownerAddress
        });
    }


}


export default TIP31Root;
