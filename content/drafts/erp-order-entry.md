---
version: 3
status: review
date: 2026-10-20
summary: Clarified how to handle split shipments on multi-line orders. Minor wording fixes.
submitted_by: Customer Service Manager
---

## Before you enter an order

Confirm the retailer account is active and not on credit hold. Confirm the style number exists in the current catalogue. Confirm finger size, width, metal and finish are all specified on the PO.

## Entering the order

Create the sales order from the retailer account, not from the product. Enter the retailer PO number in the reference field; it is **required** and orders without it will be rejected at release. Add one line per item and attach the PO as a PDF.

## Releasing to production

Once all lines are entered, release the order. The ERP creates a work order per line and assigns a provisional ETA. Send the ETA to the retailer within 4 business hours.

## Split shipments

When lines on one order will finish on different dates:

- Ask the retailer whether they want each piece shipped as it completes or everything held for one shipment.
- Record the answer in the order notes before release. The default is **hold for one shipment**.
- If shipping separately, each shipment carries the same retailer PO number and its own tracking number.
