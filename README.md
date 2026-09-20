# Image Compressor

A responsive image compression tool built with **HTML, CSS, and vanilla JavaScript**. Adjust quality, resize images, compare file sizes, and download results individually or together as a ZIP — all in your browser.

**Author:** Deb Gourab Biswas  
**Repository:** [debgourab/image_compressor](https://github.com/debgourab/image_compressor.git)

## Features

- Drag and drop multiple images or select them with the file picker.
- Export to WebP, JPEG, or PNG.
- Adjust JPEG/WebP quality from 10% to 100%.
- Resize to a maximum dimension of 800, 1280, 1920, or 2560 pixels, or keep original dimensions. Smaller images are never enlarged.
- Preview inputs and compare original/output sizes and output dimensions.
- Download individual results or all successful results in one ZIP.
- Continue processing when an individual file is corrupt or unsupported.
- Remove images, clear the queue, and recompress with different settings.
- Responsive layout, keyboard-accessible controls, visible focus states, and live status updates.
- Local processing with no accounts, API keys, backend, or image uploads.
- Bundled JSZip: no CDN dependency, package installation, or build step.

## Quick start

1. Download the project ZIP and extract it.
2. Open the `image_compressor` folder.
3. Double-click `index.html` to run it in your browser.

You can also open the folder in VS Code and use **Live Server**. If Python is installed, serve the project with:

```bash
cd image_compressor
python -m http.server 5500
```

Open [localhost:5500](http://localhost:5500). On Windows, use `py -m http.server 5500` if `python` is unavailable.

To clone the repository:

```bash
git clone https://github.com/debgourab/image_compressor.git
cd image_compressor
```

## How to use

1. Add images with **browse files** or drag and drop.
2. Select an output format, quality, and maximum dimension.
3. Click **Compress images**.
4. Review the output sizes. Larger outputs are explicitly labeled.
5. Choose **Download** beside an image or **Download ZIP** for the batch.

Changing settings clears previous results so downloaded files always correspond to the selected settings. New selections append to the queue. Matching filename, size, and last-modified values are treated as duplicate inputs.

## Format behavior

| Format | Input | Output | Notes |
| --- | --- | --- | --- |
| JPEG | Yes | Yes | Quality adjustable; transparent areas become white. |
| PNG | Yes | Yes | Transparency preserved. Canvas PNG encoding is lossless, but resizing changes pixels. Quality slider is disabled. |
| WebP | Browser-dependent | Browser-dependent | Adjustable quality and transparency. Unsupported output produces an error instead of a mislabeled file. |
| GIF | Yes | No | Converted to a still image; animation is not preserved. |
| BMP | Browser-dependent | No | Converted to the selected output format. |
| AVIF | Browser-dependent | No | Requires native browser decoding support. |
| TIFF / SVG | No | No | Not accepted by this application. |

Animated inputs are flattened to a single browser-rendered frame. Re-encoding does not preserve original EXIF metadata, animation, or color-profile metadata. This tool is intended for web images, not archival preservation.

## Limits and compression expectations

- Maximum **30 images**, **25 MiB per file**, and **100 MiB total input**. The interface uses the familiar MB label for these binary limits.
- Images above **40 megapixels** are rejected after decoding. Decoding itself can still require significant memory; use smaller files on low-memory devices.
- Processing runs sequentially to reduce peak memory use. ZIP generation still needs memory for the outputs and archive.
- The default output is **WebP, 70% quality, maximum dimension 1920 px**.
- Quality 70% is an encoder setting, not a promise of a 70% size reduction.
- Already optimized images may become larger. The requested format is always honored; the tool does not silently return an original file instead.
- ZIP uses STORE because image files are already encoded/compressed. Packaging them in ZIP is primarily for convenient downloads.
- Results live in page memory only. Refreshing or closing the page clears them.

## Project structure

```text
image_compressor/
├── index.html                  # Semantic page and controls
├── assets/
│   ├── styles.css              # Responsive styling
│   ├── app.js                  # Queue, canvas conversion, downloads
│   └── vendor/
│       ├── jszip.min.js        # Bundled JSZip 3.10.1
│       └── JSZip-LICENSE.md    # Upstream third-party license
├── .gitignore
└── README.md
```

## How it works

The browser decodes each selected file into an image. A Canvas draws it at its original size or a smaller proportional size. `canvas.toBlob()` encodes the selected format and quality. Object URLs power previews and individual downloads. JSZip packages successful results with unique filenames inside a `compressed_images` folder.

The app handles decode failures, null canvas outputs, unsupported encoders, invalid files, and missing ZIP support. File names are inserted using `textContent`; generated download names are sanitized. Object URLs are released when results are replaced or removed.

## Customize

| Change | File / location |
| --- | --- |
| Headings, author, repository links | `index.html` |
| Colors, spacing, responsive layout | `assets/styles.css` (`--blue` controls the accent) |
| Initial quality, format, resize selection | Form controls in `index.html` |
| File limits and processing logic | `assets/app.js` |
| ZIP filename | `link.download` in the ZIP click handler in `assets/app.js` |

