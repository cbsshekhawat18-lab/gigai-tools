import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { Icon } from "@/lib/icons";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = pageMetadata("contact");

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Contact", href: ROUTES.contact },
];

export default function ContactPage() {
  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMB)} />
      <Container>
        <PageHeader
          title="Contact us"
          description="Questions, feedback or a tool you wish existed? We'd love to hear from you."
          breadcrumb={BREADCRUMB}
        />
      </Container>

      <Container size="narrow" className="mt-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="Mail" size={18} />
              </span>
              <div>
                <p className="font-medium">Email</p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {SITE.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="Building2" size={18} />
              </span>
              <div>
                <p className="font-medium">{SITE.brand}</p>
                <a
                  href={SITE.parentUrl}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {SITE.parentUrl.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="Clock" size={18} />
              </span>
              <div>
                <p className="font-medium">Response time</p>
                <p className="text-sm text-muted-foreground">
                  We usually reply within 1–2 business days.
                </p>
              </div>
            </div>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
