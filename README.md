# ProShot — Android Pro Camera

A GitHub Pages-ready camera web app designed for Android Chrome, with a DSLR-inspired interface and capability-aware controls.

## Included
- Rear/front camera selection
- Requests high-resolution video stream from the camera
- Uses the browser `ImageCapture.takePhoto()` API when available for still capture; falls back to a frame capture
- Zoom and exposure compensation sliders when supported
- Focus distance and focus mode when supported
- White balance and exposure mode selectors when supported
- Tap-to-focus attempt where the browser exposes points of interest
- Torch control when supported
- Timer, burst capture, grid, aspect ratio, JPEG/WebP options and session gallery
- Capability report so unsupported features are clearly identified

## Run on Android
Camera permissions require a secure context:
1. Upload the contents of this folder to a GitHub repository.
2. Enable GitHub Pages from **Settings → Pages → Deploy from a branch → main → /(root)**.
3. Open the published HTTPS URL in Chrome on Android.
4. Grant camera permission and tap **START CAMERA**.
5. For best results, use the rear main camera and good lighting.

For local testing, run `python -m http.server 8000` and open `http://localhost:8000` on the same device.

## Important limitations
This is a browser camera, not a native Android camera application. Android Chrome and the phone camera driver decide which controls are exposed. The app cannot reliably force manual ISO, shutter speed, aperture, RAW/DNG capture, optical lens selection, or true HDR through standard browser camera APIs. Some phones also do not expose focus, torch, or white-balance controls. The capability report shows what is actually available.

For full DSLR-style manual control, build a native Android application using Camera2 or CameraX and request the supported sensor capabilities directly. No software can turn a phone's sensor/lens into a DSLR sensor; final image quality depends on the hardware.

## Publish
Upload `index.html`, `style.css`, `app.js`, `manifest.webmanifest`, and `README.md` to the repository root. No build step or dependencies are required.

## License
MIT
