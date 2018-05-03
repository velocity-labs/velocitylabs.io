# Hi, we're Velocity Labs!

We're a Ruby on Rails and JavaScript web development company based in
Phoenix, AZ. You can find us on the web at
[velocitylabs.io](http://velocitylabs.io) or on twitter
[@velocitylabs](https://twitter.com/velocitylabs).

## How to run this bissh

For some reason, Foreman never seems to work right, do things manually for now.  CI

** Build It

jekyll build --trace

** Run It

bundle exec unicorn -p 5000 -c ./unicorn-dev.rb