import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageSkeleton } from "@/components/page-skeleton";

export default function WalletPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PageSkeleton
          tag="Account · Wallet"
          title="Your agentic wallet"
          body="Connect Cobo Agentic Wallet to pay-and-run providers via x402 — bounded by Pact (intent + plan + rules + termination)."
        />
      </main>
      <Footer />
    </div>
  );
}
