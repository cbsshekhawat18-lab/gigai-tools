import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { SOCIAL_LINKS } from "@/config/navigation";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";

/**
 * "Stay updated", an honest follow band offering only REAL channels: the
 * platform's RSS feed, the blog, and social/profile links. (The email
 * subscribe form was removed deliberately; it had no backing list, and we
 * don't show users a "subscribed" state that stores nothing.)
 */
export function StayUpdated() {
  return (
    <section className="border-t border-border bg-muted/30 py-16 md:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
          {/* Subtle accent glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 -z-0 size-64 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative">
            <div className="flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Icon name="Sparkles" size={14} className="text-primary" />
                New tools ship every week
              </span>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Stay in the loop
              </h2>
              <p className="max-w-md text-pretty text-muted-foreground">
                Get occasional updates when we ship new tools and guides, or
                follow along wherever you already are. No spam, unsubscribe anytime.
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Link
                  href="/feed.xml"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors",
                    "hover:border-primary/40 hover:text-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <Icon name="Rss" size={15} />
                  RSS feed
                </Link>
                <Link
                  href={ROUTES.blog}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors",
                    "hover:border-primary/40 hover:text-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <Icon name="Newspaper" size={15} />
                  Read the blog
                </Link>
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground outline-none transition-colors",
                      "hover:border-primary/40 hover:text-foreground",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <Icon name={social.icon} size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
