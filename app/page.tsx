import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HomePage } from "@/components/home/home-page";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}
