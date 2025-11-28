import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Gavel, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { AuctionStats } from "@/components/auction/AuctionStats";
import { GradientText } from "@/components/animations/ShimmerText";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useHotAuctionsData } from "@/hooks/useAuctionData";
import { AuctionStatus, AuctionType } from "@/lib/types";

export function Home() {
  const { data: hotAuctions, isLoading } = useHotAuctionsData(6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">Powered by Zama FHE</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-6"
            >
              <span className="text-white">Privacy-First</span>
              <br />
              <GradientText className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold">
                Sealed-Bid Auctions
              </GradientText>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
            >
              Your bids are encrypted with Fully Homomorphic Encryption.
              No one can see your bid until the auction ends - not even us.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/auctions">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white px-8 h-14 text-lg"
                >
                  Explore Auctions
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/create">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-dark-600 hover:bg-dark-800 px-8 h-14 text-lg"
                >
                  Create Auction
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-primary-500/10 blur-xl"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-accent-500/10 blur-xl"
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-dark-700/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              Why ZenithVault?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The most secure auction platform for digital collectibles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCard delay={0.1} className="p-6">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2">
                Encrypted Bids
              </h3>
              <p className="text-gray-400">
                All bids are encrypted using Fully Homomorphic Encryption.
                Your bid amount remains completely private until reveal.
              </p>
            </AnimatedCard>

            <AnimatedCard delay={0.2} className="p-6">
              <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-accent-400" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2">
                Fair Auctions
              </h3>
              <p className="text-gray-400">
                No front-running, no bid sniping information leaks.
                The highest bidder wins fair and square.
              </p>
            </AnimatedCard>

            <AnimatedCard delay={0.3} className="p-6">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                <Gavel className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2">
                Vickrey Auctions
              </h3>
              <p className="text-gray-400">
                Support for second-price (Vickrey) auctions where winners
                pay the second-highest bid, encouraging honest bidding.
              </p>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              Platform Statistics
            </h2>
            <p className="text-gray-400">
              Real-time data from the ZenithVault network
            </p>
          </motion.div>

          <AuctionStats />
        </div>
      </section>

      {/* Hot Auctions Section */}
      <section className="py-16 border-t border-dark-700/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-heading font-bold text-white mb-2">
                Hot Auctions
              </h2>
              <p className="text-gray-400">
                Most active auctions right now
              </p>
            </div>
            <Link to="/auctions">
              <Button variant="outline" className="border-dark-600">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-dark-800 rounded-xl h-80 animate-pulse"
                />
              ))}
            </div>
          ) : hotAuctions && hotAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotAuctions.map((auction, index) => (
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
          ) : (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No active auctions yet</p>
              <Link to="/create" className="inline-block mt-4">
                <Button>Create the First Auction</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-dark-700/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20" />
            <div className="absolute inset-0 bg-dark-800/80 backdrop-blur-xl" />

            {/* Content */}
            <div className="relative p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                Ready to Start Bidding?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Connect your wallet and place your first encrypted bid.
                Your privacy is guaranteed by cryptography.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auctions">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500"
                  >
                    Browse Auctions
                  </Button>
                </Link>
                <a
                  href="https://docs.zama.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="border-dark-600">
                    Learn About FHE
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
