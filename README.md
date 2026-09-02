# Swatchwright

Swatchwright turns color design tokens stored in a JSON file into an Adobe Swatch Exchange (`.ase`) file.

The finished ASE file can be imported into Adobe Illustrator, Photoshop, and InDesign. This makes it easier to keep colors consistent between a design system and Adobe documents without recreating every swatch by hand.

## What it does

With Swatchwright, you can:

- Choose or drag in a design-token JSON file.
- Preview the colors found in that file.
- See how many colors are ready for export.
- Download those colors as an ASE file.
- Complete the entire conversion in your browser.

Your token file is not uploaded or stored anywhere. The browser reads it locally, creates the ASE file, and gives the result directly back to you.

## Supported colors

Swatchwright currently exports direct six-digit hex colors, such as:

```json
{
  "brand-blue": {
    "$value": "#315ee8",
    "$type": "color",
    "$description": "Primary brand color"
  }
}
```

Token groups can be nested as deeply as needed. Their names are joined together in the exported swatch name.

For example:

```json
{
  "brand": {
    "primary": {
      "$value": "#315ee8",
      "$type": "color"
    }
  }
}
```

This produces a swatch named `brand.primary`.

The following values are recognized but not currently exported:

- References to another token, such as `{brand.primary}`
- Colors written as `rgb(...)`
- Transparent colors
- Three-digit or eight-digit hex colors

The review screen reports how many of these values were skipped.

## How the project is organized

The project has four main parts:

1. **Token reader** — checks the JSON and turns it into a consistent token structure.
2. **Color converter** — finds direct hex colors and converts them into Adobe color values.
3. **ASE writer** — creates the downloadable ASE file using browser features.
4. **Web interface** — provides file selection, color previews, messages, and the download button.

The browser interface is built with React, TypeScript, and Vite. ASE files are created directly by the project rather than by a remote service.

Important locations:

```text
src/
  ase/          Color extraction and ASE creation
  tokens/       Token parsing and sample token files
  web/          Browser interface and styling
  cli/          Work-in-progress command-line tools
```

## Running Swatchwright locally

You will need Node.js version 22, 23, or 24 and npm.

First, install the project packages:

```bash
npm install
```

Start the local app:

```bash
npm run dev
```

The terminal will display a local address, usually:

```text
http://localhost:5173/
```

Open that address in a browser.

If the browser displays an older version after an update, restart with:

```bash
npm run dev -- --force
```

Then refresh the browser using `Cmd+Shift+R` on macOS or `Ctrl+Shift+R` on Windows and Linux.

## Using the app

1. Open Swatchwright in your browser.
2. Drag a JSON token file into the upload area, or click the area to choose a file.
3. Review the detected colors.
4. Check whether any references or unsupported values were skipped.
5. Select **Download** to save the ASE file.
6. Import the downloaded file into an Adobe application.

You can also select **Try the included 8-color sample** to test the complete process without supplying your own file.

## Importing the ASE file

The menu wording may vary slightly between Adobe versions.

- **Illustrator:** open the Swatches panel, then choose **Open Swatch Library → Other Library**.
- **Photoshop:** open the Swatches panel menu, then choose **Import Swatches** or **Load Swatches**.
- **InDesign:** open the Swatches panel menu, then choose **Load Swatches**.

## Checking the project

Run the automated checks with:

```bash
npm test
```

Create the finished browser files with:

```bash
npm run build:web
```

The finished files are placed in `dist/web`.

## Sample files

Two sample token files are included:

- `src/tokens/tokens0.json` — a small, flat collection of eight colors.
- `src/tokens/tokens1.json` — a larger, nested design-token collection containing colors, text settings, spacing, and other values.

Only direct supported color values are included in an ASE download. Other token types remain unchanged and are ignored during color conversion.

## Current status

The browser conversion workflow is working and covered by automated tests. Some older command-line and Style Dictionary files are still being migrated to TypeScript and should be considered work in progress.

## Privacy

Swatchwright performs conversion on your device. It does not send token files to a server, keep a copy of them, or require an account.
