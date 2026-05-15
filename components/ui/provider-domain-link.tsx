import { cx } from "@/lib/utils";
import { I } from "@/components/ui/icons";
import type { Provider } from "@/lib/types";

function websiteLabel(website: string): string {
  try {
    const u = new URL(website);
    if (u.hostname === "github.com")
      return "github.com" + u.pathname.replace(/\/$/, "");
    return u.hostname.replace(/^www\./, "");
  } catch {
    return website;
  }
}

export function ProviderDomainLink({
  p,
  size = "sm",
}: {
  p: Provider;
  size?: "sm" | "lg";
}) {
  if (!p.website) return null;
  const label = websiteLabel(p.website);
  return (
    <a
      href={p.website}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={label}
      className={cx(
        "relative z-[2] inline-flex items-center gap-1 min-w-0 max-w-full text-smoke hover:text-brand transition-colors",
        size === "sm" ? "micro mt-0.5" : "text-[11px] mt-1 normal-case tracking-normal",
      )}
    >
      <span className={cx("truncate", size === "sm" ? "" : "normal-case tracking-normal")}>
        {label}
      </span>
      <I.external className="w-2.5 h-2.5 shrink-0" />
    </a>
  );
}
