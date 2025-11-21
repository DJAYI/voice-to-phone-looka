---
title: "服务方案"
description: "这一页汇整我们提供的核心顾问服务，协助你找到最适合的解方。"
draft: false
hasCustomLineAnimationBg: true

# Override "Services Section" data located in services list page
indexServicesSection:
  enable: true # Control the visibility of this section across all services single
  # title: "延伸服务，最大化企业潜力"
  # subtitle: "我们的服务"

  creativeShape: # Background shape
    enable: true
    position: "top"

  # cta: "slider-nav" # "link" | "slider-nav" ( Define weather call to action button should be slider control or a link )
  # colorScheme: "light" # "dark" | "light"; (default "dark"); weather to show services in light or dark color scheme
  # showServicesAs: "static" # "slider" | "static"; (default "slider"); weather to show services as slider or static list
  limit: false # number / false (default "3"); Limit the number of services to be displayed (Only work if showServicesAs is static)

  button:
    enable: false
    label: "查看全部服务"
    url: "/services"
    rel: ""
    target: ""
    showIcon: "true"
    variant: "outline" # "fill", "outline", "outline-white", "text"
    hoverEffect: "text-flip" # "text-flip", "creative-fill", "magnetic", "magnetic-text-flip"

# ----------------------------------------------------------------------------------------------------------------
# DATA FOR SERVICE SINGLE PAGES
# ----------------------------------------------------------------------------------------------------------------

# "Service Details" Section located in Services Single Page (Image Moving Animation Settings)
serviceDetailsMarquee:
  marqueeElementWidth: "26.5rem"
  marqueeElementWidthResponsive: "18.75rem"
  marqueeElementWidthAuto: true
  marqueePauseOnHover: true
  marqueeReverse: "" # reverse / ""
  marqueeDuration: "30s"

# "Services" Section located in Services Single Page (Override Default Content of `/sections/services-section.md`)
# Uncomment key values that you wan to override ()
servicesSection:
  enable: true # Control the visibility of this section across all services single
  title: "延伸服务，最大化企业潜力"
  # subtitle: "我们的服务"

  creativeShape: # Background shape
    enable: false
    position: "bottom"

  # cta: "link" # "link" | "slider-nav" ( Define weather call to action button should be slider control or a link )
  # colorScheme: "light" # "dark" | "light"; (default "dark"); weather to show services in light or dark color scheme
  # showServicesAs: "static" # "slider" | "static"; (default "slider"); weather to show services as slider or static list
  # limit: 3 # number / false (default "3"); Limit the number of services to be displayed (Only work if showServicesAs is static)

  # button:
  #   enable: true
  #   label: "Voir Tous les Services"
  #   url: "/services"
  #   rel: ""
  #   target: ""

# "FAQ" Section located in Services Single Page
faqSection:
  enable: true # Control the visibility of this section across all services single
  title: "关于品牌或服务的问题？我们随时提供帮助"
  # subtitle: ""
  sectionLayout: "horizontal"
  minimalFaqLayout: true
  faqLayoutOnly: false
  showCategories: false

  button:
    enable: true
    label: "浏览所有常见问题"
    url: "/faq"
    rel: ""
    target: ""
    showIcon: "true"
    variant: "outline" # "fill", "outline", "outline-white", "text"
    hoverEffect: "text-flip" # "text-flip", "creative-fill", "magnetic", "magnetic-text-flip"
---
