# Hi, we're Velocity Labs!

We're a senior software team based in Phoenix, AZ, building custom software
and web apps since 2009. You can find us on the web at
[velocitylabs.io](https://velocitylabs.io) or on twitter
[@velocitylabs](https://twitter.com/velocitylabs).

---

# Development Guide

## Prerequisites

- **Ruby 4.0.7** (managed via RVM; see `.ruby-version`)
- **Node 26** (Heroku is pinned to 26.11.1 via `package.json` "engines"; any 26.x works locally)
- **Yarn** (not npm — always use `yarn` for package management)
- **Bundler** (`gem install bundler`)
- **watchexec** (`brew install watchexec`) — recommended for file watching (see below)

## Setup

```bash
bundle install
yarn install --ignore-scripts
```

Dependencies follow a 14-day cooldown: only adopt versions published at least 14 days ago, and pin anything newer. `bin/check-cooldown` checks `Gemfile.lock` and `yarn.lock` (CI runs it too).

Create a `.env` file in the project root with the required environment variables (see [Environment Variables](#environment-variables) below). The app loads `.env` automatically in development via the `dotenv` gem.

## Architecture

This is a hybrid static/dynamic site:

1. **Jekyll 4.3** generates static HTML into `_site/`
2. **Vite** (via the `jekyll-vite` gem) compiles the frontend (JS, SCSS, fonts) from `_frontend/` as part of the Jekyll build
3. **Sinatra 4.0** (`main.rb`) serves everything — static files from `_site/`, plus dynamic routes for the contact form
4. **Puma 8** runs the Sinatra app (configured in `Procfile`)

```
Browser → config.ru → Rack::Deflater
                     → Rack::Attack (rate limiting)
                     → main.rb (Sinatra)
                         → MovedPages      → 301s for moved pages (config/redirects.yml)
                         → GET /           → _site/index.html
                         → GET /*          → _site/<path>/index.html (catch-all)
                         → GET /form-token → HMAC-signed CSRF token (JSON)
                         → POST /contact-form → 6-layer anti-spam + Resend email
```

The design ("Orbit") is dark bands over a starfield, with the services in orbit around "your app" on the home page. There's no CSS framework: `_frontend/stylesheets/orbit.scss` pulls in one partial per part of the page, and `_frontend/entrypoints/application.js` runs small modules that each do nothing on pages without their element.

### Key directories

```
_frontend/          → Vite source: stylesheets/orbit/, javascripts/{lib,site,home}/, entrypoints/
_site/              → Jekyll build output (served by Sinatra, git-ignored)
_layouts/           → base (the shell), home, service, page, blog, post
_includes/          → site/ (header, footer, starfield), home/ (home sections), blocks/ (shared bands)
_posts/             → Blog posts (YYYY-MM-DD-slug.md)
_plugins/           → seo.rb, markdown_export.rb (Markdown copies and llms-full.txt), pullquote.rb
_data/              → services, projects, people, testimonials, technologies
config/redirects.yml → Old URL → new URL, one hop each
config/vite.json    → Vite-Ruby configuration
images/             → Static images (copied directly to _site/)
test/               → Minitest + Rack::Test (needs a built site)
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

Visit `http://localhost:3000`. Restart Puma after changing `main.rb` or `_data/services.yml` (it reads the contact form's service labels at boot).

### Why watchexec instead of `jekyll build --watch`?

Jekyll's `--watch` flag uses the `listen` gem, which has well-documented reliability issues on macOS:
- Silently misses file changes
- Spawns orphaned `fsevent_watch` processes (especially after laptop sleep)
- Can't restart after being stopped

Additionally, `jekyll build --watch` (as opposed to `jekyll serve`) doesn't trigger the `jekyll-vite` hook that excludes `_frontend/` from watching, and `.jekyll-cache/` wasn't in the exclusion list — causing Vite build output to trigger spurious Jekyll rebuilds.

**watchexec** is a Rust-based file watcher that uses native OS APIs, respects `.gitignore`, and coalesces rapid events. Install with `brew install watchexec`.

If you don't have watchexec, `jekyll build --watch --force_polling` is more reliable than the default FSEvents watcher (at the cost of higher CPU usage).

### One-off build

```bash
jekyll build --trace
```

The Jekyll build runs Vite too, so frontend changes need no separate step. Hard-refresh the browser afterward.

## Tests and link checks

```bash
bundle exec jekyll build && bundle exec rake test
```

The tests cover the contact form (anti-spam, reCAPTCHA, the Resend request, with network calls faked), redirects and headers, every URL in the old site's sitemap, and the built pages: one `<h1>` and a title and description on each, internal links and anchors that resolve, and lists that should match `_data/services.yml`. CI runs them on every push.

`bin/check-links` checks every link on the live site, external ones included, and runs monthly in GitHub Actions. Point it at a local server to check a build before it ships: `bin/check-links http://localhost:3000`.

## Contact Form

The contact form (`POST /contact-form`) has 6 layers of anti-spam protection:

1. **Honeypot field** — hidden `hp-input` field; bots fill it, humans don't
2. **Email format validation** — server-side regex check
3. **HMAC-signed CSRF token** — stateless token with 3s min / 1hr max timing window (prevents instant bot submission)
4. **Rack::Attack rate limiting** — 5 requests per IP per hour
5. **reCAPTCHA v3** — score threshold of 0.5
6. **Resend API** — sends email to contact@velocitylabs.io (via Net::HTTP, no gem)

CSRF tokens are **not** session-based. They use HMAC-SHA256 signatures so they work across concurrent browser tabs without race conditions.

"What do you need?" options come from `_data/services.yml`, and `main.rb` adds the chosen service to the email's subject and body. A service page's form sends its own service instead of asking, and sending it records that page's Google Ads conversion.

## Blog Posts

Create new posts as `_posts/YYYY-MM-DD-slug.md` with front matter:

```yaml
---
layout: post
title: "Post Title"
author_id: 1        # the author's id in _data/people.yml
excerpt: "Short description for listings and search results."
tags:
- ruby
---
```

Optional: `noindex: true` keeps a post out of search engines and the sitemap.

## Data-Driven Content

- `_data/services.yml` — The services, in order. Drives the home page's services and hero planets, the footer, the contact form options, `llms.txt`, and the "Need" line in contact emails
- `_data/projects.yml` — Portfolio projects. Those with a `slug` get a card (with technologies for the `/portfolio/?tech=` filter); the rest are listed as earlier work
- `_data/people.yml` — Team members (partners on the home page, author cards on posts)
- `_data/testimonials.yml` — Client quotes, looked up by `id`
- `_data/technologies.yml` — "The tools we build with" on the home page

## Environment Variables

Required for the contact form and monitoring to work. In development, add them to a `.env` file (git-ignored). In production (Heroku), set them as config vars.

| Variable | Purpose |
|----------|---------|
| `SESSION_SECRET` | HMAC form token signing key (Sinatra sessions are disabled) |
| `RESEND_API_KEY` | Resend API key (sending access, velocitylabs.io domain) for contact form emails |
| `CONTACT_FORM_FROM` | Optional sender override (default `Velocity Labs <contact@velocitylabs.io>`) |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret key (site key is in `_config.yml`) |

## Deployment

Heroku deploys `main` automatically, once CI passes. The build:

1. Node.js buildpack installs packages (`yarn install`) and runs the `build` script (`vite build`)
2. Ruby buildpack installs gems (`bundle install`) and runs `rake assets:precompile`, which runs `jekyll build` (Vite included) and drops build-only files from the slug
3. Puma starts via `Procfile`

`heroku rollback` restores the previous release if a deploy misbehaves.

**Note:** Vite, vite-plugin-ruby, and sass are in `dependencies` (not `devDependencies`) because Heroku prunes dev dependencies before the build step runs.

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Ruby | 4.0.7 | `.ruby-version`, managed by RVM |
| Jekyll | ~> 4.3 | Static site generator |
| Sinatra | ~> 4.0 | Dynamic routes + static file serving |
| Puma | ~> 8.0 | Web server, bound to 0.0.0.0 in `Procfile` |
| Rack | ~> 3.0 | |
| Vite | 8.3.4 | Asset pipeline (via `jekyll-vite` gem + `vite-plugin-ruby`) |
| Sass | 1.105.1 | SCSS compilation via Vite |
| Fonts | Fontsource 5.3.0 | Montserrat (headings), Atkinson Hyperlegible (text), Caveat (the 404's hand lettering) |
| Node | 26.11.1 | `package.json` "engines" (Heroku) and `.nvmrc` |
| Kramdown | ~> 2.4 | Markdown parser |
| Rack::Attack | ~> 6.7 | Rate limiting |
