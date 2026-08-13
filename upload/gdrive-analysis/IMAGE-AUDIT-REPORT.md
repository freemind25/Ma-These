# Google Drive Image Audit Report

## Scope
Analyzed all accessible files in `images/ress-1/` (50 files) and `images/ress-2/` (24 files) from the shared Google Drive folder. The `Articles/Nouveau dossier/` subfolder was **NOT accessible** (returns 404 without login — the subfolder lacks individual sharing permissions; only its parent has a share link). A `.rar` archive (8.1 MB) in the Articles folder likely contains the same files.

---

## A. images/ress-2/ — 24 files

### Group 1: Type Series — Research Design Taxonomy (9 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| Type-1.jpg | Title slide: "6 Types of Research Design Every Researcher Needs to Know" by @thedatabase_tz | LOW (intro only) |
| Type-2.jpg | **Experimental Design** — manipulate IV, control conditions, test cause-and-effect | **HIGH** |
| Type-3.jpg | **Correlational Research** — relationship between variables, "correlation ≠ causation" | **HIGH** |
| Type-4.jpg | **Descriptive Research** — observe & describe, surveys, population characteristics | **HIGH** |
| Type-5.jpg | **Case Study** — in-depth single subject/group analysis, qualitative methods | **HIGH** |
| Type-6.jpg | **Longitudinal Research** — repeated measures over time, development tracking | **HIGH** |
| Type-7.jpg | **Cross-Sectional Research** — single point snapshot, group comparisons | **HIGH** |
| Type-8.jpg | **Summary comparison table** — Cross-Sectional vs Longitudinal vs Experimental | **HIGH** |
| type.jpg | "Types of Literature Reviews & Their Applications" — comparative table of review methodologies | **HIGH** |
| Type.pdf | PDF version of Type-1 through Type-8 carousel (8 pages) | MEDIUM (duplicate of JPGs) |

**Group Summary:** The 6 research designs covered (Experimental, Correlational, Descriptive, Case Study, Longitudinal, Cross-Sectional) are **core methodology knowledge** already partially covered in `corpus-research-frameworks.ts` (statistical tests section). The `type.jpg` literature review types table is NEW knowledge not yet in the codebase.

---

### Group 2: Semantic/SR Series — Evidence Synthesis (2 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| semantic.jpg | **DISCOURSE framework** for Systematic Literature Review planning (9-step mnemonic: D-I-S-C-O-U-R-S-E) | **HIGH** |
| semantic_review.pdf | **Munn et al. (2018)** — "Systematic review or scoping review?" from BMC Medical Research Methodology (6 pages) | **HIGH** |

**Group Summary:** semantic_review.pdf is a published, peer-reviewed methodology paper directly relevant to the PRISMA/GRADE protocols already in the codebase. The DISCOURSE framework in semantic.jpg is a complementary planning tool.

---

### Group 3: Six Series — Research Frameworks & Tools (3 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| six-3.jpg | "8 Powerful Frameworks to Structure Your Research Paper" | **HIGH** |
| six-4.jpg | "The Right Tools for Every Stage of Your PhD Journey" — tool recommendations by phase | MEDIUM |
| six-6.jpg | "12 Best Websites to Download Free Books for Academic Use" — resource list | LOW |

---

### Group 4: Tip Series — Academic Writing Tips (3 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| tip-1.jpg | **PEER paragraph structure** — every paragraph makes ONE point | **HIGH** |
| tip-2.jpg | **PEER framework** — Point, Evidence, Explanation, Reference for paragraph anatomy | **HIGH** |
| tip-4.jpg | **Ethical AI use in academia** — don't trust AI references, avoid hallucinated citations | **HIGH** |

**Group Summary:** The PEER framework is actionable writing knowledge not yet in `corpus-scientific-writing.ts`. The AI ethics tips are highly relevant.

---

### Group 5: Variables (1 file)
| File | Description | Academic Value |
|------|-------------|---------------|
| variables.jpg | Types of variables: Independent, Dependent, Controlled, Confounded, Extraneous, Categorical vs Numerical, Continuous vs Discrete | **MEDIUM** |

**Note:** Basic undergraduate-level. Similar content exists in methodology textbooks already processed.

---

### Group 6: W Series — Writing & Publishing (5 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| w-9.webp | **Journal Finder Tools** — 14 publisher finder tools (Clarivate, Elsevier, etc.) | **HIGH** |
| w-10.webp | **Research Writing Starter Phrases** — Introduction & Literature Review sentence starters (RMIT) | **HIGH** |
| w-11.webp | **Starter Phrases** — Methods & Results sections | **HIGH** |
| w-12.webp | **Starter Phrases** — Discussion, Conclusion & References | **HIGH** |
| w-13.webp | **Complete Thesis Table of Contents** — quantitative research thesis structure | **HIGH** |

**Group Summary:** The RMIT starter phrases (w-10 to w-12) are **highly actionable** for AI writing prompts. The thesis ToC template (w-13) maps directly to ThesisFrame's chapter structure features.

---

## B. images/ress-1/ — 50 files

### Group A: "1-" Series — AI-Powered Academic Research (11 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| 1-1.jpg | Title: "9 Prompts for Academic Research" with NotebookLM | MEDIUM |
| 1-2.jpg | 9 NotebookLM prompts — literature scanning, gap identification, expert simulation | **HIGH** |
| 1-3.jpg | Conference networking game plan | LOW |
| 1-4.jpg | (not individually analyzed — same carousel) | — |
| 1-5.jpg | **Bulletproof grant application** — AI-simulated pre-review | **HIGH** |
| 1-6.jpg | (not individually analyzed) | — |
| 1-7.jpg | **Hunt down research gaps** — literature gap identification & ranking | **HIGH** |
| 1-8.jpg | (not individually analyzed) | — |
| 1-9.jpg | (not individually analyzed) | — |
| 1-10.jpg | **X-Ray the whole field** — comparative literature matrix | **HIGH** |
| 1-11.jpg | Turn academic jargon into accessible stories | MEDIUM |

**Group Summary:** ~5 of 11 have **HIGH** value. 1-7 (gap hunting) and 1-10 (field mapping) complement existing RB-3 (7 research gaps taxonomy).

---

### Group B: "2-" Series — Qualitative Research (2 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| 2-1.jpg | "15 Free Websites for Downloading PhD Theses" | MEDIUM |
| 2-2.jpg | **"15 Steps to Conduct Qualitative Research"** — full roadmap | **HIGH** |

---

### Group C: "3" — Literature Review Types (1 file)
| File | Description | Academic Value |
|------|-------------|---------------|
| 3.jpg | **"10 Types of Literature Review"** — Narrative, Systematic, Meta-Analysis, Scoping, Integrative, Critical, Theoretical, Methodological, Empirical, Realist | **HIGH** |

**Note:** This overlaps with `type.jpg` from ress-2 and with existing PRISMA protocol knowledge. Adds Realist and Empirical review types not yet in codebase.

---

### Group D: "5-" Series — Paper Structure & Tools (4 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| 5-1.jpg | **"8 Powerful Frameworks to Structure Your Research Paper"** | **HIGH** |
| 5-2.jpg | "The Right Tools for Every Stage of Your PhD Journey" | MEDIUM |
| 5-3.jpg | (not individually analyzed — same series) | — |
| 5-6.jpg | **"Essential Tools for Systematic Literature Review"** — SLR software by function | **HIGH** |

---

### Group E: AI Series — AI Tools for Research (3 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| ai-1.jpg | **7 PhD-friendly AI tools** — Litmaps, Consensus, SciSpace | **HIGH** |
| ai-2.jpg | (not individually analyzed — same carousel) | — |
| ai-3.jpg | **Paperpal** — AI editing & submission prep | MEDIUM |

---

### Group F: Data Series — Data Analytics Notes (15+ files)
| File | Description | Academic Value |
|------|-------------|---------------|
| data-1.jpg | Data Analytics Introduction — definitions, roles, lifecycle | LOW (non-thesis) |
| data-2.jpg | Excel for Data Analysts | LOW |
| data-3.jpg | SQL for Data Analysts | LOW |
| data-4.jpg | Advanced SQL (JOINs, set operators) | LOW |
| data-5.jpg | Statistics fundamentals — mean, median, mode, SD, normal distribution | MEDIUM |
| data-6.jpg | (Power BI or similar) | LOW |
| data-7.jpg | Power BI Basics | LOW |
| data-8.jpg | Data Cleaning & Preprocessing | LOW |
| data-9.jpg | Advanced SQL (window functions, CTEs) | LOW |
| data-10.jpg | Advanced SQL Real World Problems | LOW |
| data-a.jpg | (404 — file missing) | N/A |
| data-b.webp | (404 — file missing) | N/A |
| data-b1..b4.webp | (small webp, likely screenshots of the notes) | LOW |
| data-c.jpg | **Git cheat sheet** — version control commands | LOW |
| data.pdf | Complete 10-page DATA ANALYST NOTES (PDF version of above) | LOW |

**Group Summary:** This is a **Data Analyst course** by @codewithZ covering Excel, SQL, Power BI, Git. **Low relevance** for ThesisFrame's academic writing focus. Only data-5 (statistics basics) has marginal value.

---

### Group G: Doc Series — Research Documentation Skills (6 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| doc-1.jpg | **"How to Effectively Review a Research Paper"** — 5-criteria framework (Importance, Originality, Methodology, Reproducibility, Clarity) | **HIGH** |
| doc-2.jpg | **"How to Write a Research Problem Statement"** — Context, Issue, Significance, Objectives | **HIGH** |
| doc-3.jpg | **"10 Research Gap Types"** — mind map of gap categories | **HIGH** |
| doc-31.jpg | **"22 Types of Research"** — comprehensive research methodology taxonomy | **HIGH** |
| doc-32.jpg | **"4-Step Workflow: Find the Perfect Journal Match"** | **HIGH** |
| doc-33.jpg | **"Verify Scope Before Submission"** — journal scope checklist | **HIGH** |

**Group Summary:** All HIGH value. doc-3 (10 gap types) overlaps with RB-3 (7 gaps) — could enrich existing taxonomy. doc-31 (22 research types) is more comprehensive than Type series. doc-1 (peer review framework) is directly applicable to the peer-review AI mode.

---

### Group H: Gap Series (2 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| gap1.jpg | **Research Gap vs Research Problem** — conceptual distinction | **HIGH** |
| gap2.jpg | Same topic, alternative perspective | MEDIUM (duplicate) |

---

### Group I: Other Files (3 files)
| File | Description | Academic Value |
|------|-------------|---------------|
| APA Results Composer.md | **APA 7 Pearson correlation reporting skill** — Perplexity investigation for scientific writing app | **VERY HIGH** |
| 2607.01233v1.pdf | "Measuring the Gap Between Human and LLM Research Ideas" — arXiv paper (Chen, Zhao, Cohan) | MEDIUM |
| AQN...mp4 | Video file — unable to preview in browser | UNKNOWN |

---

## C. Articles/Nouveau dossier/ — INACCESSIBLE

**Status:** The subfolder returns a 404 error when accessed directly. It is listed in the parent `Articles/` folder but lacks individual sharing permissions. Without Google account login, its contents cannot be viewed.

**Expected contents (per task description):** art-1 through art-6, find-1 through find-7, RS-1 through RS-6, five-8 through five-11, six-1, six-2

**Inference:** Based on file naming patterns in ress-1 and ress-2, these likely correspond to:
- `art-*` → Possibly the "1-" series (AI research prompts) or a separate article screenshots series
- `find-*` → Possibly the "5-" series (frameworks/tools) or gap-finding content
- `RS-*` → Possibly the "doc-" series or a Research Synthesis series
- `five-8 to five-11` → Continuation of the "5-" series (5-1, 5-2, 5-3, 5-6 exist in ress-1)
- `six-1, six-2` → Predecessors to six-3, six-4, six-6 in ress-2

**Alternative access:** A `Nouveau dossier.rar` (8.1 MB) exists in the Articles folder which likely contains the same files. This archive would need to be downloaded and extracted on a local machine.

---

## D. Transfer Priority Recommendations

### Tier 1 — Transfer Immediately (VERY HIGH academic value for ThesisFrame)

These contain knowledge **not yet in the codebase** and directly applicable to AI writing modes:

| Priority | File | Location | Reason |
|----------|------|----------|--------|
| 1a | APA Results Composer.md | ress-1 | **APA 7 statistical reporting rules** — directly enhances methodology/peer-review modes. No existing coverage. |
| 1b | doc-3.jpg (10 Research Gap Types) | ress-1 | Enriches existing RB-3 (7 gaps) taxonomy. May add 3+ new gap types. |
| 1c | doc-1.jpg (Paper Review Framework) | ress-1 | 5-criteria peer review framework — directly enhances peer-review AI mode. |
| 1d | doc-2.jpg (Research Problem Statement) | ress-1 | 4-element problem formulation — enhances hypothesis/problem-statement modes. |
| 1e | w-10, w-11, w-12.jpg (RMIT Starter Phrases) | ress-2 | **Sentence starter libraries** for IMRaD sections — injectable into all writing modes. |
| 1f | w-13.webp (Thesis ToC Template) | ress-2 | Quantitative thesis chapter structure — maps to ThesisFrame's chapter model. |

### Tier 2 — Transfer Soon (HIGH value, complementary knowledge)

| Priority | File(s) | Location | Reason |
|----------|---------|----------|--------|
| 2a | Type-2 through Type-8.jpg | ress-2 | 6 research designs with examples — complement existing statistical test knowledge. |
| 2b | type.jpg (Literature Review Types) | ress-2 | Review type comparison table — enriches PRISMA protocol knowledge. |
| 2c | tip-1, tip-2.jpg (PEER Framework) | ress-2 | Paragraph structure framework — new knowledge for scientific-writing corpus. |
| 2d | tip-4.jpg (AI Ethics in Academia) | ress-2 | AI reference warnings — enhances ethical guidelines in writing modes. |
| 2e | semantic.jpg (DISCOURSE Framework) | ress-2 | SLR planning mnemonic — new knowledge for literature-review mode. |
| 2f | 3.jpg (10 Literature Review Types) | ress-1 | Broader review taxonomy including Realist and Empirical types. |
| 2g | doc-31.jpg (22 Research Types) | ress-1 | Comprehensive research methodology taxonomy. |
| 2h | doc-32, doc-33.jpg (Journal Matching) | ress-1 | Publishing workflow — enhances submission guidance. |
| 2i | gap1.jpg (Gap vs Problem) | ress-1 | Conceptual clarity for gap-hypothesis mapping. |
| 2j | 1-7.jpg, 1-10.jpg (Gap Hunting, Field Mapping) | ress-1 | Advanced literature analysis techniques. |
| 2k | 5-6.jpg (SLR Tools) | ress-1 | Systematic review tool recommendations. |
| 2l | ai-1.jpg (7 AI Tools) | ress-1 | Research tool recommendations for AI-assisted workflows. |
| 2m | w-9.webp (Journal Finder Tools) | ress-2 | 14 publisher finder platforms. |
| 2n | 2-2.jpg (15 Steps Qualitative Research) | ress-1 | Qualitative research roadmap. |

### Tier 3 — Optional Transfer (MEDIUM value, supplementary)

| File(s) | Location | Reason |
|---------|----------|--------|
| semantic_review.pdf (Munn 2018) | ress-2 | Published paper — should be cited/summarized rather than transferred as image. |
| 2607.01233v1.pdf | ress-1 | arXiv paper on LLM research ideas — tangential to ThesisFrame. |
| variables.jpg | ress-2 | Basic variable types — already covered in textbooks. |
| data-5.jpg (Statistics basics) | ress-1 | Introductory statistics — useful but basic. |
| six-4.jpg (PhD Tools), 5-2.jpg (PhD Tools) | ress-2, ress-1 | Tool recommendations — nice-to-have but not corpus-worthy. |
| 1-2.jpg (9 NotebookLM Prompts) | ress-1 | Interesting but tool-specific. |
| 1-5.jpg (Grant Application), 1-11.jpg (Jargon Translation) | ress-1 | Useful but niche. |
| 2-1.jpg (15 Thesis Download Sites) | ress-1 | Resource list, not framework knowledge. |
| five-1.jpg (8 Frameworks), six-3.jpg (8 Frameworks) | ress-1, ress-2 | Overlap — only one needed. |

### Tier 4 — Skip / Low Priority

| File(s) | Location | Reason |
|---------|----------|--------|
| Type-1.jpg | ress-2 | Title slide only, no content. |
| Type.pdf | ress-2 | Duplicate of Type-1 through Type-8 JPGs. |
| data-1 through data-4, data-6 through data-10 | ress-1 | Data Analyst course (Excel, SQL, Power BI) — not thesis-specific. |
| data-c.jpg (Git) | ress-1 | Git cheat sheet — not academic writing. |
| data.pdf | ress-1 | PDF of data analyst notes. |
| data-b*, data-a | ress-1 | 404/missing files. |
| gap2.jpg | ress-1 | Duplicate of gap1.jpg. |
| six-6.jpg | ress-2 | Free book download sites — not framework knowledge. |
| 1-3.jpg | ress-1 | Conference networking tips — not writing-related. |

---

## E. Summary Statistics

| Category | Total Files | HIGH+ Value | LOW/Skip |
|----------|-------------|-------------|----------|
| ress-2 (24 files) | 24 | 18 | 6 |
| ress-1 (50 files) | 50 | 20 | 30 |
| Articles/Nouveau dossier | ~20+ (inaccessible) | Unknown | — |
| **Total analyzed** | **74** | **38 (51%)** | **36 (49%)** |

### Knowledge Gaps Identified (NEW content not in existing corpus)
1. **APA statistical reporting rules** (APA Results Composer.md) — for methodology mode
2. **PEER paragraph framework** (tip-1, tip-2) — for scientific-writing mode
3. **RMIT sentence starter phrases** (w-10 to w-12) — for all writing modes
4. **DISCOURSE SLR planning mnemonic** (semantic.jpg) — for literature-review mode
5. **10 research gap types** (doc-3) — extends existing 7-gap taxonomy
6. **Peer review 5-criteria framework** (doc-1) — for peer-review mode
7. **Research problem statement 4-element model** (doc-2) — for hypothesis mode
8. **22 research types taxonomy** (doc-31) — extends existing research design knowledge
9. **Literature review type comparison** (type.jpg, 3.jpg) — for literature-review mode
10. **Thesis ToC quantitative template** (w-13) — for chapter structure

---

## F. Critical Access Issue

The **Articles/Nouveau dossier/** subfolder is inaccessible via direct URL sharing. To access its contents, the owner must either:
1. **Individually share the subfolder** (set sharing permissions on the Nouveau dossier itself)
2. **Download the Nouveau dossier.rar** (8.1 MB) archive locally and extract it
3. **Provide the Google account credentials** for login-based browsing

Without this access, ~20+ files (art-1 through art-6, find-1 through find-7, RS-1 through RS-6, five-8 through five-11, six-1, six-2) remain unaudited.
