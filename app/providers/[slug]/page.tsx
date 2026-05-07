import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageSkeleton } from "@/components/page-skeleton";
import { PROVIDERS } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ slug: p.slug }));
}

export default async function ProviderDetailPage({
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
        <PageSkeleton
          tag={`${p.type} · ${p.region}`}
          title={p.name}
          body={p.desc}
        />
      </main>
      <Footer />
    </div>
  );
}
