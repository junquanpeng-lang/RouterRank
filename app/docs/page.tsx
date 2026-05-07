import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageSkeleton } from "@/components/page-skeleton";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PageSkeleton
          tag="Methodology · GatewayBench v1"
          title="How we measure."
          body="Three tiers, nine dimensions, all anchored to published research. Full rubric is being ported from index.html."
        />
      </main>
      <Footer />
    </div>
  );
}
