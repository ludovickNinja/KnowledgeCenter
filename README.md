# Knowledge Center — proof of concept

Live demo: https://ludovickninja.github.io/KnowledgeCenter/

A static, front-end-only prototype of the Knowledge Center framework. All data is mock data
in `data.js`; progress, requests and published versions are saved in the browser (localStorage).
Use the persona switcher in the top bar to see the experience for an employee, a supervisor
and L&D. "Reset demo data" in the footer restores the seed state.

## What it demonstrates

| Area | What you can try |
| --- | --- |
| **Learn** | Four stages (Company Foundation, Products & Industry, Department Path, Ongoing Learning), progress bar, quizzes, completion records that keep the document version seen, department switch that preserves company-wide progress. |
| **Know** | Searchable knowledge base, six categories, department-label filtering, version history on every document. Archived versions are hidden from employees. |
| **Ask** | Assistant that retrieves only from current published documents the user is allowed to see, cites the exact section, and says when it cannot find a reliable answer. Retrieval is keyword-based in this POC; production would hand the same passages to an LLM. |
| **Manage** (L&D persona only) | Library, review queue, publish flow with change summary and the minor / substantive decision that controls whether an Ongoing Learning item is created, folder and access model (master / archived / current), employee request inbox, writing standards. |
| **My Team** (supervisor / L&D) | Completion by stage per team member, down to which version each person completed. |
| **Suggest a topic** | Available to every persona; submissions land in the Manage request inbox. |

## Where the documents come from

Every document is a Markdown file in [`content/`](content/) with a metadata header. A build step
compiles them into `content.js`, which the site loads. The folder mirrors the framework's structure:

```
content/current/<id>.md         the one published version of each document (all access)
content/archive/<id>/v<N>.md    superseded versions, content retained (restricted)
content/drafts/<id>.md          SME submissions waiting for L&D review
```

GitHub Actions runs the build on every push to `main` that touches `content/` and commits the
result, so editing a file on GitHub and committing is enough to update the live site. The build
fails on invalid metadata (unknown category or department, missing field, duplicate version), so a
bad file never reaches the site. See [`content/README.md`](content/README.md) for the authoring guide.

Modules, quizzes, personas and seed progress still live in `data.js`.

## Files

- `index.html` — entry point
- `app.js` — routing, views, state
- `content.js` — generated from `content/` (do not edit by hand)
- `data.js` — modules, quizzes, personas, seed progress
- `scripts/build_content.py` — compiles `content/` into `content.js`
- `styles.css` — styling (light and dark)

## Run locally

```bash
python -m pip install pyyaml
```

```bash
python scripts/build_content.py
```

```bash
python -m http.server 8765
```

then open http://localhost:8765/.
