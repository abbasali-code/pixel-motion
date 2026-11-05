# Pixel Motion

A lightweight, browser-based logo motion design studio by ProPixel.

## Version
0.1.0 — initial project foundation

## Current foundation
- Persian (RTL) and English (LTR) interface switch
- Home screen with new project, open project, and recent projects
- New project presets: 1080×1080, 1920×1080, and 1080×1920
- Duration and FPS settings
- Local project cache for guest use
- Appwrite email/password authentication
- Private cloud project storage in Appwrite TablesDB
- Project sync across devices after signing in
- Existing PMF JSON import foundation

## Appwrite configuration
The browser uses the public Appwrite project endpoint and project ID. No API key or server secret is included in this repository.

- Endpoint: `https://fra.cloud.appwrite.io/v1`
- Project ID: `pixel-motion`
- Database ID: `pixel-motion-db`
- Table ID: `user-projects`

The table has row security enabled. Each project row is created with read, update, and delete permissions for its owner only. The `owner_id` column is used for filtering, not as the security boundary; Appwrite row permissions enforce access.

## Run
Open the GitHub Pages site in a modern browser. The Appwrite SDK is loaded as an ES module from jsDelivr; no npm build step is required.

## Account and sync
- Register or sign in to sync projects to the cloud.
- Guest projects remain local until sign-in, then are imported into that account's cloud workspace.
- Each signed-in account has a separate local cache on a shared browser.
- Sign in on another device with the same account to retrieve cloud projects.
- Email/password authentication is enabled in Appwrite.
- Configure email delivery separately if email verification or password recovery is enabled later.

## Current editor status
The editor view is still a foundation placeholder. The agreed editing, timeline, effects, rendering and export features are not implemented in this starter foundation.
