"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { SITE } from "@/config/constants";
import { Icon } from "@/lib/icons";

/**
 * Where the form POSTs: NEXT_PUBLIC_LEADS_ENDPOINT (on gigai.tools, the main
 * site's leads endpoint, which saves the message and emails the team). Unset,
 * the form sends nothing and points the visitor at SITE.email instead.
 */
const LEADS_ENDPOINT = process.env.NEXT_PUBLIC_LEADS_ENDPOINT?.trim() || "";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(3, "Please add a short subject."),
  message: z.string().min(10, "Please add a few more details (10+ characters)."),
  website: z.string().optional(), // honeypot, real users never see/fill this
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm({ className }: { className?: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  // Really sends: POSTs to the main site's Django leads endpoint, which saves the
  // message and emails the team (Zoho SMTP). The subject is folded into the body
  // since the backend model has no subject field.
  async function onSubmit(values: ContactValues) {
    try {
      if (!LEADS_ENDPOINT) throw new Error("No contact endpoint configured");
      const res = await fetch(LEADS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          message: `Subject: ${values.subject}\n\n${values.message}`,
          source_path:
            typeof window !== "undefined" ? window.location.href : "/contact",
          website: values.website ?? "", // honeypot
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Message sent", {
        description: "Thanks for reaching out, we'll get back to you soon.",
      });
      reset();
    } catch {
      toast.error("Couldn't send your message", {
        description: `Please email us directly at ${SITE.email}.`,
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("space-y-5", className)}
    >
      {/* Honeypot - hidden from humans; if a bot fills it the backend drops it. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        {...register("website")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            placeholder="Jane Doe"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            {...register("name")}
          />
          {errors.name ? (
            <p id="contact-name-error" className="text-sm text-destructive">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p id="contact-email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          placeholder="How can we help?"
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          {...register("subject")}
        />
        {errors.subject ? (
          <p id="contact-subject-error" className="text-sm text-destructive">
            {errors.subject.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={6}
          placeholder="Tell us a little more…"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          {...register("message")}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <Icon name="LoaderCircle" size={16} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Icon name="Send" size={16} />
            Send message
          </>
        )}
      </Button>
    </form>
  );
}
