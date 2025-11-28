import { useReadContract, useReadContracts } from "wagmi";
import { ZENITH_VAULT_ABI, ZENITH_VAULT_ADDRESS } from "@/lib/abi";
import { CONTRACT_ADDRESS } from "@/lib/wagmi";
import type { Auction, AuctionRaw, AuctionItemRaw } from "@/lib/types";
import { parseAuctionData, parseAuctionItemData, parseFullAuction } from "@/lib/types";

const contractAddress = CONTRACT_ADDRESS as `0x${string}`;

// Hook to get full auction data (auction + item)
export function useFullAuction(auctionId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: auctionId !== undefined ? [
      {
        address: contractAddress,
        abi: ZENITH_VAULT_ABI,
        functionName: "getAuction",
        args: [auctionId],
      },
      {
        address: contractAddress,
        abi: ZENITH_VAULT_ABI,
        functionName: "getAuctionItem",
        args: [auctionId],
      },
    ] : [],
    query: {
      enabled: auctionId !== undefined,
    },
  });

  const auction =
    data && data[0]?.result && data[1]?.result
      ? parseFullAuction(
          data[0].result as unknown as AuctionRaw,
          data[1].result as unknown as AuctionItemRaw,
          auctionId!
        )
      : undefined;

  return { data: auction, isLoading, error, refetch };
}

// Hook to get multiple auctions by IDs
export function useMultipleAuctions(auctionIds: bigint[]) {
  // Build contract calls for all auctions and their items
  const contracts = auctionIds.flatMap((id) => [
    {
      address: contractAddress,
      abi: ZENITH_VAULT_ABI,
      functionName: "getAuction" as const,
      args: [id] as const,
    },
    {
      address: contractAddress,
      abi: ZENITH_VAULT_ABI,
      functionName: "getAuctionItem" as const,
      args: [id] as const,
    },
  ]);

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: auctionIds.length > 0,
    },
  });

  // Parse results into Auction objects
  const auctions: Auction[] = [];
  if (data) {
    for (let i = 0; i < auctionIds.length; i++) {
      const auctionResult = data[i * 2];
      const itemResult = data[i * 2 + 1];

      if (auctionResult?.result && itemResult?.result) {
        auctions.push(
          parseFullAuction(
            auctionResult.result as unknown as AuctionRaw,
            itemResult.result as unknown as AuctionItemRaw,
            auctionIds[i]
          )
        );
      }
    }
  }

  return { data: auctions, isLoading, error, refetch };
}

// Hook to get active auctions with full data
export function useActiveAuctionsData() {
  const { data: activeIds, isLoading: loadingIds } = useReadContract({
    address: contractAddress,
    abi: ZENITH_VAULT_ABI,
    functionName: "getActiveAuctions",
  });

  const ids = (activeIds as bigint[] | undefined) ?? [];
  const { data: auctions, isLoading: loadingAuctions, error, refetch } = useMultipleAuctions(ids);

  return {
    data: auctions,
    isLoading: loadingIds || loadingAuctions,
    error,
    refetch,
  };
}

// Hook to get hot auctions with full data
export function useHotAuctionsData(limit: number = 6) {
  const { data: hotIds, isLoading: loadingIds } = useReadContract({
    address: contractAddress,
    abi: ZENITH_VAULT_ABI,
    functionName: "getHotAuctions",
    args: [BigInt(limit)],
  });

  const ids = (hotIds as bigint[] | undefined) ?? [];
  const { data: auctions, isLoading: loadingAuctions, error, refetch } = useMultipleAuctions(ids);

  return {
    data: auctions,
    isLoading: loadingIds || loadingAuctions,
    error,
    refetch,
  };
}

// Hook to get auctions by category with full data
export function useAuctionsByCategoryData(category: string) {
  const { data: categoryIds, isLoading: loadingIds } = useReadContract({
    address: contractAddress,
    abi: ZENITH_VAULT_ABI,
    functionName: "getAuctionsByCategory",
    args: [category],
    query: {
      enabled: !!category && category !== "All",
    },
  });

  const ids = (categoryIds as bigint[] | undefined) ?? [];
  const { data: auctions, isLoading: loadingAuctions, error, refetch } = useMultipleAuctions(ids);

  return {
    data: auctions,
    isLoading: loadingIds || loadingAuctions,
    error,
    refetch,
  };
}

// Hook to get user's bid auctions with full data
export function useUserBidAuctionsData(userAddress: string | undefined) {
  const { data: bidIds, isLoading: loadingIds } = useReadContract({
    address: contractAddress,
    abi: ZENITH_VAULT_ABI,
    functionName: "getUserBidAuctions",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const ids = (bidIds as bigint[] | undefined) ?? [];
  const { data: auctions, isLoading: loadingAuctions, error, refetch } = useMultipleAuctions(ids);

  return {
    data: auctions,
    isLoading: loadingIds || loadingAuctions,
    error,
    refetch,
  };
}

// Hook to get user's created auctions with full data
export function useUserCreatedAuctionsData(userAddress: string | undefined) {
  const { data: createdIds, isLoading: loadingIds } = useReadContract({
    address: contractAddress,
    abi: ZENITH_VAULT_ABI,
    functionName: "getUserCreatedAuctions",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const ids = (createdIds as bigint[] | undefined) ?? [];
  const { data: auctions, isLoading: loadingAuctions, error, refetch } = useMultipleAuctions(ids);

  return {
    data: auctions,
    isLoading: loadingIds || loadingAuctions,
    error,
    refetch,
  };
}

// Hook to get user's won auctions with full data
export function useUserWonAuctionsData(userAddress: string | undefined) {
  const { data: wonIds, isLoading: loadingIds } = useReadContract({
    address: contractAddress,
    abi: ZENITH_VAULT_ABI,
    functionName: "getUserWonAuctions",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const ids = (wonIds as bigint[] | undefined) ?? [];
  const { data: auctions, isLoading: loadingAuctions, error, refetch } = useMultipleAuctions(ids);

  return {
    data: auctions,
    isLoading: loadingIds || loadingAuctions,
    error,
    refetch,
  };
}

// Hook to get pending refund auctions with full data
export function useUserPendingRefundsData(userAddress: string | undefined) {
  const { data: refundIds, isLoading: loadingIds } = useReadContract({
    address: contractAddress,
    abi: ZENITH_VAULT_ABI,
    functionName: "getUserPendingRefunds",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const ids = (refundIds as bigint[] | undefined) ?? [];
  const { data: auctions, isLoading: loadingAuctions, error, refetch } = useMultipleAuctions(ids);

  return {
    data: auctions,
    isLoading: loadingIds || loadingAuctions,
    error,
    refetch,
  };
}
