# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Velocity Labs company website and blog. Hybrid architecture: Jekyll 4.3 generates static HTML into `_site/`, and Sinatra 4.0 (main.rb) serves those files while handling dynamic routes (contact form). Runs on Ruby 4.0.7, deployed to Heroku via Puma 8. Assets compiled by Vite (via `jekyll-vite` gem).

## Development Commands

```bash
# Install dependencies
bundle install
yarn install  # Use yarn, not npm

# Package management — always use yarn (not npm)
yarn add <package>           # add a dependency
yarn add -D <package>        # add a dev dependency
yarn remove <package>        # remove a dependency

# Dependency cooldown: only adopt versions published at least 14 days ago
# (gems, npm packages, Ruby, Bundler, GitHub Actions). Pin anything newer,
# including transitive deps (Gemfile constraints / package.json "resolutions").
bin/check-cooldown           # verify Gemfile.lock + yarn.lock (also runs in CI)
yarn install --ignore-scripts  # install scripts are a supply-chain vector
bin/check-links              # check every link on the live site (also runs monthly)

# Local development — use two terminals
# Terminal 1: watchexec rebuilds _site/ on changes (brew install watchexec)
watchexec -e md,html,yml,yaml,scss,css,js,rb,json \
  --ignore _site --ignore node_modules --ignore public --ignore .jekyll-cache \
  -- jekyll build --trace
# Terminal 2: Puma serves at http://localhost:3000
bundle exec puma -t 5:5 -p 3000
# Note: don't use `jekyll build --watch` — the listen gem is unreliable on macOS
# and causes rebuild loops with the jekyll-vite plugin

# One-off build
jekyll build --trace

# Claude Code jekyll build (RVM doesn't auto-switch in subshells, and it
# doesn't recognize a bare "4.0.7" in .ruby-version, so pick the Ruby explicitly)
env -i HOME="$HOME" PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" LANG="en_US.UTF-8" LC_ALL="en_US.UTF-8" bash -l -c 'rvm use "ruby-$(cat .ruby-version)" >/dev/null && bundle exec jekyll build --trace'
```

Tests: `bundle exec rake test` (Minitest + Rack::Test in `test/`, after a `jekyll build`). They cover the contact form (anti-spam, reCAPTCHA, the Resend request), redirects and headers, with network calls faked. CI runs them on every push. No linter is configured.

## Architecture

```
Request → config.ru → main.rb (Sinatra) → serves _site/ static files
                                         → GET  /form-token (HMAC-signed CSRF token)
                                         → POST /contact-form (6-layer anti-spam)
                                         → legacy URL redirects
```

- **_config.yml** — Jekyll config: permalink structure (`/blog/:year/:month/:day/:title/`), pagination (10/page), Vite settings, company metadata available as Liquid variables (`site.company.*`)
- **main.rb** — Sinatra app: catch-all route serves from `_site/`, contact form with HMAC-signed CSRF tokens (stateless, not session-based — see `thoughts/shared/learnings/2026-02-25-csrf-session-race-condition.md`), Rack::Attack rate limiting
- **vite.config.mjs** / **config/vite.json** — Vite asset pipeline config; source in `_frontend/`, output to `public/vite/`
- **_frontend/** — The Orbit design (no Bootstrap). `stylesheets/orbit.scss` pulls in the partials in `stylesheets/orbit/` (tokens, shell, one per block, prose, motion). `entrypoints/application.js` runs on every page (`javascripts/site/`: cookie consent, menu, reveals, starfield, scroll effects; the contact form loads on demand); `entrypoints/home.js` adds the hero orbit (`javascripts/home/orbit.js`) on the home layout only. Scroll effects share one loop (`javascripts/lib/frame.js`). Elements animate in via `data-reveal` attributes, hidden under the `.motion` class that `_layouts/base.html` sets before first paint
- **_plugins/** — Custom Jekyll plugins: `portfolio.rb` auto-generates portfolio pages from `_data/projects.yml`, `filters.rb` adds Liquid filters (`full_image_path`, `thumb_image_path`, `get_categories`, etc.), `seo.rb` maps `author_id` and default images for jekyll-seo-tag and jekyll-feed, `markdown_export.rb` writes a Markdown copy of each indexable page (`/path.md`) plus `/llms-full.txt` for AI tools
- **_layouts/base.html** — The shell (starfield, header, footer, cookie banner) around every page. Uses Vite Liquid tags: `{% vite_client_tag %}`, `{% vite_stylesheet_tag application %}` in head; `{% vite_javascript_tag application %}` (and `home` on the home layout) in `_includes/_scripts.html`. Other layouts: `home`, `page` (inner pages), `landing` (old service pages until rebuilt), `blog`, `post`. Shared blocks are in `_includes/blocks/`, home sections in `_includes/home/`, the shell in `_includes/site/`

## Key Data-Driven Content

- `_data/services.yml` — The services, in order. One list drives the home services section, the hero planets, the footer, the contact form's options and the "Need" line `main.rb` adds to contact emails
- `_data/projects.yml` — Portfolio projects; the home page picks its featured project and cases by `slug` (in `index.html` front matter)
- `_data/people.yml` — Team members (partners on the home page, author cards on posts)
- `_data/testimonials.yml` — Client quotes; quote bands look one up by `id`
- `_data/technologies.yml` — "The tools we build with" row on the home page (icon = SVG in `_includes/devicons/`, sources in `SOURCES.txt` there; color = hover brand color)

## Blog Posts

Create as `_posts/YYYY-MM-DD-slug.md` with YAML front matter (title, author, date, excerpt, draft).

## Deployment and CI

Heroku (app `velocitylabs`) auto-deploys `main` from GitHub, but only after CI passes ("Wait for CI to pass"). A commit with no checks stays pending and never deploys, so `.github/workflows/ci.yml` runs on every push: the dependency cooldown check, a full site build, and the app tests. `heroku rollback` restores the previous release if a deploy misbehaves.

- `.github/workflows/link-check.yml` runs `bin/check-links` monthly and keeps a `link-check` issue open while dead links exist
- `.github/workflows/uptime.yml` checks the live site every 15 minutes (home page, app server, http redirect, certificate expiry) and keeps an `uptime` issue open while it's down
- `.github/dependabot.yml` opens weekly update PRs with a 14-day cooldown; `package.json` "resolutions" pins need manual review
- `SecurityHeaders` in main.rb sets security headers and caching (hashed `/vite/assets/*` cached a year). HSTS starts at one day (added 2026-10-22); raise `HSTS` to `max-age=31536000` once https has been stable for a couple of weeks
- Always compare against `origin/main` (`git fetch` first) before branching or merging; local `main` can be stale. The default branch was `master` until 2026-10-30

## Environment Variables (production)

`SESSION_SECRET` (HMAC form token signing; sessions are disabled so the site sets no cookies of its own), `RESEND_API_KEY` (contact form email; optional `CONTACT_FORM_FROM` overrides the sender), `RECAPTCHA_SECRET_KEY`
