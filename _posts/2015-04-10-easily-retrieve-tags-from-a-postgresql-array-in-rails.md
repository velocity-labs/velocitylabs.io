---
author:
  name: Curtis Miller
  twitter: curtism
  gplus:
  bio: Co-founder & CEO
  image:
excerpt:
  How to select array values easily, and efficiently, from
  a PostgreSQL array type in Rails.
layout: post
published: true
tags:
- postgresql
- rails 4
title: "Easily retrieve tags from a PostgreSQL array in Rails"
---

PostgreSQL array type support makes it easy to have an
array of tags on a Rails model.

        create_table :posts do |t|
          t.string :tags, array: true, default: []
        end

Now that you're storing some tags on your `Post`
(hand-waving...), you might want to grab an array of
unique tags entered on posts.

You might start down the path of selecting the post tags,
then collecting them, something we see often in Rails code.

        Post.select('tags').collect(&:tags).flatten.uniq

You have an array of the tags, but that's kinda ugly. There's
a lot of Ruby manipulation going on after the tags are retrieved.
The [`pluck` method](http://apidock.com/rails/ActiveRecord/Calculations/pluck)
can help with this, by giving us just the attributes we're looking for.

        Post.pluck('tags').flatten.uniq

Same result as before, but much nicer. We still have that pesky
`flatten.uniq` hanging off the end, though. PostgreSQL has
[an array function called `unnest`](http://www.postgresql.org/docs/9.2/static/functions-array.html#ARRAY-FUNCTIONS-TABLE) that will give us the same
result as our Ruby `flatten` method and `distinct` will ensure
they're unique.

        Post.pluck('distinct unnest(tags)')

There we go, offload some of those operations onto the database.
This should be much more efficient than Ruby, so we ran some
simple benchmarks against 10000 posts, with 20382 tags (183 unique).

                 user     system      total        real

        old: 0.240000   0.000000   0.240000 (  0.245174)
        new: 0.000000   0.000000   0.000000 (  0.010110)

Looks much better!

