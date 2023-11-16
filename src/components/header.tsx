import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Header = () => {
  return (
    <div className="flex flex-row gap-6 p-8">
      <h1 className="flex-auto text-3xl">Base NFT</h1>
      <ConnectButton />
    </div>
  );
};
