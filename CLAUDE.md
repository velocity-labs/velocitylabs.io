# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Velocity Labs company website and blog. Hybrid architecture: Jekyll 4.3 generates static HTML into `_site/`, and Sinatra 4.0 (main.rb) serves those files while handling dynamic routes (contact form). Runs on Ruby 3.3.10, deployed to Heroku via Puma 6. Assets compiled by Vite (via `jekyll-vite` gem).

## Development Commands

```bash
# Install dependencies
bundle install
yarn install  # Use yarn, not npm

# Package management — always use yarn (not npm)
yarn add <package>           # add a dependency
yarn add -D <package>        # add a dev dependency
yarn remove <package>        # remove a dependency

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

# Claude Code jekyll build (RVM doesn't auto-switch in subshells)
env -i HOME="$HOME" PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" LANG="en_US.UTF-8" LC_ALL="en_US.UTF-8" bash -l -c 'jekyll build --trace'
```

There is no test suite or linter configured.

## Architecture

```
Request → config.ru → main.rb (Sinatra) → serves _site/ static files
                                         → GET  /form-token (HMAC-signed CSRF token)
                                         → POST /contact-form (6-layer anti-spam)
                                         → legacy URL redirects
```

- **_config.yml** — Jekyll config: permalink structure (`/blog/:year/:month/:day/:title/`), pagination (10/page), Vite settings, company metadata available as Liquid variables (`site.company.*`)
- **main.rb** — Sinatra app: catch-all route serves from `_site/`, contact form with HMAC-signed CSRF tokens (stateless, not session-based — see `thoughts/shared/learnings/2026-02-25-csrf-session-race-condition.md`), Rack::Attack rate limiting
- **vite.config.js** / **config/vite.json** — Vite asset pipeline config; source in `_frontend/`, output to `public/vite/`
- **_plugins/** — Custom Jekyll plugins: `portfolio.rb` auto-generates portfolio pages from `_data/projects.yml`, `filters.rb` adds Liquid filters (`full_image_path`, `thumb_image_path`, `get_categories`, etc.)
- **_layouts/base.html** — Uses Vite Liquid tags: `{% vite_client_tag %}`, `{% vite_stylesheet_tag application %}` in head; `{% vite_javascript_tag application %}` in `_includes/_scripts.html`

## Key Data-Driven Content

- `_data/projects.yml` — Portfolio projects (auto-generates pages via portfolio plugin)
- `_data/people.yml` — Team members
- `_data/testimonials.yml` — Client testimonials

## Blog Posts

Create as `_posts/YYYY-MM-DD-slug.md` with YAML front matter (title, author, date, excerpt, draft).

## Environment Variables (production)

`SESSION_SECRET` (Sinatra sessions + HMAC form token signing), `SENDGRID_API_KEY`, `RECAPTCHA_SECRET_KEY`, `NEW_RELIC_LICENSE_KEY`
