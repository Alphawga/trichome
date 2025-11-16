# Fonts Directory

This directory contains the custom font files for the Trichomes website.

## Required Font Files

### Classy Vogue
Please add the following font files to this directory:

- `ClassyVogue-Regular.woff2` (preferred format)
- `ClassyVogue-Regular.woff` (fallback format)

## Font Usage

- **Inter**: Loaded from Google Fonts (automatically handled)
- **Classy Vogue**: Used for all headings (h1, h2, h3, h4, h5, h6)

## Font Configuration

Fonts are configured in:
- `src/app/layout.tsx` - Font loading and variable definitions
- `src/app/globals.css` - CSS variables and base styles

The fonts are globally applied:
- Body text uses Inter
- Headings use Classy Vogue

