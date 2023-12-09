import { useState, useContext, useEffect } from "react";
import { LightSmartContractAccount } from "@alchemy/aa-accounts";
import { SCWContext } from "../context/SCWallet";

export const Owner = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [owner, setOwner] = useState("");
  const [overrideAddress, setOverrideAddress] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const { sCWSigner, sCWAddress, updateSCW } = useContext(SCWContext);

  useEffect(() => {
    fetchOwner();
  }, []);

  const fetchOwner = async () => {
    if (!sCWSigner?.sendTransaction || !sCWAddress) return;
    setIsFetching(true);
    try {
      const currentOwner = await sCWSigner.account?.getOwnerAddress();
      setOwner(currentOwner);
    } catch (e) {
      console.error(e);
    }

    setIsFetching(false);
  };

  const overrideScwAddress = async () => {
    const result = await updateSCW!(overrideAddress);
    console.log("override result", result);
  };

  const transferOwnership = async () => {
    const result = await LightSmartContractAccount.transferOwnership(
      sCWSigner,
      transferAddress,
      true // wait for txn with UO to be mined
    );
    console.log("transfer ownership result", result);
  };

  return (
    <div>
      {owner && <div> CurrentOwner: {owner} </div>}
      <br />
      <label className="mr-4 font-bold">Override Address</label>
      <input
        type="text"
        value={overrideAddress}
        className="border-2 border-black-500"
        onChange={(e) => setOverrideAddress(e.target.value)}
      />
      <br />
      <button
        onClick={overrideScwAddress}
        disabled={isFetching}
        type="button"
        className="bg-black text-white py-3 px-5 rounded-lg m-3 hover:bg-orange-500 hover:text-black"
      >
        Override
      </button>
      <br />
      <label className="mr-4 font-bold">Transfer Ownership Address</label>
      <input
        type="text"
        value={transferAddress}
        className="border-2 border-black-500"
        onChange={(e) => setTransferAddress(e.target.value)}
      />
      <br />
      <button
        onClick={transferOwnership}
        disabled={isFetching}
        type="button"
        className="bg-black text-white py-3 px-5 rounded-lg m-3 hover:bg-orange-500 hover:text-black"
      >
        Transfer
      </button>
    </div>
  );
};
