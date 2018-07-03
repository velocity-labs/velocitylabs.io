---
author_id: 3
excerpt:
  We show that a commonly held assumption about the pessimistic requirement operator isn't necessarily always true, specifically when dealing with prerelease gem versions
layout: post
published: true
tags:
- semver
- gems
- bundler
title: "Pessimistic Prerelease Peculiarities"
---


### The assumption

There seems to be an [assumption][] that the pessimistic requirement operator (aka `~>`, aka the *twiddle-wakka*) is short hand for a pairing of `>=` and `<`.

e.g: in a `Gemfile` we see `~> 1.1` as equivalent to: `'>= 1.1' '< 2.0'`.

That seems reasonable, but be warned, it breaks down when [prerelease][] gems are involved.


### The code

Firstly, here's a method to check a gem's version against some requirements:

{% highlight ruby linenos %}
def check(version, *requirements)
  requirements.map { |v| Gem::Requirement.new(v).satisfied_by? Gem::Version.new(version) }.all?
end
{% endhighlight %}

We can use this to check if `~> 1.2` does behave indeed the same as `'>= 1.1' '< 2.0'`. Let's check both a good version (which meets the requirements) and a bad version (which does not):

{% highlight ruby %}
> good_version = '1.8'
> [check(good_version, '~> 1.1'), check(good_version, '>= 1.1', '< 2.0')
 => [true, true]
{% endhighlight %}

{% highlight ruby %}
> bad_version = '2.0'
> [check(bad_version, '~> 1.1'), check(bad_version, '>= 1.1', '< 2.0')]
 => [false, false]
{% endhighlight %}

So far, so good.


### The peculiarity with prerelease

However, this equivalence doesn't hold when the version being checked is a [prerelease][]:

{% highlight ruby %}
> pre_version = '2.0.pre'
> [check(pre_version, '~> 1.1'), check(pre_version, '>= 1.1', '< 2.0')]
 => [false, true]
{% endhighlight %}

We can see that the pessimistic operator doesn't think this prerelease gem meets the requirement, but our supposedly 'equivalent' version does. What gives?


It happens because a *less than 2.0* requirement is *true* if the version is a prerelease of 2.0:

{% highlight ruby %}
> check '2.0.pre', '< 2.0'
 => true
{% endhighlight %}

However a *pessimistic 1.1* requirement is false if the version is a prerelease of 2.0:

{% highlight ruby %}
> check '2.0.pre', '~> 1.1'
 => false
{% endhighlight %}

### Making sense of it

Rephrasing those two versions as questions, it's clear that both these answers make sense:

* Should a prerelease of N be considered a lower version N? **Yes.**
* Should a prerelease of N+1 be pessimistically compatible with version N? **No.**

It is in fact our initial assumption that `~> 1.1` is equivalent to: `'>= 1.1', '< 2.0'` that is incorrect.

So it seems in the absence of anyway to express *"less than version 2.0 and any prerelease thereof"* that the pessimistic operator is more than just a convenient short hand, it's the only correct way to specify a requirement pessimistically.


[assumption]: https://robots.thoughtbot.com/rubys-pessimistic-operator
[prerelease]: https://guides.rubygems.org/patterns/#prerelease-gems
