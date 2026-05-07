import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WalletPageBody } from "@/components/wallet/wallet-page";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <WalletPageBody />
      </main>
      <Footer />
    </div>
  );
}
