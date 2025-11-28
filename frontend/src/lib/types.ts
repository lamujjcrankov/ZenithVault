// Auction types for the frontend

export interface NFTItem {
  nftContract: string;
  tokenId: bigint;
  metadataUri: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
}

export interface Auction {
  id: bigint;
  seller: string;
  item: NFTItem;
  auctionType: AuctionType;
  status: AuctionStatus;
  reservePrice: bigint;
  depositAmount: bigint;
  startTime: bigint;
  endTime: bigint;
  bidCount: number;
  winningBid: bigint;
  secondBid: bigint;
  winner: string;
}

// Using const objects instead of enums for erasableSyntaxOnly compatibility
export const AuctionType = {
  FirstPrice: 0,
  SecondPrice: 1,
} as const;

export type AuctionType = (typeof AuctionType)[keyof typeof AuctionType];

export const AuctionStatus = {
  Active: 0,
  Ended: 1,
  Revealing: 2,
  Settled: 3,
  Cancelled: 4,
} as const;

export type AuctionStatus = (typeof AuctionStatus)[keyof typeof AuctionStatus];

export interface UserStats {
  totalBids: number;
  totalWins: number;
  totalCreated: number;
  totalDeposited: bigint;
  pendingRefunds: bigint;
}

export interface PlatformStats {
  totalAuctions: number;
  activeAuctions: number;
  settledAuctions: number;
  cancelledAuctions: number;
  totalBids: number;
  totalVolume: bigint;
}

export interface AuctionInput {
  item: {
    nftContract: string;
    tokenId: bigint;
    metadataUri: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
  };
  auctionType: AuctionType;
  reservePrice: bigint;
  depositAmount: bigint;
  duration: number;
}

// Helper functions
export function getAuctionStatusLabel(status: AuctionStatus): string {
  switch (status) {
    case AuctionStatus.Active:
      return "Active";
    case AuctionStatus.Ended:
      return "Ended";
    case AuctionStatus.Revealing:
      return "Revealing";
    case AuctionStatus.Settled:
      return "Settled";
    case AuctionStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

export function getAuctionTypeLabel(type: AuctionType): string {
  switch (type) {
    case AuctionType.FirstPrice:
      return "First Price";
    case AuctionType.SecondPrice:
      return "Vickrey (Second Price)";
    default:
      return "Unknown";
  }
}

export function getStatusColor(status: AuctionStatus): string {
  switch (status) {
    case AuctionStatus.Active:
      return "text-green-500";
    case AuctionStatus.Ended:
      return "text-yellow-500";
    case AuctionStatus.Revealing:
      return "text-blue-500";
    case AuctionStatus.Settled:
      return "text-purple-500";
    case AuctionStatus.Cancelled:
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

// Raw return types from contract reads
export type AuctionRaw = readonly [
  `0x${string}`, // seller
  number,        // auctionType
  bigint,        // reservePrice
  bigint,        // depositAmount
  bigint,        // startTime
  bigint,        // endTime
  number,        // status
  `0x${string}`, // winner
  bigint,        // winningBid
  bigint,        // paidPrice
  bigint,        // bidCount
];

export type AuctionItemRaw = readonly [
  `0x${string}`, // nftContract
  bigint,        // tokenId
  string,        // metadataUri
  string,        // name
  string,        // description
  string,        // imageUrl
  string,        // category
];

// Parse raw contract data into typed objects
export function parseAuctionData(raw: AuctionRaw, id: bigint): Omit<Auction, 'item'> {
  return {
    id,
    seller: raw[0],
    auctionType: raw[1] as AuctionType,
    reservePrice: raw[2],
    depositAmount: raw[3],
    startTime: raw[4],
    endTime: raw[5],
    status: raw[6] as AuctionStatus,
    winner: raw[7],
    winningBid: raw[8],
    secondBid: raw[9],
    bidCount: Number(raw[10]),
  };
}

export function parseAuctionItemData(raw: AuctionItemRaw): NFTItem {
  return {
    nftContract: raw[0],
    tokenId: raw[1],
    metadataUri: raw[2],
    name: raw[3],
    description: raw[4],
    imageUrl: raw[5],
    category: raw[6],
  };
}

export function parseFullAuction(
  auctionRaw: AuctionRaw,
  itemRaw: AuctionItemRaw,
  id: bigint
): Auction {
  return {
    ...parseAuctionData(auctionRaw, id),
    item: parseAuctionItemData(itemRaw),
  };
}
