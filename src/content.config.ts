import { defineCollection, z } from "astro:content";

export const sharedButton = z
  .object({
    enable: z.boolean().optional(),
    tag: z.enum(["a", "button"]).optional(),
    url: z.string(),
    label: z.string(),
    class: z.string().optional(),
    rel: z.string().optional(),
    icon: z.string().optional(),
    showIcon: z.string().optional(),
    target: z.string().optional(),
    size: z.enum(["md"]).optional(),
    hoverEffect: z
      .enum(["text-flip", "creative-fill", "magnetic", "magnetic-text-flip"])
      .optional(),
    variant: z
      .enum(["fill", "outline", "outline-white", "text", "text-white"])
      .optional(),
  })
  .passthrough();

export const sharedButtonTag = sharedButton.refine(
  (data) => data.tag !== "a" || !!data.url,
  {
    message: "`url` is required when `tag` is 'a'",
    path: ["url"],
  },
);

// Universal Page Schema
const page = z.object({
  title: z.string(),
  date: z.date().optional(), // example date format 2022-01-01 or 2022-01-01T00:00:00+00:00 (Year-Month-Day Hour:Minute:Second+Timezone)
  description: z.string().optional(),
  image: z.string().optional(),
  draft: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  robots: z.string().optional(),
  excludeFromSitemap: z.boolean().optional(),
  customSlug: z.string().optional(),
  canonical: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  disableTagline: z.boolean().optional(),
});

// Marquee Schema
export const marqueeConfig = z.object({
  marqueeElementWidth: z.string(),
  marqueeElementWidthResponsive: z.string(),
  marqueeElementWidthAuto: z.boolean(),
  marqueePauseOnHover: z.boolean(),
  marqueeReverse: z.enum(["reverse", ""]).optional(), // Optional: "reverse" or an empty string
  marqueeDuration: z.string(),
});

// Animated Number
const animatedNumber = z.object({
  value: z.string(),
  prependValue: z.string(),
  appendValue: z.string(),
});

// Pages collection schema
const pagesCollection = defineCollection({
  schema: page,
});

const servicesSection = z.object({
  enable: z.boolean().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  creativeShape: z
    .object({
      enable: z.boolean(),
      position: z.enum(["top", "bottom"]),
    })
    .optional(),
  cta: z.enum(["link", "slider-nav"]).optional(),
  colorScheme: z.enum(["dark", "light"]).optional(),
  showServicesAs: z.enum(["slider", "static"]).optional(),
  limit: z.union([z.number(), z.literal(false)]).optional(),
  button: sharedButtonTag.optional(),
});

// Service collection schema
const serviceCollection = defineCollection({
  schema: page.merge(
    z.object({
      icon: z.string().optional(),
      hasCustomLineAnimationBg: z.boolean().optional(),
      serviceDetailsMarquee: marqueeConfig.optional(),
      intro: z
        .object({
          // Call to Action Button
          enable: z.boolean(),
          image: z.string().optional(),
          title: z.string(),
          description: z.string(),
          button: sharedButtonTag.optional(),
        })
        .optional(),
      details: z
        .object({
          enable: z.boolean(),
          title: z.string(),
          description: z.string(),
          list: z.array(
            z.object({
              enable: z.boolean(),
              image: z.string(),
              title: z.string(),
              description: z.string(),
              button: sharedButtonTag.optional(),
            }),
          ),
        })
        .optional(),
      impact: z
        .object({
          enable: z.boolean(),
          title: z.string(),
          description: z.string(),
          list: z.array(z.string()),
          statsBlock: z.object({
            enable: z.boolean(),
            lg: z
              .array(
                z.object({
                  background: z
                    .object({
                      type: z.enum(["image-overlay", "light-color"]),
                      image: z.string(),
                    })
                    .optional(),
                  title: animatedNumber,
                  description: z.string(),
                }),
              )
              .optional(),
            md: z
              .array(
                z.object({
                  background: z
                    .object({
                      type: z.enum(["image-overlay", "light-color"]),
                      image: z.string(),
                    })
                    .optional(),
                  title: animatedNumber,
                  description: z.string(),
                }),
              )
              .optional(),
            sm: z
              .array(
                z.object({
                  background: z
                    .object({
                      type: z.enum(["image-overlay", "light-color"]),
                      image: z.string(),
                    })
                    .optional(),
                  title: animatedNumber,
                  description: z.string(),
                }),
              )
              .optional(),
          }),
          button: sharedButtonTag.optional(),
        })
        .optional(),
      servicesSection: servicesSection.optional(),
      indexServicesSection: servicesSection.optional(),
      faqSection: z
        .object({
          enable: z.boolean().optional(),
          title: z.string().optional(),
          sectionLayout: z.enum(["horizontal", "vertical"]).optional(),
          minimalFaqLayout: z.boolean().optional(),
          faqLayoutOnly: z.boolean().optional(),
          showCategories: z.boolean().optional(),
          subtitle: z.string().optional(),
          button: sharedButtonTag.optional(),
        })
        .optional(),
    }),
  ),
});

// Post collection schema
const blogCollection = defineCollection({
  schema: page.merge(
    z.object({
      categories: z.array(z.string()).default(["others"]),
      author: z.string().optional(),
      excerpt: z.string().optional(),
      settings: z
        .object({
          content: z.enum(["blog"]).optional(),
          layout: z.enum(["grid"]).optional(),
          columns: z
            .union([z.literal(1), z.literal(2), z.literal(3)])
            .optional(),
          limit: z.union([z.number().int(), z.literal(false)]).optional(),
          gap: z.enum(["gap-6", "gap-8"]).optional(),
          card: z.object({
            layout: z
              .enum(["classic", "overlay", "modern", "horizontal"])
              .optional(),
          }),
        })
        .optional(),
      single: z
        .object({
          layout: z.enum(["minimal", "modern"]),
        })
        .optional(),
    }),
  ),
});

// Portfolio Collection
export const portfolioCollection = defineCollection({
  schema: page.merge(
    z.object({
      categories: z.array(z.string()).optional(),
      masonryImage: z.string().optional(),
      information: z
        .array(
          z.object({
            icon: z.string(),
            label: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
      indexPortfolioSection: z
        .object({
          enable: z.boolean(),
          uniqueId: z.boolean().optional(),
          headType: z.enum(["filter", "heading"]),
          filter: z.object({
            layout: z.enum(["classic", "boxed", "modern"]),
          }),
          head: z.object({
            title: z.string(),
            subtitle: z.string(),
            button: sharedButtonTag.optional(),
          }),
          body: z.object({
            content: z.enum(["portfolio", "blog"]).optional(),
            layout: z.enum(["masonry", "grid"]).optional(),
            card: z.object({
              layout: z.enum(["classic", "overlay"]),
            }),
          }),
        })
        .optional(),
    }),
  ),
});

// Export collections
export const collections = {
  blog: blogCollection,
  services: serviceCollection,
  "case-studies": portfolioCollection,

  pages: pagesCollection,
  sections: defineCollection({}),
  about: defineCollection({}),
  contact: defineCollection({}),
  faq: defineCollection({}),
  team: defineCollection({}),
  pricing: defineCollection({}),
  homepage: defineCollection({}),
  author: defineCollection({}),
  career: defineCollection({}),
  widgets: defineCollection({}),
};
