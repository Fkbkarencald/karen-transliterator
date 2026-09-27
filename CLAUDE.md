# CLAUDE.md

This file provides context for AI assistants working on the karen-transliterator codebase.

## Project Overview

`karen-transliterator` is a zero-dependency Node.js library that converts Sgaw Karen script (a Myanmar-script variant) into Latin text, one syllable at a time.

- **Author**: Frankie Benjamin
- **License**: MIT
- **Version**: see `package.json` (2.2.0 at the time of writing)
- **Module system**: CommonJS (`require`/`module.exports`)

### Who depends on it

[Ternah Lyrics](https://github.com/Fkbkarencald/ter-nah-lyrics) pins it by tag — `github:Fkbkarencald/karen-transliterator#vX.Y.Z` — in four install roots. The output shows up in the song page's Transliterate view, sing-alongs, subtitles, print and slides. It is also used to romanize search queries and the romanizations stored in Postgres for search. So a change in output is visible to readers, and it changes search matching until the stored romanizations are refreshed. After a release, follow the "Updating `karen-transliterator`" section of that repo's README.

That repo's IPA scheme (`packages/web-core/src/transliterationIpa.js`) copies this syllable regex and keeps its own whole-syllable exceptions (`SYLLABLES`). When you add an exception here, check whether the IPA needs the same one.

## File Structure

```
karen-transliterator/
├── index.js                          # transliterate()
├── karen-language-mapping.json       # All mapping data (see below)
├── test.js                           # Assertion suite: npm test
├── check-ayin.js                     # Exploration: every အ syllable and its output
├── check-combos.js                   # Exploration: which consonant+medial pairs occur
├── check-ra-medial.js                # Exploration: which consonants take ရ second
├── sgaw-complete-syllable-list.txt   # 3,435 Sgaw syllables, from kanyawtech/myanmar-karen-word-lists
├── package.json / package-lock.json
└── LICENSE
```

The `check-*.js` scripts print what `transliterate()` does with the syllable list; they are not tests. The list's header comment refers to the kanyawtech project's README, not this repo's.

## Core API

### `transliterate(input: string): string`

```javascript
const transliterate = require("karen-transliterator");

transliterate("ဒၢ");                  // "der"
transliterate("တၢ်လုၢ်လီၢ်, သၡိာ်");   // "tah lu law, ther sho"
transliterate("မ်နမံၤ");               // "maw ner mee"
transliterate("Hello 123 မ့ၢ်");       // "Hello 123 may"
```

- Non-Karen text (Latin, digits, punctuation) passes through unchanged.
- Syllables are joined with spaces, runs of whitespace collapse, the space before `, . ! ? ; :` is removed, and the result is trimmed.
- Karen or Myanmar marks the syllable regex does not consume are left in the output as they are (`"စမ်း"` → `"ser maw း"`). Consumers strip them; Ternah Lyrics does in `packages/web-core/src/transliteration.js`.

## Character Mapping (`karen-language-mapping.json`)

| Key | Count | Role |
|---|---|---|
| `consonants` | 26 | The 25 consonant letters plus the ခရ cluster (`kr`) |
| `medials` | 5 | ှ ၠ ြ ျ ွ |
| `vowels` | 9 | ါ ံ ၢ ု ူ ့ ဲ ိ ီ |
| `tone` | 5 | ၢ် and ၣ် add `h`; ာ် း ၤ add nothing |
| `consonant_medial_overrides` | 4 | Consonant+medial pairs replaced whole: ကၠ `j`, ခၠ `ch`, စှ `s`, ဆှ `s` |
| `ayin_vowel_map` | 9 | Vowels after အ, whose own `a` is dropped (အိ `oh`, အဲ `eh`, …) |
| `syllable_overrides` | 1 | Whole written syllables replaced before any other rule: the particle မ် is `maw` |

Prefer adding an exception here, as data, over adding a branch to `index.js`.

## How a Syllable Is Read (`index.js`)

The regex matches `(consonant)(medial?)(vowel?)(tone?)`. Its character classes must list exactly the keys of `consonants`, `medials`, `vowels` and `tone` (plus the bare ် tone). ခရ comes first so the cluster wins over ခ.

For each match, in this order:

1. **Whole syllable**: if the written syllable is in `syllable_overrides`, that value is the whole output.
2. **Onset**: a `consonant_medial_overrides` entry, otherwise consonant + medial. အ followed by a vowel or tone contributes no letters.
3. **Nucleus**:
   - a vowel other than ၢ → `vowels` (or `ayin_vowel_map` after အ)
   - ၢ with ် (the ၢ် tone) → `ah`
   - no vowel but a tone other than ် → `a`
   - ၢ without ် → `er`
   - no vowel and no tone → `er` (`"က"` → `"ker"`); a bare အ is `a`
4. **Tone**: the `tone` value is appended, but its `h` is dropped after a nucleus of two or more letters or `u` (`"ကါၣ်"` → `"kah"`, `"ကူၣ်"` → `"koo"`). A ် with no vowel gives `ee` (`"ဒ်"` → `"dee"`).

## Development Workflow

### Tests

```bash
npm test   # node test.js
```

`test.js` holds 95 assertions in 15 sections: every consonant, vowel, tone and medial, clusters, overrides, pass-through, spacing, and regression lines from real hymns. Failures print the expected and actual output, and the run exits 1. Every mapping change needs cases. For a new exception, also add a case showing the general rule still holds elsewhere; `ဒ်` staying `"dee"` guards the မ် override.

### Releasing

Consumers pin tags, so a change reaches no one until it is tagged:

1. `npm test`
2. `npm version X.Y.Z --no-git-tag-version`, which bumps `package.json` and `package-lock.json`. Output changes have been released as minor versions (v2.1.0, v2.2.0); the v2.0.0 overhaul was major.
3. Commit, `git tag vX.Y.Z`, then push `main` and the tag.
4. In Ternah Lyrics, follow the README's "Updating `karen-transliterator`" steps.

### Conventions

- Double quotes, 4-space indentation, CommonJS only (do not convert to ESM)
- `function` declarations for named exports
- No dependencies; keep the library dependency-free
- Conventional commit messages (`feat:`, `fix:`, `chore:`, `feat!:` for a breaking change); work on `main`, release by tag

## Known Issues

- The JSDoc on `transliterate()` in `index.js` says standalone consonants get an `a` vowel. They get `er`; the `a` is only for a consonant with no vowel and a tone other than ်.
- There is no lint config and no CI; `npm test` is the only check.
