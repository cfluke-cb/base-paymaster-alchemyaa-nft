import { useState, useContext } from "react";
import {
  encodeDeployData,
  toBytes,
  getContractAddress,
  encodeFunctionData,
} from "viem";
import { SCWContext } from "../context/SCWallet";
const deployProxyAddr = import.meta.env.VITE_DEPLOY_CONTRACT_ADDR;

export const Deploy = () => {
  const [isDeploying, setisDeploying] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [newContractAddr, setNewContractAddr] = useState("");
  const [bytecode, setBytecode] = useState("");
  const [abi, setAbi] = useState("");
  const [readResult, setReadResult] = useState("");
  const [write, setWrite] = useState("");

  const { sCWSigner, sCWAddress, sCWClient } = useContext(SCWContext);

  const handleDeploy = async () => {
    if (!sCWSigner?.account || !sCWSigner?.sendTransaction || !sCWAddress)
      return;
    setisDeploying(true);
    try {
      const fmtAbi = JSON.parse(abi);
      console.log(fmtAbi);
      const conData = encodeDeployData({
        abi: fmtAbi,
        bytecode,
        //args: [sCWAddress],
      });

      const nonce = await sCWSigner.account.getNonce();
      const zeros =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const nonceLength = String(nonce).length;
      const salt = zeros.slice(0, zeros.length - nonceLength) + String(nonce);
      console.log("salt", salt, conData);

      const mintDeployTxnHash = await sCWSigner.sendTransaction({
        from: sCWAddress,
        to: deployProxyAddr,
        data: salt + conData,
      });
      const newAddress = getContractAddress({
        bytecode: "0x" + conData,
        from: deployProxyAddr,
        opcode: "CREATE2",
        salt: toBytes(salt),
      });

      console.log(mintDeployTxnHash);
      console.log(newAddress);

      setTxHash(mintDeployTxnHash);
      setNewContractAddr(newAddress);
    } catch (e) {
      console.error(e);
    }

    setisDeploying(false);
  };

  const writeStorage = async () => {
    if (!sCWSigner?.sendTransaction) return;
    try {
      const fmtAbi = JSON.parse(abi);
      const storageWriteTxnHash = await sCWSigner.sendTransaction({
        from: sCWAddress,
        to: newContractAddr,
        data: encodeFunctionData({
          abi: fmtAbi,
          functionName: "store",
          args: [write],
        }),
      });
      console.log(storageWriteTxnHash);
    } catch (e) {
      console.error(e);
    }
  };

  const readStorage = async () => {
    if (!sCWClient) return;
    try {
      const fmtAbi = JSON.parse(abi);
      const storageReadResult = await sCWClient.readContract({
        address: newContractAddr,
        abi: fmtAbi,
        functionName: "retrieve",
      });
      console.log(storageReadResult);
      setReadResult(String(storageReadResult));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="m-8 border-2 border-black-200 rounded-md p-4">
      <div>
        <h3 className="text-2xl">Manage Contract Example</h3>
      </div>
      <div className="p-4">
        <label className="mr-4 font-bold">Bytecode</label>
        <input
          type="text"
          className="border-2 border-black-500"
          onChange={(e) => setBytecode(e.target.value)}
        />
      </div>
      <div className="p-4">
        <label className="mr-4 font-bold">ABI</label>
        <input
          type="text"
          className="border-2 border-black-500"
          onChange={(e) => setAbi(e.target.value)}
        />
      </div>
      <button
        onClick={handleDeploy}
        disabled={isDeploying}
        type="button"
        className="bg-black text-white py-3 px-5 rounded-lg m-3 hover:bg-orange-500 hover:text-black"
      >
        Deploy
      </button>
      <div className="p-4">
        {txHash && <div> Transaction: {txHash} </div>}
        {newContractAddr && (
          <div> New Contract Address: {newContractAddr} </div>
        )}
        {newContractAddr && (
          <div>
            <button
              type="button"
              onClick={readStorage}
              className="bg-black text-white py-3 px-5 rounded-lg m-3 hover:bg-orange-500 hover:text-black"
            >
              Read
            </button>
            <div> Read Result: {readResult} </div>
            <br />
            <label className="mr-4 font-bold">New Value</label>
            <input
              type="text"
              className="border-2 border-black-500"
              onChange={(e) => setWrite(e.target.value)}
            />
            <br />
            <button
              type="button"
              onClick={writeStorage}
              className="bg-black text-white py-3 px-5 rounded-lg m-3 hover:bg-orange-500 hover:text-black"
            >
              Write
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
