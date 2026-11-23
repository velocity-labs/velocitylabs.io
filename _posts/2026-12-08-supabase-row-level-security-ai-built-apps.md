---
layout: post
title: "Is your Supabase data public? Row level security for AI-built apps"
author_id: 1
excerpt: >-
  When row level security is off, anyone with your app's public key can read and change your Supabase
  data. Why AI-built apps get it wrong, and how to check yours.
tags:
- security
- supabase
---

Many apps built with Lovable, Bolt, Replit, or an AI coding agent keep their data in Supabase. It's a solid database, but one setting decides whether that data is private: row level security, or RLS. With RLS off on a table, anyone who has your app's public key can read and change every row in it. That key isn't a secret. It ships in your app's front-end code, which is where it's meant to be.

## How common this is

In September, UpGuard [looked at about 300,000 domains](https://www.upguard.com/blog/everything-everywhere-systemic-data-exposure-in-supabase-apps) that showed signs of using Supabase and found 16,326 databases exposing readable tables. 9,104 of them exposed personal information, and 1,582 exposed credentials. The report mentions vibe coding platforms like Lovable and Replit, and AI coding agents like Claude Code and OpenAI's Codex.

In March 2025, a researcher [scanned 1,645 projects built with Lovable](https://mattpalmer.io/posts/statement-on-CVE-2025-48757/) and found 303 exposed endpoints across 170 of them, about one in ten. The data included names, phone numbers, API keys, and payment details. It became [CVE-2025-48757](https://www.cve.org/CVERecord?id=CVE-2025-48757), which Lovable disputes on the grounds that each of its customers is responsible for protecting their own app's data. Whatever you think of that position, it means checking is up to you.

## Why AI-built apps get this wrong

Supabase turns RLS on for you in one case. Its [docs](https://supabase.com/docs/guides/database/tables) say "The Table Editor enables row level security for you when you create a table in the Dashboard," and "When you create a table with SQL, enable it yourself." AI tools create tables by writing SQL, so the safe default never applies. Until someone enables RLS and writes a policy, anyone with the publishable key can read and write every row.

Two other mistakes do the same damage:

- **A policy that lets everyone in.** RLS is on, but the policy's condition is just `true`. Supabase's own checker warns that this "defeats the purpose of having Row-Level Security enabled."
- **The secret key in the front end.** Supabase's secret key (the older `service_role` key) "bypasses every Row Level Security policy you have," so if it's in the browser, your policies don't matter. Supabase says to use it only in backend code.

## How to check your app

1. In the Supabase dashboard, open the Security Advisor. A table flagged "Table publicly accessible" can be read, changed, and deleted by anyone with your project URL. Fix those first.
2. Look for warnings about policies that allow unrestricted access, and read the policies on your other tables. Each one should limit rows to the user who owns them, or to the people allowed to see them.
3. Search your front-end code for a secret key or a `service_role` key. If one is there, assume it's public and rotate it.
4. Sign in as two test users and try to load each other's records. If the second account can see the first one's data, so can anyone who signs up.

## Two Supabase changes to plan for

**New tables aren't exposed automatically.** Supabase [announced in April](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) that new tables in the `public` schema would no longer be reachable through its Data API until they're granted access. It started rolling out as the default for new projects on May 30, 2026, and Supabase said it would apply to existing projects from October 30. A table your AI tool adds may now fail with a permission error until it has a grant. A grant only decides whether the API can reach a table at all. RLS still decides which rows each person sees.

**The old API keys are going away.** Supabase is replacing the `anon` and `service_role` keys with publishable and secret keys, and [says it's deprecating the old ones](https://supabase.com/docs/guides/api/api-keys) by the end of 2026. Creating the new keys doesn't turn off the old ones, so you can switch in steps, but the switch needs doing.

## Where we can help

For apps on Supabase, our [vibe coding cleanup](/vibe-coding-cleanup/) checks every table's policies, fixes the ones that leak, and makes both of these changes without breaking your app.

If you'd rather know where you stand first, a [code audit](/code-audit/) covers apps built on Supabase, along with sign-in, payments, and secrets. Essentials is a fixed $1,000, and if you hire us for hourly development within 30 days of the report, up to $1,000 of the fee comes off your first invoice.

If keys are part of the worry, our post on [October's AI platform breaches](/blog/2026/11/24/ai-platform-breaches-and-your-api-keys/) covers where to keep them and how to limit the damage when one leaks.

## Sources

- [Everything Everywhere: systemic data exposure in Supabase apps](https://www.upguard.com/blog/everything-everywhere-systemic-data-exposure-in-supabase-apps), UpGuard, September 23, 2026
- [Statement on CVE-2025-48757](https://mattpalmer.io/posts/statement-on-CVE-2025-48757/), Matt Palmer
- Supabase docs: [Tables](https://supabase.com/docs/guides/database/tables), [API keys](https://supabase.com/docs/guides/api/api-keys), and the [database linter](https://supabase.com/docs/guides/database/database-linter)
- [Tables not exposed to Data and GraphQL API automatically](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically), Supabase changelog, April 28, 2026
