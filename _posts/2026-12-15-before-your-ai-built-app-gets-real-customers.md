---
layout: post
title: "What to check before your AI-built app gets real customers"
author_id: 1
excerpt: >-
  Lovable, Replit, and Claude Code can get an app to a working demo in days. Before customers pay for
  it or trust it with their data, check these nine things.
tags:
- vibe coding
- process
---

AI tools can take an app from idea to working demo in days. A demo only has to work when you use it the way you planned. Real customers sign up twice, mistype their passwords, hit the back button in the middle of a payment, and share links with people who shouldn't have them. Before anyone pays for your app or trusts it with their data, these are the things we'd check first.

## 1. Who can see whose data

AI tools write code that works on the happy path, and they often skip the checks that keep each customer's data private. Sign in as two test users and try to open each other's records, including by changing the ID in the address bar. If your app uses Supabase, check row level security on every table. Our [Supabase post](/blog/2026/12/08/supabase-row-level-security-ai-built-apps/) explains how.

## 2. Where your keys are

Secret keys belong on the server, never in front-end code. Make a list of every key, where it's stored, and what it can spend, and set spending limits with your AI providers. Our post on [October's AI platform breaches](/blog/2026/11/24/ai-platform-breaches-and-your-api-keys/) shows what a stolen key can cost.

## 3. Sign-in

Go through a password reset from start to finish, including with an expired link. Check that new accounts have to confirm their email address, and that someone guessing passwords gets slowed down or locked out.

## 4. Payments

If you take payments through Stripe, your app should confirm each payment from Stripe's webhooks and check every webhook's signature, rather than trusting the browser's word that a payment went through. Test a declined card, a failed renewal, and a refund, and make sure the live keys are only in production.

## 5. Email that arrives

Sign-up confirmations and password resets need to come from your own domain, with SPF, DKIM, and DMARC set up. Without them, much of your email lands in spam, and a customer who never gets the reset email usually just leaves.

## 6. Backups you've restored

Find out where your data is backed up, how often, and for how long. Then restore a backup somewhere and look at it. Until you've done that, you don't know it works.

## 7. Errors you'll hear about

Set up error monitoring, so you hear about a crash when it happens and not when a customer emails you about it.

## 8. Accounts in your name

The domain, the code repository, the hosting, and accounts like Stripe should all belong to your business. Our post on [what happens if your platform shuts down](/blog/2026/12/01/what-happens-if-your-app-platform-shuts-down/) covers what else to have in place.

## 9. Tests around what matters

Sign-up, payment, and the main thing your app does should have automated tests. Each new prompt to an AI tool can change code you didn't ask it to touch, and tests are how you find out before your customers do.

## Where we can help

A [code audit](/code-audit/) covers most of this list. Essentials is a fixed $1,000 and typically takes less than a week. It reviews your code, configuration, and database schema, and scans for security issues and leaked secrets. Comprehensive adds your domain and email setup.

When the audit turns up work, [vibe coding cleanup](/vibe-coding-cleanup/) fixes it, security first. After launch, a [maintenance plan](/maintenance/) keeps the app monitored, backed up, and patched, starting at $750 a month.
