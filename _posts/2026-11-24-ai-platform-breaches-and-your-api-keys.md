---
layout: post
title: "What October's AI platform breaches mean for your API keys"
author_id: 1
excerpt: >-
  At least nine AI developer platforms disclosed breaches in October, and the attackers went after the
  API keys customers had stored there. What that means for your app, and what to do about it.
tags:
- security
- ai
---

On October 30, Wiz published [Black October for AI Developer Platforms](https://www.wiz.io/blog/black-october-for-ai-developer-platforms), a running list of breaches at companies that host apps, run AI models, and build developer tools. At least nine disclosed incidents during the month, including Fireworks AI, Railway, Warp, Lightning AI, and Zeabur, and Wiz kept adding to the list into November.

The attackers wanted the same thing everywhere. In Wiz's words, the public reports all point to "targeted exploitation, explicitly hunting stored environment variables, with a focus on those granting AI access."

Environment variables are where an app keeps its secrets: the keys for OpenAI, Anthropic, or AWS, the Stripe secret key, the database password. When you deploy to a hosting platform or build on an app builder, you paste them into a settings page, and from then on they live on that company's servers.

## How fast a stolen key gets used

Wiz followed two companies' AI keys that were stolen through vendor breaches. Both were tested within 30 minutes of the breach. One then made about 800,000 calls to AWS Bedrock over thirty hours before it was shut off, and the other made about 1.7 million calls in thirteen hours. Wiz estimates that at list price the two "likely ran up over $100k in usage." It tied the keys to people selling discounted access to AI models.

Zeabur's own [incident report](https://zeabur.com/blogs/october-2026-security-incident) shows the scale at a single platform. The attacker read 3,218,965 environment variable records belonging to 321,810 accounts. Zeabur says the cause was its own: "long-lived admin credentials were stored in plaintext and could be used from the public internet." It told every customer to replace every credential they had stored there and to check their bills from October 14 onward. It has since said it [can't pay the third-party charges](https://zeabur.com/blogs/october-2026-security-incident-follow-up) the breach caused, and that it will cease operations on December 31.

## Why this matters if you never used those platforms

Every app keeps its secrets somewhere: a host, an app builder, a CI service, an automation tool, a teammate's laptop. Each place holds a copy, and each copy is only as safe as the company holding it. When one of them is breached, the bill can arrive before the breach notice does.

Apps built with AI tools often have a second problem: secret keys in the front-end code, where anyone can read them in their browser without breaching anything at all.

## What to do about it

- **Know where every secret lives.** Write down each key, what it can do, and every place it's stored. If nobody can write that list, that's the first job.
- **Keep secret keys on the server.** Anything sent to the browser is public. Only keys made for the browser, like Stripe's or Supabase's publishable keys, belong in front-end code.
- **Give each key only what it needs.** A key limited to one project or one set of permissions is worth less to a thief. AI and cloud providers let you split keys by project or workspace, so use that.
- **Set a spending limit.** Use the lowest limit or alert your provider offers, so a stolen key gets noticed in hours rather than on next month's invoice.
- **Use a separate key for each place.** With one key per environment and per platform, a breach at one vendor is one key to revoke, and you know which one.
- **Rotate in the right order when a vendor reports a breach.** Revoke the old key with the provider first, then create a new one and redeploy. That's the order Zeabur gave its customers, and it matters, because a new key does nothing while the old one still works.
- **Watch your usage.** A sudden jump in AI calls or cloud spend is often the first sign a key is out.

## Where we can help

Every [code audit](/code-audit/) includes automated scans for leaked secrets, and the review looks at where your keys are stored and what they can reach. Essentials is a fixed $1,000.

If your app was built with Lovable, Replit, or Base44, [vibe coding cleanup](/vibe-coding-cleanup/) closes gaps like exposed keys, and moves the app to hosting you control when you're ready.

Our [maintenance plans](/maintenance/) include round-the-clock monitoring of uptime, errors, and load, and every account stays in your name. When a vendor you depend on reports a breach, rotating the keys stored there is the kind of work the plan's hours cover.

And when we build [AI features](/ai-integration/) into an app, the keys stay on the server and the running costs are tracked from the start.

## Sources

- [Black October for AI Developer Platforms](https://www.wiz.io/blog/black-october-for-ai-developer-platforms), Wiz, October 30, 2026, with updates into November
- [October 2026 security incident](https://zeabur.com/blogs/october-2026-security-incident), Zeabur, October 19, 2026
- [October 2026 security incident follow-up](https://zeabur.com/blogs/october-2026-security-incident-follow-up), Zeabur, October 28, 2026
