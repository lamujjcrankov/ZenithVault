import { http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ZENITH_VAULT_ADDRESS } from "./abi";

export const config = getDefaultConfig({
  appName: "ZenithVault",
  projectId: "zenithvault-auction-platform",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
  },
});

// Use deployed address, allow env override
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) || ZENITH_VAULT_ADDRESS;
