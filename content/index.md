---
layout: index.njk
title: Hello
description: Artist in Birmingham, UK, currently studying for A-level fine art
showTitle: false
image:
  social: ./content/public/images/portfolio/final-piece/IMG_3671-wide.jpeg
  src: ./content/public/images/portfolio/final-piece/IMG_3671-wide.jpeg
  alt: "Over Pearly Lakes and Pine Trees Dressed in White altered book"
  widths:
    - 300
    - 600
    - 1000
  sizes: auto
  classes:
    - some-class
  pictureClasses:
    - content-canvas-item-wide
---
Recent project:{.small .content-canvas-item-wide}

[{% image image.src, image.alt, image.classes, image.widths, image.sizes, image.pictureClasses %}](/portfolio/over-pearly-lakes/)
{.content-canvas-item-wide style="max-inline-size: unset"}
