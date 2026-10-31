# Publishing / GitHub Pages

Repository: https://github.com/Apichetfirm/KMUTT-OpenMap

Source files and GitHub Actions workflows are committed to `main`. The static website does not need an application server.

**First-time owner action (only if Pages deployment fails with a 404):**
1. Go to repository **Settings → Pages**.
2. Under **Build and deployment**, set **Source = GitHub Actions**.
3. Return to **Actions → Deploy GitHub Pages**, and select **Re-run all jobs**.

The expected public preview URL is:
https://apichetfirm.github.io/KMUTT-OpenMap/

GitHub Actions cannot automatically enable Pages with the default `GITHUB_TOKEN` on a new repository. If a run fails at `actions/configure-pages` with 404, the owner must configure Pages through the Settings UI.

Run local validation with `npm test` and `npm run check`.
Run local preview with `python -m http.server 8080`.

Do not announce an official/public beta until the site has been opened and tested on desktop and mobile with live tile loading and known building identifiers.
