import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RunPageBody } from "@/components/run/run-page";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <RunPageBody />
      </main>
      <Footer />
    </div>
  );
}
