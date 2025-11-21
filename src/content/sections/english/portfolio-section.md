---
enable: true # Control the visibility of this section across all pages where it is used
headType: "heading" # "heading" | "filter"
# uniqueId: "section-1" # If headType is "filter", this will be used as the unique id for the filtering.
filter:
  layout: "classic" # "classic" | "boxed" | "modern"

head:
  title: "Success Stories: How We Helped Businesses Thrive"
  subtitle: "Case Studies"

  button:
    enable: true
    label: "See All Case Studies"
    url: "/case-studies"
    rel: ""
    target: ""
    showIcon: "true"
    variant: "outline" # "fill", "outline", "outline-white", "text"
    hoverEffect: "text-flip" # "text-flip", "creative-fill", "magnetic", "magnetic-text-flip"

# Check src/types/index.d.ts `ContentList` type
body:
  content: "portfolio"
  layout: "masonry"
  # columns: 3
  # limit: false
  # gap: "gap-6"
  card:
    layout: "overlay" # "classic" | "overlay"
---
