# CopperFlow Plumbing & Drain

A responsive, static marketing-site demo for a fictional Dallas plumbing company. It uses plain HTML, CSS, vanilla JavaScript, and local SVG illustrations; there is no framework or build step.

## Run locally

Open `index.html` in a browser. For full browser features and Lighthouse testing, serve the folder over HTTP (for example, `python -m http.server 8000`) and open `http://localhost:8000`.

The hero intentionally stays on its local poster until after the page load and an idle delay. On desktop, it then requests `assets/video/heroSectionVideomp4.mp4`; it does not request the video on small screens or when reduced motion is enabled. Replace the included clip with an optimized client video before production.

## Customize for a new client

- [ ] **Company identity:** Replace CopperFlow, the tagline, city/service area, descriptions, page title, meta description, Open Graph/Twitter content, and copyright year in `index.html`, `404.html`, `privacy-policy.html`, and `terms.html`.
- [ ] **Phone and email:** Update every visible number, `tel:` URL, email link, form-success/failure message, and the JSON-LD contact fields.
- [ ] **Address and hours:** Replace the contact card, footer NAP, business-hours display, and the JSON-LD postal address and opening hours. Keep every occurrence consistent.
- [ ] **Colors:** Edit the design tokens at the top of `css/styles.css`. Recheck every foreground/background combination after changes: normal text needs 4.5:1 contrast, large text 3:1, and meaningful control boundaries/focus indicators 3:1.
- [ ] **Logo and favicon:** Replace the SVG mark in `assets/img/favicon.svg` and the inline logo marks in `index.html`, `404.html`, `privacy-policy.html`, and `terms.html`. Keep a text company name beside the logo.
- [ ] **Hero video and poster:** Replace `assets/img/hero-poster.svg` and `assets/video/heroSectionVideomp4.mp4` with optimized client assets (optionally provide both WebM and MP4 sources). Keep the poster as the no-video/reduced-motion fallback. The page loads the video only after initial rendering, on desktop, when motion is allowed.
- [ ] **Photos and gallery:** Replace the SVG team illustrations, portraits, and before/after placeholders in `assets/img/`. Write accurate, useful alt text for informative images; retain empty alt text for decorative images.
- [ ] **Form destination:** Replace `https://formspree.io/f/your-form-id` in the quote form with the client's working endpoint. Submit a test request, confirm delivery and error handling, then update the consent and privacy wording to reflect the actual data workflow.
- [ ] **Services and claims:** Verify every service, emergency-response promise, same-day availability, guarantee, financing/discount statement, insurance claim, and service-area city with the business.
- [ ] **Reviews and credentials:** Replace the fictional testimonials, review count, rating, badges, technician names, and license number only with verified, authorized details. Remove aggregate-rating markup if it does not reflect valid real reviews.
- [ ] **Map and social profiles:** Change the Google Maps embed to the real service location and replace all social placeholder URLs with the client's official profiles (or remove unused links).
- [ ] **Domain and SEO:** Replace the canonical URL, JSON-LD URL/image, Open Graph URL/image, `robots.txt` sitemap URL, and every `sitemap.xml` entry with the production domain. Verify the live sitemap and robots response after deployment.
- [ ] **Legal pages:** Have the actual privacy policy and terms reviewed by a qualified professional. The current pages are explicitly demo placeholders and are not legal advice.
- [ ] **Production checks:** Test current Chrome, Firefox, and Safari at narrow mobile, tablet, and desktop sizes; keyboard-only navigation; form errors/success; reduced-motion mode; and real phone/email links. Confirm the production server returns the right 404 page and compresses/caches static assets.

## Accessibility and performance notes

- Semantic landmarks, one page H1, a skip link, visible keyboard focus, labelled controls, descriptive service-link names, accessible accordion and comparison range, and live form/carousel status are included.
- Reduced-motion preferences turn off the video and non-essential animation. The hero's pause/resume control stops decorative CSS motion and the background video.
- Small-print text and form controls use higher-contrast colors; recheck contrast whenever the design tokens or overlay imagery change.
- The hero poster is locally preloaded, non-critical Google Fonts are loaded without blocking the initial render, below-the-fold images and the map are lazy-loaded, and the hero video is deferred.
- These are performance optimizations, not a Lighthouse score guarantee. Run Lighthouse in Chrome DevTools with the **Mobile** preset against the deployed site; third-party fonts/maps, hosting, image/video encoding, and real-device/network conditions affect the result. Aim for 90+ while preserving the accessibility checks above.
