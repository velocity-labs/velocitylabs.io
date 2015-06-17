---
author:
  name: Dave Tapley
  twitter: davetapley
  gplus:
  bio: Programmer
  image:
excerpt:
  There's an awkward gotcha when trying to find and replace the empty hash/object with sed
layout: post
published: true
tags:
- bash
- sed
- find
- gnu
title: "Find and replace {} in sed"
---

### The problem

Replacing all instances of `vcr: {}` with `vcr: { record: :new_episodes }`, in all files below `spec/features`.

Normally this `find -exec` can come to the rescue, so a reasonable approach might be:

    $ find spec/features/ -type f -exec sed -i 's#vcr: {}#vcr: { record: :new_episodes }#' {} \;

<i>Pro-tip: [change the delimiter](http://en.wikipedia.org/wiki/Regular_expression#Delimiters) to `#`</i>


Unfortunately we run in to trouble here: It just so happens that `{}` is the sequence find's `-exec` switch uses to substitute in filenames.

Well, surely we can just escape the `{}` through find, right?

    $ find spec/features/ -type f -exec sed -i 's#vcr: \{\}#vcr: { record: :new_episodes }#' {} \;`
    sed: -e expression #1, char 45: Invalid content of \{\}

  Not quite. Now the `\{\}` are being passed straight through to `sed`, including the `\`s, and unfortunately when sed sees escaped `{}`s it assumes them to be a [consecutive occurrence matcher](http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap09.html#tag_09_03_06).

### The solution

Sometimes it's best to just ditch `-exec` altogether, and use the ever versatile `xargs`:

    $ find spec/features/ -type f -print0 | xargs -0 sed -i 's#vcr: {}#vcr: { record: :new_episodes }#'
