import { useState, useContext } from "react";
import { encodeFunctionData } from "viem";
import { NFTContractABI } from "../abi/nftContract";
import { SCWContext } from "../context/SCWallet";
const nftAddr = import.meta.env.VITE_NFT_CONTRACT_ADDR;

export const Mint = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { sCWSigner, sCWAddress } = useContext(SCWContext);

  const handleMint = async () => {
    if (!sCWSigner?.sendTransaction || !sCWAddress) return;
    setIsMinting(true);
    try {
      const mintDeployTxnHash = await sCWSigner.sendTransaction({
        from: sCWAddress as `0x${string}`,
        to: nftAddr,
        data: encodeFunctionData({
          abi: NFTContractABI.abi,
          functionName: "safeMint",
          args: [sCWAddress],
        }),
      });
      setTxHash(mintDeployTxnHash);
    } catch (e) {
      console.error(e);
    }

    setIsMinting(false);
  };

  return (
    <div>
      <button
        onClick={handleMint}
        disabled={isMinting}
        type="button"
        className="bg-black text-white py-3 px-5 rounded-lg m-3 hover:bg-orange-500 hover:text-black"
      >
        Mint
      </button>
      {txHash && <div> Transaction: {txHash} </div>}
    </div>
  );
};
