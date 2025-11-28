import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ParticleBackground } from "@/components/animations/ParticleBackground";

export function Layout() {
  return (
    <div className="min-h-screen bg-dark-900 text-white relative">
      {/* Animated background */}
      <ParticleBackground />

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top left glow */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-600 rounded-full blur-[128px] opacity-20" />
        {/* Bottom right glow */}
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-500 rounded-full blur-[128px] opacity-15" />
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500 rounded-full blur-[200px] opacity-5" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main className="pt-20 md:pt-24 min-h-[calc(100vh-200px)]">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
