---
author_id: 2
excerpt:
  We ran into a strange problem in our development environment
  recently that had us puzzled. Even though we'd turned off caching,
  we were still seeing cached results. What's going on?!
layout: post
published: true
tags:
- caching
- rails
title: "Preventing Rails.cache.fetch From Caching Content in Development"
---

In one of our applications, we have some controller code that looks
similar to:

{% highlight ruby linenos %}
@routes = Rails.cache.fetch 'routes', expires_in: 6.hours do
  Routes.all
end
{% endhighlight %}

Although we had [controller caching turned off][] in our development
configuration, we were still seeing cached results locally. So, when we
looked in the environment, it was confusing to see a setting for turning
caching off, but caching still taking place.

### Caching Gotcha

Turns out that interacting with `Rails.cache` directly will not check
if caching is disabled. Additionally, since the [default `cache_store` is
set to a file store][] in development, there is indeed a cache available.

In order to get around this, we needed to set the cache store to something
that would always result in a cache miss. [Enter `NullStore`][]:

```ruby
# Disable caching for Rails.cache.fetch
config.cache_store = [:null_store]
```

I almost feel like this should be the default for the development (and
possibly test) environment settings. If you desire caching in those
environments, then it seems like an exception and not the rule.

Anyway, if you've encountered this problem, hopefully this post helps!

[controller caching turned off]: http://guides.rubyonrails.org/caching_with_rails.html#basic-caching
[default `cache_store` is set to a file store]: http://guides.rubyonrails.org/caching_with_rails.html#activesupport-cache-filestore
[enter `NullStore`]: http://guides.rubyonrails.org/caching_with_rails.html#activesupport-cache-nullstore
