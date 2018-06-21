---
author_id: 2
excerpt:
  Ruby 2.3 introduced a new method, which is very usful when dealing with deeply nested data in a hash or array. Learn how to add it to your toolbox!
layout: post
published: true
tags:
- ruby
title: "Easily Extract Deeply Nested Hash Data in Ruby"
---

<p class="lead">
  Dealing with deeply nested hashes can be a huge pain, but it doesn't need to be.
</p>

We've all been in the situation where you obtain data in a hash and need to extract some value. For example, you have the following hash, and need to get the innermost value:

{% highlight ruby %}
hash = { first: { second: { third: 'value' } } }
{% endhighlight %}

You could try:

{% highlight ruby %}
hash[:first][:second][:third] #=> 'value'
{% endhighlight %}

However, what happens when a `nil` is encountered along the way?

{% highlight ruby %}
hash = {}
hash[:first][:second][:third] #=> NoMethodError: undefined method `[]' for nil:NilClass
{% endhighlight %}

Throwing an exeption may not be what you want. If you have access to `ActiveSupport` you could use the `try` method:

{% highlight ruby %}
hash.try(:[], :first).try(:[], :second).try(:[], :third) #=> 'value'
{% endhighlight %}


<b>
  Now, I like the `try` method, but this is truly an abomination.
</b>

### Enter Hash#dig

As of Ruby 2.3.0, the `Hash#dig` method makes this so much easier. Take a look!

{% highlight ruby linenos %}
hash = { first: { second: { third: 'value' } } }
hash.dig(:first, :second, :third)                #=> 'value'

hash = { first: { second: nil } }
hash.dig(:first, :second, :third)                #=> nil
{% endhighlight %}

If a `nil` is encountered at any level, then `nil` is returned.

Note that this also works for
<a href="http://ruby-doc.org/core-2.5.1/Array.html#method-i-dig">
  `Array`
</a>and
<a href="http://ruby-doc.org/core-2.5.1/Struct.html#method-i-dig">
  `Struct`
</a>, although I'm not sure they are as useful as the `Hash` method:

{% highlight ruby %}
array = [[['value']]]
array.dig(0, 0, 0)    #=> 'value'
{% endhighlight %}
