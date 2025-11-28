import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  initializeFHE,
  isFheReady,
  isFheAvailable,
  encryptBidAmount,
  resetFHEInstance,
} from "@/lib/fhe";

interface EncryptedValue {
  encryptedHandle: `0x${string}`;
  proof: `0x${string}`;
}

export function useFhevm() {
  const { address, isConnected } = useAccount();
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize FHEVM instance
  const initialize = useCallback(async () => {
    if (!isConnected || !address) {
      return;
    }

    // Check if SDK is available (CDN loaded)
    if (!isFheAvailable()) {
      setError(new Error("FHE SDK not loaded. Please refresh the page."));
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await initializeFHE();
      setIsReady(true);
    } catch (err) {
      console.error("Failed to initialize FHEVM:", err);
      setError(err instanceof Error ? err : new Error("Failed to initialize FHEVM"));
    } finally {
      setIsInitializing(false);
    }
  }, [isConnected, address]);

  // Auto-initialize when connected
  useEffect(() => {
    if (isConnected && !isReady && !isInitializing && !error) {
      initialize();
    }
  }, [isConnected, isReady, isInitializing, error, initialize]);

  // Reset on disconnect
  useEffect(() => {
    if (!isConnected) {
      resetFHEInstance();
      setIsReady(false);
    }
  }, [isConnected]);

  // Check SDK availability periodically (CDN might load later)
  useEffect(() => {
    if (isConnected && !isReady && !isInitializing) {
      const checkAvailability = setInterval(() => {
        if (isFheAvailable() && !isFheReady()) {
          initialize();
        }
      }, 1000);
      return () => clearInterval(checkAvailability);
    }
  }, [isConnected, isReady, isInitializing, initialize]);

  // Encrypt a bid amount
  const encryptBid = useCallback(
    async (bidAmount: bigint): Promise<EncryptedValue | null> => {
      if (!isReady || !address) {
        setError(new Error("FHEVM not initialized or wallet not connected"));
        return null;
      }

      try {
        const result = await encryptBidAmount(bidAmount, address as `0x${string}`);
        return result;
      } catch (err) {
        console.error("Encryption failed:", err);
        setError(err instanceof Error ? err : new Error("Encryption failed"));
        return null;
      }
    },
    [isReady, address]
  );

  return {
    isInitializing,
    isReady,
    error,
    initialize,
    encryptBid,
  };
}

// Hook to encrypt a bid before submission
export function useEncryptedBid() {
  const { encryptBid, isReady, isInitializing, error, initialize } = useFhevm();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedBid, setEncryptedBid] = useState<EncryptedValue | null>(null);

  const encrypt = useCallback(
    async (bidAmount: bigint) => {
      if (!isReady) {
        throw new Error("FHEVM not ready");
      }

      setIsEncrypting(true);
      try {
        const result = await encryptBid(bidAmount);
        setEncryptedBid(result);
        return result;
      } finally {
        setIsEncrypting(false);
      }
    },
    [isReady, encryptBid]
  );

  const reset = useCallback(() => {
    setEncryptedBid(null);
  }, []);

  return {
    encrypt,
    encryptedBid,
    isEncrypting,
    isReady,
    isInitializing,
    error,
    reset,
    initialize,
  };
}
