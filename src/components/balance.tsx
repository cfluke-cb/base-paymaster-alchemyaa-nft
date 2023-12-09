import { useState, useContext, useMemo } from "react";
import { encodeFunctionData } from "viem";
import { NFTContractABI } from "../abi/nftContract";
import { SCWContext } from "../context/SCWallet";
const nftAddr = import.meta.env.VITE_NFT_CONTRACT_ADDR;

export const Mint = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { sCWClient, sCWAddress } = useContext(SCWContext);

  useMemo(async () => {
    
  },[sCWAddress]);

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
