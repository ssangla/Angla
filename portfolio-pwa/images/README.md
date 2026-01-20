# PWA Icons

This directory contains placeholder SVG icons for the Progressive Web App.

## Icon Sizes Needed

For a complete PWA, you need the following PNG icon sizes:
- 72x72 (icon-72.png)
- 96x96 (icon-96.png)
- 128x128 (icon-128.png)
- 144x144 (icon-144.png)
- 152x152 (icon-152.png)
- 192x192 (icon-192.png)
- 384x384 (icon-384.png)
- 512x512 (icon-512.png)

## Generating PNG Icons from SVG

You can use the provided SVG files as a starting point and convert them to PNG using various tools:

### Using ImageMagick (Command Line)
```bash
convert icon-192.svg -resize 192x192 icon-192.png
convert icon-512.svg -resize 512x512 icon-512.png
```

### Using Online Tools
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Cloudinary](https://cloudinary.com/tools/svg-to-png)

### Using Node.js (Sharp library)
```javascript
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('icon-192.svg')
    .resize(size, size)
    .png()
    .toFile(`icon-${size}.png`);
});
```

## Design Tips

For a professional icon:
1. Use your brand colors
2. Keep it simple and recognizable at small sizes
3. Ensure sufficient contrast for visibility
4. Consider using a design tool like Figma, Adobe Illustrator, or Inkscape
5. Follow the [Material Design icon guidelines](https://material.io/design/iconography/)

## Current Placeholder

The current SVG icons show a simple "D" (for Developer) design with a blue background.
Replace these with your actual brand logo or professional icon design.
