---
title: 'Work Order Flow: From Release to Shipping'
category: reference
departments: [production, operations]
owner: Production Lead
tags: [work order, routing, stations, traveller]
version: 1
date: 2025-08-01
summary: Initial release
pushed: true
---

## Stations

A work order moves through Casting, Bench, Setting (if stones), Finishing, Engraving (if requested), QC and Shipping. Each station scans the traveller in and out.

## Holds

Any station can put a work order on hold with a reason code. Holds longer than one day are reviewed by the Production Lead at the morning huddle.

## Shipping handoff

Only pieces that passed QC may be scanned into Shipping. Shipping matches the piece to the packing slip and the retailer PO number before sealing the box.
