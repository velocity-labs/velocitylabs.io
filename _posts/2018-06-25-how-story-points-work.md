---
author_id: 2
date: 2018-06-25
excerpt:
  Story points size work by effort, risk, and complexity, not by the clock. Here's how they work and how we use them.
layout: post
published: true
tags:
- process
title: "How We Use Story Points (and Why They Aren't Hours)"
---

"How long will it take?" is the first question almost every client asks, and it's a fair one. It informs their budget and timeline, so they can make plans for their business. But the honest answer is that software estimates in hours are usually wrong, and almost always too low. That's how projects end up over time and over budget. It's also why we size work in story points instead.

### What are story points?

A story point is a relative measure of three things together: how much **effort** a piece of work takes, how much **risk** it carries, and how much **complexity** or uncertainty is involved.

The key word is relative. A 2 is roughly twice the size of a 1, and a 5 is a good deal bigger than a 3, but there's no unit behind any of them. A small change to the code that handles payments can rate higher than a larger change to a settings page, because the risk is different even if the typing isn't.

Each estimate is a number from a scale based on the Fibonacci sequence, where the gaps between numbers grow as the numbers do.

<div class="callout" markdown="1">

### Why Fibonacci?

The larger a piece of work is, the less precisely anyone can size it. If the scale had every number, you'd waste time arguing whether something is a 14 or a 15. Choosing between 13 and 21 is a real conversation about how much is unknown.

As a rough guide:

<ul>
  <li><b>1:</b> trivial and well understood, like a configuration change.</li>
  <li><b>2 to 3:</b> a small, contained change that's straightforward to test.</li>
  <li><b>5:</b> touches several areas, or has a few unknowns to work out first.</li>
  <li><b>8:</b> cross-cutting or risky, and needs careful testing and rollout.</li>
  <li><b>13:</b> large, with significant unknowns. Worth looking for a way to split it.</li>
  <li><b>21:</b> too big to schedule as one piece of work.</li>
</ul>

</div>

### How do we estimate?

Every project starts with a <a href="/process/story-workshop/">story workshop</a>, where we work with you to gather requirements and write them up as user stories: short descriptions of what someone needs to do and why.

Once the stories are written, we start with the ones we understand best, the familiar, well-defined pieces of work, and give them story points. Those first few estimates become the baseline for the project. Every story after that is sized relative to them: is this bigger or smaller than the login story we called a 3? About the same as the report we called a 5?

Stories that come out large don't stay that way, which brings us to our rules.

### Some rules we stick to

<b>We don't map points to hours.</b> Every project is different: different technologies, domains, complexities, technical debt, and team composition. A 2 for one project does not necessarily take the same amount of time as a 2 in another.

<b>We break down high numbers.</b> Anything rated 13 or higher gets split into smaller pieces that can each be understood, built, and tested on their own, and each piece is estimated again. A major framework upgrade, for example, becomes a series of one-version steps, each with its own points. Splitting a story usually surfaces questions nobody had thought to ask yet, and it's much better to find those during planning than halfway through building.

<b>We don't compare velocities.</b> A team's velocity is the number of points it completes in a typical iteration (a short, fixed block of work, usually a week or two). It reflects that team's own baseline: their experience, their codebase, and how they happen to calibrate a 3. Two teams' point totals can't be compared, and using them that way just teaches teams to inflate their numbers.

### So how do we plan with them?

Points become useful for planning once a team has a track record. After a few iterations you know roughly what the velocity is, and you can see how much of a backlog fits in the coming weeks. The forecast comes from the team's measured pace, not from converting points to hours up front, and it gets more accurate as the team goes.

Velocity also moves with the team. Sick days, vacations, and holidays mean fewer points in a given iteration, and someone joining or leaving the team shifts the pace for a while as people get up to speed. So we plan from an average over several iterations rather than any single one, and when we know a change is coming, like a holiday week or a new developer starting, we adjust the forecast ahead of time instead of letting it surprise anyone.

Questions about how we'd estimate your project? <a href="/#contact">Get in touch</a>.
