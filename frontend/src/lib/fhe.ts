import { ZENITH_VAULT_ADDRESS } from "./abi";
import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

declare global {
  interface Window {
    RelayerSDK?: any;
    relayerSDK?: any;
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;

/**
 * Get SDK from window (loaded via static script tag in HTML)
 */
const getSDK = () => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }
  const sdk = window.RelayerSDK || window.relayerSDK;
  if (!sdk) {
    throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present in index.html");
  }
  return sdk;
};

/**
 * Initialize FHE instance (singleton pattern)
 */
export const initializeFHE = async (provider?: any) => {
  if (fheInstance) return fheInstance;

  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }

  const ethereumProvider =
    provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;

  if (!ethereumProvider) {
    throw new Error("No wallet provider detected. Connect a wallet first.");
  }

  const sdk = getSDK();
  const { initSDK, createInstance, SepoliaConfig } = sdk;
  await initSDK();
  const config = { ...SepoliaConfig, network: ethereumProvider };
  fheInstance = await createInstance(config);
  return fheInstance;
};

/**
 * Get instance or initialize if needed
 */
const getInstance = async (provider?: any) => {
  if (fheInstance) return fheInstance;
  return initializeFHE(provider);
};

/**
 * Get FHE instance if it exists
 */
export const getFHEInstance = (): any => {
  return fheInstance;
};

/**
 * Check if FHE SDK is ready
 */
export const isFheReady = (): boolean => {
  return fheInstance !== null;
};

/**
 * Check if FHE SDK is available (CDN loaded)
 */
export const isFheAvailable = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window.RelayerSDK || window.relayerSDK);
};

/**
 * Reset FHE instance (useful for wallet changes)
 */
export const resetFHEInstance = () => {
  fheInstance = null;
};

/**
 * Encrypt a bid amount as euint64
 * @param bidAmount - The bid amount in wei (as bigint)
 * @param userAddress - The user's wallet address
 * @param provider - Optional provider
 * @returns Encrypted handle and proof
 */
export async function encryptBidAmount(
  bidAmount: bigint,
  userAddress: Address,
  provider?: any
): Promise<{
  encryptedHandle: `0x${string}`;
  proof: `0x${string}`;
}> {
  if (!ZENITH_VAULT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const instance = await getInstance(provider);
  const contractAddr = getAddress(ZENITH_VAULT_ADDRESS);
  const userAddr = getAddress(userAddress);

  // Create encrypted input for euint64
  const input = instance.createEncryptedInput(contractAddr, userAddr);
  input.add64(bidAmount);

  const { handles, inputProof } = await input.encrypt();

  return {
    encryptedHandle: bytesToHex(handles[0]) as `0x${string}`,
    proof: bytesToHex(inputProof) as `0x${string}`
  };
}

/**
 * Public decrypt for decrypting winning bid amounts
 */
export async function publicDecryptHandles(
  handles: `0x${string}`[],
  provider?: any
): Promise<{
  values: (number | bigint | boolean)[];
  abiEncoded: `0x${string}`;
  proof: `0x${string}`;
}> {
  if (handles.length === 0) {
    throw new Error("No handles provided for public decryption");
  }

  const instance = await getInstance(provider);
  const result = await instance.publicDecrypt(handles);

  const normalized: Record<string, number | bigint | boolean> = {};
  Object.entries(result.clearValues || {}).forEach(([handle, value]) => {
    const key = handle.toLowerCase();
    normalized[key] = typeof value === "bigint" ? value : (value as number | boolean);
  });

  const values = handles.map((handle) => normalized[handle.toLowerCase()] ?? 0);

  return {
    values,
    abiEncoded: result.abiEncodedClearValues as `0x${string}`,
    proof: result.decryptionProof as `0x${string}`
  };
}
