import { motion } from "framer-motion";
import {
  Play,
  Wallet,
  Search,
  Lock,
  Gavel,
  Plus,
  Clock,
  Trophy,
  Coins,
  RefreshCw,
  Shield,
  CheckCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Docs() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <Badge className="mb-4 bg-primary-500/20 text-primary-400 border-primary-500/30">
          Documentation
        </Badge>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
          How to Use ZenithVault
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Learn how to participate in privacy-preserving sealed-bid auctions powered by
          Zama's Fully Homomorphic Encryption.
        </p>
      </motion.div>

      {/* Demo Video Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-16"
      >
        <Card className="bg-dark-800/50 border-dark-600 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary-400" />
              Demo Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-dark-900 rounded-lg overflow-hidden border border-dark-700">
              <video
                controls
                className="w-full h-full object-contain"
                poster="/bid_test_poster.jpg"
              >
                <source src="/bid_test.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-sm text-gray-400 mt-4 text-center">
              Watch how to place encrypted bids and participate in sealed-bid auctions using ZenithVault
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table of Contents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-12"
      >
        <Card className="bg-dark-800/30 border-dark-600">
          <CardHeader>
            <CardTitle className="text-lg">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a href="#getting-started" className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors">
                <ArrowRight className="w-4 h-4" />
                Getting Started
              </a>
              <a href="#participate" className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors">
                <ArrowRight className="w-4 h-4" />
                How to Bid
              </a>
              <a href="#create" className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors">
                <ArrowRight className="w-4 h-4" />
                Create an Auction
              </a>
              <a href="#settlement" className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors">
                <ArrowRight className="w-4 h-4" />
                Settlement & Refunds
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Getting Started */}
      <DocSection
        id="getting-started"
        icon={<Wallet className="w-6 h-6" />}
        title="Getting Started"
        delay={0.2}
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Before you can participate in auctions, you'll need to set up your wallet and connect to the Sepolia testnet.
          </p>

          <StepList steps={[
            {
              title: "Install a Web3 Wallet",
              description: "Install MetaMask or another compatible wallet browser extension."
            },
            {
              title: "Switch to Sepolia Testnet",
              description: "ZenithVault runs on Sepolia testnet. Switch your network in your wallet settings."
            },
            {
              title: "Get Test ETH",
              description: "Visit a Sepolia faucet to get free test ETH for transactions."
            },
            {
              title: "Connect Your Wallet",
              description: "Click the 'Connect Wallet' button in the top right corner of the app."
            }
          ]} />
        </div>
      </DocSection>

      {/* How to Participate */}
      <DocSection
        id="participate"
        icon={<Gavel className="w-6 h-6" />}
        title="How to Participate in Auctions"
        delay={0.25}
      >
        <div className="space-y-6">
          <p className="text-gray-300">
            ZenithVault uses <strong className="text-primary-400">sealed-bid auctions</strong> where your bid amount is encrypted and remains completely private until the auction ends.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Lock className="w-5 h-5" />}
              title="First-Price Auction"
              description="Highest bidder wins and pays their bid amount."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Vickrey (Second-Price)"
              description="Highest bidder wins but pays the second-highest bid."
            />
          </div>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Steps to Place a Bid</h3>

          <StepList steps={[
            {
              title: "Browse Auctions",
              description: "Go to the 'Auctions' page and find an item you want to bid on."
            },
            {
              title: "Check Auction Details",
              description: "Review the reserve price, deposit amount, auction type, and time remaining."
            },
            {
              title: "Enter Your Bid",
              description: "Enter a bid amount that meets or exceeds the reserve price."
            },
            {
              title: "Encrypt & Submit",
              description: "Click 'Place Encrypted Bid'. Your bid will be encrypted using FHE before submission."
            },
            {
              title: "Pay the Deposit",
              description: "Confirm the transaction in your wallet. You'll pay the deposit amount (not your bid amount)."
            },
            {
              title: "Wait for Results",
              description: "Once the auction ends, bids are decrypted and the winner is determined."
            }
          ]} />

          <InfoBox type="info">
            <strong>Privacy Note:</strong> Your bid amount is encrypted with Fully Homomorphic Encryption.
            No one - not even the contract owner - can see your bid until the auction ends and bids are revealed.
          </InfoBox>
        </div>
      </DocSection>

      {/* Create Auction */}
      <DocSection
        id="create"
        icon={<Plus className="w-6 h-6" />}
        title="How to Create an Auction"
        delay={0.3}
      >
        <div className="space-y-6">
          <p className="text-gray-300">
            Anyone can create a sealed-bid auction for their NFT or digital item.
          </p>

          <StepList steps={[
            {
              title: "Go to Create Page",
              description: "Click 'Create Auction' in the navigation menu."
            },
            {
              title: "Fill Item Details",
              description: "Enter the NFT contract address, token ID, name, description, image URL, and category."
            },
            {
              title: "Set Auction Parameters",
              description: "Choose auction type (First-Price or Vickrey), set reserve price, deposit amount, and duration."
            },
            {
              title: "Review & Create",
              description: "Review all details and confirm the transaction to create your auction."
            }
          ]} />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Auction Parameters Explained</h3>

          <div className="space-y-3">
            <ParamExplainer
              name="Reserve Price"
              description="The minimum bid amount. Bids below this will not be accepted."
            />
            <ParamExplainer
              name="Deposit Amount"
              description="The amount bidders must deposit to participate. This ensures serious bids only."
            />
            <ParamExplainer
              name="Duration"
              description="How long the auction will run before closing for bids."
            />
            <ParamExplainer
              name="Auction Type"
              description="First-Price: winner pays their bid. Vickrey: winner pays second-highest bid."
            />
          </div>
        </div>
      </DocSection>

      {/* Settlement & Refunds */}
      <DocSection
        id="settlement"
        icon={<Trophy className="w-6 h-6" />}
        title="Settlement & Claiming Funds"
        delay={0.35}
      >
        <div className="space-y-6">
          <p className="text-gray-300">
            After an auction ends, there's a settlement process where bids are decrypted and the winner is determined.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-4">For Winners</h3>
          <StepList steps={[
            {
              title: "Auction Ends",
              description: "Wait for the auction timer to reach zero."
            },
            {
              title: "Settlement Process",
              description: "Bids are decrypted using FHE. The highest bidder is determined automatically."
            },
            {
              title: "Pay Remaining Balance",
              description: "If you won, you may need to pay the difference between your deposit and the final price."
            },
            {
              title: "Receive Your Item",
              description: "The NFT or item ownership is transferred to your wallet."
            }
          ]} />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">For Non-Winners</h3>
          <StepList steps={[
            {
              title: "Check My Dashboard",
              description: "Go to 'My Dashboard' to see your pending refunds."
            },
            {
              title: "Claim Refund",
              description: "Click 'Claim Refund' next to each auction where you didn't win."
            },
            {
              title: "Confirm Transaction",
              description: "Approve the transaction to receive your deposit back."
            }
          ]} />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">For Sellers</h3>
          <StepList steps={[
            {
              title: "Auction Settles",
              description: "Once the auction settles, the winning bid amount is ready to claim."
            },
            {
              title: "Claim Proceeds",
              description: "Visit the auction page and click 'Claim Proceeds' to receive your funds."
            }
          ]} />

          <InfoBox type="warning">
            <strong>Important:</strong> Make sure to claim your refunds or proceeds. Unclaimed funds remain in the contract until claimed.
          </InfoBox>
        </div>
      </DocSection>

      {/* FHE Technology */}
      <DocSection
        id="fhe"
        icon={<Shield className="w-6 h-6" />}
        title="About FHE Technology"
        delay={0.4}
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            ZenithVault uses <strong className="text-primary-400">Fully Homomorphic Encryption (FHE)</strong> powered by
            Zama's fhEVM to ensure complete bid privacy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <FeatureCard
              icon={<Lock className="w-5 h-5" />}
              title="Encrypted Bids"
              description="Your bid amount is encrypted before being sent to the blockchain."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="On-Chain Privacy"
              description="Computations happen on encrypted data without revealing values."
            />
            <FeatureCard
              icon={<CheckCircle className="w-5 h-5" />}
              title="Trustless Reveal"
              description="Bids are only decrypted when the auction ends, by the protocol."
            />
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-primary-400 mt-1" />
              <div>
                <p className="text-primary-300 font-medium">Learn More About Zama FHE</p>
                <a
                  href="https://www.zama.ai/fhevm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-400 hover:underline"
                >
                  https://www.zama.ai/fhevm
                </a>
              </div>
            </div>
          </div>
        </div>
      </DocSection>
    </div>
  );
}

// Helper Components
interface DocSectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
}

function DocSection({ id, icon, title, children, delay = 0 }: DocSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-12 scroll-mt-20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
          {icon}
        </div>
        <h2 className="text-2xl font-heading font-bold text-white">{title}</h2>
      </div>
      <div className="pl-2 border-l-2 border-dark-700 ml-4">
        <div className="pl-6">
          {children}
        </div>
      </div>
    </motion.section>
  );
}

interface StepListProps {
  steps: { title: string; description: string }[];
}

function StepList({ steps }: StepListProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
            <span className="text-sm font-mono font-bold text-primary-400">{index + 1}</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">{step.title}</h4>
            <p className="text-sm text-gray-400">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
      <div className="text-primary-400 mb-2">{icon}</div>
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

interface ParamExplainerProps {
  name: string;
  description: string;
}

function ParamExplainer({ name, description }: ParamExplainerProps) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-dark-800/30 border border-dark-700">
      <div className="flex-shrink-0">
        <Badge variant="outline" className="border-dark-600">{name}</Badge>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

interface InfoBoxProps {
  type: "info" | "warning";
  children: React.ReactNode;
}

function InfoBox({ type, children }: InfoBoxProps) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
  };

  return (
    <div className={cn("p-4 rounded-lg border", styles[type])}>
      <p className="text-sm">{children}</p>
    </div>
  );
}
