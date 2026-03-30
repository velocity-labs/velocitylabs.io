# Hi, we're Velocity Labs!

We're a Ruby on Rails and JavaScript web development company based in
Phoenix, AZ. You can find us on the web at
[velocitylabs.io](http://velocitylabs.io) or on twitter
[@velocitylabs](https://twitter.com/velocitylabs).

---

# Development Guide

## Prerequisites

- **Ruby 3.3.10** (managed via RVM; see `.ruby-version`)
- **Node 24** (see `.nvmrc`)
- **Yarn** (not npm — always use `yarn` for package management)
- **Bundler** (`gem install bundler`)
- **watchexec** (`brew install watchexec`) — recommended for file watching (see below)

## Setup

```bash
bundle install
yarn install
```

Create a `.env` file in the project root with the required environment variables (see [Environment Variables](#environment-variables) below). The app loads `.env` automatically in development via the `dotenv` gem.

## Architecture

This is a hybrid static/dynamic site:

1. **Jekyll 4.3** generates static HTML into `_site/`
2. **Vite** (via `jekyll-vite` gem) compiles frontend assets (JS, SCSS) from `_frontend/` into `public/vite/`
3. **Sinatra 4.0** (`main.rb`) serves everything — static files from `_site/`, plus dynamic routes for the contact form
4. **Puma 6** runs the Sinatra app (configured in `Procfile`)

```
Browser → config.ru → Rack::Deflater
                     → Rack::Attack (rate limiting)
                     → main.rb (Sinatra)
                         → GET /           → _site/index.html
                         → GET /*          → _site/<path>/index.html (catch-all)
                         → GET /form-token → HMAC-signed CSRF token (JSON)
                         → POST /contact-form → 6-layer anti-spam + SendGrid email
```

### Key directories

```
_frontend/          → Vite source (JS, SCSS, images, entrypoints)
_site/              → Jekyll build output (served by Sinatra, git-ignored)
_layouts/           → Jekyll layout templates
_includes/          → Jekyll partials
_posts/             → Blog posts (YYYY-MM-DD-slug.md)
_plugins/           → Custom Jekyll plugins (portfolio generator, Liquid filters)
_data/              → Data files (projects.yml, people.yml, testimonials.yml)
config/vite.json    → Vite-Ruby configuration
images/             → Static images (copied directly to _site/)
js/                 → Static vendor JS (not processed by Vite)
public/vite/        → Vite build output (copied into _site/ by Jekyll)
```

## Running Locally

Use two terminals:

```bash
# Terminal 1: Jekyll rebuild via watchexec (recommended)
watchexec -e md,html,yml,yaml,scss,css,js,rb,json \
  --ignore _site --ignore node_modules --ignore public --ignore .jekyll-cache \
  -- jekyll build --trace

# Terminal 2: Puma serves the site
bundle exec puma -t 5:5 -p 3000
```

Visit `http://localhost:3000`.

### Why watchexec instead of `jekyll build --watch`?

Jekyll's `--watch` flag uses the `listen` gem, which has well-documented reliability issues on macOS:
- Silently misses file changes
- Spawns orphaned `fsevent_watch` processes (especially after laptop sleep)
- Can't restart after being stopped

Additionally, `jekyll build --watch` (as opposed to `jekyll serve`) doesn't trigger the `jekyll-vite` hook that excludes `_frontend/` from watching, and `.jekyll-cache/` wasn't in the exclusion list — causing Vite build output to trigger spurious Jekyll rebuilds.

**watchexec** is a Rust-based file watcher that uses native OS APIs, respects `.gitignore`, and coalesces rapid events. Install with `brew install watchexec`.

If you don't have watchexec, `jekyll build --watch --force_polling` is more reliable than the default FSEvents watcher (at the cost of higher CPU usage).

### Build order matters

When changing frontend code (JS/SCSS in `_frontend/`):

1. `yarn build` — compiles Vite assets to `public/vite/`
2. `jekyll build` — copies everything (including Vite output) into `_site/`
3. Hard-refresh the browser

For content/template changes only, the watchexec loop handles it automatically.

### One-off build

```bash
jekyll build --trace
```

Or to build everything from scratch:

```bash
yarn build && jekyll build --trace
```

## Contact Form

The contact form (`POST /contact-form`) has 6 layers of anti-spam protection:

1. **Honeypot field** — hidden `hp-input` field; bots fill it, humans don't
2. **Email format validation** — server-side regex check
3. **HMAC-signed CSRF token** — stateless token with 3s min / 1hr max timing window (prevents instant bot submission)
4. **Rack::Attack rate limiting** — 5 requests per IP per hour
5. **reCAPTCHA v3** — score threshold of 0.5
6. **SendGrid v3 API** — sends email to contact@velocitylabs.io

CSRF tokens are **not** session-based. They use HMAC-SHA256 signatures so they work across concurrent browser tabs without race conditions.

## Blog Posts

Create new posts as `_posts/YYYY-MM-DD-slug.md` with front matter:

```yaml
---
title: "Post Title"
author: "Author Name"
date: YYYY-MM-DD
excerpt: "Short description for listings."
draft: false
---
```

## Data-Driven Content

- `_data/projects.yml` — Portfolio projects (auto-generates pages via `_plugins/portfolio.rb`)
- `_data/people.yml` — Team members
- `_data/testimonials.yml` — Client testimonials

## Environment Variables

Required for the contact form and monitoring to work. In development, add them to a `.env` file (git-ignored). In production (Heroku), set them as config vars.

| Variable | Purpose |
|----------|---------|
| `SESSION_SECRET` | Sinatra session secret + HMAC form token signing key |
| `SENDGRID_API_KEY` | SendGrid v3 API key for sending contact form emails |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret key (site key is in `_config.yml`) |
| `NEW_RELIC_LICENSE_KEY` | New Relic APM monitoring |

## Deployment

Deployed to **Heroku** via git push. The Heroku build process:

1. Ruby buildpack installs gems (`bundle install`)
2. Node.js buildpack installs packages (`yarn install`) and runs `yarn build` (Vite)
3. Jekyll builds `_site/`
4. Puma starts via `Procfile`

**Note:** Vite, vite-plugin-ruby, and sass are in `dependencies` (not `devDependencies`) because Heroku prunes dev dependencies before the build step runs.

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Ruby | 3.3.10 | `.ruby-version`, managed by RVM |
| Jekyll | ~> 4.3 | Static site generator |
| Sinatra | ~> 4.0 | Dynamic routes + static file serving |
| Puma | ~> 6.4 | Web server |
| Rack | ~> 3.0 | |
| Vite | ^6.0 | Asset pipeline (via `jekyll-vite` gem + `vite-plugin-ruby`) |
| Sass | ^1.83 | SCSS compilation via Vite |
| Bootstrap | 5.3.3 | CDN (no jQuery dependency) |
| Node | 24 | `.nvmrc` |
| Kramdown | ~> 2.4 | Markdown parser |
| SendGrid | ~> 6.7 | Email delivery (v3 API) |
| Rack::Attack | ~> 6.7 | Rate limiting |
