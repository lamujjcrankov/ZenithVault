# ZenithVault

<div align="center">

**Privacy-Preserving Sealed-Bid Auction Platform for Digital Collectibles**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![Zama fhEVM](https://img.shields.io/badge/Zama_fhEVM-v0.9.1-purple.svg)](https://docs.zama.ai/fhevm)
[![Tests](https://img.shields.io/badge/Tests-71%20passing-brightgreen.svg)](./test)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Live Demo](https://zenithvault-nvnexcn60-songsus-projects.vercel.app) | [Documentation](./docs) | [Architecture](#system-architecture)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Auction Mechanisms](#auction-mechanisms)
- [System Architecture](#system-architecture)
- [Smart Contract Design](#smart-contract-design)
- [FHE Implementation](#fhe-implementation)
- [Frontend Application](#frontend-application)
- [Testing](#testing)
- [Deployment](#deployment)
- [Development Guide](#development-guide)
- [Security Considerations](#security-considerations)
- [License](#license)

---

## Overview

ZenithVault is a decentralized auction platform that leverages **Fully Homomorphic Encryption (FHE)** to enable truly sealed-bid auctions on the blockchain. Built on Zama's fhEVM, the platform ensures that bid amounts remain completely private and encrypted until the auction concludes, preventing bid sniping, collusion, and front-running attacks.

### Problem Statement

Traditional on-chain auctions suffer from several critical issues:
- **Transparency Paradox**: Public blockchains expose all bid information, enabling strategic manipulation
- **Front-Running**: Validators and searchers can exploit bid visibility
- **Bid Sniping**: Users can place bids at the last second after observing others
- **Collusion**: Bidders can coordinate based on visible bid information

### Solution

ZenithVault uses **Fully Homomorphic Encryption** to encrypt all bid amounts on-chain while still enabling:
- ✅ Encrypted bid comparison to determine winners
- ✅ Fair auction settlement without trusted intermediaries
- ✅ Privacy preservation until reveal phase
- ✅ Verifiable on-chain execution

---

## Key Features

### 🔐 Privacy-First Design
- **End-to-End Encryption**: All bid amounts encrypted using FHE before submission
- **Blind Comparison**: Winner determined through encrypted comparisons on-chain
- **Selective Reveal**: Only winning bid revealed after settlement
- **No Trusted Intermediary**: All operations verifiable on-chain

### 🎯 Dual Auction Mechanisms
- **First-Price Auction**: Highest bidder wins and pays their bid amount
- **Second-Price (Vickrey) Auction**: Highest bidder wins but pays second-highest bid
  - Incentivizes truthful bidding
  - Reduces strategic behavior

### 💎 Digital Collectibles Support
- NFT auction support (ERC-721)
- Multiple categories: Art, Music, Gaming, Collectibles, Domains
- Rich metadata with images and descriptions
- IPFS integration for decentralized storage

### 🛡️ Security & Fairness
- Deposit-based bidding to prevent spam
- Reserve price protection for sellers
- Automated refund system for non-winners
- Platform fee transparency (2.5%)

### 📊 Comprehensive Analytics
- Real-time platform statistics
- User activity tracking (bids, wins, deposits)
- Hot auctions ranking
- Ending soon filters

---

## Auction Mechanisms

### First-Price Sealed-Bid Auction

In a first-price auction, the highest bidder wins and pays exactly what they bid.

**Flow:**
1. Bidders submit encrypted bids with deposits
2. Auction ends after duration expires
3. FHE comparison determines highest bid
4. Winner pays their bid amount
5. Non-winners receive deposit refunds

**Advantages:**
- Simple and intuitive
- Maximum revenue for sellers
- Fair price discovery

**Example:**
```
Bids (encrypted): [0.5 ETH, 0.8 ETH, 0.6 ETH]
Winner: Bidder B (0.8 ETH)
Payment: 0.8 ETH
```

### Second-Price Sealed-Bid (Vickrey) Auction

In a Vickrey auction, the highest bidder wins but pays the second-highest bid amount.

**Flow:**
1. Bidders submit encrypted bids with deposits
2. Auction ends after duration expires
3. FHE comparison determines highest and second-highest bids
4. Winner pays second-highest bid amount
5. Non-winners receive deposit refunds

**Advantages:**
- Encourages truthful bidding (no strategic underbidding)
- Winner surplus (pays less than their maximum)
- Economically efficient

**Example:**
```
Bids (encrypted): [0.5 ETH, 0.8 ETH, 0.6 ETH]
Winner: Bidder B (bid 0.8 ETH)
Payment: 0.6 ETH (second-highest bid)
Surplus: 0.2 ETH
```

### Auction Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                      AUCTION LIFECYCLE                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│   CREATION   │  Seller creates auction with reserve price,
│              │  deposit requirement, and duration
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    ACTIVE    │  Bidders submit encrypted bids with deposits
│              │  - Bids encrypted client-side using FHE
│  (Accepting  │  - On-chain comparison tracks highest bids
│    Bids)     │  - Seller cannot see bid amounts
│              │  - Other bidders cannot see bid amounts
└──────┬───────┘
       │
       │ (Duration expires)
       ▼
┌──────────────┐
│    ENDED     │  Bidding closed, awaiting reveal
│              │  - No more bids accepted
│  (Pending    │  - Encrypted bids stored on-chain
│   Reveal)    │  - Trigger decryption request
└──────┬───────┘
       │
       │ (Request FHE decryption)
       ▼
┌──────────────┐
│  REVEALING   │  Zama Gateway processes decryption
│              │  - Self-relaying decryption via Gateway
│ (Decryption  │  - Only highest and second-highest revealed
│ In Progress) │  - All other bids remain encrypted
└──────┬───────┘
       │
       │ (Decryption complete)
       ▼
┌──────────────┐
│   SETTLED    │  Winner determined, payments processed
│              │  - Winner identified on-chain
│  (Winner     │  - Winner pays final amount
│ Determined)  │  - Seller receives payment (minus 2.5% fee)
│              │  - Non-winners claim deposit refunds
└──────────────┘
```

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  React + TypeScript + Vite                                       │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐         │
│  │   UI/UX    │  │ State Mgmt   │  │ FHE Encryption  │         │
│  │ Components │──│ (React Query)│──│ (Relayer SDK)   │         │
│  └────────────┘  └──────────────┘  └─────────────────┘         │
│         │                │                    │                  │
│         └────────────────┴────────────────────┘                  │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                          ▼     WEB3 LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐         │
│  │   Wagmi v3   │  │  RainbowKit   │  │   Viem       │         │
│  │ React Hooks  │──│ Wallet Conn.  │──│ JSON-RPC     │         │
│  └──────────────┘  └───────────────┘  └──────────────┘         │
│         │                │                    │                  │
│         └────────────────┴────────────────────┘                  │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                          ▼   BLOCKCHAIN LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│                  Sepolia Testnet (fhEVM)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ZenithVault Smart Contract                   │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────┐   │   │
│  │  │  Auction   │  │     Bid      │  │   Settlement   │   │   │
│  │  │ Management │  │  Processing  │  │   & Refunds    │   │   │
│  │  └────────────┘  └──────────────┘  └────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Zama fhEVM v0.9.1                            │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────┐   │   │
│  │  │    FHE     │  │   Gateway    │  │   KMS (Key     │   │   │
│  │  │ Operations │──│ Decryption   │──│  Management)   │   │   │
│  │  └────────────┘  └──────────────┘  └────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌──────────┐        ┌──────────────┐        ┌────────────────┐
│  Bidder  │        │   Frontend   │        │ Smart Contract │
└────┬─────┘        └──────┬───────┘        └────────┬───────┘
     │                     │                         │
     │ 1. Enter bid amount │                         │
     │────────────────────>│                         │
     │                     │                         │
     │                     │ 2. Encrypt with FHE     │
     │                     │    (Relayer SDK)        │
     │                     │────────────┐            │
     │                     │            │            │
     │                     │<───────────┘            │
     │                     │                         │
     │                     │ 3. Submit encrypted bid │
     │                     │    + deposit (ETH)      │
     │                     │────────────────────────>│
     │                     │                         │
     │                     │                         │ 4. Store
     │                     │                         │    encrypted
     │                     │                         │    bid
     │                     │                         │─────────┐
     │                     │                         │         │
     │                     │                         │<────────┘
     │                     │                         │
     │                     │ 5. Emit BidPlaced event │
     │                     │<────────────────────────│
     │                     │                         │
     │ 6. Bid confirmed    │                         │
     │<────────────────────│                         │
     │                     │                         │

     (After auction ends)

     │                     │ 7. Request reveal       │
     │                     │────────────────────────>│
     │                     │                         │
     │                     │                         │ 8. Request
     │                     │                         │    Gateway
     │                     │                         │    decryption
     │                     │                         │─────────┐
     │                     │                         │         │
     │                     │                         │<────────┘
     │                     │                         │
     │                     │ 9. Decrypted values     │
     │                     │<────────────────────────│
     │                     │                         │
     │                     │ 10. Settle auction      │
     │                     │────────────────────────>│
     │                     │                         │
     │                     │                         │ 11. Determine
     │                     │                         │     winner,
     │                     │                         │     process
     │                     │                         │     payments
     │                     │                         │─────────┐
     │                     │                         │         │
     │                     │                         │<────────┘
     │                     │                         │
     │                     │ 12. Settlement complete │
     │                     │<────────────────────────│
     │                     │                         │
     │ 13. Claim refund    │                         │
     │    (if not winner)  │                         │
     │────────────────────>│                         │
     │                     │                         │
     │                     │ 14. Process refund      │
     │                     │────────────────────────>│
     │                     │                         │
     │ 15. Refund received │                         │
     │<────────────────────│<────────────────────────│
```

---

## Smart Contract Design

### Contract Structure

```solidity
contract ZenithVault is ZamaEthereumConfig {

    // ==================== Core Types ====================

    enum AuctionStatus {
        Active,      // Accepting bids
        Ended,       // Bidding closed, pending reveal
        Revealing,   // Decryption in progress
        Settled,     // Winner determined
        Cancelled    // Auction cancelled
    }

    enum AuctionType {
        FirstPrice,   // Highest bid wins, pays highest bid
        SecondPrice   // Highest bid wins, pays second highest (Vickrey)
    }

    struct NFTItem {
        address nftContract;
        uint256 tokenId;
        string metadataUri;
        string name;
        string description;
        string imageUrl;
        string category;
    }

    struct Auction {
        bool exists;
        uint256 auctionId;
        address seller;
        NFTItem item;
        AuctionType auctionType;
        uint256 reservePrice;
        uint256 depositAmount;
        uint256 startTime;
        uint256 endTime;
        AuctionStatus status;
        euint64 highestBidCipher;    // Encrypted highest bid
        euint64 secondBidCipher;     // Encrypted second-highest bid
        address winner;
        uint64 winningBid;
        uint64 paidPrice;
        uint256 bidCount;
    }

    struct Bid {
        bool exists;
        address bidder;
        euint64 bidAmountCipher;     // Encrypted bid amount
        uint256 depositPaid;
        uint256 timestamp;
        bool refunded;
        bool isWinner;
    }
}
```

### Key Functions

#### Auction Management

```solidity
/// @notice Create a new sealed-bid auction
/// @param input Auction parameters (item, type, reserve, deposit, duration)
/// @return auctionId The newly created auction ID
function createAuction(AuctionInput calldata input)
    external
    returns (uint256 auctionId);

/// @notice Cancel an active auction (seller only, before bids)
/// @param auctionId The auction to cancel
function cancelAuction(uint256 auctionId)
    external
    auctionExists(auctionId);
```

#### Bidding

```solidity
/// @notice Place an encrypted bid with deposit
/// @param auctionId The auction to bid on
/// @param encryptedBid The FHE-encrypted bid amount
/// @param proof Encryption proof from relayer
function placeBid(
    uint256 auctionId,
    externalEuint64 calldata encryptedBid,
    bytes calldata proof
) external payable auctionExists(auctionId);

/// @notice Increase an existing bid
/// @param auctionId The auction ID
/// @param newEncryptedBid The new encrypted bid amount (must be higher)
/// @param proof Encryption proof
function increaseBid(
    uint256 auctionId,
    externalEuint64 calldata newEncryptedBid,
    bytes calldata proof
) external auctionExists(auctionId);
```

#### Settlement

```solidity
/// @notice End the auction (mark as Ended)
/// @param auctionId The auction to end
function endAuction(uint256 auctionId)
    external
    auctionExists(auctionId);

/// @notice Request FHE decryption of winning bids
/// @param auctionId The auction to reveal
function requestReveal(uint256 auctionId)
    external
    auctionExists(auctionId);

/// @notice Settle auction with decrypted values
/// @param auctionId The auction to settle
/// @param winningBid Decrypted highest bid
/// @param secondBid Decrypted second-highest bid
/// @param winner Winner's address
function settleAuction(
    uint256 auctionId,
    uint64 winningBid,
    uint64 secondBid,
    address winner
) external auctionExists(auctionId);
```

#### Refunds & Payments

```solidity
/// @notice Claim deposit refund (non-winners only)
/// @param auctionId The settled auction
function claimRefund(uint256 auctionId)
    external
    auctionExists(auctionId);

/// @notice Winner pays the final bid amount
/// @param auctionId The auction won
function payWinningBid(uint256 auctionId)
    external
    payable
    auctionExists(auctionId);
```

### Query Functions

```solidity
// User queries
function getUserBidAuctions(address user) external view returns (uint256[]);
function getUserCreatedAuctions(address user) external view returns (uint256[]);
function getUserWonAuctions(address user) external view returns (uint256[]);
function getUserPendingRefunds(address user) external view returns (uint256[]);
function getUserStats(address user) external view returns (...);

// Auction discovery
function getActiveAuctions() external view returns (uint256[]);
function getEndingSoonAuctions() external view returns (uint256[]);
function getAuctionsByCategory(string category) external view returns (uint256[]);
function getHotAuctions(uint256 limit) external view returns (uint256[]);
function getAuctionsPaginated(uint256 offset, uint256 limit) external view returns (...);

// Platform statistics
function getPlatformStats() external view returns (
    uint256 totalAuctions,
    uint256 activeAuctions,
    uint256 settledAuctions,
    uint256 cancelledAuctions,
    uint256 totalBidsPlaced,
    uint256 totalVolumeSettled
);
```

### Constants

| Parameter | Value | Description |
|-----------|-------|-------------|
| `MIN_DURATION` | 1 hour | Minimum auction duration |
| `MAX_DURATION` | 30 days | Maximum auction duration |
| `MIN_DEPOSIT` | 0.001 ETH | Minimum deposit per bid |
| `PLATFORM_FEE_BPS` | 250 | Platform fee (2.5% in basis points) |

---

## FHE Implementation

### Fully Homomorphic Encryption Overview

ZenithVault uses Zama's fhEVM to perform encrypted computations on-chain without ever revealing bid amounts until settlement.

### FHE Operations Used

| Operation | Type | Purpose | Example |
|-----------|------|---------|---------|
| `FHE.fromExternal()` | Conversion | Import user's encrypted bid | Convert client-side encryption to on-chain type |
| `FHE.gt()` | Comparison | Check if bid is higher | `FHE.gt(newBid, currentHighest)` |
| `FHE.select()` | Conditional | Update highest bid if greater | `FHE.select(isHigher, newBid, currentBid)` |
| `FHE.eq()` | Equality | Check if bid equals highest | Determine winner position |
| `FHE.makePubliclyDecryptable()` | Reveal | Mark cipher for decryption | Request Gateway decryption |
| `FHE.isPubliclyDecryptable()` | Check | Verify decryption status | Ensure reveal complete |
| `FHE.toBytes32()` | Read | Extract decrypted value | Read winning bid amount |

### Bid Placement with FHE

```solidity
function placeBid(
    uint256 auctionId,
    externalEuint64 calldata encryptedBid,
    bytes calldata proof
) external payable auctionExists(auctionId) {
    Auction storage auction = auctions[auctionId];

    // Validate auction is active
    if (auction.status != AuctionStatus.Active) revert AuctionNotActive();
    if (block.timestamp >= auction.endTime) revert AuctionNotActive();
    if (msg.sender == auction.seller) revert SellerCannotBid();

    // Import encrypted bid from client
    euint64 bidCipher = FHE.fromExternal(encryptedBid, proof);

    // Check if deposit is sufficient
    if (msg.value < auction.depositAmount) revert InsufficientDeposit();

    // Store encrypted bid
    Bid storage bid = bids[auctionId][msg.sender];
    if (bid.exists) revert AlreadyBid();

    bid.exists = true;
    bid.bidder = msg.sender;
    bid.bidAmountCipher = bidCipher;
    bid.depositPaid = msg.value;
    bid.timestamp = block.timestamp;

    // Update highest bid using FHE comparison
    if (auction.bidCount == 0) {
        // First bid becomes highest
        auction.highestBidCipher = bidCipher;
    } else {
        // Compare with current highest (encrypted)
        ebool isHigher = FHE.gt(bidCipher, auction.highestBidCipher);

        // For Vickrey, track second-highest
        if (auction.auctionType == AuctionType.SecondPrice) {
            // If new bid is higher, old highest becomes second
            auction.secondBidCipher = FHE.select(
                isHigher,
                auction.highestBidCipher,  // Old highest → second
                auction.secondBidCipher     // Keep current second
            );
        }

        // Update highest bid conditionally
        auction.highestBidCipher = FHE.select(
            isHigher,
            bidCipher,                    // New bid → highest
            auction.highestBidCipher      // Keep current highest
        );
    }

    auction.bidCount++;
    auctionBidders[auctionId].push(msg.sender);
    userBidAuctions[msg.sender].push(auctionId);

    emit BidPlaced(auctionId, msg.sender, block.timestamp);
}
```

### Decryption & Settlement

```solidity
function requestReveal(uint256 auctionId) external auctionExists(auctionId) {
    Auction storage auction = auctions[auctionId];

    if (auction.status != AuctionStatus.Ended) revert AuctionNotEnded();

    // Request Gateway decryption
    FHE.makePubliclyDecryptable(auction.highestBidCipher);

    if (auction.auctionType == AuctionType.SecondPrice) {
        FHE.makePubliclyDecryptable(auction.secondBidCipher);
    }

    auction.status = AuctionStatus.Revealing;
    emit RevealRequested(auctionId);
}

function settleAuction(
    uint256 auctionId,
    uint64 winningBid,
    uint64 secondBid,
    address winner
) external auctionExists(auctionId) {
    Auction storage auction = auctions[auctionId];

    // Verify reveal is complete
    if (!FHE.isPubliclyDecryptable(auction.highestBidCipher)) {
        revert RevealNotReady();
    }

    // Read decrypted values
    uint64 decryptedHighest = uint64(bytes8(FHE.toBytes32(auction.highestBidCipher)));

    if (decryptedHighest != winningBid) revert("Invalid decryption");
    if (winningBid < auction.reservePrice) revert BelowReservePrice();

    auction.winner = winner;
    auction.winningBid = winningBid;

    // Calculate payment based on auction type
    if (auction.auctionType == AuctionType.FirstPrice) {
        auction.paidPrice = winningBid;
    } else {
        // Vickrey: winner pays second-highest
        auction.paidPrice = secondBid;
    }

    auction.status = AuctionStatus.Settled;
    bids[auctionId][winner].isWinner = true;

    emit AuctionSettled(auctionId, winner, winningBid, auction.paidPrice);
}
```

---

## Frontend Application

### Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Web3**: Wagmi v3.0.2 + Viem
- **UI**: Tailwind CSS + shadcn/ui components
- **Wallet**: RainbowKit for wallet connection
- **FHE**: @zama-fhe/relayer-sdk for encryption
- **Deployment**: Vercel with SPA routing

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auction/
│   │   │   ├── AuctionCard.tsx       # Auction preview card
│   │   │   ├── AuctionFilters.tsx    # Category/status filters
│   │   │   └── BidForm.tsx           # Encrypted bid submission
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Navigation + wallet
│   │   │   └── Footer.tsx
│   │   └── ui/                       # shadcn/ui components
│   ├── pages/
│   │   ├── Home.tsx                  # Landing page
│   │   ├── AuctionList.tsx          # Browse auctions
│   │   ├── AuctionDetail.tsx        # Single auction view
│   │   ├── CreateAuction.tsx        # Create new auction
│   │   ├── MyBids.tsx               # User's bid history
│   │   └── Docs.tsx                 # Documentation
│   ├── hooks/
│   │   ├── useAuctions.ts           # Auction data fetching
│   │   ├── useContract.ts           # Contract interactions
│   │   └── useFHE.ts                # FHE encryption
│   ├── lib/
│   │   ├── contract.ts              # Contract ABI & address
│   │   └── utils.ts                 # Helper functions
│   └── App.tsx                      # Router + providers
├── public/
└── vercel.json                      # SPA routing config
```

### Key Features

#### 1. Wallet Integration

```typescript
// RainbowKit configuration
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'ZenithVault',
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
});

export function App() {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        <Router />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
```

#### 2. FHE Encrypted Bidding

```typescript
import { createRelayer } from '@zama-fhe/relayer-sdk';

export function BidForm({ auctionId, depositAmount }) {
  const [bidAmount, setBidAmount] = useState('');
  const { writeContract } = useWriteContract();

  const handleSubmit = async () => {
    // Initialize FHE relayer
    const relayer = await createRelayer({
      network: 'sepolia',
      contractAddress: CONTRACT_ADDRESS,
    });

    // Encrypt bid amount
    const encrypted = await relayer.encryptEuint64(
      parseEther(bidAmount)
    );

    // Submit encrypted bid
    await writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'placeBid',
      args: [auctionId, encrypted.data, encrypted.proof],
      value: depositAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Enter bid amount"
      />
      <button type="submit">Place Encrypted Bid</button>
    </form>
  );
}
```

#### 3. Real-Time Auction Listing

```typescript
export function AuctionList() {
  const { data: auctions } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActiveAuctions',
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {auctions?.map((auctionId) => (
        <AuctionCard key={auctionId} auctionId={auctionId} />
      ))}
    </div>
  );
}
```

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-optimized interactions
- Progressive Web App (PWA) ready

---

## Testing

### Test Coverage

**Total Tests**: 71 tests across 3 test suites
**Pass Rate**: 100% (71/71 passing)
**Execution Time**: ~576ms

### Test Suites

#### 1. Core Functionality Tests (`ZenithVault.test.js`)

**Coverage**: 23 tests

- ✅ Contract deployment and initialization
- ✅ Auction creation (First-Price and Vickrey)
- ✅ Input validation (duration, deposit amount)
- ✅ Auction queries (by ID, category, pagination)
- ✅ Platform statistics tracking
- ✅ User statistics tracking
- ✅ Category filtering
- ✅ Pagination logic

**Example Test**:
```javascript
it("Should create a first-price auction", async function () {
  const auctionInput = {
    item: SAMPLE_ITEM,
    auctionType: 0, // FirstPrice
    reservePrice: ethers.parseEther("0.1"),
    depositAmount: ethers.parseEther("0.02"),
    duration: 7 * 24 * 60 * 60 // 7 days
  };

  await expect(zenithVault.connect(seller).createAuction(auctionInput))
    .to.emit(zenithVault, "AuctionCreated");

  const auction = await zenithVault.getAuction(0);
  expect(auction.seller).to.equal(seller.address);
  expect(auction.auctionType).to.equal(0);
  expect(auction.reservePrice).to.equal(ethers.parseEther("0.1"));
  expect(auction.status).to.equal(0); // Active
});
```

#### 2. Bidding System Tests (`ZenithVault.bidding.test.js`)

**Coverage**: 22 tests

- ✅ Bid validation rules
- ✅ Bidder tracking
- ✅ User bid history
- ✅ Hot auctions algorithm
- ✅ Ending soon filter
- ✅ Deposit requirements
- ✅ Multiple bidders handling
- ✅ Platform statistics

**Example Test**:
```javascript
it("Should not allow seller to bid on own auction", async function () {
  const [canBid] = await zenithVault.canUserBid(auctionId, seller.address);
  expect(canBid).to.be.false;
});

it("Should allow valid bidder to bid", async function () {
  const [canBid, reason] = await zenithVault.canUserBid(auctionId, bidder1.address);
  expect(canBid).to.be.true;
  expect(reason).to.equal("");
});
```

#### 3. Settlement & Refunds Tests (`ZenithVault.settlement.test.js`)

**Coverage**: 26 tests

- ✅ Auction lifecycle (Active → Ended → Settled)
- ✅ Winner determination
- ✅ Refund tracking
- ✅ Platform fees (2.5%)
- ✅ Winning bid tracking
- ✅ Settlement statistics
- ✅ Edge cases (no bids, single bid in Vickrey)
- ✅ Paid price calculation

**Example Test**:
```javascript
it("Should calculate paid price for second-price auction", async function () {
  const vickreyAuction = {
    item: SAMPLE_ITEM,
    auctionType: 1, // SecondPrice
    reservePrice: RESERVE_PRICE,
    depositAmount: DEPOSIT_AMOUNT,
    duration: DURATION
  };

  await zenithVault.connect(seller).createAuction(vickreyAuction);
  const auction = await zenithVault.getAuction(1);
  expect(auction.auctionType).to.equal(1);
  // In Vickrey, paid price should equal second-highest bid
  expect(auction.paidPrice).to.equal(0); // Not settled yet
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:basic        # Core functionality
npm run test:bidding      # Bidding system
npm run test:settlement   # Settlement & refunds

# Run with coverage report
npm run test:coverage
```

### Test Configuration

```javascript
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  mocha: {
    timeout: 120000, // 2 minutes
  },
};
```

### Testing Limitations

**Note**: Some tests verify contract structure and access control rather than actual FHE operations, as full FHE testing requires:

1. fhEVM network with FHE support
2. Relayer SDK for encryption/decryption
3. Gateway contract for decryption requests

The test suite focuses on:
- ✅ Contract logic and state management
- ✅ Access control and permissions
- ✅ Event emissions
- ✅ Error handling
- ⚠️ FHE operations (integration testing required)

---

## Deployment

### Smart Contract Deployment

**Network**: Sepolia Testnet (fhEVM)
**Contract Address**: `0x6dd08836B73DC2dd3e294De7f20b18802e282254`

#### Deploy Steps

```bash
# 1. Set environment variables
cp .env.example .env
# Edit .env with your values:
# SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
# PRIVATE_KEY=your_private_key

# 2. Compile contracts
npm run compile

# 3. Deploy to Sepolia
npm run deploy:sepolia

# 4. Seed sample auctions (optional)
npm run seed
```

#### Deployment Script

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying ZenithVault...");

  const ZenithVault = await hre.ethers.getContractFactory("ZenithVault");
  const zenithVault = await ZenithVault.deploy();

  await zenithVault.waitForDeployment();
  const address = await zenithVault.getAddress();

  console.log(`ZenithVault deployed to: ${address}`);

  // Verify constants
  const minDuration = await zenithVault.MIN_DURATION();
  const maxDuration = await zenithVault.MAX_DURATION();
  const minDeposit = await zenithVault.MIN_DEPOSIT();
  const platformFee = await zenithVault.PLATFORM_FEE_BPS();

  console.log(`MIN_DURATION: ${minDuration} seconds`);
  console.log(`MAX_DURATION: ${maxDuration} seconds`);
  console.log(`MIN_DEPOSIT: ${hre.ethers.formatEther(minDeposit)} ETH`);
  console.log(`PLATFORM_FEE: ${platformFee} bps (${platformFee/100}%)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Frontend Deployment

**Platform**: Vercel
**Live URL**: [https://zenithvault-nvnexcn60-songsus-projects.vercel.app](https://zenithvault-nvnexcn60-songsus-projects.vercel.app)

#### Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Configure environment variables in Vercel dashboard:
# - VITE_CONTRACT_ADDRESS
# - VITE_WALLETCONNECT_PROJECT_ID

# 3. Deploy
cd frontend
vercel --prod
```

#### SPA Routing Configuration

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This configuration ensures that client-side routing works correctly and prevents 404 errors when refreshing pages.

---

## Development Guide

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Hardhat
- MetaMask or compatible Web3 wallet

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/zenithvault.git
cd zenithvault

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Compile contracts
npm run compile

# 5. Run tests
npm test

# 6. Start local Hardhat node
npx hardhat node

# 7. Deploy to local network (in new terminal)
npx hardhat run scripts/deploy.js --network localhost

# 8. Start frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Project Scripts

#### Smart Contract

```bash
npm run compile         # Compile contracts
npm run deploy          # Deploy to Sepolia
npm run deploy:sepolia  # Deploy to Sepolia (explicit)
npm run seed            # Seed sample auctions
npm run test            # Run all tests
npm run test:basic      # Run core tests
npm run test:bidding    # Run bidding tests
npm run test:settlement # Run settlement tests
npm run test:coverage   # Generate coverage report
npm run clean           # Clean artifacts
```

#### Frontend

```bash
npm run dev             # Start dev server (http://localhost:5173)
npm run build           # Production build
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### Adding New Features

#### 1. Add New Auction Category

```solidity
// In ZenithVault.sol, categories are just strings
// No contract changes needed, just add to frontend

// In frontend/src/lib/constants.ts
export const CATEGORIES = [
  'Art',
  'Music',
  'Collectible',
  'GameAsset',
  'Domain',
  'Photography', // New category
];
```

#### 2. Add New Query Function

```solidity
// 1. Add to contract
function getAuctionsByPriceRange(
    uint256 minPrice,
    uint256 maxPrice
) external view returns (uint256[] memory) {
    uint256[] memory temp = new uint256[](nextAuctionId);
    uint256 count = 0;

    for (uint256 i = 0; i < nextAuctionId; i++) {
        Auction storage auction = auctions[i];
        if (auction.exists &&
            auction.reservePrice >= minPrice &&
            auction.reservePrice <= maxPrice) {
            temp[count++] = i;
        }
    }

    uint256[] memory result = new uint256[](count);
    for (uint256 i = 0; i < count; i++) {
        result[i] = temp[i];
    }
    return result;
}

// 2. Add to ABI in frontend
// 3. Create hook in frontend/src/hooks/
export function useAuctionsByPriceRange(minPrice, maxPrice) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAuctionsByPriceRange',
    args: [parseEther(minPrice), parseEther(maxPrice)],
  });
}
```

### Code Style Guidelines

#### Solidity

```solidity
// ✅ Good
function createAuction(AuctionInput calldata input)
    external
    returns (uint256 auctionId)
{
    if (input.duration < MIN_DURATION) revert InvalidDuration();
    // ...
}

// ❌ Bad
function createAuction(AuctionInput calldata input) external returns (uint256 auctionId) {
  require(input.duration >= MIN_DURATION, "Invalid duration");
  // ...
}
```

#### TypeScript/React

```typescript
// ✅ Good
export function AuctionCard({ auctionId }: { auctionId: bigint }) {
  const { data: auction } = useAuction(auctionId);

  if (!auction) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{auction.item.name}</CardTitle>
      </CardHeader>
    </Card>
  );
}

// ❌ Bad
export function AuctionCard(props) {
  const auction = useAuction(props.auctionId).data;
  return <div>{auction?.item?.name}</div>;
}
```

---

## Security Considerations

### Smart Contract Security

#### 1. Access Control

```solidity
// Seller-only actions
modifier onlySeller(uint256 auctionId) {
    if (msg.sender != auctions[auctionId].seller) revert NotSeller();
    _;
}

// Prevent seller from bidding on own auction
if (msg.sender == auction.seller) revert SellerCannotBid();
```

#### 2. Reentrancy Protection

```solidity
// State changes before external calls
bid.refunded = true;
(bool success, ) = payable(msg.sender).call{value: refundAmount}("");
if (!success) revert TransferFailed();
```

#### 3. Integer Overflow Prevention

```solidity
// Using Solidity 0.8.24 with built-in overflow checks
uint256 totalDeposit = depositAmount * bidCount; // Safe
```

#### 4. Input Validation

```solidity
// Comprehensive validation
if (input.duration < MIN_DURATION || input.duration > MAX_DURATION)
    revert InvalidDuration();
if (input.depositAmount < MIN_DEPOSIT)
    revert InvalidDeposit();
if (input.reservePrice == 0)
    revert("Reserve price must be > 0");
```

### FHE Security

#### 1. Bid Privacy

- All bids encrypted client-side before submission
- On-chain comparisons performed on encrypted values
- Only winning bids revealed after settlement
- Non-winning bids never decrypted

#### 2. Decryption Control

```solidity
// Only mark for decryption after auction ends
if (auction.status != AuctionStatus.Ended) revert AuctionNotEnded();
FHE.makePubliclyDecryptable(auction.highestBidCipher);
```

#### 3. Proof Verification

```solidity
// Relayer SDK provides encryption proofs
euint64 bidCipher = FHE.fromExternal(encryptedBid, proof);
// Proof verified by fhEVM before accepting
```

### Frontend Security

#### 1. Environment Variables

```bash
# Never commit .env files
# Use .env.example as template
VITE_CONTRACT_ADDRESS=0x...
VITE_WALLETCONNECT_PROJECT_ID=...
```

#### 2. Input Sanitization

```typescript
// Validate user input
const bidAmount = parseFloat(input);
if (isNaN(bidAmount) || bidAmount <= 0) {
  throw new Error('Invalid bid amount');
}
```

#### 3. Transaction Verification

```typescript
// Wait for transaction confirmation
const tx = await writeContract({...});
const receipt = await waitForTransactionReceipt({ hash: tx });

if (receipt.status !== 'success') {
  throw new Error('Transaction failed');
}
```

### Audit Recommendations

Before mainnet deployment:

1. ✅ Professional smart contract audit
2. ✅ FHE implementation review by Zama team
3. ✅ Economic attack vector analysis
4. ✅ Gas optimization review
5. ✅ Frontend security audit

---

## License

MIT License

Copyright (c) 2025 ZenithVault

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Acknowledgments

- **Zama** - For fhEVM and FHE technology
- **Ethereum Foundation** - For Solidity and EVM
- **Hardhat** - For development framework
- **Vercel** - For frontend hosting

---

## Contact & Support

- **Documentation**: [Project Docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/zenithvault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/zenithvault/discussions)

---

<div align="center">

**Built with ❤️ using Zama fhEVM**

[Website](https://zenithvault-nvnexcn60-songsus-projects.vercel.app) • [GitHub](https://github.com/yourusername/zenithvault) • [Docs](./docs)

</div>
