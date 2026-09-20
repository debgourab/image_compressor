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

