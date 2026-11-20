import { getIndexableCategories, getToolCountByCategory } from "@/lib/registry";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CategoryCard } from "@/components/shared/category-card";

/**
 * Browse-by-category section. Renders a CategoryCard for every category with a
 * live tool count pulled from the registry. Anchored with id="categories" for
 * in-page navigation from the header/hero.
 */
export function CategoriesSection() {
  const categories = getIndexableCategories();
  if (categories.length === 0) return null;

  return (
    <section id="categories" className="scroll-mt-24 py-10 md:py-12">
      <Container>
        <SectionHeading
          title="Explore by category"
          description="Every tool, neatly organized: jump straight to what you need."
          align="center"
        />
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              count={getToolCountByCategory(category.slug)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
