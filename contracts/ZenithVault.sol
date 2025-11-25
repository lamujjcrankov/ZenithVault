// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ZenithVault - FHE Encrypted Digital Collectibles Sealed-Bid Auction
/// @notice Privacy-preserving auction platform where all bids are encrypted until reveal
/// @dev Built on Zama fhEVM v0.9.1 with self-relaying decryption
contract ZenithVault is ZamaEthereumConfig {

    // ==================== Enums ====================

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

    // ==================== Structs ====================

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
        euint64 highestBidCipher;
        euint64 secondBidCipher;
        address winner;
        uint64 winningBid;
        uint64 paidPrice;
        uint256 bidCount;
    }

    struct Bid {
        bool exists;
        address bidder;
        euint64 bidAmountCipher;
        uint256 depositPaid;
        uint256 timestamp;
        bool refunded;
        bool isWinner;
    }

    struct AuctionInput {
        NFTItem item;
        AuctionType auctionType;
        uint256 reservePrice;
        uint256 depositAmount;
        uint256 duration;
    }

    // ==================== State Variables ====================

    uint256 public nextAuctionId;
    mapping(uint256 => Auction) private auctions;
    mapping(uint256 => mapping(address => Bid)) private bids;
    mapping(uint256 => address[]) private auctionBidders;
    mapping(address => uint256[]) private userBidAuctions;
    mapping(address => uint256[]) private userCreatedAuctions;

    uint256 public constant MIN_DURATION = 1 hours;
    uint256 public constant MAX_DURATION = 30 days;
    uint256 public constant MIN_DEPOSIT = 0.001 ether;
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%

    // ==================== Events ====================

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        string itemName,
        AuctionType auctionType,
        uint256 reservePrice,
        uint256 endTime
    );
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 timestamp);
    event BidIncreased(uint256 indexed auctionId, address indexed bidder, uint256 timestamp);
    event AuctionEnded(uint256 indexed auctionId);
    event RevealRequested(uint256 indexed auctionId);
    event AuctionSettled(uint256 indexed auctionId, address winner, uint64 winningBid, uint64 paidPrice);
    event AuctionCancelled(uint256 indexed auctionId);
    event DepositRefunded(uint256 indexed auctionId, address bidder, uint256 amount);
    event WinnerPaid(uint256 indexed auctionId, address seller, uint256 amount);

    // ==================== Errors ====================

    error AuctionNotFound();
    error AuctionNotActive();
    error AuctionNotEnded();
    error AuctionAlreadySettled();
    error InvalidDuration();
    error InvalidDeposit();
    error InsufficientDeposit();
    error AlreadyBid();
    error NoBidFound();
    error NotSeller();
    error NotWinner();
    error AlreadyRefunded();
    error CannotRefundWinner();
    error RevealNotReady();
    error TransferFailed();
    error BelowReservePrice();
    error SellerCannotBid();
    error AuctionStillActive();

    // ==================== Modifiers ====================

    modifier auctionExists(uint256 auctionId) {
        if (!auctions[auctionId].exists) revert AuctionNotFound();
        _;
    }

    // ==================== Auction Management ====================

    /// @notice Create a new sealed-bid auction for a digital collectible
    function createAuction(AuctionInput calldata input) external returns (uint256 auctionId) {
        if (input.duration < MIN_DURATION || input.duration > MAX_DURATION) revert InvalidDuration();
        if (input.depositAmount < MIN_DEPOSIT) revert InvalidDeposit();

        auctionId = nextAuctionId++;
        Auction storage auction = auctions[auctionId];

        auction.exists = true;
        auction.auctionId = auctionId;
        auction.seller = msg.sender;
        auction.item = input.item;
        auction.auctionType = input.auctionType;
        auction.reservePrice = input.reservePrice;
        auction.depositAmount = input.depositAmount;
        auction.startTime = block.timestamp;
        auction.endTime = block.timestamp + input.duration;
        auction.status = AuctionStatus.Active;

        // Initialize FHE encrypted values
        auction.highestBidCipher = FHE.asEuint64(0);
        auction.secondBidCipher = FHE.asEuint64(0);
        FHE.allowThis(auction.highestBidCipher);
        FHE.allowThis(auction.secondBidCipher);

        userCreatedAuctions[msg.sender].push(auctionId);

        emit AuctionCreated(
            auctionId,
            msg.sender,
            input.item.name,
            input.auctionType,
            input.reservePrice,
            auction.endTime
        );
    }

    /// @notice Place an encrypted sealed bid
    function placeBid(
        uint256 auctionId,
        externalEuint64 encryptedBid,
        bytes calldata proof
    ) external payable auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Active) revert AuctionNotActive();
        if (block.timestamp >= auction.endTime) revert AuctionNotActive();
        if (msg.value < auction.depositAmount) revert InsufficientDeposit();
        if (msg.sender == auction.seller) revert SellerCannotBid();
        if (bids[auctionId][msg.sender].exists) revert AlreadyBid();

        // Convert external encrypted value
        euint64 bidAmount = FHE.fromExternal(encryptedBid, proof);
        FHE.allowThis(bidAmount);
        FHE.allow(bidAmount, msg.sender);

        // Update highest and second highest bids
        _updateHighestBids(auctionId, bidAmount);

        // Store bid
        Bid storage bid = bids[auctionId][msg.sender];
        bid.exists = true;
        bid.bidder = msg.sender;
        bid.bidAmountCipher = bidAmount;
        bid.depositPaid = msg.value;
        bid.timestamp = block.timestamp;
        bid.refunded = false;
        bid.isWinner = false;

        auctionBidders[auctionId].push(msg.sender);
        userBidAuctions[msg.sender].push(auctionId);
        auction.bidCount++;

        emit BidPlaced(auctionId, msg.sender, block.timestamp);
    }

    /// @notice Increase an existing bid
    function increaseBid(
        uint256 auctionId,
        externalEuint64 newEncryptedBid,
        bytes calldata proof
    ) external auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Active) revert AuctionNotActive();
        if (block.timestamp >= auction.endTime) revert AuctionNotActive();

        Bid storage bid = bids[auctionId][msg.sender];
        if (!bid.exists) revert NoBidFound();

        euint64 newBidAmount = FHE.fromExternal(newEncryptedBid, proof);
        FHE.allowThis(newBidAmount);

        // Only allow increase (new > old)
        ebool isIncrease = FHE.gt(newBidAmount, bid.bidAmountCipher);
        bid.bidAmountCipher = FHE.select(isIncrease, newBidAmount, bid.bidAmountCipher);
        FHE.allowThis(bid.bidAmountCipher);
        FHE.allow(bid.bidAmountCipher, msg.sender);

        // Update highest bids
        _updateHighestBids(auctionId, bid.bidAmountCipher);

        emit BidIncreased(auctionId, msg.sender, block.timestamp);
    }

    /// @dev Update highest and second highest bids using FHE comparisons
    function _updateHighestBids(uint256 auctionId, euint64 newBid) internal {
        Auction storage auction = auctions[auctionId];

        // Check if new bid > current highest
        ebool isHigher = FHE.gt(newBid, auction.highestBidCipher);

        // Update second highest: if new is higher, old highest becomes second
        // Otherwise, check if new > second
        ebool newIsSecond = FHE.gt(newBid, auction.secondBidCipher);
        euint64 newSecond = FHE.select(
            isHigher,
            auction.highestBidCipher,
            FHE.select(newIsSecond, newBid, auction.secondBidCipher)
        );

        // Update highest
        auction.highestBidCipher = FHE.select(isHigher, newBid, auction.highestBidCipher);
        auction.secondBidCipher = newSecond;

        FHE.allowThis(auction.highestBidCipher);
        FHE.allowThis(auction.secondBidCipher);
    }

    // ==================== Auction Settlement ====================

    /// @notice End the bidding period
    function endAuction(uint256 auctionId) external auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Active) revert AuctionNotActive();
        if (block.timestamp < auction.endTime) revert AuctionStillActive();

        auction.status = AuctionStatus.Ended;
        emit AuctionEnded(auctionId);
    }

    /// @notice Request decryption of winning bid
    function requestReveal(uint256 auctionId) external auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Ended) revert AuctionNotEnded();

        // Mark highest bid for decryption
        FHE.makePubliclyDecryptable(auction.highestBidCipher);

        // For second price auctions, also reveal second bid
        if (auction.auctionType == AuctionType.SecondPrice) {
            FHE.makePubliclyDecryptable(auction.secondBidCipher);
        }

        // Mark each bid for winner determination
        address[] storage bidders = auctionBidders[auctionId];
        for (uint256 i = 0; i < bidders.length; i++) {
            Bid storage bid = bids[auctionId][bidders[i]];
            if (bid.exists) {
                ebool isWinningBid = FHE.eq(bid.bidAmountCipher, auction.highestBidCipher);
                FHE.makePubliclyDecryptable(isWinningBid);
            }
        }

        auction.status = AuctionStatus.Revealing;
        emit RevealRequested(auctionId);
    }

    /// @notice Settle auction after decryption
    function settleAuction(
        uint256 auctionId,
        uint64 winningBidValue,
        uint64 secondBidValue,
        address winnerAddress
    ) external auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Revealing) revert RevealNotReady();
        require(FHE.isPubliclyDecryptable(auction.highestBidCipher), "Not decrypted");

        // Verify winning bid
        bytes32 decrypted = FHE.toBytes32(auction.highestBidCipher);
        require(uint64(uint256(decrypted)) == winningBidValue, "Bid mismatch");

        // Check reserve price
        if (winningBidValue < auction.reservePrice) revert BelowReservePrice();

        // Determine payment price
        uint64 paidPrice;
        if (auction.auctionType == AuctionType.FirstPrice) {
            paidPrice = winningBidValue;
        } else {
            paidPrice = secondBidValue > 0 ? secondBidValue : winningBidValue;
        }

        // Set winner
        Bid storage winnerBid = bids[auctionId][winnerAddress];
        require(winnerBid.exists, "Winner not found");

        auction.winner = winnerAddress;
        auction.winningBid = winningBidValue;
        auction.paidPrice = paidPrice;
        auction.status = AuctionStatus.Settled;
        winnerBid.isWinner = true;

        emit AuctionSettled(auctionId, winnerAddress, winningBidValue, paidPrice);
    }

    /// @notice Cancel auction (seller only, before settlement)
    function cancelAuction(uint256 auctionId) external auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        if (msg.sender != auction.seller) revert NotSeller();
        if (auction.status == AuctionStatus.Settled) revert AuctionAlreadySettled();

        auction.status = AuctionStatus.Cancelled;
        emit AuctionCancelled(auctionId);
    }

    // ==================== Claims & Refunds ====================

    /// @notice Claim refund for non-winning bidders
    function claimRefund(uint256 auctionId) external auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        Bid storage bid = bids[auctionId][msg.sender];

        if (!bid.exists) revert NoBidFound();
        if (bid.refunded) revert AlreadyRefunded();
        if (bid.isWinner) revert CannotRefundWinner();

        bool canRefund = auction.status == AuctionStatus.Cancelled ||
                        auction.status == AuctionStatus.Settled;

        if (!canRefund) revert AlreadyRefunded();

        uint256 refundAmount = bid.depositPaid;
        bid.refunded = true;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!sent) revert TransferFailed();

        emit DepositRefunded(auctionId, msg.sender, refundAmount);
    }

    /// @notice Winner pays the winning bid, seller receives payment
    function payWinningBid(uint256 auctionId) external payable auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Settled) revert AuctionNotEnded();
        if (msg.sender != auction.winner) revert NotWinner();

        Bid storage bid = bids[auctionId][msg.sender];
        if (bid.refunded) revert AlreadyRefunded();

        // Calculate amount due
        uint256 amountDue = auction.paidPrice > bid.depositPaid
            ? auction.paidPrice - bid.depositPaid
            : 0;

        require(msg.value >= amountDue, "Insufficient payment");

        bid.refunded = true;

        // Calculate platform fee
        uint256 totalPayment = bid.depositPaid + msg.value;
        uint256 platformFee = (totalPayment * PLATFORM_FEE_BPS) / 10000;
        uint256 sellerPayment = totalPayment - platformFee;

        // Transfer to seller
        (bool sent, ) = payable(auction.seller).call{value: sellerPayment}("");
        if (!sent) revert TransferFailed();

        // Refund excess
        if (msg.value > amountDue) {
            (bool refundSent, ) = payable(msg.sender).call{value: msg.value - amountDue}("");
            if (!refundSent) revert TransferFailed();
        }

        emit WinnerPaid(auctionId, auction.seller, sellerPayment);
    }

    // ==================== User Queries ====================

    /// @notice Get auctions user has bid on
    function getUserBidAuctions(address user) external view returns (uint256[] memory) {
        return userBidAuctions[user];
    }

    /// @notice Get auctions user has created
    function getUserCreatedAuctions(address user) external view returns (uint256[] memory) {
        return userCreatedAuctions[user];
    }

    /// @notice Get auctions user has won
    function getUserWonAuctions(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists && auctions[i].winner == user) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists && auctions[i].winner == user) {
                result[index++] = i;
            }
        }
        return result;
    }

    /// @notice Get user's pending refunds
    function getUserPendingRefunds(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256[] storage userAuctions = userBidAuctions[user];

        for (uint256 i = 0; i < userAuctions.length; i++) {
            uint256 auctionId = userAuctions[i];
            Bid storage bid = bids[auctionId][user];
            Auction storage auction = auctions[auctionId];

            if (bid.exists && !bid.refunded && !bid.isWinner &&
                (auction.status == AuctionStatus.Settled || auction.status == AuctionStatus.Cancelled)) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < userAuctions.length; i++) {
            uint256 auctionId = userAuctions[i];
            Bid storage bid = bids[auctionId][user];
            Auction storage auction = auctions[auctionId];

            if (bid.exists && !bid.refunded && !bid.isWinner &&
                (auction.status == AuctionStatus.Settled || auction.status == AuctionStatus.Cancelled)) {
                result[index++] = auctionId;
            }
        }
        return result;
    }

    /// @notice Get user's bid details for an auction
    function getUserBid(uint256 auctionId, address user) external view returns (
        bool exists,
        uint256 depositPaid,
        uint256 timestamp,
        bool refunded,
        bool isWinner
    ) {
        Bid storage bid = bids[auctionId][user];
        return (bid.exists, bid.depositPaid, bid.timestamp, bid.refunded, bid.isWinner);
    }

    /// @notice Get user statistics
    function getUserStats(address user) external view returns (
        uint256 totalBids,
        uint256 totalWins,
        uint256 totalCreated,
        uint256 totalDeposited,
        uint256 pendingRefunds
    ) {
        totalBids = userBidAuctions[user].length;
        totalCreated = userCreatedAuctions[user].length;

        for (uint256 i = 0; i < userBidAuctions[user].length; i++) {
            uint256 auctionId = userBidAuctions[user][i];
            Bid storage bid = bids[auctionId][user];
            Auction storage auction = auctions[auctionId];

            totalDeposited += bid.depositPaid;

            if (bid.isWinner) {
                totalWins++;
            } else if (!bid.refunded &&
                (auction.status == AuctionStatus.Settled || auction.status == AuctionStatus.Cancelled)) {
                pendingRefunds++;
            }
        }
    }

    // ==================== Auction List Queries ====================

    /// @notice Get total auction count
    function getAuctionCount() external view returns (uint256) {
        return nextAuctionId;
    }

    /// @notice Get auctions by status
    function getAuctionsByStatus(AuctionStatus status) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists && auctions[i].status == status) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists && auctions[i].status == status) {
                result[index++] = i;
            }
        }
        return result;
    }

    /// @notice Get active auctions
    function getActiveAuctions() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists &&
                auctions[i].status == AuctionStatus.Active &&
                block.timestamp < auctions[i].endTime) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists &&
                auctions[i].status == AuctionStatus.Active &&
                block.timestamp < auctions[i].endTime) {
                result[index++] = i;
            }
        }
        return result;
    }

    /// @notice Get auctions ending within 24 hours
    function getEndingSoonAuctions() external view returns (uint256[] memory) {
        uint256 threshold = block.timestamp + 24 hours;
        uint256 count = 0;

        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists &&
                auctions[i].status == AuctionStatus.Active &&
                auctions[i].endTime > block.timestamp &&
                auctions[i].endTime <= threshold) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists &&
                auctions[i].status == AuctionStatus.Active &&
                auctions[i].endTime > block.timestamp &&
                auctions[i].endTime <= threshold) {
                result[index++] = i;
            }
        }
        return result;
    }

    /// @notice Get auctions by category
    function getAuctionsByCategory(string calldata category) external view returns (uint256[] memory) {
        bytes32 categoryHash = keccak256(bytes(category));
        uint256 count = 0;

        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists &&
                keccak256(bytes(auctions[i].item.category)) == categoryHash) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists &&
                keccak256(bytes(auctions[i].item.category)) == categoryHash) {
                result[index++] = i;
            }
        }
        return result;
    }

    /// @notice Get paginated auction list
    function getAuctionsPaginated(uint256 offset, uint256 limit) external view returns (
        uint256[] memory auctionIds,
        uint256 total
    ) {
        total = nextAuctionId;

        if (offset >= total) {
            return (new uint256[](0), total);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        auctionIds = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            auctionIds[i - offset] = i;
        }
    }

    /// @notice Get hot auctions (by bid count)
    function getHotAuctions(uint256 limit) external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists && auctions[i].status == AuctionStatus.Active) {
                activeCount++;
            }
        }

        if (activeCount == 0) return new uint256[](0);

        uint256[] memory activeIds = new uint256[](activeCount);
        uint256[] memory bidCounts = new uint256[](activeCount);
        uint256 idx = 0;

        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists && auctions[i].status == AuctionStatus.Active) {
                activeIds[idx] = i;
                bidCounts[idx] = auctions[i].bidCount;
                idx++;
            }
        }

        // Simple bubble sort by bid count (descending)
        for (uint256 i = 0; i < activeCount - 1; i++) {
            for (uint256 j = 0; j < activeCount - i - 1; j++) {
                if (bidCounts[j] < bidCounts[j + 1]) {
                    (activeIds[j], activeIds[j + 1]) = (activeIds[j + 1], activeIds[j]);
                    (bidCounts[j], bidCounts[j + 1]) = (bidCounts[j + 1], bidCounts[j]);
                }
            }
        }

        uint256 resultSize = limit < activeCount ? limit : activeCount;
        uint256[] memory result = new uint256[](resultSize);
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = activeIds[i];
        }
        return result;
    }

    // ==================== Single Auction Queries ====================

    /// @notice Get auction basic info
    function getAuction(uint256 auctionId) external view auctionExists(auctionId) returns (
        address seller,
        AuctionType auctionType,
        uint256 reservePrice,
        uint256 depositAmount,
        uint256 startTime,
        uint256 endTime,
        AuctionStatus status,
        address winner,
        uint64 winningBid,
        uint64 paidPrice,
        uint256 bidCount
    ) {
        Auction storage auction = auctions[auctionId];
        return (
            auction.seller,
            auction.auctionType,
            auction.reservePrice,
            auction.depositAmount,
            auction.startTime,
            auction.endTime,
            auction.status,
            auction.winner,
            auction.winningBid,
            auction.paidPrice,
            auction.bidCount
        );
    }

    /// @notice Get auction item details
    function getAuctionItem(uint256 auctionId) external view auctionExists(auctionId) returns (
        address nftContract,
        uint256 tokenId,
        string memory metadataUri,
        string memory name,
        string memory description,
        string memory imageUrl,
        string memory category
    ) {
        NFTItem storage item = auctions[auctionId].item;
        return (
            item.nftContract,
            item.tokenId,
            item.metadataUri,
            item.name,
            item.description,
            item.imageUrl,
            item.category
        );
    }

    /// @notice Get all bidders for an auction
    function getAuctionBidders(uint256 auctionId) external view auctionExists(auctionId) returns (address[] memory) {
        return auctionBidders[auctionId];
    }

    /// @notice Get remaining time for auction
    function getAuctionTimeRemaining(uint256 auctionId) external view auctionExists(auctionId) returns (uint256) {
        Auction storage auction = auctions[auctionId];
        if (block.timestamp >= auction.endTime) {
            return 0;
        }
        return auction.endTime - block.timestamp;
    }

    /// @notice Check if user can bid on auction
    function canUserBid(uint256 auctionId, address user) external view returns (
        bool canBid,
        string memory reason
    ) {
        if (auctionId >= nextAuctionId || !auctions[auctionId].exists) {
            return (false, "Auction not found");
        }

        Auction storage auction = auctions[auctionId];

        if (auction.status != AuctionStatus.Active) {
            return (false, "Auction not active");
        }
        if (block.timestamp >= auction.endTime) {
            return (false, "Auction ended");
        }
        if (auction.seller == user) {
            return (false, "Seller cannot bid");
        }
        if (bids[auctionId][user].exists) {
            return (false, "Already placed bid");
        }

        return (true, "");
    }

    /// @notice Check if auction can be ended
    function canEndAuction(uint256 auctionId) external view returns (bool) {
        if (auctionId >= nextAuctionId) return false;
        Auction storage auction = auctions[auctionId];
        return auction.exists &&
               auction.status == AuctionStatus.Active &&
               block.timestamp >= auction.endTime;
    }

    // ==================== Platform Stats ====================

    /// @notice Get platform statistics
    function getPlatformStats() external view returns (
        uint256 totalAuctions,
        uint256 activeAuctions,
        uint256 settledAuctions,
        uint256 cancelledAuctions,
        uint256 totalBidsPlaced,
        uint256 totalVolumeSettled
    ) {
        totalAuctions = nextAuctionId;

        for (uint256 i = 0; i < nextAuctionId; i++) {
            Auction storage auction = auctions[i];
            if (!auction.exists) continue;

            if (auction.status == AuctionStatus.Active) {
                activeAuctions++;
            } else if (auction.status == AuctionStatus.Settled) {
                settledAuctions++;
                totalVolumeSettled += auction.paidPrice;
            } else if (auction.status == AuctionStatus.Cancelled) {
                cancelledAuctions++;
            }

            totalBidsPlaced += auction.bidCount;
        }
    }

    /// @notice Get contract ETH balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Get available categories
    function getCategories() external pure returns (string[] memory) {
        string[] memory categories = new string[](5);
        categories[0] = "Art";
        categories[1] = "Music";
        categories[2] = "Collectible";
        categories[3] = "GameAsset";
        categories[4] = "Domain";
        return categories;
    }

    /// @notice Get recent settled auctions
    function getRecentSettledAuctions(uint256 limit) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextAuctionId; i++) {
            if (auctions[i].exists && auctions[i].status == AuctionStatus.Settled) {
                count++;
            }
        }

        if (count == 0) return new uint256[](0);

        uint256 resultSize = limit < count ? limit : count;
        uint256[] memory result = new uint256[](resultSize);

        uint256 found = 0;
        for (uint256 i = nextAuctionId; i > 0 && found < resultSize; i--) {
            if (auctions[i - 1].exists && auctions[i - 1].status == AuctionStatus.Settled) {
                result[found++] = i - 1;
            }
        }
        return result;
    }

    // ==================== Receive ====================

    receive() external payable {}
}
