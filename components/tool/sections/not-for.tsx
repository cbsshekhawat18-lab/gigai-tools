import Link from "next/link";

import type { Tool } from "@/types";
import { getToolBySlug } from "@/lib/registry";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Icon } from "@/lib/icons";

/**
 * "What this does not do" (specs/per-tool-geo.md Phase 2). Explicit boundaries
 * with a link to the sibling that DOES do the job. Server-rendered; this is
 * the block that stops an assistant citing the wrong one of two adjacent
 * tools, which with 262 of them matters as much as the description.
 */
export function NotFor({ tool }: { tool: Tool }) {
  if (!tool.notFor || tool.notFor.length === 0) return null;

  return (
    <section id="boundaries" className="py-10 sm:py-14">
      <Container>
        <SectionHeading
          title="What this tool does not do"
          description="Boundaries stated plainly, with the right tool for each neighbouring job."
        />
        <ul className="mt-6 space-y-3">
          {tool.notFor.map((item, i) => {
            const sibling = item.toolSlug ? getToolBySlug(item.toolSlug) : undefined;
            return (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
              >
                <Icon name="CornerDownRight" size={15} className="mt-0.5 shrink-0 text-primary" />
                <span>
                  {item.text}
                  {sibling ? (
                    <>
                      {" "}
                      <Link
                        href={`/${sibling.slug}`}
                        className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                      >
                        {sibling.title}
                      </Link>{" "}
                      does that.
                    </>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
