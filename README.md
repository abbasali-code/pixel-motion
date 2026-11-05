# Pixel Motion

A browser-based logo motion design studio by ProPixel.

## Version
0.1.0 — editor foundation release

## Features
- Persian (RTL) and English (LTR) interface
- Square, landscape and portrait projects
- Canvas with text, image and shape layers
- Layer selection, visibility and deletion
- Editable position, scale, rotation, opacity, font, weight and color
- Combined effects: blur, glow, grayscale, shadow and vintage
- Timeline scrubber, playback preview and per-layer keyframes
- PMF JSON project import and export
- PNG still export and WebM video export (browser support required)
- Guest local storage and private Appwrite cloud sync

## Run
Open the GitHub Pages site in a modern browser. No npm build step is required. Appwrite Web SDK 29.2.0 is loaded as an ES module.

## PMF and export
PMF is a JSON project file. Uploaded images are embedded as data URLs. WebM export uses Canvas Capture Stream and MediaRecorder; available codecs depend on the browser.
