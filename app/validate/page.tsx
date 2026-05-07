import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ValidatePageBody } from "@/components/validate/validate-page";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ValidatePageBody />
      </main>
      <Footer />
    </div>
  );
}
