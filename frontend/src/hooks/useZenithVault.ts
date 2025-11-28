import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ZENITH_VAULT_ABI } from "@/lib/abi";
import { CONTRACT_ADDRESS } from "@/lib/wagmi";
import type { Auction, UserStats, PlatformStats } from "@/lib/types";

// Read hooks
export function useAuction(auctionId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getAuction",
    args: auctionId !== undefined ? [auctionId] : undefined,
    query: {
      enabled: auctionId !== undefined,
    },
  });
}

export function useAuctionItem(auctionId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getAuctionItem",
    args: auctionId !== undefined ? [auctionId] : undefined,
    query: {
      enabled: auctionId !== undefined,
    },
  });
}

export function useActiveAuctions() {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getActiveAuctions",
  });
}

export function useEndingSoonAuctions() {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getEndingSoonAuctions",
  });
}

export function useAuctionsByCategory(category: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getAuctionsByCategory",
    args: [category],
    query: {
      enabled: !!category && category !== "All",
    },
  });
}

export function useHotAuctions(limit: number = 6) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getHotAuctions",
    args: [BigInt(limit)],
  });
}

export function useAuctionsPaginated(offset: number, limit: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getAuctionsPaginated",
    args: [BigInt(offset), BigInt(limit)],
  });
}

export function useAuctionCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getAuctionCount",
  });
}

export function useUserBidAuctions(user: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getUserBidAuctions",
    args: user ? [user as `0x${string}`] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function useUserCreatedAuctions(user: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getUserCreatedAuctions",
    args: user ? [user as `0x${string}`] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function useUserWonAuctions(user: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getUserWonAuctions",
    args: user ? [user as `0x${string}`] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function useUserPendingRefunds(user: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getUserPendingRefunds",
    args: user ? [user as `0x${string}`] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function useUserStats(user: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getUserStats",
    args: user ? [user as `0x${string}`] : undefined,
    query: {
      enabled: !!user,
    },
  });
}

export function usePlatformStats() {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getPlatformStats",
  });
}

export function useAuctionBidders(auctionId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getAuctionBidders",
    args: auctionId ? [auctionId] : undefined,
    query: {
      enabled: !!auctionId,
    },
  });
}

export function useCanUserBid(auctionId: bigint | undefined, user: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "canUserBid",
    args: auctionId && user ? [auctionId, user as `0x${string}`] : undefined,
    query: {
      enabled: !!auctionId && !!user,
    },
  });
}

export function useCategories() {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ZENITH_VAULT_ABI,
    functionName: "getCategories",
  });
}

// Write hooks
export function useCreateAuction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createAuction = (input: {
    item: {
      nftContract: `0x${string}`;
      tokenId: bigint;
      metadataUri: string;
      name: string;
      description: string;
      imageUrl: string;
      category: string;
    };
    auctionType: number;
    reservePrice: bigint;
    depositAmount: bigint;
    duration: bigint;
  }) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ZENITH_VAULT_ABI,
      functionName: "createAuction",
      args: [input],
    });
  };

  return { createAuction, hash, isPending, isConfirming, isSuccess, error };
}

export function usePlaceBid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const placeBid = (auctionId: bigint, encryptedBid: `0x${string}`, proof: `0x${string}`, deposit: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ZENITH_VAULT_ABI,
      functionName: "placeBid",
      args: [auctionId, encryptedBid, proof],
      value: deposit,
    });
  };

  return { placeBid, hash, isPending, isConfirming, isSuccess, error };
}

export function useIncreaseBid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const increaseBid = (auctionId: bigint, newEncryptedBid: `0x${string}`, proof: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ZENITH_VAULT_ABI,
      functionName: "increaseBid",
      args: [auctionId, newEncryptedBid, proof],
    });
  };

  return { increaseBid, hash, isPending, isConfirming, isSuccess, error };
}

export function useCancelAuction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelAuction = (auctionId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ZENITH_VAULT_ABI,
      functionName: "cancelAuction",
      args: [auctionId],
    });
  };

  return { cancelAuction, hash, isPending, isConfirming, isSuccess, error };
}

export function useEndAuction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const endAuction = (auctionId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ZENITH_VAULT_ABI,
      functionName: "endAuction",
      args: [auctionId],
    });
  };

  return { endAuction, hash, isPending, isConfirming, isSuccess, error };
}

export function useClaimRefund() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimRefund = (auctionId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ZENITH_VAULT_ABI,
      functionName: "claimRefund",
      args: [auctionId],
    });
  };

  return { claimRefund, hash, isPending, isConfirming, isSuccess, error };
}

export function usePayWinningBid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const payWinningBid = (auctionId: bigint, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ZENITH_VAULT_ABI,
      functionName: "payWinningBid",
      args: [auctionId],
      value: amount,
    });
  };

  return { payWinningBid, hash, isPending, isConfirming, isSuccess, error };
}
