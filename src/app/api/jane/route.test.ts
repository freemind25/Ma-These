import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Helpers ───────────────────────────────────────────

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/jane", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// Échantillons de HTML imitant la structure réelle de Jane
// (observations jane.biosemantics.org/suggestions.php — 2026-11)

const JOURNAL_ROW_OA = `<tr>
<td><div id="bluebar" title="Confidence is 6%"><div id="bluebarfill" style="width:6px; left:94px;"></div><div></td>
<td width="100%"> PloS one <div id="openaccess"><a href="openaccess.html" class="jTip" id="oa2" name="Open access">High-quality&nbsp;open&nbsp;access</a></div> <div id="medlineindexed"><a href="medlineindexed.html" class="jTip" id="mi2" name="Medline-indexed">Medline-indexed</a></div> <div id="pubmedcentral"><a href="pubmedcentral.html" class="jTip" id="pmc2" name="PubMed Central">PMC</a></div> </td>
<td><div id="orangebar" title="Article Influence = 1.1. Of all journals, 81% has a lower Article Influence score."><div id="orangebarfill" style="width:81px;"></div><div id="barcontent">1.1</div></div></td>
<td><input class="bigButton" id="button2" value="Show articles" type="button"></td>
</tr>`;

const JOURNAL_ROW_NOT_MEDLINE = `<tr>
<td><div id="bluebar" title="Confidence is 4%"><div id="bluebarfill" style="width:4px; left:96px;"></div><div></td>
<td width="100%"> J Prof Nurs </td>
<td><div id="orangebar" title="Article Influence = 0.4. Of all journals, 37% has a lower Article Influence score."><div id="orangebarfill" style="width:37px;"></div><div id="barcontent">0.4</div></div></td>
<td><input class="bigButton" id="button0" value="Show articles" type="button"></td>
</tr>`;

const INFO_ROW_TO_EXCLUDE = `<tr>
<td><div id="bluebar" title="Confidence is 6%"><div id="bluebarfill" style="width:6px;"></div><div></td>
<td width="100%">The confidence score for PloS one is based on these articles:</td>
<td><span name="Wrap_PMID_12345678" class="styledCheckboxWrap"><input type="checkbox" name="PMID_12345678" id="PMID_12345678" value="12345678" class="styledCheckbox" /></span></td>
<td><a href="https://pubmed.ncbi.nlm.nih.gov/12345678" target="_blank"/>Rocafort, TB</a><br> <strong>Following the Path; A Grounded Theory Study</strong><br> Some journal. 2020<br></td>
</tr>`;

const AUTHOR_ROW = `<tr>
<td><div id="bluebar" title="Confidence is 1%"><div id="bluebarfill" style="width:1px; left:99px;"></div><div></td>
<td width="100%"> Silva, JP </td>
<td><input class="bigButton" name="email0" value="E-mail" type="submit"><input type="hidden" name="authorName0" value="Silva, JP"><input type="hidden" name="authorPMIDs0" value="38651134;42237903"></td>
<td><input class="bigButton" id="button0" value="Show articles" type="button"></td>
</tr>`;

const AUTHOR_INFO_ROW = `<tr>
<td><div id="bluebar" title="Confidence is 1%"><div id="bluebarfill" style="width:1px;"></div><div></td>
<td width="100%">The confidence score for Silva, JP is based on these articles:</td>
<td><span name="Wrap_PMID_38651134" class="styledCheckboxWrap"><input type="checkbox" name="PMID_38651134" id="PMID_38651134" value="38651134" class="styledCheckbox" /></span></td>
</tr>`;

const AUTHOR_ROW_NO_PMIDS = `<tr>
<td><div id="bluebar" title="Confidence is 0%"><div id="bluebarfill" style="width:0px; left:100px;"></div><div></td>
<td width="100%"> Ribeiro, AI </td>
<td><input class="bigButton" name="email1" value="E-mail" type="submit"><input type="hidden" name="authorName1" value="Ribeiro, AI"><input type="hidden" name="authorPMIDs1" value=""></td>
<td><input class="bigButton" id="button1" value="Show articles" type="button"></td>
</tr>`;

const PAPER_ROW = `<tr>
<td><div id="bluebar" title="Similarity to your query is 100%"><div id="bluebarfill" style="width:100px; left:0px;"></div><div></td>
<td><span name="Wrap_PMID_38651134" class="styledCheckboxWrap"><input type="checkbox" name="PMID_38651134" id="PMID_38651134" value="38651134" onclick="setCheckboxDisplay(this)" class="styledCheckbox" /></span></td>
<td><a href="https://pubmed.ncbi.nlm.nih.gov/38651134" target="_blank"/>Silva, JP, Ribeiro, AI</a><br> <strong>Using Qualitative Methods to Understand the Interconnections Between Cities and Health: A Methodological Review.</strong><br> Public health reviews. 2024<br> <br> </td>
</tr>`;

const PAPER_ROW_2 = `<tr>
<td><div id="bluebar" title="Similarity to your query is 42%"><div id="bluebarfill" style="width:42px; left:58px;"></div><div></td>
<td><span name="Wrap_PMID_32819552" class="styledCheckboxWrap"><input type="checkbox" name="PMID_32819552" id="PMID_32819552" value="32819552" class="styledCheckbox" /></span></td>
<td><a href="https://pubmed.ncbi.nlm.nih.gov/32819552" target="_blank"/>Rocafort, TB</a><br> <strong>Following the Path; A Grounded Theory Study</strong><br> Nurse education today<br> <br> </td>
</tr>`;

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests : validation de la requête ──────────────────

describe("POST /api/jane — validation", () => {
  it("should return 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/jane", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for too-short text", async () => {
    const res = await POST(makePostRequest({ text: "ab", mode: "journals" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Veuillez coller");
  });

  it("should return 400 for text exceeding 5000 chars", async () => {
    const res = await POST(
      makePostRequest({ text: "x".repeat(5001), mode: "journals" })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Texte trop long");
  });

  it("should return 400 for invalid mode", async () => {
    const res = await POST(
      makePostRequest({ text: "Problem statement research", mode: "invalid" })
    );
    expect(res.status).toBe(400);
  });
});

// ── Tests : mode journals ─────────────────────────────

describe("POST /api/jane — mode journals", () => {
  it("should parse journals with confidence, badges and Article Influence", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(`<html><table>${JOURNAL_ROW_OA}${JOURNAL_ROW_NOT_MEDLINE}</table></html>`),
    });

    const res = await POST(
      makePostRequest({
        text: "Problem statement formulation in doctoral research",
        mode: "journals",
      })
    );
    expect(res.status).toBe(200);
    expect(mockFetch.mock.calls[0][0]).toContain("jane.biosemantics.org/suggestions.php");

    const body = await res.json();
    expect(body.mode).toBe("journals");
    expect(body.journals).toHaveLength(2);

    const plos = body.journals[0];
    expect(plos.name).toBe("PloS one");
    expect(plos.confidence).toBe(6);
    expect(plos.openAccess).toBe(true);
    expect(plos.openAccessLabel).toBe("High-quality open access");
    expect(plos.medlineIndexed).toBe(true);
    expect(plos.pmc).toBe(true);
    expect(plos.articleInfluence).toBe(1.1);
    expect(plos.influencePercentile).toBe(81);

    const jprof = body.journals[1];
    expect(jprof.name).toBe("J Prof Nurs");
    expect(jprof.confidence).toBe(4);
    expect(jprof.openAccess).toBe(false);
    expect(jprof.medlineIndexed).toBe(false);
    expect(jprof.pmc).toBe(false);
    expect(jprof.articleInfluence).toBe(0.4);
    expect(jprof.influencePercentile).toBe(37);
  });

  it("should never expose info/reference rows as journal results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(`<html><table>${JOURNAL_ROW_OA}${INFO_ROW_TO_EXCLUDE}</table></html>`),
    });

    const res = await POST(
      makePostRequest({ text: "Grounded theory doctoral research", mode: "journals" })
    );
    const body = await res.json();
    expect(body.journals).toHaveLength(1);
    expect(body.journals[0].name).toBe("PloS one");
  });

  it("should send the findJournals button name to Jane", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("<html></html>"),
    });

    await POST(makePostRequest({ text: "Doctoral research methods", mode: "journals" }));
    const sentBody = mockFetch.mock.calls[0][1].body as string;
    expect(sentBody).toContain("findJournals");
    expect(sentBody).toContain("text=Doctoral");
  });

  it("should forward language and publication-type filters only when set", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<html></html>"),
    });

    // Sans filtres : aucune langue / type transmis
    await POST(makePostRequest({ text: "Doctoral research methods", mode: "journals" }));
    let sentBody = mockFetch.mock.calls[0][1].body as string;
    expect(sentBody).not.toContain("language0");
    expect(sentBody).not.toContain("type0");

    // Avec filtres : langues + types transmis avec leurs compteurs
    await POST(
      makePostRequest({
        text: "Doctoral research methods",
        mode: "journals",
        languages: ["eng", "fre"],
        publicationTypes: ["Journal Article", "Review"],
      })
    );
    sentBody = mockFetch.mock.calls[1][1].body as string;
    expect(sentBody).toContain("language0=eng");
    expect(sentBody).toContain("language1=fre");
    expect(sentBody).toContain("languageCount=7");
    expect(sentBody).toContain("type0=Journal+Article");
    expect(sentBody).toContain("type1=Review");
    expect(sentBody).toContain("typeCount=19");
  });

  it("should reject unknown language and type values", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<html></html>"),
    });

    await POST(
      makePostRequest({
        text: "Doctoral research methods",
        mode: "journals",
        languages: ["eng", "xx-invalid"],
        publicationTypes: ["Review", "Not-A-Real-Type"],
      })
    );
    const sentBody = mockFetch.mock.calls[0][1].body as string;
    expect(sentBody).toContain("language0=eng");
    expect(sentBody).not.toContain("language1=xx-invalid");
    expect(sentBody).toContain("type0=Review");
    expect(sentBody).not.toContain("Not-A-Real-Type");
  });

  it("should return empty list when Jane has no suggestion", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("<html><body><table></table></body></html>"),
    });

    const res = await POST(
      makePostRequest({ text: "Doctoral research methods", mode: "journals" })
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.journals).toEqual([]);
  });
});

// ── Tests : mode authors ──────────────────────────────

describe("POST /api/jane — mode authors", () => {
  it("should parse authors with confidence and PMIDs", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(`<html><table>${AUTHOR_ROW}${AUTHOR_ROW_NO_PMIDS}${AUTHOR_INFO_ROW}</table></html>`),
    });

    const res = await POST(
      makePostRequest({ text: "Urban studies qualitative methods", mode: "authors" })
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.mode).toBe("authors");
    expect(body.authors).toHaveLength(2);

    const silva = body.authors[0];
    expect(silva.name).toBe("Silva, JP");
    expect(silva.confidence).toBe(1);
    expect(silva.pmids).toEqual(["38651134", "42237903"]);

    const ribeiro = body.authors[1];
    expect(ribeiro.name).toBe("Ribeiro, AI");
    expect(ribeiro.pmids).toEqual([]);
  });

  it("should send the findAuthors button name to Jane", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("<html></html>"),
    });

    await POST(makePostRequest({ text: "Urban studies qualitative methods", mode: "authors" }));
    const sentBody = mockFetch.mock.calls[0][1].body as string;
    expect(sentBody).toContain("findAuthors");
  });
});

// ── Tests : mode papers ───────────────────────────────

describe("POST /api/jane — mode papers", () => {
  it("should parse papers with PMID, authors, title, journal, year and similarity", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(`<html><table>${PAPER_ROW}${PAPER_ROW_2}</table></html>`),
    });

    const res = await POST(
      makePostRequest({ text: "Urban studies qualitative methods", mode: "papers" })
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.mode).toBe("papers");
    expect(body.papers).toHaveLength(2);

    const first = body.papers[0];
    expect(first.pmid).toBe("38651134");
    expect(first.authors).toBe("Silva, JP, Ribeiro, AI");
    expect(first.title).toBe(
      "Using Qualitative Methods to Understand the Interconnections Between Cities and Health: A Methodological Review."
    );
    expect(first.journal).toBe("Public health reviews");
    expect(first.year).toBe("2024");
    expect(first.similarity).toBe(100);

    const second = body.papers[1];
    expect(second.pmid).toBe("32819552");
    expect(second.title).toBe("Following the Path; A Grounded Theory Study");
    // Pas d'année dans la ligne : journal seul
    expect(second.journal).toBe("Nurse education today");
    expect(second.year).toBe("");
    expect(second.similarity).toBe(42);
  });

  it("should send the findPapers button name to Jane", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("<html></html>"),
    });

    await POST(makePostRequest({ text: "Urban studies qualitative methods", mode: "papers" }));
    const sentBody = mockFetch.mock.calls[0][1].body as string;
    expect(sentBody).toContain("findPapers");
  });
});

// ── Tests : erreurs réseau ────────────────────────────

describe("POST /api/jane — erreurs externes", () => {
  it("should return 502 when Jane answers with an HTTP error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const res = await POST(
      makePostRequest({ text: "Doctoral research methods", mode: "journals" })
    );
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toContain("503");
  });

  it("should return 502 with a clear message when Jane is unreachable", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const res = await POST(
      makePostRequest({ text: "Doctoral research methods", mode: "journals" })
    );
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toContain("Impossible de joindre Jane");
  });

  it("should return 502 with a timeout message on TimeoutError", async () => {
    const timeoutError = new Error("The operation was aborted due to timeout");
    timeoutError.name = "TimeoutError";
    mockFetch.mockRejectedValueOnce(timeoutError);

    const res = await POST(
      makePostRequest({ text: "Doctoral research methods", mode: "journals" })
    );
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toContain("délai imparti");
  });
});
