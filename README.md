# Pixel Motion

A lightweight, browser-based logo motion design studio by ProPixel.

## Version
0.1.0 — initial project foundation

## Current foundation
- Persian (RTL) and English (LTR) interface switch
- Home screen with new project, open project, and recent projects
- New project presets: 1080×1080, 1920×1080, and 1080×1920
- Duration and FPS settings
- Basic project list persistence in browser storage
- Initial PMF JSON project validation on import

## Planned 0.1 scope
The agreed product scope includes a multi-layer editor (image, text, shape, and effect layers), reorderable layers, a simple timeline with independent effect tracks and keyframes, combined effects, editable canvas objects, undo/redo, solid or transparent backgrounds, and export to MP4, WebM, GIF, and PNG.

These editor and rendering features are not implemented in this starter commit yet. The current editor view is a foundation placeholder.

## Run
Open `index.html` in a modern browser. No build step or external API is required.

## Project format
The planned `.pmf` format is JSON-based and will package project metadata and assets for portability. The complete asset packaging/import workflow is not implemented yet.