---
author_id: 3
excerpt:
  Dave shows how to scope a IDs to tenants, in a multitenant system, using CanCanCan
layout: post
published: true
tags:
- cancan
- cancancan
- multitenancy
- id
title: "Per tenant IDs, with CanCanCan"
---

### The problem

You have a [multitenant] system, where each tenant is only aware of the instances of a model which belong to them. Let's say our tenants are organizations, and each organization has many customers.

Let's assume we've already set up a customer controller. Here we're using [CanCanCan]'s [nested resources] to load an organization's customers:

{% highlight ruby linenos %}
class CustomersController < ApplicationController
  load_and_authorize_resource :organization
  load_and_authorize_resource :customer, :through => :organization
end
{% endhighlight %}

Now assume we have two organizations: Foo and Bar.

Foo comes along and creates two customers, which are assigned IDs `1` and `2`; next Bar creates a customer, which gets ID `3`; then Foo creates a third customer, which gets ID `4`.

There are a few undesirable properties with this system:

1. From an organization's perspective, the IDs are non-contiguous, so Foo sees customers `1`, `2`, and `4`, with no explanation where 3 went.
2. Any organization will be able to infer the total number of customers across all organizations.

The underlying issue with both of these properties is that it makes an organization aware of the existence of other organizations.

### Our solution

We had a few goals for our solution:

* Keep our existing [surrogate keys] i.e. the `id` column on `Customer`.
* Be general enough to apply not only to `Customer`, but to any per-organization model added in the future.

Based on this we used a solution in three parts:

1. We will use an `organization_object_counters` table to keep track of how many instances of each model an organization has.
  This table will offer functionality similar to [counter cache], but it will not decrement when an instance of a model is deleted (since we do not wish to reuse IDs).

1. Any model which is scoped to an organization such as `Customer` will gain an `id_within_organization` column.
  More generally we'll say that if a model `belongs_to :organization`, then it should have an `id_within_organization`.

1. When a new instance of such a model is persisted, we will set its `id_within_organization` to the current `organization_object_counters` for that organization and model.
  Once that is done we will increment the count ready for the next object.

### The code

Firstly we add the table to track our `next_id` for each pairing of organization and model.
Note we also add an index, which serves the dual purpose of improving performance and ensuring we only have one `next_id` for each pairing on organization and model.

{% highlight ruby linenos %}
  def change
    create_table :organization_object_counters do |t|
      t.references :organization, null: false
      t.string :klass, null: false
      t.integer :next_id, null: false, default: 1
    end

    add_index :organization_object_counters, [:organization_id, :klass],
      unique: true, name: 'index_organization_object_counters'
  end
{% endhighlight %}

Next we identify any model which `belongs_to :organization` and give it an `id_within_organization`.
Since we'll always be looking this up along with an `organization_id`, we add a [composite index] including both.

{% highlight ruby linenos %}
class AddIdWithOrganizationToCustomers < ActiveRecord::Migration
  def change
    add_column :customers, :id_within_organization, :integer, null: false

    add_index :customers, [:organization_id, :id_within_organization],
      unique: true, name: 'index_customers_on_id_within_organization'
  end
end
{% endhighlight %}

We will define an `ActiveSupport:Concern` to encapsulate the `id_within_organization` behavior described above.
If `create` fails for any reason, the `counter.increment!` will rollback because the `yield` will take place within a transaction.

{% highlight ruby linenos %}
module IdentifierWithinOrganization
  extend ActiveSupport::Concern

  included do
    around_create :set_id_within_organization

  private

    def set_id_within_organization
      counter = organization.object_counters.whereklass: self.class.base_class.name.first_or_create
      self.id_within_organization = counter.next_id
      yield

      counter.increment! :next_id
    end
  end
end
{% endhighlight %}

Finally we can `include IdentifierWithinOrganization` in our `Customer` model.

### Integrating cancan

Having an `id_within_organization` for each instance of a model is useful on its own,
but if you're already using [cancancan]'s `load_and_authorize_resource` method then switching to use it your paths is as easy as:

1. Have links use `id_within_organization` as their [param], by adding a default `to_param` implementation in the `IdentifierWithinOrganization` concern:

    {% highlight ruby %}
    def to_param
      id_within_organization.to_s
    end
    {% endhighlight %}

1. Use `id_within_organization` to load resources by specify a `find_by` option to `load_and_authorize_resource`:

    {% highlight ruby %}
    load_and_authorize_resource through: :current_organization, find_by: :id_within_organization
    {% endhighlight %}


[multitenant]: http://en.wikipedia.org/wiki/Multitenancy
[CanCanCan]: https://github.com/cancancommunity/cancancan
[nested resources]: https://github.com/ryanb/cancan/wiki/Nested-Resources
[surrogate keys]: https://en.wikipedia.org/wiki/Surrogate_key
[counter cache]: http://guides.rubyonrails.org/association_basics.html#counter-cache
[composite index]: https://en.wikipedia.org/wiki/Composite_index_database
[cancancan]: https://github.com/cancancommunity/cancancan
[param]: http://apidock.com/rails/ActiveRecord/Base/to_param.
