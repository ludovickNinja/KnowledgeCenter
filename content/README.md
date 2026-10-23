# Content folder: how documents feed the Knowledge Center

Every document the site shows lives here as a Markdown file. A build step
(`python scripts/build_content.py`, run automatically by GitHub Actions on every push)
compiles these files into `content.js`, which the site loads. Nothing here is written twice:
Know, Ask and Learn all read from the same compiled documents.

```
content/
  current/<id>.md         the ONE published version of each document   (all access)
  archive/<id>/v<N>.md    superseded versions, content kept for the record (restricted in the real system)
  drafts/<id>.md          SME submissions waiting for L&D review (status: draft or review)
```

`<id>` is the filename, lowercase with hyphens (for example `returns-repairs`). It never changes
once a document exists, because modules and links point at it.

## A current document

`content/current/returns-repairs.md`

```markdown
---
title: Returns, Repairs & RMA Policy
category: policies
departments: [sales, operations]
owner: Customer Service Manager
tags: [returns, rma, repairs, warranty, resize]
version: 3
date: 2026-10-14
summary: RMA is now required before any return is accepted. Resizing on alternative metals is excluded.
pushed: true
queue:
  title: "Policy update: Returns, Repairs & RMA (v3)"
  minutes: 5
  quiz:
    - q: Under v3, what is required before any return is accepted?
      a: [A phone call, An RMA number, A manager signature, Nothing]
      c: 1
---

## RMA required

No return, repair or resize is accepted without an RMA number issued by Customer Service.

## Return window

Unworn stock items may be returned within **30 days** of invoice for full credit.
```

### Frontmatter fields

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | yes | Shown everywhere. |
| `category` | yes | One of `company`, `product`, `systems`, `policies`, `quality`, `reference`. |
| `departments` | yes | `[all]` or any of `sales`, `production`, `marketing`, `operations`. Acts as a visibility filter. |
| `owner` | yes | The subject matter expert accountable for accuracy. |
| `tags` | no | Extra search words. |
| `version` | yes | Whole number, starts at 1. |
| `date` | yes | Publish date, `YYYY-MM-DD`. |
| `summary` | yes | One or two sentences, written for employees. This is what the learning queue shows. |
| `pushed` | no | `true` when the change is substantive (a rule, number, step or product changed). `false` for formatting or clarification. |
| `queue` | no | Add this block when the version should create an Ongoing Learning item. `title` is required; `minutes` defaults to 5; `quiz` is optional (without it the item is acknowledge-only). `c` is the 0-based index of the correct answer. |

### Body

- Start every section with a `## Heading`. Sections are what Ask cites, so keep them short and titled by topic.
- Inside a section: paragraphs, bullet lists (`- item`), **bold**, *italic* and links. Nothing else.
- Do not add a `# Title` line; the title comes from the frontmatter.
- State a rule, number or threshold once, in the section it belongs to.

## Publishing a new version (L&D)

1. Move the current file to the archive: `content/current/<id>.md` → `content/archive/<id>/v<N>.md`
   (N is its version). Leave its frontmatter and body as they were. Remove the document fields
   (`title`, `category`, `departments`, `owner`, `tags`) from the archived copy if you like; they are
   only needed when a document has no current version.
2. Create the new `content/current/<id>.md`: same document fields, `version` N+1, today's `date`,
   a fresh `summary`, and `pushed: true` plus a `queue` block **only** if the change is substantive.
3. If the new version came from a draft, delete `content/drafts/<id>.md`.
4. Commit. The build validates the files and fails the push's workflow if anything is wrong
   (unknown category, missing field, duplicate version, draft numbered below the current, and so on).

Minor changes (typos, formatting, clarifications) can also be made directly in the current file
without a new version. Use judgment: if an employee needs to know, it is a new version.

## Submitting a draft (SME)

Create `content/drafts/<id>.md` with:

```yaml
---
version: 4            # one above the current version
status: review        # or draft while still being written
date: 2026-10-20
summary: Clarified how to handle split shipments on multi-line orders.
submitted_by: Customer Service Manager
---
```

followed by the full proposed body. For a brand-new document also include `title`, `category`,
`departments` and `owner`. L&D sees drafts in Manage → Review queue.

## Checking your work locally

```bash
python -m pip install pyyaml
python scripts/build_content.py --check
```
