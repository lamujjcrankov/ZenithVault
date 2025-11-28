import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { Auctions } from "@/pages/Auctions";
import { AuctionDetail } from "@/pages/AuctionDetail";
import { MyBids } from "@/pages/MyBids";
import { CreateAuction } from "@/pages/CreateAuction";
import { Docs } from "@/pages/Docs";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="auctions" element={<Auctions />} />
          <Route path="auction/:id" element={<AuctionDetail />} />
          <Route path="my-bids" element={<MyBids />} />
          <Route path="create" element={<CreateAuction />} />
          <Route path="docs" element={<Docs />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
