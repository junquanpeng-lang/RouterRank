import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageSkeleton } from "@/components/page-skeleton";

export default function RunPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PageSkeleton
          tag="Tool · Run"
          title="One prompt. N truths."
          body="Send identical prompts through up to five routers. Watch real-time output, cost, latency, and the GatewayBench scorecard."
        />
      </main>
      <Footer />
    </div>
  );
}
