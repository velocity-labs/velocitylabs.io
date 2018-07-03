---
author_id: 1
excerpt:
  If you deal with multiple projects over time, it's easy to forget about the leftover log files that may be eating up your disk space.
layout: post
published: true
tags:
- bash
- unix
title: Save disk space by truncating dev log files
---

### The problem

Ever wonder where all that disk space is going?

{% asset low-disk.png class="img-responsive" %}

Over the course of a year we touch alot of projects here at Velocity Labs. It's not uncommon for one of us to touch 5+ different code bases in that time.

When we're actively working on a project we're running it in development mode, running test specs, etc. All that contributes to dev and test log files growing larger and larger. Then we move on to the next project and forget about those files.

<div class="wp-terminal">
  $ ls -lah /Users/supairish/Projects/best/log/development.log
-rw-r--r--+ 1 supairish  staff   2.6G May 25 16:58 /Users/supairish/Projects/best/log/development.log<br/>
</div>

2 gigs!?

<i>Is there a quick way to clean these up?</i>

### The solution

Well there happens to be a <b>truncate unix command</b> we could use to shorten up these log files. The only problem is that <b>truncate</b> isn't available on OSX.

But we can get the same functionality via Homebrew + coreutils.

<div class="wp-terminal">
  $ brew install coreutils <br>
  ==> Installing coreutils
  ==> Downloading https://homebrew.bintray.com/bottles/coreutils-8.29.high_sierra.bottle.tar.gz
  ######################################################################## 100.0%
  ==> Pouring coreutils-8.29.high_sierra.bottle.tar.gz
  ==> Caveats
  All commands have been installed with the prefix 'g'.

  If you really need to use these commands with their normal names, you
  can add a "gnubin" directory to your PATH from your bashrc like:

      PATH="/usr/local/opt/coreutils/libexec/gnubin:$PATH"

  Additionally, you can access their man pages with normal names if you add
  the "gnuman" directory to your MANPATH from your bashrc as well:

      MANPATH="/usr/local/opt/coreutils/libexec/gnuman:$MANPATH"

  ==> Summary
  🍺  /usr/local/Cellar/coreutils/8.29: 430 files, 8.9MB
</div>

Now we can find log files and pass them to truncate setting them to 0 in size.

<i>One thing of note is that all coreutils commands are prefixed with a <b>'g'</b>, so we'll be using <b>gtruncate</b></i>

<div class="wp-terminal">
  $ find ~/Projects/ -name development.log | xargs gtruncate -s0 <br/>
</div>

The -s flag of gtruncate allows us to set the file to any size after truncation.

So let's check one of our logs and see what size it's at now.

<div class="wp-terminal">
  $ ls -lah /Users/supairish/Projects/best/log//development.log
-rw-r--r--+ 1 supairish  staff     0B Jun  8 16:47 /Users/supairish/Projects/best/log//development.log
</div>

Oh yeah, nice and empty, go forth and reclaim that space from your dev machines!
