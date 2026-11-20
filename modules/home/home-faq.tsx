import type { FaqItem } from "@/types";
import { SITE } from "@/config/constants";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQ } from "@/components/shared/faq";

/**
 * Home-page FAQs. Exported so the home route can reuse the exact same Q&A for
 * FAQPage JSON-LD (lib/schema.faqJsonLd), one source of truth for both the UI
 * and structured data.
 */
export const HOME_FAQS: FaqItem[] = [
  {
    question: "Is GigAI Tools free to use?",
    answer:
      "Yes. Every tool on GigAI Tools is free to use with no sign-up and no hidden limits. It's built and maintained by Gigai Kripa Services as a genuinely useful public utility.",
  },
  {
    question: "Do you upload my files to a server?",
    answer:
      "Wherever technically possible, tools process your files right in your browser, so nothing leaves your device. When a tool does need server processing, files are handled over an encrypted connection and deleted automatically shortly after. Never stored or shared.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account is required. Just open a tool and start using it. Skipping sign-up keeps things fast and keeps your data to a minimum.",
  },
  {
    question: "Is there a limit on file size or usage?",
    answer:
      "For browser-based tools the practical limit is your device's memory rather than an arbitrary cap. There are no daily usage limits. Use the tools as much as you like.",
  },
  {
    question: "How often are new tools added?",
    answer:
      "Regularly. The platform is designed to scale to hundreds of tools, and new ones are added continuously. Check the “Recently added” section on the home page to see the latest.",
  },
  {
    question: "How do I request a tool or report a problem?",
    answer:
      `We'd love to hear from you. Use the contact page to suggest a new tool or report an issue, or email us at ${SITE.email}. Real requests genuinely shape the roadmap.`,
  },
];

/** Renders the home-page FAQ section using the shared accordion FAQ component. */
export function HomeFAQ() {
  return (
    <section className="border-t border-border py-16 md:py-20">
      <Container size="narrow">
        <SectionHeading
          title="Frequently asked questions"
          description="Everything you need to know about using GigAI Tools."
          align="center"
        />
        <div className="mt-10">
          <FAQ items={HOME_FAQS} title="" />
        </div>
      </Container>
    </section>
  );
}
