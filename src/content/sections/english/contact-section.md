---
enable: true
title: "Hablemos sobre las comunicaciones de su empresa"
description: "Nuestro equipo está listo para asesorarle y ayudarle a implementar una solución de telefonía en la nube adaptada a su negocio."
subtitle: "Contacto"

contactList:
  enable: true
  list:
    - icon: "Phone"
      label: "Llámenos"
      value: "+1 786 000 0000"
    - icon: "Mail"
      label: "Escríbanos"
      value: "sales@voicetophone.com"
    - icon: "Send"
      label: "Soporte y ventas"
      value: "@voicetophone"

social:
  enable: true
  title: "Síganos en redes sociales"
  # list se mantiene desde social.json

# Check config.toml file for form action related settings
form:
  emailSubject: "Nuevo contacto desde VoiceToPhone"
  submitButton:
    label: "Enviar solicitud"
    showIcon: "true"
    variant: "outline"
    hoverEffect: "text-flip"

  # note:
  #   Sus datos están protegidos. Nunca compartimos su información con terceros.
  #   Consulte nuestra [Política de Privacidad](/privacy-policy/).

  inputs:
    - label: ""
      placeholder: "Nombre completo"
      name: "Nombre completo"
      required: true
      halfWidth: true
      defaultValue: ""

    - label: ""
      placeholder: "Correo electrónico"
      name: "Correo electrónico"
      required: true
      type: "email"
      halfWidth: true
      defaultValue: ""

    - label: ""
      placeholder: "Teléfono"
      name: "Teléfono"
      required: true
      type: "text"
      halfWidth: true
      defaultValue: ""

    - label: ""
      placeholder: "Empresa"
      name: "Empresa"
      required: true
      type: "text"
      halfWidth: true
      defaultValue: ""

    - label: ""
      placeholder: "Motivo de contacto"
      name: "Motivo de contacto"
      required: true
      halfWidth: true
      dropdown:
        type: "select"
        search:
          placeholder: ""
        items:
          - label: "Solicitar demo"
            value: "Solicitar demo"
          - label: "Información comercial"
            value: "Información comercial"
          - label: "Soporte técnico"
            value: "Soporte técnico"
          - label: "Integraciones / API"
            value: "Integraciones / API"
          - label: "Otro"
            value: "Otro"

    - label: ""
      placeholder: "Mensaje"
      name: "Mensaje"
      tag: "textarea"
      rows: "4"
      required: true
      halfWidth: false
      defaultValue: ""

    - label: "Google"
      checked: false
      name: "Origen del contacto"
      required: true
      groupLabel: "¿Cómo nos conoció?"
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""

    - label: "Redes sociales"
      name: "Origen del contacto"
      required: true
      groupLabel: ""
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""

    - label: "Referencia"
      name: "Origen del contacto"
      required: true
      groupLabel: ""
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""

    - label: "Otro"
      name: "Origen del contacto"
      required: true
      groupLabel: ""
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""

    - label: "Acepto los términos y la [política de privacidad](/privacy-policy/)."
      name: "Aceptación de privacidad"
      value: "Aceptado"
      checked: false
      required: true
      type: "checkbox"
      halfWidth: false
      defaultValue: ""

    - note: success
      parentClass: "hidden text-sm message success"
      content: "Hemos recibido su mensaje. Nuestro equipo se pondrá en contacto con usted a la brevedad."

    - note: deprecated
      parentClass: "hidden text-sm message error"
      content: "Ha ocurrido un error. Por favor escríbanos a [support@voicetophone.com](mailto:support@voicetophone.com)."
---
