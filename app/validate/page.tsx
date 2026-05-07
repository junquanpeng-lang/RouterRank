import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageSkeleton } from "@/components/page-skeleton";

export default function ValidatePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PageSkeleton
          tag="Tool · Validate"
          title="Validate any AI router."
          body="Paste a chat-completions URL. We probe with a fixed prompt set and run the same fingerprint suite that powers the L1 score."
        />
      </main>
      <Footer />
    </div>
  );
}
