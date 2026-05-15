import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProviderDetail } from "@/components/provider/provider-detail";

// Dynamic route — slug list comes from the DB at runtime, not hardcoded at build time
export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ProviderDetail slug={slug} />
      </main>
      <Footer />
    </div>
  );
}
