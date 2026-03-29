const transliterate = require("./index");
const mapping = require("./karen-language-mapping.json");

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
    if (actual === expected) {
        passed++;
    } else {
        failed++;
        console.error(`FAIL: ${description}`);
        console.error(`  expected: ${JSON.stringify(expected)}`);
        console.error(`  actual:   ${JSON.stringify(actual)}`);
    }
}

function section(name) {
    console.log(`\n── ${name} ──`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ALL 25 CONSONANTS — bare (no vowel, no tone)
//    A bare consonant with no tone gets NO default vowel.
// ─────────────────────────────────────────────────────────────────────────────
section("All 25 consonants (bare)");

const consonantCases = [
    ["က", "k"],   ["ခ", "kh"],  ["ဂ", "gh"],  ["ဃ", "kgh"], ["င", "ng"],
    ["စ", "s"],   ["ဆ", "s"],   ["ၡ", "sh"],  ["ည", "ny"],  ["တ", "t"],
    ["ထ", "ht"],  ["ဒ", "d"],   ["န", "n"],   ["ပ", "bp"],  ["ဖ", "p"],
    ["ဘ", "b"],   ["မ", "m"],   ["ယ", "y"],   ["ရ", "r"],   ["လ", "l"],
    ["ဝ", "w"],   ["သ", "th"],  ["ဟ", "h"],   ["အ", "a"],   ["ဧ", "ha"],
];

for (const [char, expected] of consonantCases) {
    assert(`consonant ${char} → ${expected}`, transliterate(char), expected);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ALL 9 VOWELS — paired with consonant က (k)
//    The ၢ vowel is handled separately below due to its special cases.
// ─────────────────────────────────────────────────────────────────────────────
section("All 9 vowels with consonant က");

for (const [vowel, latin] of Object.entries(mapping.vowels)) {
    if (vowel === "ၢ") continue; // tested separately in section 3
    assert(
        `က + vowel ${vowel} → k${latin}`,
        transliterate("က" + vowel),
        "k" + latin
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. VOWEL ၢ SPECIAL CASES
//    ၢ alone (no tone)       → "er"  (normal vowel lookup)
//    ၢ + ်  (asat tone)     → "ah"  (special-cased, overrides "er")
// ─────────────────────────────────────────────────────────────────────────────
section("Vowel ၢ special cases");

assert("ကၢ  (ၢ alone, no tone)  → ker", transliterate("ကၢ"), "ker");
assert("ကၢ် (ၢ + ် tone)      → kah", transliterate("ကၢ်"), "kah");

// ─────────────────────────────────────────────────────────────────────────────
// 4. TONE ် (ASAT) WITHOUT A VOWEL → "ee"
//    When ် appears with no vowel the function emits "ee".
// ─────────────────────────────────────────────────────────────────────────────
section("Tone ် without vowel → ee");

assert("က်  (ကသာ ် no vowel)  → kee", transliterate("က်"), "kee");
assert("တ်                    → tee", transliterate("တ်"), "tee");
assert("လ်                    → lee", transliterate("လ်"), "lee");

// ─────────────────────────────────────────────────────────────────────────────
// 5. CONSONANT + NON-ASAT TONE, NO VOWEL → default "a" inserted
//    Any tone other than ် triggers a default "a" vowel when there is no
//    explicit vowel character in the syllable.
//    Note: the compound tone "ၢ်" cannot appear in the tone slot independently
//    because ၢ is always captured first by the vowel group.
// ─────────────────────────────────────────────────────────────────────────────
section("Consonant + tone (no vowel) → default 'a'");

assert("ကာ် (tone ာ်  → \"\")  → ka",  transliterate("ကာ်"), "ka");
assert("ကး  (tone း   → \"\")  → ka",  transliterate("ကး"),  "ka");
assert("ကၣ် (tone ၣ်  → \"h\") → kah", transliterate("ကၣ်"), "kah");
assert("ကၤ  (tone ၤ   → \"\")  → ka",  transliterate("ကၤ"),  "ka");

// ─────────────────────────────────────────────────────────────────────────────
// 6. ALL 5 MAPPING TONES — applied to consonant + regular vowel ါ
//    Uses ါ (maps to "a") as a neutral base vowel to test each tone suffix.
// ─────────────────────────────────────────────────────────────────────────────
section("All 5 tones applied to ကါ (ka)");

assert("ကါၢ် (tone ၢ် → \"h\") → kah", transliterate("ကါၢ်"), "kah");
assert("ကါာ် (tone ာ် → \"\")  → ka",  transliterate("ကါာ်"), "ka");
assert("ကါး  (tone း  → \"\")  → ka",  transliterate("ကါး"),  "ka");
assert("ကါၣ် (tone ၣ် → \"h\") → kah", transliterate("ကါၣ်"), "kah");
assert("ကါၤ  (tone ၤ  → \"\")  → ka",  transliterate("ကါၤ"),  "ka");

// ─────────────────────────────────────────────────────────────────────────────
// 7. ALL 5 MEDIALS — with consonant တ (t) + vowel ါ (a)
//    Expected pattern: t + medial-latin + a
//    NOTE: ၠ is a known bug — mapping key is "|ၠ" (with stray pipe) instead
//    of "ၠ", so the medial is silently dropped and the result is "ta" not "tja".
// ─────────────────────────────────────────────────────────────────────────────
section("All 5 medials with တါ (ta) base");

assert("တြါ (medial ြ → r) → tra", transliterate("တြါ"), "tra");
assert("တျါ (medial ျ → l) → tla", transliterate("တျါ"), "tla");
assert("တွါ (medial ွ → w) → twa", transliterate("တွါ"), "twa");
assert("တှါ (medial ှ → g) → tga", transliterate("တှါ"), "tga");
// BUG: mapping key "|ၠ" has a stray "|" — fix by renaming the key to "ၠ"
assert("တၠါ (medial ၠ → j) → tja [BUG: currently produces 'ta']", transliterate("တၠါ"), "tja");

// ─────────────────────────────────────────────────────────────────────────────
// 8. CONSONANT + MEDIAL + VOWEL + TONE combinations
// ─────────────────────────────────────────────────────────────────────────────
section("Medial + vowel + tone combinations");

assert("တြၢ်  (t + r + ah)       → trah",  transliterate("တြၢ်"), "trah");
assert("တြၢ   (t + r + er)       → trer",  transliterate("တြၢ"),  "trer");
assert("တြါၢ် (t + r + a + h)    → trah",  transliterate("တြါၢ်"), "trah");
assert("ကှါ   (k + g + a)        → kga",   transliterate("ကှါ"),  "kga");
assert("ကွၢ်  (k + w + ah)       → kwah",  transliterate("ကွၢ်"), "kwah");

// ─────────────────────────────────────────────────────────────────────────────
// 9. FULL SYLLABLE COMBINATIONS — consonant + vowel + tone
// ─────────────────────────────────────────────────────────────────────────────
section("Full syllable: consonant + vowel + tone");

assert("ဒၢ   (d + er)           → der",  transliterate("ဒၢ"),   "der");
assert("တၢ်  (t + ah)           → tah",  transliterate("တၢ်"),  "tah");
assert("လုၢ် (l + u + h)        → luh",  transliterate("လုၢ်"), "luh");
assert("လီၢ် (l + aw + h)       → lawh", transliterate("လီၢ်"), "lawh");
assert("သၡိ  (th + sh + o)     is two syllables: th sh+o", transliterate("သၡိ"), "th sho");
assert("ဟံ   (h + ee)           → hee",  transliterate("ဟံ"),   "hee");
assert("ဘါ   (b + a)            → ba",   transliterate("ဘါ"),   "ba");
assert("ဖိ   (p + o)            → po",   transliterate("ဖိ"),   "po");
assert("ကIၢ် with ၡ (sh)       → shah", transliterate("ၡၢ်"),   "shah");

// ─────────────────────────────────────────────────────────────────────────────
// 10. NON-KAREN CHARACTER PRESERVATION
//     Spaces, punctuation, digits, and ASCII letters pass through unchanged.
//     They are placed in the output without added surrounding spaces
//     (the join(" ") + collapse step may introduce at most one space).
// ─────────────────────────────────────────────────────────────────────────────
section("Non-Karen character preservation");

assert("empty string               → \"\"",      transliterate(""),         "");
assert("ASCII letters              → unchanged", transliterate("hello"),    "hello");
assert("digits                     → unchanged", transliterate("123"),      "123");
assert("punctuation                → unchanged", transliterate("!?."),      "!?.");
assert("Karen + period             → der .",     transliterate("ဒၢ."),      "der .");
assert("Karen + comma + Karen      → der , tah", transliterate("ဒၢ, တၢ်"), "der , tah");
assert("Karen + digits             → der 123",   transliterate("ဒၢ123"),    "der 123");
assert("ASCII before Karen         → hello der", transliterate("helloဒၢ"), "hello der");
assert("lone vowel char (no cons)  → ါ",         transliterate("ါ"),        "ါ");
assert("lone tone char (no cons)   → ်",          transliterate("်"),         "်");

// ─────────────────────────────────────────────────────────────────────────────
// 11. MULTI-SYLLABLE SPACING
//     Adjacent Karen syllables always get a space inserted between them even
//     when the source text has no space. Multiple spaces collapse to one.
// ─────────────────────────────────────────────────────────────────────────────
section("Multi-syllable spacing");

assert("two syllables (no space)   → der tah", transliterate("ဒၢတၢ်"),  "der tah");
assert("two syllables (one space)  → der tah", transliterate("ဒၢ တၢ်"), "der tah");
assert("two syllables (two spaces) → der tah", transliterate("ဒၢ  တၢ်"),"der tah");
assert("three syllables            → der tah der", transliterate("ဒၢတၢ်ဒၢ"), "der tah der");

// ─────────────────────────────────────────────────────────────────────────────
// 12. REGRESSION — original smoke-test inputs
// ─────────────────────────────────────────────────────────────────────────────
section("Regression (original smoke tests)");

assert(
    "ဒၢ → der",
    transliterate("ဒၢ"),
    "der"
);

// The long sentence from the original test.js — expected value hardcoded from
// current implementation output so regressions surface on future changes.
assert(
    "long sentence regression",
    transliterate("တၢ်လုၢ်လီၢ်, သၡိာ်အလံာ်စီဆှံအစီၢ်နီၤခိၣ်,ပှၤဟံၣ်ဖိဃီဖိအတၢ်ဘါ."),
    "tah luh lawh , th sho a lee saw sgee a sawh naw khoh , bpga heeh po kghaw po a tah ba ."
);

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${passed}/${total} tests passed`);
if (failed > 0) {
    process.exit(1);
}
