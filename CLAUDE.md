# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Velocity Labs company website and blog. Hybrid architecture: Jekyll 3.9.0 generates static HTML into `_site/`, and Sinatra 2.0 (main.rb) serves those files while handling dynamic routes (contact form, Stripe payments). Runs on Ruby 3.0.6, deployed to Heroku via Puma.

## Development Commands

```bash
# Install dependencies
bundle install

# Local development (Foreman is unreliable — use two terminals instead)
jekyll build --watch          # Terminal 1: rebuilds _site/ on changes
bundle exec puma -t 5:5 -p 3000  # Terminal 2: serves at http://localhost:3000

# One-off build
jekyll build --trace
```

There is no test suite or linter configured.

## Architecture

```
Request → config.ru → main.rb (Sinatra) → serves _site/ static files
                                         → POST /contact-form (disabled)
                                         → POST /charge (Stripe payments)
                                         → legacy URL redirects
```

- **_config.yml** — Jekyll config: permalink structure (`/blog/:year/:month/:day/:title/`), pagination (10/page), asset pipeline settings, company metadata available as Liquid variables (`site.company.*`)
- **main.rb** — Sinatra app: catch-all route serves from `_site/`, plus dynamic endpoints
- **_plugins/** — Custom Jekyll plugins: `portfolio.rb` auto-generates portfolio pages from `_data/projects.yml`, `filters.rb` adds Liquid filters (`full_image_path`, `thumb_image_path`, `get_categories`, etc.)

## Key Data-Driven Content

- `_data/projects.yml` — Portfolio projects (auto-generates pages via portfolio plugin)
- `_data/people.yml` — Team members
- `_data/testimonials.yml` — Client testimonials

## Blog Posts

Create as `_posts/YYYY-MM-DD-slug.md` with YAML front matter (title, author, date, excerpt, draft).

## Environment Variables (production)

`SENDGRID_USERNAME`, `SENDGRID_PASSWORD`, `RECAPTCHA_SECRET_KEY`, `STRIPE_SECRET_KEY`, `NEW_RELIC_LICENSE_KEY`
