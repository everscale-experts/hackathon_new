import {TonClient} from "@tonclient/core";
import {libWeb} from "@tonclient/lib-web";

// Application initialization

//TonClient.useBinaryLibrary(libWeb);

export class Call {
  const client = new TonClient({
      network: {
          endpoints: ['net.ton.dev']
      }
  });

public add(){
const keys = await this.client.crypto.generate_random_sign_keys();
console.log(keys);
}
}
