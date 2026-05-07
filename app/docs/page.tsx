import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DocsPageBody } from "@/components/docs/docs-page";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <DocsPageBody />
      </main>
      <Footer />
    </div>
  );
}
