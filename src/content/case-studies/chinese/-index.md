---
title: "客戶成功案例"
description: "探索我們如何協助不同產業的企業突破瓶頸、創造成果。"

# Override "Portfolio Section" data located in Portfolio list page
indexPortfolioSection:
  enable: true # Control the visibility of this section across all pages where it is used
  headType: "filter"
  # uniqueId: "section-1" # If headType is "filter", this will be used as the unique id for the filtering.
  filter:
    layout: "classic" # "classic" | "boxed" | "modern"

  head:
    title: "這些企業如何在顧問陪伴下脫穎而出"
    subtitle: "案例精選"

    button:
      enable: true
      label: "瀏覽全部案例"
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
