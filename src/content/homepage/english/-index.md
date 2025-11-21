---
title: ""
metaDescription: "This is a example description"

# Override Default Content of `/sections/services-section.md`
# Uncomment key values that you wan to override
servicesSection:
  # enable: true # Control the visibility of this section across all services single
  title: "Additional Services to Maximize Your Business Potential"
  # subtitle: "Our Services"

  creativeShape: # Background shape
    enable: true
    position: "bottom"

  # cta: "link" # "link" | "slider-nav" ( Define weather call to action button should be slider control or a link )
  colorScheme: "dark" # "dark" | "light"; (default "dark"); weather to show services in light or dark color scheme
  showServicesAs: "slider" # "slider" | "static"; (default "slider"); weather to show services as slider or static list
  # limit: 3 # number / false (default "3"); Limit the number of services to be displayed (Only work if showServicesAs is static)

  button:
    enable: true
    label: "View All Services"
    url: "/services"
    rel: ""
    target: ""
    showIcon: "true"
    variant: "outline-white" # "fill", "outline", "outline-white", "text"
    hoverEffect: "text-flip" # "text-flip", "creative-fill", "magnetic", "magnetic-text-flip"

# Override Default Content of `/sections/call-to-action.md`
# Uncomment key values that you wan to override
callToActionSection:
  enable: true # Control the visibility of this section across all pages where it is used
  # title: "Ready to Transform Your Business?"
  # subtitle: "Business Goals"
  # description: |
  #   Partner with our team of experts to unlock your business’s full potential. Schedule your free consultation and discover how we can help you.

  button:
    enable: true
    label: "Get A Free Consultation"
    url: "/contact/"
    rel: ""
    showIcon: "true"
    variant: "outline" # "fill", "outline", "outline-white", "text"
    hoverEffect: "text-flip" # "text-flip", "creative-fill", "magnetic", "magnetic-text-flip"

  # ctaShapeOne: "/images/shapes/cta-shape-one.svg"
  # ctaShapeTwo: "/images/shapes/cta-shape-two.svg"

  rightContent: "stats" # Choose between "image" or "stats" for the content of the right side of the section


  # imageBlock:
  # image: "/images/call-to-action/image.png"
  # experience:
  #   label: "Years of Experience"
  #   prependValue: ""
  #   value: "12+"
  #   appendValue: "+"

  # statsBlock:
  #   list:
  #     - prependValue: ""
  #       value: "98"
  #       appendValue: "%"
  #       title: "Satisfaction Rate"
  #       description: "Our clients consistently report high levels of satisfaction"
  #     - prependValue: ""
  #       value: "200"
  #       appendValue: "+"
  #       title: "Successful Projects"
  #       description: "our team of consultants brings a wealth of expertise."
  #     - prependValue: ""
  #       value: "25"
  #       appendValue: "+"
  #       title: "Years of Experience"
  #       description: "Our strategies have generated over $50 million."
---
