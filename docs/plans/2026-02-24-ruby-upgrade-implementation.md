# Ruby 3.3+ Upgrade & Full Gem Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade velocitylabs.io from Ruby 3.0.6 / Jekyll 3.9 / Sinatra 2 to Ruby 3.3.x / Jekyll 4.x / Sinatra 4.x, replacing the Sprockets-based jekyll-assets pipeline with Vite.

**Architecture:** Jekyll 4 generates static HTML into `_site/`. Vite compiles SCSS and JS at build time via `jekyll-vite` gem. Sinatra 4 serves the pre-built static files and handles legacy redirects. Deployed to Heroku (heroku-24 stack) with nodejs + ruby buildpacks.

**Tech Stack:** Ruby 3.3.x, Jekyll 4.3, Sinatra 4.0, Puma 6.x, Vite 6.x, dart-sass (npm), jekyll-vite gem

**Design doc:** `docs/plans/2026-02-24-ruby-upgrade-design.md`

---

## Task 1: Update Ruby Version & Bundler

**Files:**
- Modify: `Gemfile:3`

**Step 1: Update Ruby version in Gemfile**

Change line 3 from:
```ruby
ruby '3.0.6'
```
to:
```ruby
ruby '3.3.7'
```

**Step 2: Verify Ruby 3.3.x is installed locally**

Run: `ruby -v`
Expected: `ruby 3.3.x` — if not, install via `rbenv install 3.3.7 && rbenv local 3.3.7` (or equivalent for your Ruby version manager).

**Step 3: Update Bundler**

Run: `gem install bundler`
Expected: Bundler 2.5.x+ installed.

**Step 4: Commit**

```bash
git add Gemfile
git commit -m "chore: bump Ruby to 3.3.7"
```

---

## Task 2: Overhaul Gemfile — Remove, Add, Update Gems

**Files:**
- Modify: `Gemfile`
- Delete: `Gemfile.lock` (will be regenerated)

**Step 1: Rewrite Gemfile**

Replace the entire `Gemfile` with:

```ruby
source 'https://rubygems.org'

ruby '3.3.7'

gem 'jekyll',             '~> 4.3'
gem 'jekyll-vite'
gem 'jekyll-minify-html'
gem 'jekyll-paginate',    '~> 1.1'
gem 'jekyll-sitemap',     '~> 1.4'
gem 'kramdown',           '~> 2.4'
gem 'kramdown-parser-gfm'
gem 'nokogiri',           '~> 1.16'
gem 'puma',               '~> 6.4'
gem 'rack',               '~> 3.0'
gem 'rake',               '~> 13.0'
gem 'sinatra',            '~> 4.0'

group :development do
  gem 'debug'
  gem 'foreman'
end
```

**Step 2: Delete Gemfile.lock**

Run: `rm Gemfile.lock`

**Step 3: Run bundle install**

Run: `bundle install`
Expected: All gems resolve and install. If `jekyll-minify-html` fails with Jekyll 4, remove it from Gemfile and re-run.

**Step 4: Commit**

```bash
git add Gemfile Gemfile.lock
git commit -m "chore: overhaul Gemfile for Ruby 3.3 / Jekyll 4 / Sinatra 4"
```

---

## Task 3: Update Sinatra App (main.rb)

**Files:**
- Modify: `main.rb`
- Modify: `config.ru`

**Step 1: Update main.rb**

Replace entire contents of `main.rb` with:

```ruby
require 'rubygems'
require 'bundler'

Bundler.require :default, (ENV["RACK_ENV"] || "development").to_sym

require 'debug' if settings.development?

# configure :production do
#   require 'newrelic_rpm'
# end

# TODO: re-enable Pony email integration
# require 'pony'
# configure :production do
#   Pony.options = {
#     via: :smtp,
#     via_options: {
#       address:              'smtp.sendgrid.net',
#       port:                 '587',
#       domain:               'velocitylabs.io',
#       user_name:            ENV['SENDGRID_USERNAME'],
#       password:             ENV['SENDGRID_PASSWORD'],
#       authentication:       :plain,
#       enable_starttls_auto: true
#     }
#   }
# end

## Global Settings ##
set :public_folder, Proc.new { File.join(root, "_site") }
set :protection, except: :frame_options

# TODO: re-enable Stripe integration
# require 'stripe'
# Stripe.api_key = ENV['STRIPE_SECRET_KEY']

IP_BLACKLIST = %w()

## Error Handling
not_found do
  last_modified File.mtime("_site/404/index.html")
  File.read("_site/404/index.html")
end

## GET requests ##
get '/' do
  if params[:ref]
    match = params[:ref].match(/(.*?)\/(.*)/)
    if match && match[2]
      redirect "/#{match[2]}?ref=#{match[1]}"
    end
  end

  last_modified File.mtime("_site/index.html")
  File.read("_site/index.html")
end

# Catch All
get "/*" do |title|
  if request.user_agent == '<?php system("id"); ?>' or IP_BLACKLIST.include?(request.ip)
    ''
  else
    begin
      last_modified File.mtime("_site/#{title}/index.html")
      File.read("_site/#{title}/index.html")
    rescue
      if params[:ref] =~ /flatterline/i
        last_modified File.mtime("_site/index.html")
        File.read("_site/index.html")

      elsif params[:ref] =~ /burstdev/i
        case title
          when /^contact/
            redirect '/#contact'
          when /^(projects|pages)/
            redirect '/portfolio'
          else
            last_modified File.mtime("_site/index.html")
            File.read("_site/index.html")
        end

      else
        raise Sinatra::NotFound
      end
    end
  end
end

## POST requests ##

# TODO: re-enable Stripe charge route
# post '/charge' do
#   puts params
#   customer = Stripe::Customer.create(
#     email: params[:stripeEmail],
#     card: params[:stripeToken],
#     metadata: {
#       phone: params[:phone],
#       company: params[:company],
#       name: params[:name]
#     }
#   )
#
#   customer.subscriptions.create plan: "maintenance-2"
#
#   redirect '/ruby-on-rails/maintenance/thank-you'
# end
#
# error Stripe::CardError do
#   env['sinatra.error'].message
# end

# TODO: re-enable contact form route
# post '/contact-form/?' do
#   recaptcha_raw_response = RestClient.post 'https://www.google.com/recaptcha/api/siteverify', secret: ENV['RECAPTCHA_SECRET_KEY'], response: params['g-recaptcha-response'], remoteip: request.ip
#   recaptcha = JSON.parse recaptcha_raw_response
#
#   if recaptcha["success"] == true
#     htmlBody = %Q{
#       <div style="font-family:Helvetica;">
#         <h2>Contact Information</h2>
#         <table style="font-size:11pt;">
#           <tbody>
#             <tr><td width="25%">Name:</td><td>#{params[:name]}</td></tr>
#             <tr><td>Email:</td><td>#{params[:email]}</td></tr>
#             <tr><td>Phone:</td><td>#{params[:phone]}</td></tr>
#           </tbody>
#         </table>
#         <h2>Message</h2>
#         <p style="font-size:11pt;">#{params[:message]}</p>
#       </div>
#     }
#
#     textBody = %Q{
#       Contact Information
#       ====================
#       Name:  #{params[:name]}
#       Email: #{params[:email]}
#       Phone: #{params[:phone]}
#
#       Message
#       ====================
#       #{params[:message]}
#     }
#
#     begin
#       res = Pony.mail(
#         to:        "Velocity Labs <contact@velocitylabs.io>",
#         from:      "contact@velocitylabs.io",
#         reply_to:  "#{params[:name]} <#{params[:email]}>",
#         subject:   "Project contact form from #{params[:name]}",
#         body:      textBody,
#         html_body: htmlBody
#       )
#       response = res ? { status: :success } : { status: :failure }
#     rescue
#       response = { status: :failure }
#     end
#   else
#     response = { status: :failure }
#   end
#
#   content_type :json
#   status 200
#   body response.to_json
# end
```

**Step 2: Update config.ru**

Replace entire contents of `config.ru` with:

```ruby
require 'rubygems'
require 'sinatra'

require File.expand_path '../main.rb', __FILE__

use Rack::Deflater
run Sinatra::Application
```

(This is unchanged — `Rack::Deflater` works with Rack 3.)

**Step 3: Commit**

```bash
git add main.rb config.ru
git commit -m "chore: update Sinatra app for v4, comment out Stripe/Pony/contact"
```

---

## Task 4: Update Jekyll Config (_config.yml)

**Files:**
- Modify: `_config.yml`

**Step 1: Switch markdown engine from redcarpet to kramdown**

In `_config.yml`, change line 29:
```yaml
markdown:     kramdown
```

**Step 2: Remove maruku config block**

Delete lines 55-60 (the `maruku:` block):
```yaml
maruku:
  use_tex:    false
  use_divs:   false
  png_engine: blahtex
  png_dir:    images/latex
  png_url:    /images/latex
  fenced_code_blocks: true
```

**Step 3: Remove redcarpet config block**

Delete lines 66-67:
```yaml
redcarpet:
  extensions: []
```

**Step 4: Remove jekyll-assets config block**

Delete lines 85-94 (the `assets:` block):
```yaml
## jekyll-assets: ##
# see more at https://github.com/ixti/jekyll-assets
assets:
  sources:
    - _assets/javascripts
    - _assets/stylesheets
    - _assets/images
  gzip: [ text/css, application/javascript ]
  precompile: [ logo-text.png ]
  # debug: true
```

**Step 5: Add jekyll-vite to plugins list**

Change the plugins block to:
```yaml
plugins:
  - jekyll-paginate
  - jekyll-sitemap
  - jekyll-vite
```

**Step 6: Update exclude list**

Add Node.js / Vite files to the exclude list:
```yaml
exclude:      ['config.ru', 'Gemfile', 'Gemfile.lock', 'vendor', 'README.md', 'Rakefile', 'Procfile.dev', 'unicorn-dev.rb', 'LICENSE', 'CNAME', 'node_modules', 'package.json', 'package-lock.json', 'vite.config.js', 'docs']
```

**Step 7: Remove relative_permalinks (deprecated in Jekyll 4)**

Delete line 43:
```yaml
relative_permalinks: false
```

**Step 8: Commit**

```bash
git add _config.yml
git commit -m "chore: update Jekyll config for v4, switch to kramdown, add jekyll-vite"
```

---

## Task 5: Remove _plugins/_ext.rb

**Files:**
- Delete: `_plugins/_ext.rb`
- Modify: `_plugins/filters.rb` (update image path to new location)

**Step 1: Delete _ext.rb**

Run: `rm _plugins/_ext.rb`

The `jekyll-minify-html` plugin will be loaded via the `plugins:` list in `_config.yml` if it's compatible with Jekyll 4. If not, we'll drop it later.

**Step 2: Update filters.rb image path**

In `_plugins/filters.rb`, update the `full_image_path` method to reference the new image location. Change line 17 from:
```ruby
File.exist?(File.expand_path("./_assets/images/projects/#{title}/full.png")) ? "projects/#{title}/full.png" : thumb_image_path(title)
```
to:
```ruby
File.exist?(File.expand_path("./_frontend/images/projects/#{title}/full.png")) ? "projects/#{title}/full.png" : thumb_image_path(title)
```

**Step 3: Commit**

```bash
git rm _plugins/_ext.rb
git add _plugins/filters.rb
git commit -m "chore: remove jekyll-assets ext plugin, update image paths in filters"
```

---

## Task 6: Set Up Vite & Node.js Tooling

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `config/vite.json`
- Create: `.node-version`

**Step 1: Create .node-version**

```
22
```

**Step 2: Create package.json**

```json
{
  "name": "velocitylabs-io",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "^6.0",
    "vite-plugin-ruby": "^5.1",
    "sass": "^1.83"
  }
}
```

**Step 3: Install Node dependencies**

Run: `npm install`

**Step 4: Create vite.config.js**

```javascript
import { defineConfig } from 'vite';
import ViteRuby from 'vite-plugin-ruby';
import path from 'path';

export default defineConfig({
  plugins: [ViteRuby()],
  resolve: {
    alias: {
      '@images': path.resolve(__dirname, '_frontend/images')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
});
```

**Step 5: Create config/vite.json**

```json
{
  "all": {
    "sourceCodeDir": "_frontend",
    "watchAdditionalPaths": ["_includes/**/*", "_layouts/**/*", "_posts/**/*"]
  },
  "development": {
    "autoBuild": true,
    "publicOutputDir": "vite-dev",
    "port": 3036
  },
  "production": {
    "publicOutputDir": "vite"
  }
}
```

**Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js config/vite.json .node-version
git commit -m "chore: add Vite tooling with vite-plugin-ruby and dart-sass"
```

---

## Task 7: Move Assets to _frontend/ Directory

**Files:**
- Move: `_assets/` → `_frontend/`
- Create: `_frontend/entrypoints/application.js` (Vite entry point)

**Step 1: Move the _assets directory to _frontend**

Run:
```bash
mv _assets _frontend
```

**Step 2: Create entrypoints directory**

Run:
```bash
mkdir -p _frontend/entrypoints
```

**Step 3: Create the Vite entry point**

Create `_frontend/entrypoints/application.js`:

```javascript
// Styles
import '../stylesheets/main.scss';

// Vendor JS
import '../javascripts/vendor/modernizr.custom.js';
import '../javascripts/vendor/classie.js';
import '../javascripts/vendor/cbpAnimatedHeader.min.js';
import '../javascripts/vendor/imagesloaded.pkgd.min.js';
import '../javascripts/vendor/isotope.min.js';
import '../javascripts/vendor/jquery.flexslider-min.js';
import '../javascripts/vendor/jquery.magnific-popup.min.js';
import '../javascripts/vendor/jquery.mb.YTPlayer.js';
import '../javascripts/vendor/jquery.nav.js';
import '../javascripts/vendor/jquery.scrollTo.js';
import '../javascripts/vendor/jquery.validate.min.js';
import '../javascripts/vendor/less-1.6.1.min.js';
import '../javascripts/vendor/owl.carousel.min.js';
import '../javascripts/vendor/scrollReveal.js';
import '../javascripts/vendor/boostrap-select.min.js';

// App JS
import '../javascripts/custom.js';
import '../javascripts/frontend/carousels.js';
import '../javascripts/frontend/contact.js';
import '../javascripts/frontend/conversions.js';
import '../javascripts/frontend/devicons.js';
import '../javascripts/frontend/homepage.js';
import '../javascripts/frontend/links.js';
import '../javascripts/frontend/mobile.js';
import '../javascripts/frontend/nav_fix.js';
import '../javascripts/frontend/navbar.js';
// import '../javascripts/frontend/stripe.js'; // TODO: re-enable
import '../javascripts/frontend/team.js';
import '../javascripts/frontend/tooltips.js';
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: move _assets to _frontend, create Vite entrypoint"
```

---

## Task 8: Convert CoffeeScript to Plain JS

**Files:**
- Create: `_frontend/javascripts/frontend/carousels.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/contact.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/conversions.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/devicons.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/homepage.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/links.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/mobile.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/nav_fix.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/navbar.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/stripe.js` (replace .coffee.erb)
- Create: `_frontend/javascripts/frontend/team.js` (replace .coffee)
- Create: `_frontend/javascripts/frontend/tooltips.js` (replace .coffee)
- Delete: all `.coffee` and `.coffee.erb` files
- Delete: `_frontend/javascripts/main.js.coffee`

**Step 1: Convert carousels.js.coffee → carousels.js**

```javascript
$(function() {
  var height = 300;
  var items = $('#quote-carousel .item');

  for (var i = 0; i < items.length; i++) {
    height = Math.max(height, $(items[i]).height() + 50);
  }

  for (var j = 0; j < items.length; j++) {
    $(items[j]).height(height);
  }
});
```

**Step 2: Convert contact.js.coffee → contact.js**

```javascript
$(function() {
  $("#subscription-form").validate({
    errorElement: "span",
    errorClass: "help-block",
    errorPlacement: function(error, element) {
      return;
    },
    highlight: function(element) {
      $(element).closest(".form-group").addClass("has-error");
    },
    rules: {
      name: "required",
      company: "required",
      phone: "required"
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-error');
    }
  });

  $('.stripe-button-el').on('click', function() {
    if ($("#subscription-form").valid()) {
      $('#contact-form-error').html("");
      return true;
    } else {
      $('#contact-form-error').html("Please fill out form completely");
      return false;
    }
  });

  $("#contactForm").validate({
    errorElement: "span",
    errorClass: "help-block",
    errorPlacement: function(error, element) {
      return;
    },
    highlight: function(element) {
      $(element).closest(".form-group").addClass("has-error");
    },
    rules: {
      name: "required",
      email: {
        email: true,
        required: true
      },
      message: "required"
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler: function(form) {
      var $submitBtn = $(form).find('button[type=submit]');
      var originalButtonText = $submitBtn.html();

      $submitBtn.prop('disabled', true).html('Submitting...');

      var textBody = "Contact Information\n" +
        "====================\n\n" +
        "Name:  " + $(form).find('input#name').val() + "\n" +
        "Email: " + $(form).find('input#email').val() + "\n" +
        "Phone: " + $(form).find('input#phone').val() + "\n\n" +
        "Message\n" +
        "====================\n\n" +
        $(form).find('textarea#message').val();

      $.ajax({
        type: "POST",
        url: $(form).prop('action'),
        data: $(form).serializeArray(),
        success: function(data, status, xhr) {
          if (data.status == "success") {
            $('.contact-form').slideToggle(300, function() {
              $('.contact-button').toggleClass('active');

              $('#contact-form-success').html(
                "<div class='alert alert-success'>" +
                  "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
                  "<strong>Thanks! Your message has been sent. We'll get back with you shortly.</strong>" +
                "</div>"
              );

              $('#contact-form-error').html("");
              $('#contactForm').trigger("reset");
              ga('send', 'event', $(form).data('form'), 'Submitted');
            });
          } else {
            $('#contact-form-error').html(
              "<div class='alert alert-danger'>" +
                "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
                "<strong>Sorry, there was a problem submitting the form.</strong> " +
                "Please check your entries and try again. If the problem persists, please email us directly at " +
                "<a target='_blank' href='mailto:contact@velocitylabs.io?body=" + encodeURIComponent(textBody) + "'>contact@velocitylabs.io</a>." +
              "</div>"
            );
          }
        },
        error: function(xhr, status, error) {
          $('#contact-form-error').html(
            "<div class='alert alert-danger'>" +
              "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
              "<strong>Sorry, it seems the mail server is not responding...</strong> " +
              "Could you please send an email directly to " +
              "<a target='_blank' href='mailto:contact@velocitylabs.io?body=" + encodeURIComponent(textBody) + "'>contact@velocitylabs.io</a>?" +
            "</div>"
          );
        },
        complete: function() {
          $('#contactForm button[type=submit]').prop('disabled', false).html(originalButtonText);
        }
      });
    }
  });
});
```

**Step 3: Convert conversions.coffee → conversions.js**

```javascript
$(function() {
  $('[data-form="Maintenance Form"]').on('submit', function() {
    if ($(this).valid()) {
      gtag('event', 'conversion', {
        'send_to': 'AW-960263497/EFULCKirioUBEMnq8ckD'
      });
    }
  });

  $('[data-form="Upgrade Form"]').on('submit', function() {
    if ($(this).valid()) {
      gtag('event', 'conversion', {
        'send_to': 'AW-960263497/8nV2CPTngoUBEMnq8ckD'
      });
    }
  });

  $('[data-form="Code Audit Form"]').on('submit', function() {
    if ($(this).valid()) {
      gtag('event', 'conversion', {
        'send_to': 'AW-960263497/evf8CKS8ioUBEMnq8ckD'
      });
    }
  });

  $('#subscription-form').on('submit', function() {
    if ($(this).valid()) {
      gtag('event', 'conversion', {
        'send_to': 'AW-960263497/TQnhCJOg9IQBEMnq8ckD',
        'transaction_id': $(this).find('input[name=phone]').val()
      });
    }
  });
});
```

**Step 4: Convert devicons.js.coffee → devicons.js**

```javascript
$(function() {
  $('[class*=" devicon-"], [class^=devicon-]').on('mouseover', function() {
    $(this).addClass('colored');
  }).on('mouseout', function() {
    $(this).removeClass('colored');
  });
});
```

**Step 5: Convert homepage.js.coffee → homepage.js**

```javascript
function resize() {
  var screenWidth = $(window).width() + "px";
  var screenHeight = $(window).height() + "px";

  $("#intro, #intro .item, #intro-video, #intro-video .item").css({
    width: screenWidth,
    height: screenHeight
  });
}

function urlParam(target) {
  var url = window.location.search.substring(1);
  var params = url.split('&');

  for (var i = 0; i < params.length; i++) {
    var values = params[i].split('=');
    if (values[0] == target) {
      return values[1];
    }
  }

  return '';
}

$(function() {
  resize();
  $(window).resize(resize);

  var urlMatch = urlParam('ref');
  if (document.referrer.match(/flatterline/i) || urlMatch.match(/flatterline/i)) {
    $('#intro .hero h2').before('<div class="alert alert-success"><div style="text-transform: uppercase;">Welcome Flatterline visitor!</div>We recently merged with another awesome development company and became Velocity Labs!</div>');
  }
});
```

**Step 6: Convert links.js.coffee → links.js**

```javascript
$(function() {
  $('.post-body a').each(function() {
    var a = new RegExp(window.location.host + '|mailto:|tel:');
    if (!a.test(this.href)) {
      $(this).attr('rel', $.trim([$(this).attr('rel'), 'external'].join(' ')));

      $(this).click(function(event) {
        window.open(this.href, '_blank');
        return false;
      });
    }
  });
});
```

**Step 7: Convert mobile.js.coffee → mobile.js**

```javascript
$(function() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    $('.selectpicker').selectpicker('mobile');
  }
});
```

**Step 8: Convert nav_fix.js.coffee → nav_fix.js**

```javascript
$(function() {
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (window.location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && window.location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

      if (target.length) {
        $('html, body').animate({ scrollTop: target.offset().top }, 1000);
        return false;
      }
    }
  });
});
```

**Step 9: Convert navbar.js.coffee → navbar.js**

```javascript
$(function() {
  $('.navbar-wrapper').addClass('cbp-af-header');

  if (!$('.device-xs').is(':visible')) {
    if ($('.navbar-small').is(':visible')) {
      $('.navbar-small').addClass('cbp-af-header-shrink');
    } else {
      cbpAnimatedHeader();
    }
  }
});
```

**Step 10: Convert stripe.js.coffee.erb → stripe.js (commented out)**

```javascript
// TODO: re-enable Stripe Checkout integration
// Requires STRIPE_PUBLISHABLE_KEY to be injected at build time
//
// $(function() {
//   if (typeof StripeCheckout !== 'undefined') {
//     var handler = StripeCheckout.configure({
//       key: 'STRIPE_PUBLISHABLE_KEY_PLACEHOLDER',
//       locale: 'auto',
//       name: "Velocity Labs",
//       description: "Monthly App Maintenance",
//       'panel-label': "Subscribe",
//       token: function(token) {
//         $('#subscription-form').append($('<input>', {type: 'hidden', value: token.id, name: 'stripeToken'}));
//         $('#subscription-form').append($('<input>', {type: 'hidden', value: token.email, name: 'stripeEmail'}));
//         $('#subscription-form').submit();
//       }
//     });
//
//     $('#purchase').on('click', function(e) {
//       if ($('#subscription-form').valid()) {
//         handler.open({
//           name: 'Velocity Labs',
//           description: 'Monthly App Maintenance'
//         });
//       } else {
//         alert("Please fill out form completely");
//       }
//       e.preventDefault();
//     });
//   }
// });
```

**Step 11: Convert team.js.coffee → team.js**

```javascript
$(function() {
  $('#team .owl-carousel').owlCarousel({
    lazyLoad: true,
    items: Math.min($('#team .owl-carousel .item').length, 3),
    theme: "owl-theme-main"
  });
});
```

**Step 12: Convert tooltips.js.coffee → tooltips.js**

```javascript
$(function() {
  $('.tooltips').tooltip();
  $('.popovers').popover({
    container: 'body',
    placement: 'auto',
    trigger: 'hover'
  });
});
```

**Step 13: Delete old CoffeeScript files and main.js.coffee**

Run:
```bash
rm _frontend/javascripts/frontend/carousels.js.coffee
rm _frontend/javascripts/frontend/contact.js.coffee
rm _frontend/javascripts/frontend/conversions.coffee
rm _frontend/javascripts/frontend/devicons.js.coffee
rm _frontend/javascripts/frontend/homepage.js.coffee
rm _frontend/javascripts/frontend/links.js.coffee
rm _frontend/javascripts/frontend/mobile.js.coffee
rm _frontend/javascripts/frontend/nav_fix.js.coffee
rm _frontend/javascripts/frontend/navbar.js.coffee
rm _frontend/javascripts/frontend/stripe.js.coffee.erb
rm _frontend/javascripts/frontend/team.js.coffee
rm _frontend/javascripts/frontend/tooltips.js.coffee
rm _frontend/javascripts/main.js.coffee
```

**Step 14: Commit**

```bash
git add -A
git commit -m "chore: convert all CoffeeScript to plain JS"
```

---

## Task 9: Restructure SCSS for Vite

**Files:**
- Modify: `_frontend/stylesheets/main.scss`
- Modify: `_frontend/stylesheets/theme/theme.css.scss`
- Modify: `_frontend/stylesheets/frontend/_maintenance.css.scss`
- Modify: `_frontend/stylesheets/frontend/_wp-terminal.css.scss`

**Step 1: Rewrite main.scss — replace Sprockets directives with Sass @use**

Replace entire contents of `_frontend/stylesheets/main.scss` with:

```scss
// Theme
@import "theme/theme.css";

// Vendor
@import "vendor/magnific-popup";
@import "vendor/bootstrap-select.min";

// Base (top-level partials)
@import "bootstrap";
@import "animate";
@import "base";
@import "article";
@import "icons";
@import "nav";
@import "footer";
@import "responsive";

// Frontend
@import "frontend/blog.css";
@import "frontend/clutch.css";
@import "frontend/contact.css";
@import "frontend/devicon";
@import "frontend/home.css";
@import "frontend/inner.css";
@import "frontend/landing.css";
@import "frontend/layout.css";
@import "frontend/maintenance.css";
@import "frontend/portfolio.css";
@import "frontend/syntax";
@import "frontend/team.css";
@import "frontend/terms.css";
@import "frontend/theme_override.css";
@import "frontend/upgrades.css";
@import "frontend/wp-terminal.css";
```

Note: The `.css.scss` extensions need the `.css` part in the import path. Verify exact filenames and adjust import paths to match. Some files may be `_blog.css.scss` — the import would be `"frontend/blog.css"` (Sass resolves underscored partials automatically).

**Step 2: Replace asset_path() in theme.css.scss**

In `_frontend/stylesheets/theme/theme.css.scss`, replace all 8 `asset_path()` calls with relative `url()` references to the images directory:

Line 537: `background: url(asset_path('theme/cross.png'))` → `background: url('../../images/theme/cross.png')`
Line 681: `cursor: url(asset_path('theme/grabbing.png'))` → `cursor: url('../../images/theme/grabbing.png')`
Line 818: `background: url(asset_path('theme/AjaxLoader.gif'))` → `background: url('../../images/theme/AjaxLoader.gif')`
Line 1306: `background: url(asset_path('theme/ie-overlay.png'))` → `background: url('../../images/theme/ie-overlay.png')`
Line 1470: `background: url(asset_path("theme/raster.png"))` → `background: url('../../images/theme/raster.png')`
Line 1473: `background: url(asset_path("theme/raster@2x.png"))` → `background: url('../../images/theme/raster@2x.png')`
Line 1515: `background: url(asset_path('theme/bg-content1.jpg'))` → `background: url('../../images/theme/bg-content1.jpg')`
Line 1522: `background: url(asset_path('theme/bg-content1.jpg'))` → `background: url('../../images/theme/bg-content1.jpg')`

Vite automatically resolves relative `url()` references, fingerprints the images, and rewrites the paths in the output CSS.

**Step 3: Replace asset-url() in frontend SCSS files**

In `_frontend/stylesheets/frontend/_maintenance.css.scss`, line 3:
```scss
background: transparent url('../../images/credit-cards.png') no-repeat 100% 50%;
```

In `_frontend/stylesheets/frontend/_wp-terminal.css.scss`, line 4:
```scss
background-image: url('../../images/terminal.png');
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: restructure SCSS for Vite, replace Sprockets/asset helpers"
```

---

## Task 10: Update Liquid Templates — Replace jekyll-assets Tags

**Files:**
- Modify: `_layouts/base.html`
- Modify: `_includes/_scripts.html`
- Modify: `_layouts/home.html`
- Modify: `_layouts/blog.html`
- Modify: `_layouts/landing.html`
- Modify: `_includes/_nav_inner.html`
- Modify: `_includes/_footer.html`
- Modify: `_includes/sections/_portfolio.html`
- Modify: `portfolio.md`
- Modify: `ruby-on-rails/maintenance.md`
- Modify: `ruby-on-rails/upgrades.md`
- Modify: `_posts/2018-07-02-phoenix-web-development-company.md`
- Modify: `_posts/2018-06-18-how-to-save-disk-space-prune-those-dev-project-log-files.md`

For images that were processed through jekyll-assets (hero.jpg, logo.svg, project images, guarantee.png, etc.), we'll move them to a `public/` directory that Vite copies as-is (no fingerprinting needed for these — they're referenced by templates, not CSS). Images referenced from SCSS (`url()`) stay in `_frontend/images/` where Vite processes them.

**Step 1: Create public images directory and copy template-referenced images**

Run:
```bash
mkdir -p public/images/projects
cp _frontend/images/hero.jpg public/images/
cp _frontend/images/logo.svg public/images/
cp _frontend/images/logo-text.png public/images/
cp _frontend/images/guarantee.png public/images/
cp _frontend/images/ruby.png public/images/
cp _frontend/images/low-disk.png public/images/
cp _frontend/images/velocity-railsconf-2017.png public/images/
cp -r _frontend/images/projects/ public/images/projects/
```

**Step 2: Update _layouts/base.html**

Line 13 — replace `assets['logo-text.png'].digest_path` with static path:
```html
<meta property="og:image" content="{{ site.url }}/images/logo-text.png"/>
```

Line 35 — replace `{% asset main.scss %}` with Vite tag:
```html
{% vite_stylesheet_tag application %}
```

Add `{% vite_client_tag %}` right before the stylesheet tag (needed for Vite dev server HMR):
```html
{% vite_client_tag %}
{% vite_stylesheet_tag application %}
```

**Step 3: Update _includes/_scripts.html**

Replace line 4 `{% asset main.js.coffee %}` with:
```html
{% vite_javascript_tag application %}
```

**Step 4: Update _layouts/home.html**

Line 10 — replace `{% asset hero.jpg @path alt='{{ site.company.name }} Cover' %}` with:
```
/images/hero.jpg
```

So the full line becomes:
```html
<div class="item hero" style="background: url('/images/hero.jpg') no-repeat;">
```

**Step 5: Update _layouts/blog.html**

Line 8 — same hero.jpg replacement:
```html
<div class="item hero" style="background: url('/images/hero.jpg') no-repeat;">
```

**Step 6: Update _layouts/landing.html**

Line 11 — same hero.jpg replacement:
```html
<div class="item hero" style="background: url('/images/hero.jpg') no-repeat;">
```

**Step 7: Update _includes/_nav_inner.html**

Line 13 — replace `{% asset logo.svg alt='{{ site.company.name }}' %}` with:
```html
<img src="/images/logo.svg" alt="{{ site.company.name }}">
```

**Step 8: Update _includes/_footer.html**

Line 6 — replace `{% asset logo.svg itemprop='logo' alt='{{ site.company.name }}' %}` with:
```html
<img src="/images/logo.svg" itemprop="logo" alt="{{ site.company.name }}">
```

**Step 9: Update _includes/sections/_portfolio.html**

Lines 21-22 — replace `{% asset '{{full_path}}' @path %}` and `{% asset '{{thumb_path}}' @path %}` with direct paths:
```html
<a href="/images/{{ full_path }}" rel="nofollow" class="popup-gallery popovers" title="{{ project.title }}" data-html="true" data-content="{{ project.description | xml_escape }}">
  <img src="/images/{{ thumb_path }}" alt="{{ project.title }}" class="img-responsive center-block">
</a>
```

**Step 10: Update portfolio.md**

Lines 28-29 — same pattern as _portfolio.html:
```html
<a href="/images/{{ full_path }}" rel="nofollow" class="popup-gallery popovers" title="{{ project.title }}" data-html="true" data-content="{{ project.description | xml_escape }}<br /&gt;<b&gt;Type: {{ project.categories | array_to_sentence_string }}</b&gt;">
  <img src="/images/{{ thumb_path }}" alt="{{ project.title }}" class="img-responsive center-block">
</a>
```

**Step 11: Update ruby-on-rails/maintenance.md**

Line 254 — replace `{% asset guarantee.png class="img-responsive" alt='{{ site.company.name }} Guarantee' %}` with:
```html
<img src="/images/guarantee.png" class="img-responsive" alt="{{ site.company.name }} Guarantee">
```

**Step 12: Update ruby-on-rails/upgrades.md**

Line 225 — same guarantee.png replacement:
```html
<img src="/images/guarantee.png" class="img-responsive" alt="{{ site.company.name }} Guarantee">
```

**Step 13: Update blog post 2018-07-02-phoenix-web-development-company.md**

Line 25 — replace `{% asset ruby.png class="img-responsive" alt='Velocity Labs at RailsConf 2017', width=120 %}` with:
```html
<img src="/images/ruby.png" class="img-responsive" alt="Velocity Labs at RailsConf 2017" width="120">
```

Line 54 — replace `{% asset velocity-railsconf-2017.png class="img-responsive" alt='Velocity Labs at RailsConf 2017' %}` with:
```html
<img src="/images/velocity-railsconf-2017.png" class="img-responsive" alt="Velocity Labs at RailsConf 2017">
```

**Step 14: Update blog post 2018-06-18-how-to-save-disk-space-prune-those-dev-project-log-files.md**

Line 17 — replace `{% asset low-disk.png class="img-responsive" alt='Low Disk Space' %}` with:
```html
<img src="/images/low-disk.png" class="img-responsive" alt="Low Disk Space">
```

**Step 15: Update _plugins/filters.rb — update path check**

The `full_image_path` method checks for file existence. With images now in `public/images/`, update line 17:
```ruby
File.exist?(File.expand_path("./public/images/projects/#{title}/full.png")) ? "projects/#{title}/full.png" : thumb_image_path(title)
```

(This replaces the change made in Task 5 Step 2.)

**Step 16: Commit**

```bash
git add -A
git commit -m "chore: replace all jekyll-assets Liquid tags with Vite tags and static paths"
```

---

## Task 11: Update Procfile.dev for Vite Dev Server

**Files:**
- Modify: `Procfile.dev`

**Step 1: Update Procfile.dev**

Replace entire contents with:
```
vite: npx vite
jekyll: bundle exec jekyll build --watch
web: bundle exec puma -t 5:5 -p ${PORT:-3000} -e ${RACK_ENV:-development}
```

**Step 2: Commit**

```bash
git add Procfile.dev
git commit -m "chore: add Vite dev server to Procfile.dev"
```

---

## Task 12: Add .gitignore Entries

**Files:**
- Modify or create: `.gitignore`

**Step 1: Add Node.js and Vite entries to .gitignore**

Append to `.gitignore` (or create it):
```
node_modules/
public/vite/
public/vite-dev/
```

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add node_modules and Vite output to .gitignore"
```

---

## Task 13: Local Verification

**Step 1: Verify bundle install works**

Run: `bundle install`
Expected: Clean install, no errors.

**Step 2: Verify npm install works**

Run: `npm install`
Expected: Clean install, no errors.

**Step 3: Build with Jekyll + Vite**

Run: `JEKYLL_ENV=production bundle exec jekyll build --trace`
Expected: Build completes. `_site/` is populated. Vite assets compiled to `public/vite/` (or wherever configured). Check for any warnings about missing assets or Jekyll 4 deprecations.

**Step 4: If jekyll-minify-html fails**

If you see errors from `jekyll-minify-html`, remove it:
- Remove from `Gemfile`
- Remove from `_config.yml` plugins list
- Run `bundle install` again
- Retry the build

**Step 5: Start the server and verify**

Run: `bundle exec puma -t 5:5 -p 3000`

Then open http://localhost:3000 and verify:
- Homepage loads with styling and hero background image
- Navigation logo appears
- Portfolio section shows project thumbnails
- Blog page loads
- Footer renders correctly
- JavaScript works (scroll animations, isotope grid, tooltips)
- No 404s in browser console for CSS/JS/images

**Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: adjustments from local verification"
```

---

## Task 14: Heroku Deployment

**Step 1: Set Heroku stack**

Run: `heroku stack:set heroku-24 --app velocitylabs`

**Step 2: Update buildpacks**

Run:
```bash
heroku buildpacks:clear --app velocitylabs
heroku buildpacks:add heroku/nodejs --app velocitylabs
heroku buildpacks:add heroku/ruby --app velocitylabs
```

**Step 3: Set config vars**

Run: `heroku config:set NPM_CONFIG_INCLUDE=dev --app velocitylabs`

**Step 4: Remove New Relic addon**

Run: `heroku addons:destroy newrelic:wayne --app velocitylabs --confirm velocitylabs`

**Step 5: Deploy**

Run: `git push heroku master`

Monitor build output for:
- Node.js buildpack installs npm dependencies
- Ruby buildpack installs gems
- Vite build runs during asset precompilation
- Puma starts successfully

**Step 6: Verify production site**

Open https://velocitylabs.io and verify same checks as Task 13 Step 5.

**Step 7: If rollback needed**

Run: `heroku rollback --app velocitylabs`
This reverts both the code deploy and the stack change.
