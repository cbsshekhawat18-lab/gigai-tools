import { SOCIAL_LINKS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

export interface SubscribeCtaProps {
  /** Path/URL to the RSS feed. */
  feedHref?: string;
  /** Social follow links. Defaults to the site's SOCIAL_LINKS. */
  socials?: { label: string; href: string; icon: string }[];
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Honest "get updates" block. There is no backend, so we do NOT capture emails
 * or fake a subscriber list: instead we offer the real RSS feed and social
 * follow links, which genuinely deliver new posts.
 */
export function SubscribeCta({
  feedHref = "/feed.xml",
  socials = SOCIAL_LINKS,
  title = "Never miss a guide",
  description = "New tools and how-to articles land regularly. Follow along however you like. No inbox required.",
  className,
}: SubscribeCtaProps) {
  return (
    <section
      aria-labelledby="subscribe-cta-title"
      className={cn(
        "flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <h2
          id="subscribe-cta-title"
          className="text-xl font-semibold tracking-tight text-foreground text-balance"
        >
          {title}
        </h2>
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={feedHref}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <Icon name="Rss" size={16} />
          Subscribe via RSS
        </a>

        {socials.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">or follow:</span>
            <ul className="flex items-center gap-1.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow on ${s.label}`}
                    title={s.label}
                    className={cn(
                      "inline-flex size-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors",
                      "hover:border-primary/40 hover:text-primary",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <Icon name={s.icon} size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
