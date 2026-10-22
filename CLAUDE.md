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
- **vite.config.mjs** / **config/vite.json** — Vite asset pipeline config; source in `_frontend/`, output to `public/vite/`
- **_plugins/** — Custom Jekyll plugins: `portfolio.rb` auto-generates portfolio pages from `_data/projects.yml`, `filters.rb` adds Liquid filters (`full_image_path`, `thumb_image_path`, `get_categories`, etc.), `seo.rb` maps `author_id` and default images for jekyll-seo-tag and jekyll-feed, `markdown_export.rb` writes a Markdown copy of each indexable page (`/path.md`) plus `/llms-full.txt` for AI tools
- **_layouts/base.html** — Uses Vite Liquid tags: `{% vite_client_tag %}`, `{% vite_stylesheet_tag application %}` in head; `{% vite_javascript_tag application %}` in `_includes/_scripts.html`

## Key Data-Driven Content

- `_data/projects.yml` — Portfolio projects (auto-generates pages via portfolio plugin)
- `_data/people.yml` — Team members
- `_data/testimonials.yml` — Client testimonials
- `_data/technologies.yml` — Technologies section on the home page (Devicon class per entry)

## Blog Posts

Create as `_posts/YYYY-MM-DD-slug.md` with YAML front matter (title, author, date, excerpt, draft).

## Deployment and CI

Heroku (app `velocitylabs`) auto-deploys `master` from GitHub, but only after CI passes ("Wait for CI to pass"). A commit with no checks stays pending and never deploys, so `.github/workflows/ci.yml` runs on every push: the dependency cooldown check and a full site build. `heroku rollback` restores the previous release if a deploy misbehaves.

- `.github/workflows/link-check.yml` runs `bin/check-links` monthly and keeps a `link-check` issue open while dead links exist
- `.github/dependabot.yml` opens weekly update PRs with a 14-day cooldown; `package.json` "resolutions" pins need manual review
- Always compare against `origin/master` (`git fetch` first) before branching or merging; local `master` can be stale

## Environment Variables (production)

`SESSION_SECRET` (HMAC form token signing; sessions are disabled so the site sets no cookies of its own), `RESEND_API_KEY` (contact form email; optional `CONTACT_FORM_FROM` overrides the sender), `RECAPTCHA_SECRET_KEY`
