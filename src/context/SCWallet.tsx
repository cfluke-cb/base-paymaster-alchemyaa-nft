import { createContext, useState, useRef, useMemo } from "react";
import { useAccount, useNetwork, type Chain } from "wagmi";
import { toHex } from "viem";
import {
  Deferrable,
  HttpTransport,
  PublicErc4337Client,
  createPublicErc4337Client,
  getDefaultEntryPointAddress,
} from "@alchemy/aa-core";
import {
  AlchemyProvider,
  withAlchemyGasFeeEstimator,
} from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { useLightAccountSigner } from "./lightAccountSigner";
export const SCWContext = createContext<{
  sCWAddress?: string;
  sCWClient?: PublicErc4337Client<HttpTransport>;
  sCWSigner?: AlchemyProvider;
}>({});

const rpcUrl =
  "https://base-goerli.g.alchemy.com/v2/" + import.meta.env.VITE_ALCHEMY_ID;

export const SCWalletContext = ({ children }: React.PropsWithChildren) => {
  const [sCWAddress, setSCWAddress] = useState("");
  const sCWSigner = useRef({});
  const sCWClient = useRef({});
  const account = useAccount();
  const network = useNetwork();
  const ownerResult = useLightAccountSigner();

  useMemo(async () => {
    if (!account || !network?.chain || ownerResult.isLoading) return;
    const chain: Chain = network.chain!;
    const baseSigner = new AlchemyProvider({
      rpcUrl,
      chain,
      opts: {
        txMaxRetries: 60,
      },
    }).connect((provider) => {
      return new LightSmartContractAccount({
        chain,
        owner: ownerResult.owner!,
        entryPointAddress: getDefaultEntryPointAddress(chain),
        factoryAddress: getDefaultLightAccountFactoryAddress(chain),
        rpcClient: provider,
      });
    });

    const smartAccountAddress = await baseSigner.getAddress();
    setSCWAddress(smartAccountAddress);

    const dummyPaymasterDataMiddleware = async (uoStruct: any) => {
      // Return an object like {paymasterAndData: "0x..."} where "0x..." is the valid paymasterAndData for your paymaster contract (used in gas estimation)
      // You can even hardcode these dummy singatures
      // You can read up more on dummy signatures here: https://www.alchemy.com/blog/dummy-signatures-and-gas-token-transfers
      console.log("dummy paymaster for gas estimate", uoStruct);
      const params1 = await resolveProperties(uoStruct);
      console.log("params1", params1);

      const body = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_paymasterAndDataForUserOperation",
        params: [
          {
            ...params1,
            nonce: toHex(Number(params1.nonce)),
            sender: smartAccountAddress,
            callGasLimit: "0x0",
            preVerificationGas: "0x0",
            verificationGasLimit: "0x0",
            maxFeePerGas: "0x0",
            maxPriorityFeePerGas: "0x0",
          },
          baseSigner.getEntryPointAddress(),
          toHex(chain.id),
        ],
      };

      const response = await fetch("https://paymaster.base.org", {
        method: "post",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      console.log("response", data);

      return {
        paymasterAndData: data.result,
      };
    };

    // Define the PaymasterDataMiddlewareOverrideFunction
    const paymasterDataMiddleware = async (uoStruct: any) => {
      // Return at minimum {paymasterAndData: "0x..."}, can also return gas estimates
      console.log("final paymaster", uoStruct);

      const params1 = await resolveProperties(uoStruct);
      console.log("params1", params1);
      const body = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_paymasterAndDataForUserOperation",
        params: [
          {
            ...params1,
            nonce: toHex(Number(params1.nonce)),
            sender: smartAccountAddress,
            callGasLimit: toHex(Number(params1.callGasLimit)),
            preVerificationGas: toHex(Number(params1.preVerificationGas)),
            verificationGasLimit: toHex(Number(params1.verificationGasLimit)),
            maxFeePerGas: toHex(Number(params1.maxFeePerGas)),
            maxPriorityFeePerGas: toHex(Number(params1.maxPriorityFeePerGas)),
          },
          baseSigner.getEntryPointAddress(),
          toHex(chain.id),
        ],
      };

      const response = await fetch("https://paymaster.base.org", {
        method: "post",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      console.log("response", data);

      return {
        paymasterAndData: data.result,
      };
    };

    const signer = withAlchemyGasFeeEstimator(baseSigner, 50n, 50n);

    // Integrate the dummy paymaster data middleware and paymaster data middleware middleware with the provider
    const smartAccountSigner = signer.withPaymasterMiddleware({
      dummyPaymasterDataMiddleware,
      paymasterDataMiddleware,
    });

    sCWSigner.current = smartAccountSigner;
    console.log(sCWSigner.current);
    const client = createPublicErc4337Client({
      chain,
      rpcUrl,
    });
    sCWClient.current = client;
  }, [account?.address, network?.chain?.id, ownerResult.isLoading]);

  const state = {
    sCWAddress,
    sCWSigner: sCWSigner.current,
    sCWClient: sCWClient.current,
  };

  return <SCWContext.Provider value={state}>{children}</SCWContext.Provider>;
};

async function resolveProperties<T>(object: Deferrable<T>): Promise<T> {
  const promises = Object.keys(object).map((key) => {
    const value = object[key as keyof Deferrable<T>];
    return Promise.resolve(value).then((v) => ({ key: key, value: v }));
  });

  const results = await Promise.all(promises);

  return results.reduce((accum, curr) => {
    accum[curr.key as keyof T] = curr.value;
    return accum;
  }, {} as T);
}
