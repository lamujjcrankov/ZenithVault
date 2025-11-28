// Contract addresses
export const ZENITH_VAULT_ADDRESS = '0x...' as `0x${string}`;

// Auction categories
export const CATEGORIES = [
    'All',
    'Art',
    'Music',
    'Collectible',
    'GameAsset',
    'Domain',
] as const;

export type AuctionCategory = typeof CATEGORIES[number];

// Auction types
export const AUCTION_TYPES = {
    FirstPrice: 'First Price',
    SecondPrice: 'Vickrey (Second Price)',
} as const;

// Auction status
export const AUCTION_STATUS = {
    Active: 'Active',
    Ended: 'Ended',
    Revealing: 'Revealing',
    Settled: 'Settled',
    Cancelled: 'Cancelled',
} as const;

export type AuctionStatus = keyof typeof AUCTION_STATUS;

// Duration options for auction creation
export const DURATION_OPTIONS = [
    { label: '1 day', value: 86400 },
    { label: '3 days', value: 259200 },
    { label: '7 days', value: 604800 },
    { label: '14 days', value: 1209600 },
    { label: '30 days', value: 2592000 },
];

// Platform fee
export const PLATFORM_FEE_PERCENTAGE = 2.5;
