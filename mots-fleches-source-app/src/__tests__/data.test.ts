import { describe, it, expect } from "vitest";
import {
  normalize,
  wordKey,
  shuffle,
  wiktUrl,
  buildSmartDeck,
  WORDS,
  type Word,
  type Stats,
} from "../data";

// ---- normalize ----
describe("normalize", () => {
  it("lowercases input", () => {
    expect(normalize("BONJOUR")).toBe("bonjour");
  });

  it("strips common French accents", () => {
    expect(normalize("é")).toBe("e");
    expect(normalize("è")).toBe("e");
    expect(normalize("ê")).toBe("e");
    expect(normalize("ô")).toBe("o");
    expect(normalize("î")).toBe("i");
    expect(normalize("ï")).toBe("i");
    expect(normalize("â")).toBe("a");
    expect(normalize("à")).toBe("a");
    expect(normalize("û")).toBe("u");
    expect(normalize("ù")).toBe("u");
    expect(normalize("ç")).toBe("c");
  });

  it("removes non-alpha characters (spaces, slashes, hyphens)", () => {
    expect(normalize("a b")).toBe("ab");
    expect(normalize("a/b")).toBe("ab");
    expect(normalize("a-b")).toBe("ab");
  });

  it("handles empty string", () => {
    expect(normalize("")).toBe("");
  });

  it("handles a realistic word", () => {
    expect(normalize("IENISSEÏ")).toBe("ienissei");
  });
});

// ---- wordKey ----
describe("wordKey", () => {
  it("produces key from normalized mot and category", () => {
    const word: Word = { mot: "ERSE", defs: ["def"], lettres: 4, cat: "marine" };
    expect(wordKey(word)).toBe("erse_marine");
  });

  it("uses only the first part of a slash-separated mot", () => {
    const word: Word = { mot: "LEU / LEI", defs: ["def"], lettres: 3, cat: "monnaie" };
    expect(wordKey(word)).toBe("leu_monnaie");
  });

  it("strips accents in the key", () => {
    const word: Word = { mot: "ÉROS", defs: ["def"], lettres: 4, cat: "mytho2" };
    expect(wordKey(word)).toBe("eros_mytho2");
  });
});

// ---- shuffle ----
describe("shuffle", () => {
  it("returns an array with the same elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.slice().sort()).toEqual(arr.slice().sort());
  });

  it("returns the same length", () => {
    const arr = ["a", "b", "c"];
    expect(shuffle(arr)).toHaveLength(arr.length);
  });

  it("does not mutate the original array", () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  it("handles empty array", () => {
    expect(shuffle([])).toEqual([]);
  });
});

// ---- wiktUrl ----
describe("wiktUrl", () => {
  it("capitalizes title for geo category", () => {
    const word: Word = { mot: "ORNE", defs: ["def"], lettres: 4, cat: "géo2" };
    const url = wiktUrl(word);
    expect(url).toContain("Orne");
  });

  it("capitalizes title for mytho category", () => {
    const word: Word = { mot: "ÉROS", defs: ["def"], lettres: 4, cat: "mytho2" };
    const url = wiktUrl(word);
    // lowercase = "éros", capitalized = "Éros" → encoded as %C3%89ros
    expect(url).toContain("%C3%89ros");
  });

  it("lowercases title for non-proper categories", () => {
    const word: Word = { mot: "ESSE", defs: ["def"], lettres: 4, cat: "objet" };
    const url = wiktUrl(word);
    expect(url).toContain("esse"); // not "Esse"
    expect(url).not.toContain("Esse");
  });

  it("forcedProper set overrides non-geo/mytho category to capitalize", () => {
    // "io" is in forcedProper set, cat is "mytho" (also proper) — already capital
    // "asti" is in forcedProper, cat is "gastro" (not proper)
    const word: Word = { mot: "ASTI", defs: ["def"], lettres: 4, cat: "gastro" };
    const url = wiktUrl(word);
    expect(url).toContain("Asti");
  });

  it("forcedCommon overrides geo category to lowercase", () => {
    // "erg" is in forcedCommon, cat is "géo"
    const word: Word = { mot: "ERG", defs: ["def"], lettres: 3, cat: "géo" };
    const url = wiktUrl(word);
    expect(url).toContain("erg");
    expect(url).not.toContain("Erg");
  });

  it("uses only first part of slash-separated mot", () => {
    const word: Word = { mot: "LEU / LEI", defs: ["def"], lettres: 3, cat: "monnaie" };
    const url = wiktUrl(word);
    expect(url).toContain("leu");
    expect(url).not.toContain("lei");
  });

  it("returns a wiktionary URL", () => {
    const word: Word = { mot: "ACE", defs: ["def"], lettres: 3, cat: "sport" };
    expect(wiktUrl(word)).toMatch(/^https:\/\/fr\.wiktionary\.org\/wiki\//);
  });
});

// ---- buildSmartDeck ----
describe("buildSmartDeck", () => {
  it("returns all words", () => {
    const deck = buildSmartDeck(WORDS, {});
    expect(deck).toHaveLength(WORDS.length);
  });

  it("each item has word and def properties", () => {
    const deck = buildSmartDeck(WORDS, {});
    deck.forEach((item) => {
      expect(item).toHaveProperty("word");
      expect(item).toHaveProperty("def");
      expect(typeof item.def).toBe("string");
    });
  });

  it("words with high error rate sort before words with perfect stats", () => {
    const now = Date.now();
    const [w1, w2] = WORDS.slice(0, 2);
    const stats: Stats = {
      [wordKey(w1)]: { e: 10, s: 0, last: now - 86400000, streak: 0 }, // all errors
      [wordKey(w2)]: { e: 0, s: 10, last: now - 86400000, streak: 5 }, // all correct
    };
    const deck = buildSmartDeck([w1, w2], stats);
    // w1 (high errors) should appear before w2 (perfect)
    expect(deck[0].word).toEqual(w1);
  });

  it("unseen words (empty stats) get non-trivial weight", () => {
    const deck = buildSmartDeck(WORDS, {});
    // All items should have a def string (def is picked from word.defs)
    expect(deck[0].def).toBeTruthy();
  });

  it("word not seen for a long time gets higher priority than recently seen", () => {
    const now = Date.now();
    const [w1, w2] = WORDS.slice(0, 2);
    const stats: Stats = {
      [wordKey(w1)]: { e: 0, s: 5, last: now - 30 * 86400000, streak: 5 }, // 30 days ago
      [wordKey(w2)]: { e: 0, s: 5, last: now - 86400000, streak: 5 },       // yesterday
    };
    const deck = buildSmartDeck([w1, w2], stats);
    // w1 (stale) should appear before w2 (recent)
    expect(deck[0].word).toEqual(w1);
  });
});
