---
contact:
  button: Click Here to Schedule Your FREE Audit
excerpt:
  Your Rails application is an investment in your business.
  We'll help you keep that investment working for you.
heading: An up-to-date application is a happy and secure application.
layout: landing
lead:
  You keep your personal devices up-to-date with the latest software, why not your business software?
title: Ruby on Rails Application Upgrades
---

<section>
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <h2 class="text-center">
          <blockquote>
            "We haven't added any new features in a while and nothing seems broken…"
          </blockquote>
        </h2>

        <p>You might be asking, why should I bother?</p>

        <p>
          It's a good question to ask, and there are multiple reasons. In this case, what you don't know could, in fact, kill your business.
        </p>

        <h3>Security</h3>
        <p>
          Just because you're not actively working on an app doesn't mean hackers aren't continuously searching for new vulnerabilities. As <b>security vulnerabilities</b> are discovered, in the software your business is built on, fixes are released. By staying up-to-date, or as closely as possible, you mitigate risk to your business and your customers' data.
        </p>

        <p>
          All applications today are built upon many small libraries, some from 3rd party sources. While there are known bugs in pretty much every library, they range in severity from insignificant annoyances to critical issues. By keeping the libraries your application uses up-to-date, you benefit from the community's effort to keep these libraries as stable and secure as possible.
        </p>

        <h3>Performance</h3>
        <p>
          Speed! Amazon calculated that 1 second longer in page load costs them $1.6 billion annually.  And with so many big websites using Ruby on Rails there is a large demand for <b>increased speed</b>. This results in many updates to the latest versions of Ruby, Rails, and other libraries to improve performance. Staying up-to-date allows you to take advantage of these new performance improvements, so your app continues to handle your growing customer base.
        </p>

        <h3>Code Rot</h3>
        <p>
          The older your software versions, the harder it becomes to upgrade to newer versions later.  The community moves forward and your competition moves forward, but you don't. Each version you put off upgrading makes it harder for future developers, costing you more time and money down the road, and putting you even further behind.
        </p>

        <p>
          Think of your application like a custom racecar. If you want to win you'll need fresh tires, a tuned engine, and topped off gas tank.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="dark">
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <h3 class="text-center">End-to-End Ruby on Rails Code Upgrades</h3>
        <p>
          The team at Velocity Labs has been working with Rails since 2007. This has provided us with many opportunities to upgrade both large and small applications over the years. We've seen a lot of applications and we have the experience to handle your upgrade.
        </p>

        <p>
          As we go through the code, here's what you can expect us to
          look at:
        </p>

        <div class="row">
          <div class="col-lg-6">
            <ul class="checklist" >
              <li>
                <i class="fa fa-check"></i>
                Your Ruby version
              </li>

              <li>
                <i class="fa fa-check"></i>
                Your Rails version
              </li>

              <li>
                <i class="fa fa-check"></i>
                Your 3rd party libraries
              </li>
            </ul>
          </div>

          <div class="col-lg-6">
            <ul class="checklist" >
              <li>
                <i class="fa fa-check"></i>
                Your application's server environment
              </li>

              <li>
                <i class="fa fa-check"></i>
                Your JavaScript libraries
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <h3 class="text-center">How Much Does It Cost To Upgrade?</h3>

        <p>
          Every application is different and we'll need to look at your application's code to have a better idea of the effort required. However, most Rails applications can be upgraded within a full week of development work.
        </p>

        <p>
          The answers to the following questions may affect the time it takes to upgrade your application:
        </p>

        <ul class="complexity-considerations">
          <li>How far behind is your version of Ruby? Rails? Other libraries?</li>
          <li>How much test coverage exists? Are there any tests?</li>
          <li>How complex is your application?</li>
          <li>How many dependencies does your application have?</li>
        </ul>

      </div>
    </div>
  </div>
</section>

<section class="dark" id="contact">
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-lg-offset-2">
        <h3 class="text-center">Are You Ready To Get Started?</h3>

        <p>
          Fill out the form below and we'll get back to you quickly to discuss your application. We've helped many companies and are confident we'll be able to help you, too.
        </p>

        <div id="contact-form-success"></div> <!-- For success/fail messages -->

        <div class='contact-form'>
          <form action="/contact-form" name="sentMessage" id="contactForm" role="form" novalidate data-form="Upgrade Form">
            <div class="row">
              <div class='form-group col-lg-8 col-lg-offset-2'>
                <input class='form-control name' placeholder='Name' type="text" id="name" name="name">
              </div>

              <div class="form-group col-lg-8 col-lg-offset-2">
                <input class='form-control email' placeholder='E-mail Address' type='email' id="email" name="email">
              </div>

              <input name="message" type="hidden" value="Application upgrade inquiry.">
              <input name="hp-input" placeholder="Do not fill" type="text">
            </div>

            <div class="row">
              <div id="contact-form-error"></div> <!-- For success/fail messages -->

              <div class="g-recaptcha" data-sitekey="6Le0D1EUAAAAAJlyECAhW72BPGxrg_EkM4oygnsF"></div>

              <footer class="submit-button">
                <button type="submit">Schedule Your FREE Audit Today</button>
              </footer>
            </div>

          </form>
        </div>

        <hr />
      </div>
    </div>
  </div>
</section>

<section class="dark testimonial">
  <div class="container">
    <div class="row">
      <div class="col-lg-10 col-lg-offset-1">
        {% assign testimonials = site.data.testimonials | where:"name","Robert Wallace" %}
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
        <h3 class="text-center">Web Application Maintenance</h3>

        <p>
          Don't want to be stuck in this situation again?
        </p>

        <div class="row">
          <div class="col-lg-10">
            <p>
              <i>Then you might be interested in our
              <a href="/ruby-on-rails/maintenance">Ruby on Rails Application Maintenance</a>
              service, which includes monitoring and upgrades to keep your app in tip-top shape.</i>
            </p>
          </div>

          <div class='col-lg-2 text-center'>
            {% asset guarantee.png class="img-responsive" alt='{{ site.company.name }} Guarantee' %}
          </div>
        </div>

      </div>
    </div>
  </div>
</section>
