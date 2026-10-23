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

## Files

- `index.html` — entry point
- `app.js` — routing, views, state
- `data.js` — mock documents, versions, modules, personas
- `styles.css` — styling (light and dark)

## Run locally

Any static server works, for example:

```bash
python -m http.server 8765
```

then open http://localhost:8765/.
