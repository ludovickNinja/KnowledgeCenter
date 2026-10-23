#!/usr/bin/env python3
"""
Compile the Markdown documents in content/ into content.js.

    python scripts/build_content.py          # build (exit 1 on validation errors)
    python scripts/build_content.py --check  # validate only, write nothing

Layout
    content/current/<id>.md         the published version of each document
    content/archive/<id>/v<N>.md    superseded versions (content retained)
    content/drafts/<id>.md          SME submissions awaiting review (status: draft | review)

See content/README.md for the frontmatter reference.
"""
import hashlib
import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML is required. Install it with:  python -m pip install pyyaml")

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
OUT = ROOT / "content.js"

CATEGORIES = ["company", "product", "systems", "policies", "quality", "reference"]
DEPARTMENTS = ["all", "sales", "production", "marketing", "operations"]
DOC_FIELDS = ["title", "category", "departments", "owner"]
VERSION_FIELDS = ["version", "date", "summary"]

errors = []


def err(path, msg):
    errors.append(f"{path.relative_to(ROOT).as_posix()}: {msg}")


# ---------------------------------------------------------------- parsing
FRONT = re.compile(r"^﻿?---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$", re.S)


def parse_file(path):
    text = path.read_text(encoding="utf-8")
    m = FRONT.match(text)
    if not m:
        err(path, "missing frontmatter block (--- ... ---)")
        return None, ""
    try:
        meta = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        err(path, f"invalid YAML in frontmatter: {e}")
        return None, ""
    if not isinstance(meta, dict):
        err(path, "frontmatter must be a mapping of key: value")
        return None, ""
    return meta, m.group(2)


def plain_text(md):
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)
    t = re.sub(r"^\s*[-*]\s+", "", t, flags=re.M)
    t = re.sub(r"[*_`]+", "", t)
    return re.sub(r"\s+", " ", t).strip()


def sections_from(body, path, required=True):
    secs, cur = [], None
    for line in body.splitlines():
        h = re.match(r"^##\s+(.+?)\s*$", line)
        if h:
            cur = {"h": h.group(1), "lines": []}
            secs.append(cur)
            continue
        if re.match(r"^#\s", line):
            err(path, "use '## ' for section headings; a single '#' title is not needed (the title comes from frontmatter)")
            continue
        if cur is None:
            if line.strip():
                err(path, f"text before the first '## ' heading: {line.strip()[:50]!r}")
            continue
        cur["lines"].append(line)
    out = []
    for s in secs:
        md = "\n".join(s["lines"]).strip()
        if not md:
            err(path, f"section '{s['h']}' is empty")
        out.append({"h": s["h"], "p": md, "text": plain_text(md)})
    if required and not out:
        err(path, "body has no '## ' sections")
    return out


def as_iso(value, path, field):
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return value
    err(path, f"'{field}' must be a date like 2026-10-14 (got {value!r})")
    return str(value)


def check_quiz(quiz, path):
    if quiz is None:
        return None
    if not isinstance(quiz, list) or not quiz:
        err(path, "queue.quiz must be a non-empty list")
        return None
    out = []
    for i, q in enumerate(quiz, 1):
        if not isinstance(q, dict) or not all(k in q for k in ("q", "a", "c")):
            err(path, f"queue.quiz item {i} needs q, a and c")
            continue
        if not isinstance(q["a"], list) or len(q["a"]) < 2:
            err(path, f"queue.quiz item {i}: 'a' must list at least two answers")
            continue
        if not isinstance(q["c"], int) or not 0 <= q["c"] < len(q["a"]):
            err(path, f"queue.quiz item {i}: 'c' must be the 0-based index of the correct answer (0..{len(q['a']) - 1})")
            continue
        out.append({"q": str(q["q"]), "a": [str(a) for a in q["a"]], "c": q["c"]})
    return out


def version_from(meta, body, path, status, body_required):
    for f in VERSION_FIELDS:
        if f not in meta:
            err(path, f"missing required field '{f}'")
    v = {
        "v": meta.get("version"),
        "status": status,
        "date": as_iso(meta.get("date", ""), path, "date") if "date" in meta else "",
        "summary": str(meta.get("summary", "")).strip(),
        "pushed": bool(meta.get("pushed", False)),
        "sections": sections_from(body, path, required=body_required),
    }
    if not isinstance(v["v"], int) or v["v"] < 1:
        err(path, f"'version' must be a positive integer (got {meta.get('version')!r})")
    if "submitted_by" in meta:
        v["submittedBy"] = str(meta["submitted_by"])
    q = meta.get("queue")
    if q is not None:
        if not isinstance(q, dict) or "title" not in q:
            err(path, "queue must have at least a 'title'")
        else:
            v["queue"] = {
                "title": str(q["title"]),
                "minutes": int(q.get("minutes", 5)),
                "quiz": check_quiz(q.get("quiz"), path),
            }
    return v


def apply_doc_meta(doc, meta, path, required):
    for f in DOC_FIELDS:
        if f in meta and f not in doc:
            doc[f] = meta[f]
        elif f not in meta and required:
            err(path, f"missing required field '{f}'")
    if "tags" in meta and "tags" not in doc:
        doc["tags"] = [str(t) for t in (meta["tags"] or [])]
    if "departments" in doc and isinstance(doc["departments"], str):
        doc["departments"] = [doc["departments"]]


# ---------------------------------------------------------------- assemble
def build():
    docs = {}

    def doc(doc_id):
        return docs.setdefault(doc_id, {"id": doc_id, "versions": [], "_files": []})

    for f in sorted((CONTENT / "current").glob("*.md")):
        meta, body = parse_file(f)
        if meta is None:
            continue
        d = doc(f.stem)
        apply_doc_meta(d, meta, f, required=True)
        d["versions"].append(version_from(meta, body, f, "published", body_required=True))
        d["_files"].append(f)

    for folder in sorted(p for p in (CONTENT / "archive").glob("*") if p.is_dir()):
        for f in sorted(folder.glob("*.md")):
            meta, body = parse_file(f)
            if meta is None:
                continue
            m = re.fullmatch(r"v(\d+)", f.stem)
            if not m:
                err(f, "archived files must be named v<N>.md")
                continue
            d = doc(folder.name)
            apply_doc_meta(d, meta, f, required=False)
            v = version_from(meta, body, f, "archived", body_required=False)
            if v["v"] != int(m.group(1)):
                err(f, f"filename says v{m.group(1)} but frontmatter version is {v['v']}")
            d["versions"].append(v)
            d["_files"].append(f)

    for f in sorted((CONTENT / "drafts").glob("*.md")):
        meta, body = parse_file(f)
        if meta is None:
            continue
        status = str(meta.get("status", "draft"))
        if status not in ("draft", "review"):
            err(f, f"status must be 'draft' or 'review' (got {status!r})")
            status = "draft"
        d = doc(f.stem)
        apply_doc_meta(d, meta, f, required=False)
        d["versions"].append(version_from(meta, body, f, status, body_required=False))
        d["_files"].append(f)

    # ---- document-level validation
    for d in docs.values():
        first = d["_files"][0]
        for f in DOC_FIELDS:
            if f not in d:
                err(first, f"document '{d['id']}' has no '{f}' (no current version and no metadata in archive/draft)")
        if d.get("category") not in CATEGORIES:
            err(first, f"unknown category {d.get('category')!r}; use one of {', '.join(CATEGORIES)}")
        depts = d.get("departments") or []
        for dp in depts:
            if dp not in DEPARTMENTS:
                err(first, f"unknown department {dp!r}; use one of {', '.join(DEPARTMENTS)}")
        if "all" in depts and len(depts) > 1:
            err(first, "departments: use [all] on its own, not combined with departments")
        d.setdefault("tags", [])

        vs = sorted(d["versions"], key=lambda v: (v["v"] if isinstance(v["v"], int) else 0))
        nums = [v["v"] for v in vs]
        if len(set(nums)) != len(nums):
            err(first, f"duplicate version numbers {nums}")
        published = [v for v in vs if v["status"] == "published"]
        if len(published) > 1:
            err(first, "more than one published version")
        cur = published[0]["v"] if published else 0
        for v in vs:
            if v["status"] in ("draft", "review") and isinstance(v["v"], int) and v["v"] <= cur:
                err(first, f"draft v{v['v']} must be numbered above the current v{cur}")
            if v["status"] == "archived" and isinstance(v["v"], int) and cur and v["v"] >= cur:
                err(first, f"archived v{v['v']} must be numbered below the current v{cur}")
        d["versions"] = vs

    # ---- derive Ongoing Learning queue items from versions with a queue block
    ongoing = []
    for d in docs.values():
        for v in d["versions"]:
            q = v.get("queue")
            if q and v["status"] in ("published", "archived"):
                ongoing.append({
                    "id": f"o-{d['id']}-v{v['v']}",
                    "docId": d["id"],
                    "version": v["v"],
                    "depts": d.get("departments", []),
                    "date": v["date"],
                    "title": q["title"],
                    "minutes": q["minutes"],
                    "quiz": q["quiz"],
                })
    ongoing.sort(key=lambda o: (o["date"], o["id"]), reverse=True)

    cat_order = {c: i for i, c in enumerate(CATEGORIES)}
    out_docs = []
    for d in sorted(docs.values(), key=lambda d: (cat_order.get(d.get("category"), 99), str(d.get("title", "")))):
        out_docs.append({
            "id": d["id"],
            "title": str(d.get("title", d["id"])),
            "category": d.get("category"),
            "depts": d.get("departments", []),
            "owner": str(d.get("owner", "")),
            "tags": d.get("tags", []),
            "versions": [{k: v for k, v in ver.items()} for ver in d["versions"]],
        })
    return out_docs, ongoing


def main():
    check_only = "--check" in sys.argv
    if not CONTENT.is_dir():
        sys.exit(f"content folder not found: {CONTENT}")
    docs, ongoing = build()
    if errors:
        print(f"Content validation failed with {len(errors)} error(s):\n", file=sys.stderr)
        for e in errors:
            print("  - " + e, file=sys.stderr)
        sys.exit(1)
    payload = {"docs": docs, "ongoing": ongoing}
    body = json.dumps(payload, ensure_ascii=False, indent=1, sort_keys=False)
    stamp = hashlib.sha1(body.encode("utf-8")).hexdigest()[:12]
    js = ("/* Generated by scripts/build_content.py from content/ — do not edit by hand. */\n"
          f"window.KC_CONTENT = {{\"build\": \"{stamp}\", \"source\": \"content/\", " + body[1:] + ";\n")
    cur_count = sum(1 for d in docs if any(v["status"] == "published" for v in d["versions"]))
    print(f"{len(docs)} documents ({cur_count} published), {sum(len(d['versions']) for d in docs)} versions, "
          f"{len(ongoing)} queue items. build {stamp}")
    if check_only:
        print("--check: nothing written")
        return
    old = OUT.read_text(encoding="utf-8") if OUT.exists() else None
    if old == js:
        print(f"{OUT.name} unchanged")
    else:
        OUT.write_text(js, encoding="utf-8", newline="\n")
        print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
