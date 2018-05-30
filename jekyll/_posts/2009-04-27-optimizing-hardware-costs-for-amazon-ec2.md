---
author:
  name: Curtis Miller
  twitter: curtism
  gplus:
  bio: Co-founder & CEO
  image:
excerpt:
  Wondering what hardware you should provision for your application hosted
  in the cloud with Amazon EC2? We've got you covered with this handy optimal
  cost calculator.
image:
  url: http://farm1.static.flickr.com/67/170500174_d15d6c5541_m_d.jpg
  title: A happy application in the cloud.
  alt: A happy application in the cloud.
  attribution: Photo by Timothy K. Hamilton.
layout: post
title: Optimizing hardware costs for Amazon EC2
tags:
- technology
---

Velocity Labs believes heavily in the power of [cloud computing](http://en.wikipedia.org/wiki/Cloud_computing). Dynamically allocated hardware on a pay-for-what-you-need basis has tremendous advantages when it comes to helping clients manage and provision their clusters. The main advantage of cloud computing is dynamically growing, or shrinking, hardware as the needs of the application change.

Because of the dynamic nature of cloud computing, we don't need a guaranteed answer on hardware requirements up front. However, a client may want a ballpark figure in order to set aside the right amount of budget or let investors know the estimated operational cost. You could crunch the numbers yourself, but why would you do that when we've already automated the process for you?

### Determining optimal cost

We've constructed a very basic model for minimizing the cost of [Amazon EC2](http://aws.amazon.com/ec2/) hardware resources which satisfies a minimum number of [EC2 Compute Units](http://aws.amazon.com/ec2/instance-types/) and a given amount of RAM per process.

The technique uses [linear programming](http://en.wikipedia.org/wiki/Linear_programming) and the [GNU linear programming kit (GLPK)](http://en.wikipedia.org/wiki/GNU_Linear_Programming_Kit). **Note**: I'm a math geek that likes linear modeling, so if you're unfamiliar with either, I'd be happy to chat with you about them over lunch.

### Installation

First, install the GLPK. On Ubuntu execute the command

{% highlight shell %}
sudo aptitude install glpk
{% endhighlight %}

on Mac OS X execute the command

{% highlight shell %}
sudo port install glpk
{% endhighlight %}

Next, create the following as `cloud_cost.txt`.

{% highlight text linenos %}
## Amazon EC2 Cloud
## Optimizing cost per processor

# The set of instance types
set InstanceTypes;

# The costs per instance
param InstanceCosts{a in InstanceTypes};

# The compute units per instance
param InstanceCU{b in InstanceTypes};

# The amount of RAM per instance
param InstanceRAM{b in InstanceTypes};

# The number of compute units needed
param unitsNeeded;

# The amount of RAM required per instance of the application
param ramRequiredPerAppInstance;

# The quantity of each instance to purchase
var InstanceQuantity{q in InstanceTypes}, integer, >= 0;

# The objective function to minimize, in this case: cost
minimize cost: sum{i in InstanceTypes} InstanceCosts[i] * InstanceQuantity[i] * 720;

# Minimum total compute unit constraint
s.t.  supply: sum{d in InstanceTypes} InstanceCU[d] * InstanceQuantity[d] >= unitsNeeded;

# Maximum RAM per instance constraint
s.t.  ramrequired{d in InstanceTypes}: InstanceCU[d] * ramRequiredPerAppInstance * InstanceQuantity[d] <= InstanceRAM[d] * InstanceQuantity[d];

solve;

display{i in InstanceTypes}: InstanceQuantity[i];

data;

set InstanceTypes := Small Large XLarge HCPULarge HCPUXLarge;

param InstanceCosts :=  Small 0.1
                Large  0.4
                XLarge 0.8
                HCPULarge .2
                HCPUXLarge  .8;

param InstanceCU := Small 1
                    Large 4
                    XLarge 8
                    HCPULarge 5
                    HCPUXLarge 20;

param InstanceRAM := Small 1700
                    Large 7500
                    XLarge 15000
                    HCPULarge 1700
                    HCPUXLarge 7000;

# The number of compute units our cluster will need
param unitsNeeded := 500;

# The amount of RAM each process requires
param ramRequiredPerAppInstance := 125;

end;
{% endhighlight %}

### Computing the cost

The model requires the specification of two variables: total number of EC2 Compute Units and RAM. Both variables are specified at the bottom with `param unitsNeeded` and `param ramRequiredPerAppInstance` respectively. Change these params to reflect your particular situation. **Note**: A future article will explore capacity planning in more detail.

When you're ready, execute the solver using the following command:

{% highlight shell %}
glpsol --model cloud_cost.txt --output result.txt
{% endhighlight %}

### Analyzing the results

The program generates the result into a file called `result.txt`. Assuming 500 EC2 Compute Units with 125MB of RAM per process, the file will look something like the following:

{% highlight text linenos %}
Problem:  cloud_cost
Rows:    7
Columns:  5 (5 integer, 0 binary)
Non-zeros: 15
Status:   INTEGER OPTIMAL
Objective: cost = 14400 (MINimum)

 1 InstanceQuantity[Small]
                    *              0             0
 2 InstanceQuantity[Large]
                    *              0             0
 3 InstanceQuantity[XLarge]
                    *              0             0
 4 InstanceQuantity[HCPULarge]
                    *              0             0
 5 InstanceQuantity[HCPUXLarge]
                    *             25             0
{% endhighlight %}

The objective function was cost, so the optimal arrangement of hardware needed to get that computational power costs $14,400/month. The second column of the hardware arrangement indicates the number of instance needed. In this case we need 25 high-CPU, extra large instances.

**Did you find this useful? Let us know in the comments!**
