# Ruby 3.3+ Upgrade & Full Gem Overhaul

## Overview

Upgrade velocitylabs.io from Ruby 3.0.6 to Ruby 3.3.x with a full gem overhaul. Replace the jekyll-assets (Sprockets) asset pipeline with Vite via jekyll-vite. Upgrade Jekyll 3.9 to 4.x, Sinatra 2 to 4, Puma 4 to 6. Deploy on Heroku stack heroku-24.

## Step 1: Ruby & Bundler

- Ruby 3.0.6 → 3.3.x (latest stable)
- Bundler 1.17.3 → 2.5.x

## Step 2: Core Framework Gems

| Gem | Current | Target |
|-----|---------|--------|
| jekyll | ~> 3.9.0 | ~> 4.3 |
| sinatra | ~> 2.0 | ~> 4.0 |
| puma | ~> 4.3.11 | ~> 6.4 |
| rack | (unpinned) | ~> 3.0 |
| rake | ~> 12.3 | ~> 13.0 |

## Step 3: Gems to Remove

| Gem | Reason |
|-----|--------|
| jekyll-assets (circleci fork) | Replaced by jekyll-vite |
| coffee-script | CoffeeScript files converted to plain JS |
| sass (Ruby Sass) | Replaced by dart-sass (npm) |
| uglifier | Replaced by Vite's built-in minification |
| sprockets | Replaced by Vite |
| newrelic_rpm | No longer needed |
| byebug | Replaced by debug gem |
| stripe | Temporarily disabled (code commented out, gem removed) |
| pony | Temporarily disabled (code commented out, gem removed) |
| rest-client | Only used by disabled contact form |
| maruku | Unmaintained; switching to kramdown |
| redcarpet | Jekyll 4 dropped built-in support; switching to kramdown |
| addressable | Was only a dependabot override; let Jekyll manage transitively |

## Step 4: Gems to Add

| Gem | Purpose |
|-----|--------|
| jekyll-vite | Vite integration for Jekyll |
| debug | Replaces byebug (Ruby 3.2+ standard) |

## Step 5: Remaining Gems (Update)

| Gem | Current | Target |
|-----|---------|--------|
| kramdown | >= 2.3.0 | ~> 2.4 |
| nokogiri | >= 1.13.5 | ~> 1.16 |
| jekyll-paginate | (unpinned) | ~> 1.1 |
| jekyll-sitemap | (unpinned) | ~> 1.4 |
| jekyll-minify-html | (unpinned) | keep (verify Jekyll 4 compat, drop if breaks) |
| foreman | (dev, unpinned) | keep |

## Step 6: Asset Pipeline Migration (jekyll-assets → Vite)

### 6a: Add Node.js tooling

Create `package.json` with:
- vite
- sass (dart-sass)
- vite-plugin-ruby

### 6b: Convert CoffeeScript → Plain JS

12 frontend CoffeeScript files → plain JS (keep jQuery patterns, no ES6+ modernization):
- carousels.js.coffee → carousels.js
- contact.js.coffee → contact.js
- conversions.coffee → conversions.js
- devicons.js.coffee → devicons.js
- homepage.js.coffee → homepage.js
- links.js.coffee → links.js
- mobile.js.coffee → mobile.js
- nav_fix.js.coffee → nav_fix.js
- navbar.js.coffee → navbar.js
- stripe.js.coffee.erb → stripe.js (comment out, inline ENV var as placeholder)
- team.js.coffee → team.js
- tooltips.js.coffee → tooltips.js
- main.js.coffee → entrypoints/application.js (entry point)

### 6c: Restructure SCSS

- Replace Sprockets `//= require_tree` directives in main.scss with Sass `@use`/@forward
- Replace `asset_path()` calls in theme.css.scss (8 instances) with Vite alias `url()` references
- Replace `asset-url()` calls in 2 frontend SCSS files with Vite alias `url()` references
- Move assets from `_assets/` to `_frontend/` (jekyll-vite convention)

### 6d: Update Liquid Templates

- Replace `{% asset main.scss %}` → `{% vite_stylesheet_tag application %}`
- Replace `{% asset main.js.coffee %}` → `{% vite_javascript_tag application %}`
- Add `{% vite_client_tag %}` for dev mode HMR
- Replace `{% asset hero.jpg @path %}` → direct path references
- Replace `{% asset logo.svg %}` → plain `<img>` tags with path from Vite manifest or public dir
- Replace `{% asset 'project_path' @path %}` → resolve from public dir or Vite manifest
- Replace `assets['logo-text.png'].digest_path` → Vite manifest lookup or public dir
- Replace `{% asset guarantee.png %}` and other image tags in posts/pages
- Remove `_plugins/_ext.rb` (the `require "jekyll-assets"` loader)

### 6e: Vite Configuration

- Create `vite.config.js` with resolve aliases for `@images` → `_frontend/images`
- Create `config/vite.json` with sourceCodeDir, entrypointsDir, publicOutputDir
- Update `Procfile.dev` for Vite dev server + Jekyll watch

## Step 7: Jekyll Config Updates (_config.yml)

- Switch `markdown: redcarpet` → `markdown: kramdown`
- Remove `maruku:` config block
- Remove `redcarpet:` config block
- Remove `assets:` config block (jekyll-assets specific)
- Add `jekyll-vite` to plugins list
- Review `exclude:` list for new files (package.json, node_modules, vite.config.js, etc.)

## Step 8: Sinatra Updates (main.rb)

- Comment out Stripe integration (require, config, /charge route, error handler) with `# TODO: re-enable`
- Comment out Pony integration (require, config) with `# TODO: re-enable`
- Comment out /contact-form route with `# TODO: re-enable`
- Replace `require 'byebug'` → `require 'debug'`
- Remove rest-client require
- Verify Sinatra 4 / Rack 3 compatibility for remaining routes

## Step 9: Heroku Deployment

### Buildpacks (in order):
1. heroku/nodejs (ADD)
2. heroku/ruby (KEEP)
3. heroku-buildpack-static (REMOVE — redundant)

### Config vars:
- Set `NPM_CONFIG_INCLUDE=dev`
- Remove `NEW_RELIC_LICENSE_KEY`
- Keep `STRIPE_SECRET_KEY`, `SENDGRID_*`, `RECAPTCHA_SECRET_KEY` for later

### Addons:
- Remove `newrelic:wayne`
- Keep `sendgrid:starter`

### Deploy sequence:
1. All code changes committed and tested locally
2. `heroku stack:set heroku-24 --app velocitylabs`
3. `heroku buildpacks:clear --app velocitylabs`
4. `heroku buildpacks:add heroku/nodejs --app velocitylabs`
5. `heroku buildpacks:add heroku/ruby --app velocitylabs`
6. `heroku config:set NPM_CONFIG_INCLUDE=dev --app velocitylabs`
7. `git push heroku master`

## Implementation Order

1. Steps 1-5: Ruby, bundler, gem updates (get bundle install working)
2. Step 6a: Add Node tooling (package.json, vite config)
3. Step 6b: Convert CoffeeScript → JS
4. Steps 6c-6d: Restructure SCSS + update Liquid templates
5. Step 6e: Vite configuration
6. Step 7: Jekyll config updates
7. Step 8: Sinatra updates
8. Local verification: `jekyll build` + `puma` serving correctly
9. Step 9: Heroku deployment

## Risks

- **jekyll-minify-html** may not be compatible with Jekyll 4 — have a fallback plan to drop it
- **Dynamic project image paths** (`{% asset '{{full_path}}' @path %}`) need careful migration — the custom Liquid filter in `_plugins/filters.rb` builds paths that jekyll-assets resolves; with Vite, project images may need to go in the public dir instead
- **Sinatra 4 / Rack 3** — verify `Rack::Deflater` and `rack-protection` still work as expected
- **heroku-buildpack-static** removal — confirm Sinatra handles all static file serving without it
