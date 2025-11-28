import { Link } from "react-router-dom";
import { Shield, Github, Twitter, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-dark-700/50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-50" />

      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-heading text-xl font-bold text-white">Zenith</span>
                <span className="font-heading text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Vault</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm max-w-md mb-4">
              Privacy-preserving sealed-bid auction platform for digital collectibles.
              Powered by Zama's Fully Homomorphic Encryption (FHE) technology.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auctions" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Explore Auctions
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Create Auction
                </Link>
              </li>
              <li>
                <Link to="/my-bids" className="text-gray-400 hover:text-white text-sm transition-colors">
                  My Bids
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.zama.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
                >
                  Zama Docs
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://sepolia.etherscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
                >
                  Etherscan
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-dark-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ZenithVault. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Powered by</span>
            <a
              href="https://zama.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Zama fhEVM
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
