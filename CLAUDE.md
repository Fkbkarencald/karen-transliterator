# CLAUDE.md

This file provides context for AI assistants working on the karen-transliterator codebase.

## Project Overview

`karen-transliterator` is a zero-dependency Node.js library that converts Sgaw Karen script (a Myanmar/Burmese script variant) into Latin (romanized) text. It handles the complex syllabic structure of Karen script including consonants, medials, vowels, and tone markers.

- **Author**: Frankie Benjamin
- **License**: MIT
- **Version**: 1.0.0
- **Module system**: CommonJS (`require`/`module.exports`)

## File Structure

```
karen-transliterator/
├── index.js                      # Main module — exports the transliterate() function
├── karen-language-mapping.json   # Character mapping data (consonants, medials, vowels, tones)
├── test.js                       # Manual smoke tests (console.log-based)
├── package.json                  # Project manifest
├── package-lock.json             # Dependency lock file
└── LICENSE                       # MIT License
```

## Core API

### `transliterate(input: string): string`

Exported from `index.js`. Converts Karen script text to Latin transliteration.

- Non-Karen characters (spaces, punctuation, numbers) are preserved unchanged
- Transliterated syllables are joined with spaces
- Multiple spaces are normalized to a single space

**Usage:**
```javascript
const transliterate = require("karen-transliterator");

transliterate("ဒၢ");
// => "der"

transliterate("တၢ်လုၢ်လီၢ်, သၡိာ်");
// => "tah lu leeah, thsho"
```

## Character Mapping (`karen-language-mapping.json`)

The mapping file has four top-level keys:

| Key          | Count | Description                              |
|--------------|-------|------------------------------------------|
| `consonants` | 25    | Karen consonant characters → Latin       |
| `medials`    | 5     | Medial (modifier) characters → Latin     |
| `vowels`     | 9     | Vowel diacritics → Latin                 |
| `tone`       | 5     | Tone markers → Latin (some map to `""`)  |

Note: the medials entry `"|ၠ": "j"` has a leading pipe character in the key — this appears to be a data quirk, not a regex alternation.

## Transliteration Logic (`index.js`)

### Regex Structure

The regex matches a Karen syllable as:

```
(consonant)(medial?)(vowel?)(tone?)
```

- **Consonant** (required): One of 25 characters
- **Medial** (optional): One of 5 modifier characters
- **Vowel** (optional): One of 9 vowel diacritics
- **Tone** (optional): One of 5 tone markers

The regex uses the global `"g"` flag and is compiled once at module load.

### Special Cases

1. **Standalone consonant (no vowel)**: Adds a default `"a"` vowel — but only when a tone is present and the tone is not `်`.
2. **"ၢ" vowel + `်` tone**: Rendered as `"ah"` (not the default `"er"` for "ၢ" alone).
3. **`်` tone without vowel**: Rendered as `"ee"`.
4. **Consonant with no vowel and no tone**: No default vowel is added (result is just the consonant transliteration).

### Text Preservation

The function tracks `lastIndex` between matches and slices unreplaced segments from the input, preserving punctuation, numbers, and whitespace in their original positions. The final output joins all pieces with spaces and collapses runs of whitespace.

## Development Workflow

### Running Tests

```bash
npm test
# or
node test.js
```

Tests print two lines to stdout. Verify output visually — there are no assertions or a test framework.

### Adding or Modifying Character Mappings

Edit `karen-language-mapping.json`. The four top-level keys (`consonants`, `medials`, `vowels`, `tone`) must remain as-is because `index.js` references them directly (`mapping.consonants`, `mapping.medials`, `mapping.vowels`, `mapping.tone`).

### Modifying the Regex

The regex character classes in `index.js:3-9` must stay in sync with the keys in `karen-language-mapping.json`. If you add a character to `consonants`, add it to the consonant group in the regex, and vice versa.

### No Build Step

There is no compilation, bundling, or transpilation. Edit source files directly.

## Conventions

- **String quotes**: Double quotes (`"`)
- **Indentation**: 4 spaces
- **Function style**: Traditional `function` declarations (not arrow functions) for named exports
- **Module system**: CommonJS only — do not convert to ESM
- **No external dependencies**: Keep this library dependency-free

## Known Issues / Areas for Improvement

- `test.js` has no assertions; failures are silent unless output is manually checked
- The medials mapping key `"|ၠ": "j"` has a stray `|` prefix that likely prevents it from matching
- Standalone consonants without a tone marker do not get a default vowel (intentional or oversight is unclear)
- No `.gitignore`, no linting config, no CI

## Branch

Active development branch: `claude/add-claude-documentation-WEZHM`
