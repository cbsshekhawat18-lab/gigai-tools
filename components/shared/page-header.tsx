import * as React from "react";

import type { BreadcrumbItem } from "@/types";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  align?: "left" | "center";
  /** Optional trailing content (search bar, actions, etc.). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Standard page hero band: optional breadcrumb, title, description, and an
 * optional slot for actions/search. Used by category, blog, and static pages.
 */
export function PageHeader({
  title,
  description,
  breadcrumb,
  align = "left",
  children,
  className,
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "border-b border-border bg-muted/30",
        className,
      )}
    >
      <Container className="py-10 sm:py-14">
        <div
          className={cn(
            "flex flex-col gap-5",
            centered && "items-center text-center",
          )}
        >
          {breadcrumb && breadcrumb.length > 0 ? (
            <Breadcrumb
              items={breadcrumb}
              className={cn(centered && "flex justify-center")}
            />
          ) : null}

          <div className={cn("flex flex-col gap-3", centered && "items-center")}>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  "max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg",
                  centered && "mx-auto",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>

          {children ? (
            <div className={cn("w-full", centered && "flex justify-center")}>
              {children}
            </div>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
