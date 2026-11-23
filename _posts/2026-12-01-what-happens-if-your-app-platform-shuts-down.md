---
layout: post
title: "What happens to your app if the platform shuts down?"
author_id: 1
excerpt: >-
  Zeabur is shutting down after a breach, with weeks of notice. What you can and can't take with you
  from a hosting platform or AI app builder, and what to have in place first.
tags:
- business
- vibe coding
---

On October 17, two days after it found an attacker in its systems, the hosting platform Zeabur [announced it was shutting down](https://zeabur.com/blogs/zeabur-is-shutting-down). Customers got about six weeks before things started to stop: services on its shared clusters would be paused on December 1, dedicated servers would shut down as they expired during December, and the company would [cease operations on December 31](https://zeabur.com/blogs/october-2026-security-incident-follow-up). The final dates for exporting and deleting data, it said, "have not yet been finalized."

Zeabur is an extreme case, but not an unusual kind. Glitch [ended project hosting on July 8, 2025](https://blog.glitch.com/post/changes-are-coming-to-glitch/), seven weeks after announcing it. Heroku [ended its free plans](https://www.heroku.com/blog/next-chapter/) on November 28, 2022. Platforms get bought, change their pricing, drop features, and close. If your business depends on an app, it needs to survive any of those.

## Exporting your code isn't the same as moving your app

The AI app builders all let you get your code out in some form. Lovable can sync a project to GitHub or let you download it, and Replit can download a project as a zip or sync it with GitHub. The code is the easy part.

The hard parts are everything around it: the database, your users' accounts and logins, uploaded files, secrets, and any backend features the platform provides. If user accounts can't come with you, every customer has to sign up again or reset their password.

Base44's [documentation](https://docs.base44.com/documentation/building-your-app/developer-tools) is unusually direct about this. Its exported code "still relies on Base44 to run, so a ZIP is a copy of your code, not a way to move your app off Base44." Data comes out one table at a time as CSV files, and "your secrets and app users aren't included. They stay in Base44." Base44 also says it "doesn't support self-hosting." That doesn't make it a bad choice, but it does mean leaving it involves rebuilding the backend, which is worth knowing before you need to.

## What to have in place before you need it

- **Your code in a GitHub account you own.** Not the platform's, and not a former developer's.
- **Your domain in your name,** at a registrar you can log into. When you move, the domain is how customers find the new home.
- **Backups you've restored somewhere else.** A backup kept only on the platform that's closing doesn't help, and one you've never restored may not work.
- **A list of every service and secret your app uses.** Email, payments, AI providers, and storage, with the account each one belongs to. Our post on [October's AI platform breaches](/blog/2026/11/24/ai-platform-breaches-and-your-api-keys/) covers the secrets side.
- **A clear picture of what belongs to the platform.** Sign-in, file storage, email sending, and AI credits are often the builder's own, and each needs a replacement when you leave.
- **Business accounts in your company's name.** Stripe, your email provider, and your cloud accounts should belong to the business, not to whoever set them up.

None of this means you should leave your builder. Stay while it helps you move fast, and move when you need something it can't do well, like a custom backend, complex permissions, or hosting and costs you control.

## Where we can help

When we [take over an app](/app-rescue/), the first step is making sure you control the code, hosting, domain, and every account it depends on, so nothing is stuck with someone who left.

Our [maintenance plans](/maintenance/) include offsite backups that are checked so they can actually be restored. If you ever move on, we transfer every account and all of your data to you.

When you're ready to leave a builder, [vibe coding cleanup](/vibe-coding-cleanup/) moves your code out of the tool and onto hosting you control. For Base44 apps, we review what it generated and plan the move to code you own.

## Sources

- [Zeabur is shutting down](https://zeabur.com/blogs/zeabur-is-shutting-down), Zeabur, October 17, 2026
- [October 2026 security incident follow-up](https://zeabur.com/blogs/october-2026-security-incident-follow-up), Zeabur, October 28, 2026
- [Changes are coming to Glitch](https://blog.glitch.com/post/changes-are-coming-to-glitch/), Glitch, May 22, 2025
- [Heroku's next chapter](https://www.heroku.com/blog/next-chapter/), Heroku, August 25, 2022
- [Developer tools](https://docs.base44.com/documentation/building-your-app/developer-tools), Base44 docs
