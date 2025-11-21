---
enable: true # 控制区块显示
headType: "heading"
# uniqueId: "section-1" # If headType is "filter", this will be used as the unique id for the filtering.
filter:
  layout: "classic" # "classic" | "boxed" | "modern"

head:
  title: "这些案例证明策略真的奏效"
  subtitle: "精选案例"

  button:
    enable: true
    label: "浏览所有案例"
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
