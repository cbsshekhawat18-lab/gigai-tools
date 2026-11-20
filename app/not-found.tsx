import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { getIndexableCategories, getToolCountByCategory } from "@/lib/registry";
import { Icon } from "@/lib/icons";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CategoryCard } from "@/components/shared/category-card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const categories = getIndexableCategories();

  return (
    <div className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon name="Compass" size={30} />
          </div>
          <p className="mt-6 text-sm font-medium text-primary">404</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-4 text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have moved. Try a
            search, or explore a category below.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={ROUTES.home}>
                <Icon name="Home" size={16} />
                Back home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.search}>
                <Icon name="Search" size={16} />
                Search tools
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading title="Browse by category" align="center" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ slug, name, description, icon, accent }) => (
              <CategoryCard
                key={slug}
                category={{ slug, name, description, icon, accent }}
                count={getToolCountByCategory(slug)}
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
