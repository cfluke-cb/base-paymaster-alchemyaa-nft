import "@rainbow-me/rainbowkit/styles.css";
import "./app.css";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { baseGoerli, base } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { Home } from "./pages/Home";
import { SCWalletContext } from "./context/SCWallet";

const { chains, publicClient } = configureChains(
  [baseGoerli, base],
  [
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_ID }),
    publicProvider(),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Paymaster Nft Example",
    wallets: [injectedWallet({ chains })],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <SCWalletContext>
          <Home />
        </SCWalletContext>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
