---
enable: true # 控制区块显示
title: "欢迎与我们联系"
description: "无论需要策略建议或专案支援，我们的团队都会在每一个阶段与您并肩。"
subtitle: "联络方式"

contactList:
  enable: true
  list:
    - icon: "Phone"
      label: "立即来电"
      value: "+6011-27368039"
    - icon: "Mail"
      label: "Email"
      value: "admin@mmcfin.com"

social:
  enable: true
  title: "追踪我们的社群频道"
  # # uncomment below list if you want to override `src/config/social.json` data
  # list:
  #   - enable: true
  #     label: "facebook"
  #     icon: "/images/icons/social/facebook.svg"
  #     url: "/"

# Check config.toml file for form action related settings
form:
  emailSubject: "MMC FP 网站有新的联络表单" # Customized email subject (applicable when anyone submit form, form submission may receive by email depend on provider)
  submitButton:
    label: "送出讯息"
    showIcon: "true"
    variant: "outline" # "fill", "outline", "outline-white", "text"
    hoverEffect: "text-flip" # "text-flip", "creative-fill", "magnetic", "magnetic-text-flip"
  # This note will show at the end of form
  # note: |
  #   我们会妥善保护你的资料，绝不对外分享。<br /> 详阅我们的[隐私政策](/privacy-policy/)。
  inputs:
    - label: ""
      placeholder: "姓名"
      name: "姓名" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "电子邮箱"
      name: "电子邮箱" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      type: "email"
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "电话号码"
      name: "电话号码" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      type: "text"
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "公司名称"
      name: "公司名称" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      type: "text"
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "主题"
      name: "主题" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      halfWidth: true
      dropdown:
        type: "" # select | search - default is select
        search: # if type is search then it will work
          placeholder: ""
        items:
          - label: "咨询合作"
            value: "咨询合作"
          - label: "媒体采访"
            value: "媒体采访"
          - label: "其他"
            value: "其他"
    - label: ""
      placeholder: "主题（可搜寻）"
      name: "主题（搜寻）" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      halfWidth: true
      dropdown:
        type: "search" # select | search - default is select
        search: # if type is search then it will work
          placeholder: "输入关键字"
        items:
          - label: "策略诊断"
            value: "策略诊断"
          - label: "品牌升级"
            value: "品牌升级"
          - label: "营运优化"
            value: "营运优化"
          - label: "人才发展"
            value: "人才发展"
          - label: "其他"
            value: "其他"
    - label: ""
      tag: "textarea"
      defaultValue: ""
      rows: "4" # Only work if tag is textarea
      placeholder: "请输入讯息内容"
      name: "讯息" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      halfWidth: false
    - label: "Google 搜寻" # only valid for type="checkbox" & type === "radio"
      checked: false # only valid for type="checkbox" & type === "radio"
      name: "信息来源" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      groupLabel: "你是如何认识我们的？" # Radio Inputs Label
      group: "source" # when you add group then it will omit space between the same group radio input
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "社群媒体" # only valid for type="checkbox" & type === "radio"
      name: "信息来源" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      groupLabel: "" # Radio Inputs Label
      group: "source" # when you add group then it will omit space between the same group radio input
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "伙伴推荐" # only valid for type="checkbox" & type === "radio"
      name: "信息来源" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      groupLabel: "" # Radio Inputs Label
      group: "source" # when you add group then it will omit space between the same group radio input
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "其他" # only valid for type="checkbox" & type === "radio"
      name: "信息来源" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      groupLabel: "" # Radio Inputs Label
      group: "source" # when you add group then it will omit space between the same group radio input
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "我同意条款与条件，并理解[隐私政策](/contact/)" # only valid for type="checkbox" & type === "radio"
      name: "同意条款" # This is crucial. Its indicate under which name you want to receive this field data
      value: "Agreed" # Value that will be submit (applicable for type="checkbox" & type === "radio")
      checked: false # only valid for type="checkbox" & type === "radio"
      required: true
      type: "checkbox"
      halfWidth: false
      defaultValue: ""
    - note: success # info | warning | success | deprecated | hint
      parentClass: "hidden text-sm message success"
      content: 我们已经收到你的讯息，会尽快与您联系。
    - note: deprecated # info | warning | success | deprecated | hint
      parentClass: "hidden text-sm message error"
      content: 送出失败，请寄信至 [mmcfp-astro-theme@gmail.com](mailto:mmcfp-astro-theme@gmail.com) 与我们联系。
---
