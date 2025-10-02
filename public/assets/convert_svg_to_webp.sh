#!/bin/bash

# Simple SVG to WebP converter for current directory
# Converts only SVG files that contain embedded PNG or JPEG images
# Preserves transparency
# Usage: ./convert_svg_to_webp.sh [directory]

if [[ $# -eq 0 ]]; then
    directory="."
else
    directory="$1"
fi

# Check if directory exists
if [[ ! -d "$directory" ]]; then
    echo "Error: Directory '$directory' not found!"
    exit 1
fi

if ! command -v magick &>/dev/null && ! command -v convert &>/dev/null; then
    echo "Error: ImageMagick is not installed!"
    exit 1
fi

echo "Converting SVG files with embedded PNG/JPEG images in directory: $directory"

# Convert SVG files that contain embedded PNG or JPEG
for file in *.svg *.SVG; do
    if [[ -f "$file" ]]; then
        # Check if SVG contains embedded PNG or JPEG data
        if grep -q "xlink:href.*data:image/\(png\|jpeg\|jpg\)" "$file" ||
            grep -q "href.*data:image/\(png\|jpeg\|jpg\)" "$file"; then
            output="${file%.*}.webp"
            echo "Converting: $file -> $output"

            magick "$file" -resize "260x260>" -background none -alpha on -quality 90 "$output"
            git rm $file
            git add $output
        else
            echo "Skipping $file (no embedded PNG/JPEG found)"
        fi
    fi
done

echo "Conversion complete!"
