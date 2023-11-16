import { useContext } from "react";
import { useAccount } from "wagmi";
import { Header } from "../components/header";
import { SCWContext } from "../context/SCWallet";
import { Mint } from "../components/mint";
import { Deploy } from "../components/deploy";

export const Home = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { sCWAddress } = useContext(SCWContext);
  return (
    <div>
      <Header />
      <div className="p-4">
        {address ? (
          <>
            <div>Logged In!</div>
            <div>EOA Address: {address}</div>
            <div>SCW Address: {sCWAddress}</div>
          </>
        ) : (
          <div>Please connect your wallet</div>
        )}
        {sCWAddress && (
          <div>
            <Mint />
            <br />
            <Deploy />
          </div>
        )}
      </div>
    </div>
  );
};
