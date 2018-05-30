---
author:
  name: Curtis Miller
  twitter: curtism
  gplus:
  bio: Co-founder & CEO
  image:
excerpt:
  There are certain Ruby gems that we've found to be useful
  and include in every project we work on. Here are a few of
  the testing gems we feel are indispensible.
layout: post
published: true
tags:
- testing
title: "5 Indispensible Rails Testing Gems"
---

We work on a lot of different projects and are constantly shifting
between them. Whether we're starting an application from scratch
or picking up a 3 year old maintenance project, having a robust
and comprehensive test suite is essential for us to maintain our sanity
and ensure that changes are less likely to break something.

Here are a few of the testing gems that we add to every project we
work on. We find them extremely useful and think you will too.

### Should Matchers

We've been including the
[shoulda-matchers gem](https://github.com/thoughtbot/shoulda-matchers)
since the beginning and it has become an essential tool in our test suite.

This gem makes it simple to ensure that your model validations are
well defined, associations exist, controllers are doing what you think
they're doing, and more. For example:

{% highlight ruby linenos %}
describe User, type: :model do
  context 'associations' do
    it { should belong_to(:organization) }
  end

  context 'validations' do
    %w(first_name last_name email password phone).each do |a|
      it { should validate_presence_of(a.to_sym) }
    end
  end
end
{% endhighlight %}

### State Machine RSpec

This one is a little specific as it only works with
[RSpec](http://rspec.info/)
and the
[state_machine gem](https://github.com/pluginaweek/state_machine),
but we almost always have a state machine somewhere in our
applications. Golden hammer!

Simply put, the
[state\_machine\_rspec gem](https://github.com/modocache/state_machine_rspec)
helps ensure that you have the proper states defined in your state machine,
with conditions, as well as the transitions between states.

### Simplecov

While it's true that code coverage does not ensure a well tested
application, it is still a useful metric. The
[simplecov gem](https://github.com/colszowka/simplecov)
helps us understand where and when we've slacked off on testing in
a nicely consumable HTML format.

<a href="http://colszowka.github.com/simplecov/devise_result-0.5.3.png">
  <img src="http://colszowka.github.com/simplecov/devise_result-0.5.3.png" alt="SimpleCov coverage report" class="img-responsive">
</a>

Additionally, by setting the
[minimum coverage percentage](https://github.com/colszowka/simplecov#minimum-coverage),
you can have `simplecov` return a non-zero status if coverage falls
below a set limit. This is great for continuous integration and gives
you a heads up quickly that recently introduced code is probably not
tested well enough.

### Timecop

For applications that are time-sensitive, like public transit
applications, the
[timecop gem](https://github.com/travisjeffery/timecop)
is a must-have. This gem allows you to freeze time, jump back
to a specific point in time to begin execution, or accelerate the
passage of time.

At times, we've encountered intermittent problems with time-sensitive
tests (e.g., when we run our tests after 5pm and UTC has rolled over
to the next day). This gem has allowed us to mitigate these issues and
make our test suite more reliable. If you're dealing with time then give
this a try.

### Zonebie

Similar to our need for `timecop`, we added the
[zonebie gem](https://github.com/alindeman/zonebie)
to our testing toolbox this year after we encountered intermittent
test failures in timezone-sensitive tests.

Now, at the beginning of our test suite, we set a random timezone. This
helps us make a robust test suite when dealing with users in different
timezones. If you do encounter a problem in a specific timezone for a
test run, it's easy to rerun the tests in that timezone using the `ZONEBIE_TZ`
env var that is output at the beginning of each run. For example:

{% highlight shell linenos %}
[Zonebie] Setting timezone: ZONEBIE_TZ="Eastern Time (US & Canada)"
...

# Rerun tests in the same timezone
$ ZONEBIE_TZ="Eastern Time (US & Canada)" rspec spec
{% endhighlight %}

In an effort to make our own lives easier, we test like crazy. These
gems have all proven themselves over time and our test suite would be
sad without them.

Have any testing gems or nuggets of wisdom to share? Hit us up on
twitter
[@velocitylabs](https://twitter.com/velocitylabs),
we love to hear about it!

