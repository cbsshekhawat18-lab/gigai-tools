import Link from "next/link";

import { PrivacyChoices } from "@/components/legal/privacy-choices";

import type { NavData } from "@/lib/nav-data";
import { SOCIAL_LINKS } from "@/config/navigation";
import { ROUTES, SITE } from "@/config/constants";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/layout/logo";

interface FooterProps {
  navData: NavData;
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

/** Static (registry-free) link columns that sit alongside the category columns. */
const DISCOVER_LINKS: FooterLink[] = [
  { label: "Ask GigAI", href: "/ask" },
  { label: "Collections", href: ROUTES.collections },
  { label: "Use cases", href: ROUTES.useCases },
  { label: "Solve a problem", href: ROUTES.solve },
  { label: "Tasks", href: ROUTES.tasks },
  { label: "Workflows", href: ROUTES.workflows },
  { label: "Image sizes", href: ROUTES.forIndex },
  { label: "All tools", href: ROUTES.search },
];

const LEARN_LINKS: FooterLink[] = [
  { label: "Learning center", href: ROUTES.learn },
  { label: "How-to guides", href: ROUTES.howToIndex },
  { label: "Comparisons", href: ROUTES.compare },
  { label: "Glossary", href: ROUTES.glossary },
  { label: "Blog", href: ROUTES.blog },
  { label: "Changelog", href: ROUTES.changelog },
];

const DEVELOPER_LINKS: FooterLink[] = [
  { label: "API overview", href: "/developers" },
  { label: "Documentation", href: "/developers/docs" },
  { label: "Quickstart", href: "/developers/docs" },
  { label: "Request builder", href: "/developers/builder" },
  { label: "SDKs", href: "/developers/docs/sdks" },
  { label: "MCP server", href: "/developers/docs/mcp" },
  { label: "openapi.yaml", href: "/developers/openapi.yaml" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "About", href: ROUTES.about },
  { label: "Open source", href: ROUTES.openSource },
  { label: "Contact", href: ROUTES.contact },
  { label: "Editorial standards", href: ROUTES.editorial },
  { label: SITE.brand, href: SITE.parentUrl, external: true },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: ROUTES.privacy },
  { label: "Terms of Service", href: ROUTES.terms },
  { label: "Cookie Policy", href: ROUTES.cookies },
  { label: "AI Policy", href: ROUTES.aiPolicy },
  { label: "Disclaimer", href: ROUTES.disclaimer },
  { label: "DMCA", href: ROUTES.dmca },
  { label: "Accessibility", href: ROUTES.accessibility },
];

/**
 * Global footer, a rich, discovery-first sitemap. Brand blurb + newsletter on
 * the left; on the right, one column per category (each spotlighting a few top
 * tools) plus Discover, Learn and Company columns. All tool/category data is
 * SLIM `navData` computed on the server and threaded down as props, so this
 * server component never bundles the registry into the client.
 */
export function Footer({ navData }: FooterProps) {
  const year = new Date().getFullYear();

  // Spotlight the first N categories as full tool columns; the rest collapse
  // into a compact "More categories" link list to keep the grid balanced.
  const spotlightCount = 4;
  const spotlight = navData.categories.slice(0, spotlightCount);
  const rest = navData.categories.slice(spotlightCount);

  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <Container size="wide" className="py-14">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>

            <ul className="flex items-center gap-2" aria-label="Social links">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={cn(
                      "grid size-11 place-items-center rounded-lg border border-border bg-background text-muted-foreground outline-none transition-colors",
                      "hover:bg-accent hover:text-foreground",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <Icon name={social.icon} size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <nav
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-8"
            aria-label="Footer"
          >
            {/* V4: one link per category, not five tools each - category pages
                are the tool directories; sitewide per-tool links were noise. */}
            <FooterColumn title="Categories">
              {[...spotlight, ...rest].map((category) => (
                <FooterLinkItem
                  key={category.slug}
                  link={{ label: category.name, href: category.href }}
                />
              ))}
            </FooterColumn>

            <FooterColumn title="Discover">
              {DISCOVER_LINKS.map((link) => (
                <FooterLinkItem key={link.href} link={link} />
              ))}
              {rest.length > 0 ? (
                <FooterLinkItem
                  link={{ label: "All categories", href: "/#categories" }}
                  muted
                />
              ) : null}
            </FooterColumn>

            <FooterColumn title="Learn">
              {LEARN_LINKS.map((link) => (
                <FooterLinkItem key={link.href} link={link} />
              ))}
            </FooterColumn>

            <FooterColumn title="Developers">
              {DEVELOPER_LINKS.map((link) => (
                <FooterLinkItem key={link.href + link.label} link={link} />
              ))}
            </FooterColumn>
            <FooterColumn title="Company">
              {COMPANY_LINKS.map((link) => (
                <FooterLinkItem key={link.href} link={link} />
              ))}
            </FooterColumn>

            <FooterColumn title="Legal">
              {LEGAL_LINKS.map((link) => (
                <FooterLinkItem key={link.href} link={link} />
              ))}
              {/* CCPA/CPRA opt-out + GPC status. A button (opens the choices
                  dialog), not a page link, so it sits with the legal links. */}
              <li>
                <PrivacyChoices />
              </li>
            </FooterColumn>

          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            &copy; {year} {SITE.name}. {navData.totalTools}+ free tools, no
            sign-up.
          </p>
          <p>
            A{" "}
            <Link
              href={SITE.parentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:underline"
            >
              {SITE.brand}
            </Link>{" "}
            product.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h2>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLinkItem({
  link,
  muted,
}: {
  link: FooterLink;
  muted?: boolean;
}) {
  return (
    <li>
      <Link
        href={link.href}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noopener noreferrer" : undefined}
        className={cn(
          "-mx-2 -my-1.5 inline-flex min-h-11 min-w-11 items-center justify-start px-2 inline-flex items-center gap-1 truncate text-sm outline-none transition-colors",
          "hover:text-foreground focus-visible:text-foreground focus-visible:underline",
          muted ? "font-medium text-muted-foreground/80" : "text-muted-foreground",
        )}
      >
        {link.label}
        {link.external ? (
          <Icon name="ArrowUpRight" size={13} className="opacity-70" />
        ) : null}
      </Link>
    </li>
  );
}
