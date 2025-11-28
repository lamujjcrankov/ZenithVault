import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { MiniStats } from "@/components/auction/AuctionStats";
import {
  useActiveAuctionsData,
  useAuctionsByCategoryData,
} from "@/hooks/useAuctionData";
import { useEndingSoonAuctions } from "@/hooks/useZenithVault";
import { CATEGORIES } from "@/lib/constants";
import type { Auction } from "@/lib/types";
import { AuctionStatus, AuctionType } from "@/lib/types";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "ending" | "popular" | "price-low" | "price-high";
type ViewMode = "grid" | "list";

export function Auctions() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch auctions
  const { data: activeAuctions, isLoading: loadingActive } = useActiveAuctionsData();
  const { data: endingSoonIds } = useEndingSoonAuctions();
  const { data: categoryAuctions, isLoading: loadingCategory } = useAuctionsByCategoryData(
    selectedCategory !== "All" ? selectedCategory : ""
  );

  // Determine which auctions to show
  const auctions = useMemo(() => {
    if (selectedCategory !== "All" && categoryAuctions && categoryAuctions.length > 0) {
      return categoryAuctions;
    }
    return activeAuctions || [];
  }, [selectedCategory, categoryAuctions, activeAuctions]);

  // Filter by search query
  const filteredAuctions = useMemo(() => {
    if (!searchQuery) return auctions;

    const query = searchQuery.toLowerCase();
    return auctions.filter((auction) => {
      const matchesName = auction.item.name.toLowerCase().includes(query);
      const matchesDesc = auction.item.description.toLowerCase().includes(query);
      const matchesCategory = auction.item.category.toLowerCase().includes(query);
      return matchesName || matchesDesc || matchesCategory;
    });
  }, [auctions, searchQuery]);

  // Sort auctions
  const sortedAuctions = useMemo(() => {
    const sorted = [...filteredAuctions];
    switch (sortBy) {
      case "ending":
        return sorted.sort((a, b) => Number(a.endTime - b.endTime));
      case "popular":
        return sorted.sort((a, b) => b.bidCount - a.bidCount);
      case "price-low":
        return sorted.sort((a, b) => Number(a.reservePrice - b.reservePrice));
      case "price-high":
        return sorted.sort((a, b) => Number(b.reservePrice - a.reservePrice));
      case "newest":
      default:
        return sorted.sort((a, b) => Number(b.startTime - a.startTime));
    }
  }, [filteredAuctions, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-heading font-bold text-white mb-2"
        >
          Explore Auctions
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MiniStats />
        </motion.div>
      </div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4 mb-8"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-800 border-dark-600 h-12"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full lg:w-48 h-12 bg-dark-800 border-dark-600">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full lg:w-48 h-12 bg-dark-800 border-dark-600">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-gray-500" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="ending">Ending Soon</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-dark-800 border border-dark-600 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10",
              viewMode === "grid" && "bg-primary-600/20 text-primary-400"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10",
              viewMode === "list" && "bg-primary-600/20 text-primary-400"
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              selectedCategory === cat
                ? "bg-primary-600 text-white"
                : "border-dark-600 hover:border-primary-500/50"
            )}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </motion.div>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="bg-dark-800 border border-dark-600">
          <TabsTrigger value="all">All Active</TabsTrigger>
          <TabsTrigger value="ending">
            Ending Soon
            {endingSoonIds && endingSoonIds.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                {endingSoonIds.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <AuctionGrid
            auctions={sortedAuctions}
            isLoading={loadingActive || loadingCategory}
            viewMode={viewMode}
          />
        </TabsContent>

        <TabsContent value="ending" className="mt-6">
          <AuctionGrid
            auctions={sortedAuctions.filter(a => a.status === AuctionStatus.Active).slice(0, 10)}
            isLoading={false}
            viewMode={viewMode}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Auction grid component
interface AuctionGridProps {
  auctions: Auction[];
  isLoading: boolean;
  viewMode: ViewMode;
}

function AuctionGrid({ auctions, isLoading, viewMode }: AuctionGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-6",
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-dark-800 rounded-xl h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!auctions || auctions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 mb-2">No auctions found</p>
        <p className="text-sm text-gray-500">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6",
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      )}
    >
      {auctions.map((auction, index) => (
        <AuctionCard
          key={auction.id.toString()}
          auction={{
            id: auction.id,
            item: {
              name: auction.item.name,
              description: auction.item.description,
              imageUrl: auction.item.imageUrl,
              category: auction.item.category,
            },
            auctionType: auction.auctionType as AuctionType,
            status: auction.status as AuctionStatus,
            reservePrice: auction.reservePrice,
            depositAmount: auction.depositAmount,
            endTime: auction.endTime,
            bidCount: auction.bidCount,
          }}
          index={index}
        />
      ))}
    </div>
  );
}
