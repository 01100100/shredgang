---
type: PageLayout
title: "Join us 🫂"
colors: colors-a
backgroundImage:
  type: BackgroundImage
  url: /images/bg1.jpg
  backgroundSize: cover
  backgroundPosition: center
  backgroundRepeat: no-repeat
  opacity: 75
sections:
  - type: ContactSection
    title: Join us!
    text: |
      You were always meant to be here, drawn by destiny and fate. You are a shredder and we have been waiting for you ✨
    form:
      type: FormBlock
      title: Title of the form
      fields:
        - type: TextFormControl
          name: name
          label: Name
          hideLabel: true
          placeholder: Your name
          width: 1/2
          isRequired: 'true'
        - type: EmailFormControl
          name: email
          label: Name
          hideLabel: true
          placeholder: Your email
          width: 1/2
          isRequired: 'true'
      submitLabel: "Join the ShredGang ❤️‍\U0001F525"
      elementId: contact-form
      styles:
        submitLabel:
          textAlign: left
    colors: colors-f
    backgroundSize: full
    elementId: ''
    styles:
      self:
        height: auto
        width: narrow
        padding:
          - pt-28
          - pb-36
          - pl-4
          - pr-4
        alignItems: center
        justifyContent: center
        flexDirection: row
        borderStyle: dashed
        borderWidth: 0
        borderRadius: none
      title:
        textAlign: center
      text:
        textAlign: center
socialImage: /images/sneak-peaks-7.jpg
metaDescription: "Are you Shready..? \U0001F919"
addTitleSuffix: false
metaTitle: ''
---
