import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProviderDetail } from "@/components/provider/provider-detail";
import { PROVIDERS } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ slug: p.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = PROVIDERS.find((x) => x.slug === slug);
  if (!p) notFound();

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
