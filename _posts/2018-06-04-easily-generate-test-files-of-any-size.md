---
author:
  name: Chris Irish
  twitter: supairish
  gplus:
  bio: Dude
  image: 'https://s.gravatar.com/avatar/132afddcbdf38c93d02334687537242f?s=80'
excerpt:
  Finding files of a correct size to test with doesn't have to be hard.
layout: post
published: false
tags:
- bash
- dd
- unix
title: "Easily generate test files of any size"
---

### The problem

Say you have a file upload validation in one of your Rails models. This validation limits the size of an uploaded file to 10 Mb.

<script src="https://gist.github.com/velocitylabs-admin/f21951d7d08d01d32bb3e8916b191ba3.js"></script>

You now want to test the upload validation size limit works correctly (manually or automated).

So you start searching your Documents folder, hoping to find a couple files that will work.

You want one file that's just below 10 Mb limit and another that is just above 10 Mb.  This can be cumbersome and you just may not have local files that fit the bill.

<i>What can we do instead?</i>

### The solution

How about dynamically generate a file of the exact size we need?

We can accomplish this using the <b>dd unix command</b>.  So let's try creating a file of exactly 10 Mb in size.

<div class="wp-terminal">
  $ dd if=/dev/random of=test.txt bs=1024 count=10240<br/>
  10240+0 records in<br/>
  10240+0 records outt<br/>
  10485760 bytes transferred in 0.859163 secs (12204622 bytes/sec)<br/>
</div>

What were saying here is, read data from /dev/random, into a new file called 'test.txt', in 1024-byte size blocks (1 KB), and give me 10,240 of them (10 Mbs is 10,240 KB).

We can verify this file is the correct size with

<div class="wp-terminal">
  $ ls -lah test.txt<br/>
  -rw-r--r--+ 1 supairish  staff    10M Jun  4 17:42 test.txt<br/>
</div>

Excellent!

So just rerun this command with a smaller or larger count number to get the exact file sizes you need and you're good to go.

<i>Just remember: <b>1 Mb is 1,024 KB</b></i>

You could also wrap this command in a spec helper to use in MiniSpec or Rspec and generate files of random size ranges during your runs.

Just remember to cleanup/delete in your teardowns so you don't accidentally eat up disk space.
