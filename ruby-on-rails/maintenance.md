---
contact:
  button: Click Here to Make Your Web App An Asset
excerpt:
  Your Rails application is an investment in your business.
  We'll help you keep that investment working for you.
heading: Keep Your Web Application Working For Your Business
layout: landing
lead:
  If your business has made a significant investment in getting a web application
  launched, yet lack in-house expertize to maintain it, we can help.
title: Ruby on Rails Application Maintenance
---

<section>
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <h2 class="text-center">
          <blockquote>
            "We launched months ago, but afterward, our developer moved on and we failed
            to maintain our application. Now we're having issues."
          </blockquote>
        </h2>

        <p>Does this sound familiar?</p>

        <p>
          By creating software, you've made a significant investment in your business.
          It might be your core business, something that compliments your business, or
          an internal tool to enable better business decisions. Whatever the case,
          launching is only the beginning. <i>It's the easy part.</i>
        </p>

        <p>
          As time goes on, users will discover bugs that you weren't aware existed,
          they'll use the system in ways you didn't intend, and problems will surface.
          Additionally, the software upon which your system is built will get out of date,
          exposing your business to security issues that can be exploited and placing your
          users' information at risk.
        </p>

        <p>
          Sadly, this is not uncommon. Many web applications live in a state of perpetual
          abandonment.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="dark">
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <h3 class="text-center">You Have Options</h3>

        <p>
          You want to keep your web application working for your business, so what do you do?
        </p>

        <p>
          <u>Have one of your existing employees maintain the application?</u>
          This is great if you already have developers, but it means shifting their time away
          from existing projects and deadlines. Most businesses aren't in a position to do this.
        </p>

        <p>
          <u>Hire a freelancer?</u>
          Most freelancers are expensive, with low availability, and typically look for larger,
          more lucrative projects.
        </p>

        <p>
          <u>Hire a full-time developer?</u>
          Even if you locate a good developer, is there enough work to keep them busy full time?
        </p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <h3 class="text-center">Let The Experts Maintain Your Application</h3>

        <p>
          <b>Your core business is not web application development</b>, <i>but
          ours is!</i> We offer a monthly, full-service application maintenance
          package that includes:
        </p>
      </div>

      <div id="benefits">
        <div class="col-lg-4">
          <h4>
            <i class="fa fa-tasks"></i>
            Unlimited Small Tasks
          </h4>

          <p>
            If there are other small (1 hour) tasks that need to be done to
            make your software work better on behalf of your business, then
            we'll take care of those.
          </p>
        </div>

        <div class="col-lg-4">
          <h4>
            <i class="fa fa-lock"></i>
            Security Patches
          </h4>

          <p>
            Chances are, your software is out-of-date, including the software
            that powers your servers. We'll take stock of your entire infrastructure,
            get things up-to-date, and periodically revisit to maintain the latest versions.
          </p>
        </div>

        <div class="col-lg-4">
          <h4>
            <i class="fa fa-heartbeat"></i>
            24/7 Application Monitoring
          </h4>

          <p>
            We use industry proven solutions to monitor the health
            of your application, to ensure you stay running and trouble free.
          </p>
        </div>

        <div class="col-lg-4">
          <h4>
            <i class="fa fa-database"></i>
            Automated Backups
          </h4>

          <p>
            Losing data can be catastrophic to a business. We'll make sure
            offsite data backups are regularly executed and can be restored.
          </p>
        </div>

        <div class="col-lg-4">
          <h4>
            <i class="fa fa-bug"></i>
            Error Detection &amp; Mitigation
          </h4>

          <p>
            We'll instrument your application with state-of-the-art error detection
            software to detect problems as they happen. We'll triage, test, and
            then fix to ensure the error doesn't happen again.
          </p>
        </div>

        <div class="col-lg-4">
          <h4>
            <i class="fa fa-area-chart"></i>
            Load Monitoring
          </h4>

          <p>
            Your web application is only useful if your users can reach it. Without
            the proper amount of resources allocated to your software, some users
            can get shut out, unable to reach the site. We'll monitor the load and
            adjust as necessary.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="dark testimonial">
  <div class="container">
    <div class="row">
      <div class="col-lg-10 col-lg-offset-1">
        {% assign testimonials = site.data.testimonials | where:"name","Andrew Hyde" %}
        {% for testimonial in testimonials limit: 1 %}
          <blockquote>
            <div class="row">
              <div class="col-sm-3 text-center">
                <img width="100" height="100" class="img-rounded" src="https://secure.gravatar.com/avatar/{{ testimonial.avatar }}?r=g&s=100">
              </div>
              <div class="col-sm-9">
                <p>&ldquo;{{ testimonial.quote }}&rdquo;</p>
                <p><small>{{ testimonial.name }} - <a href="{{ testimonial.link.href }}" target="_blank">{{ testimonial.link.text }}</a></small></p>
              </div>
            </div>
          </blockquote>
        {% endfor %}
      </div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <h3 class="text-center">How Much Does It Cost?</h3>

        <p>
          It depends on the size and complexity of your application.
        </p>

        <p>
          Get in touch to have us put together a quote for your app
        </p>
      </div>
    </div>
  </div>
</section>

<section class="dark testimonial">
  <div class="container">
    <div class="row">
      <div class="col-lg-10 col-lg-offset-1">
        {% assign testimonials = site.data.testimonials | where:"name","Linda Ruehlman" %}
        {% for testimonial in testimonials limit: 1 %}
          <blockquote>
            <div class="row">
              <div class="col-sm-3 text-center">
                <img width="100" height="100" class="img-rounded" src="https://secure.gravatar.com/avatar/{{ testimonial.avatar }}?r=g&s=100">
              </div>
              <div class="col-sm-9">
                <p>&ldquo;{{ testimonial.quote }}&rdquo;</p>
                <p><small>{{ testimonial.name }} - <a href="{{ testimonial.link.href }}" target="_blank">{{ testimonial.link.text }}</a></small></p>
              </div>
            </div>
          </blockquote>
        {% endfor %}
      </div>
    </div>
  </div>
</section>

<section id="contact">
  <div class="container">
    <!-- <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <h3 class="text-center">Are You Ready To Get Started?</h3>

        <div class="row">
          <p class="col-lg-10">
            We take payment by credit card, and offer a risk-free 30 day money back guarantee - if you're not ecstatic with how we're looking after your app, then we don't want your money.
          </p>

          <p class='col-lg-2 text-center'>
            {% asset guarantee.png class="img-responsive" alt='{{ site.company.name }} Guarantee' %}
          </p>
        </div>

        <div id="subscribe-cta" class="row">
          <div class="col-lg-12">
            <p class="text-center bold">
              Turn Your App From A Liability Into An Asset!
            </p>
          </div>

          <div class="col-lg-8 col-lg-offset-2">
            <form action="/charge" method="post" id="subscription-form" class="payment" novalidate>
              <div class='form-group'>
                <input class='form-control name' placeholder='Name' type="text" id="name" name="name">
              </div>

              <div class='form-group'>
                <input class='form-control company' placeholder='Company' type="text" id="company" name="company">
              </div>

              <div class='form-group'>
                <input class='form-control phone' placeholder='Phone Number' type="tel" id="phone" name="phone">
              </div>

              <div class='form-group'>
                <input class='form-control' value="Amount: $2500.00 / month" type="text" id="amount" name="amount" disabled>
              </div>

              <div class='form-group'>
                <button type="submit" id="purchase" class="btn btn-lg btn-success">
                  <i class="fa fa-lock"></i>&nbsp;&nbsp;Start Now
                </button>

                <div class="text-center">
                  <small>
                    By subscribing to this service, you are agreeing to our
                    <a href="/ruby-on-rails/maintenance/terms">Terms & Conditions</a>.
                  </small>
                </div>

                <script src="https://checkout.stripe.com/checkout.js"></script>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div> -->

    <div class="row">
      <div id="faq" class="col-lg-10 col-lg-offset-1">
        <h3 class=" text-center">Frequently Asked Questions</h3>

        <p>
          <strong>When you say "small tasks are included", what do you mean by "small tasks"?</strong>
          <span>This would include any dev or ops task that takes an hour or so to complete.  We know a big job when we see one and will let you know but in general, we're pretty flexible.</span></p>

        <p>
          <strong>Will you fix any crash/bug that happens?</strong>
          <span>Yep, or at least do our best to try depending on the complexity of the issue!</span>
        </p>

        <p>
          <strong>We have our own developer(s) in-house who are working on the app, is Velocity Labs Maintenance a good fit for us?</strong>
          <span>No, Velocity Lab's Maintenance service is designed for companies that had an outside developer or agency build their app and lack the inhouse expertise to make the most of it.</span>
        </p>

        <p>
          <strong>If I cancel, are the accounts and data you've collected transferrable to me?</strong>
          <span>They sure are! If you decide to move on, we will arrange to have all the accounts transferred to you. This will obviously involve you taking on the billing for the various accounts. If you choose to not continue with the accounts we will, to the best of our ability (and if the services support it), export your data and provide it to you.</span>
        </p>

        <p>
          <strong>Will you sign my NDA?</strong>
          <span>Maybe, we actually have a pretty awesome one ourselves, <a href="/downloads/VelocityLabsNDATemplate.pdf">Mutual Non-Disclosure</a></span>
        </p>

        <p>
          <strong>Do you have a discount for Non-Profits?</strong>
          <span>Yes, contact us for details.</span>
        </p>

        <p>
          <strong>Can you invoice me instead of having a credit card on file?</strong>
          <span>Yes, but only if you pre-pay for a year.</span>
        </p>

        <p>
          <strong>Will you sign our contract/work-for-hire/IP assignment, etc documents?</strong>
          <span>No, Velocity Lab's Maintenance service is bound by the following <a href="/ruby-on-rails/maintenance/terms">Terms & Conditions</a>, which we believe should cover your concerns in terms of who owns what, liability, etc. (If not, please feel free to contact us about the issue you're concerned about.)</span>
        </p>

      </div>
    </div>
  </div>
</section>

<section class="dark">
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <p>
          Still not sure?  Fill out the form below and we'll get back to you quickly to
          discuss your application. We've helped many companies and are
          confident we'll be able to help you, too.
        </p>

        <div id="contact-form-success"></div> <!-- For success/fail messages -->

        <div class='contact-form'>
          <form action="/contact-form" name="sentMessage" id="contactForm" role="form" novalidate data-form="Maintenance Form">
            <div class="row">
              <div class='form-group col-lg-8 col-lg-offset-2'>
                <input class='form-control name' placeholder='Name' type="text" id="name" name="name">
              </div>

              <div class="form-group col-lg-8 col-lg-offset-2">
                <input class='form-control email' placeholder='E-mail Address' type='email' id="email" name="email">
              </div>

              <input name="message" type="hidden" value="Application maintenance inquiry.">
              <input name="hp-input" placeholder="Do not fill" type="text">
            </div>

            <div class="row">
              <div id="contact-form-error"></div> <!-- For success/fail messages -->

              <div class="g-recaptcha" data-sitekey="6Le0D1EUAAAAAJlyECAhW72BPGxrg_EkM4oygnsF"></div>

              <footer class="submit-button">
                <button type="submit">Schedule Your Initial Appointment</button>
              </footer>
            </div>

          </form>
        </div>
      </div>

    </div>

  </div>
</section>
