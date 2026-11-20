import type { FaqItem } from "@/types";
import { cn, slugify } from "@/lib/utils";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQProps {
  items: FaqItem[];
  title?: string;
  className?: string;
}

/**
 * Frequently-asked-questions block. Single-open, collapsible accordion.
 * Renders nothing when there are no items, so it's safe to always include.
 */
export function FAQ({ items, title = "Frequently asked questions", className }: FAQProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={cn("space-y-6", className)}
      aria-label={title || "Frequently asked questions"}
    >
      {title ? <SectionHeading title={title} /> : null}

      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => {
          const value = `${slugify(item.question) || "faq"}-${index}`;
          return (
            <AccordionItem key={value} value={value}>
              <AccordionTrigger className="text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[0.9375rem] leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
