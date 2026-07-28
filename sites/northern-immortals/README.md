# Northern Immortals LLC Website Package

Open `index.html` in a browser to preview the site.

## Folder structure

```text
index.html
assets/
  images/
    logo/        Logo, favicon, seal, and wordmark/lockup files
    background/  Global site atmosphere image
    home/        Homepage hero, feature, and story images
    brother/     Brother's Work page images
    sister/      Sister's Jewelry page images
    gallery/     Recent work/gallery preview images
```

## Replacing images later

The HTML has already been updated to use normal file paths instead of embedded base64 image data.

To replace an image:
1. Put the new image in the same folder.
2. Give it the same filename as the current file, or update the matching path in `index.html`.
3. Keep similar aspect ratios where possible so the layout stays intact.

Recommended replacement format: `.jpg` for photos and `.png` for logos with transparency.

## Notes

- CSS and JavaScript are still embedded in `index.html` so the site remains simple to move and preview.
- The cart/claim drawer is front-end only. The inquiry form is also front-end only until connected to email, Formspree, Supabase, Shopify, etc.
- `IMAGE-MANIFEST.md` lists every extracted image path and what it is used for.
