const mapping = require("./karen-language-mapping.json");

const regex = new RegExp(
    "(ခရ|က|ခ|ဂ|ဃ|င|စ|ဆ|ၡ|ည|တ|ထ|ဒ|န|ပ|ဖ|ဘ|မ|ယ|ရ|လ|ဝ|သ|ဟ|အ|ဧ)" + // Consonant (Required)
    "(ှ|ၠ|ြ|ျ|ွ)?" + // Medial (Optional)
    "(ါ|ံ|ၢ|ု|ူ|့|ဲ|ိ|ီ)?" + // Vowel (Optional)
    "(ၢ်|ာ်|း|ၣ်|ၤ|်)?", // Tone (Optional)
    "g"
);

/**
 * Transliterates Karen script to Latin while preserving spaces and other characters.
 * - Standalone consonants get an 'a' vowel.
 * - Non-Karen characters (spaces, punctuation, numbers) remain unchanged.
 * - Tones are **applied first** but stay in the correct position.
 * - Adds spaces between each transliterated Karen word.
 * @param {string} input - Karen script text.
 * @returns {string} - Transliterated text with proper spacing.
 */
function transliterate(input) {
    let output = [];
    let lastIndex = 0;

    input.replace(regex, (match, consonant, medial, vowel, tone, offset) => {
        // Add unchanged text before the match (preserves spaces and other characters)
        if (offset > lastIndex) {
            output.push(input.slice(lastIndex, offset));
        }

        let result = "";

        const override = consonant && medial && mapping.consonant_medial_overrides[consonant + medial];
        if (override !== undefined) {
            result += override;
        } else {
            if (consonant && mapping.consonants[consonant]) {
                result += mapping.consonants[consonant];
            }
            if (medial && mapping.medials[medial]) {
                result += mapping.medials[medial];
            }
        }
        // Handle "ၢ" as a vowel **only if it's not part of "ၢ်"**
        let vowelOutput = "";
        if (vowel && vowel !== "ၢ") {
            vowelOutput = mapping.vowels[vowel];
            result += vowelOutput;
        }
        else if (vowel && vowel === "ၢ" && tone && tone === '်') {
            vowelOutput = "ah";
            result += vowelOutput;
        }
        else if (consonant && !vowel && (tone && tone !== '်')) {
            // If there's no vowel, add "a"
            vowelOutput = "a";
            result += vowelOutput;
        }
        else if (vowel && vowel === "ၢ") {
            // If there's no tone
            vowelOutput = mapping.vowels[vowel];
            result += vowelOutput;
        }
        else if (consonant && !vowel && !tone && consonant !== "အ") {
            // Bare consonant (no vowel, no tone) gets default "er"
            result += "er";
        }

        if (tone && mapping.tone[tone] !== undefined) {
            const toneVal = mapping.tone[tone];
            if (toneVal === "h" && (vowelOutput.length >= 2 || vowelOutput === "u")) {
                // Drop "h" when the vowel is 2+ characters (e.g. "ay", "er", "ee")
            } else {
                result += toneVal;
            }
        }
        else if (tone && tone === '်' && !vowel) {
            result += "ee";
        }

        output.push(result);
        lastIndex = offset + match.length;
    });

    // Add any remaining text after the last match (preserves spaces at the end)
    if (lastIndex < input.length) {
        output.push(input.slice(lastIndex));
    }

    return output.join(" ").replace(/\s+/g, " ").replace(/ ([,\.!?;:])/g, "$1").trim(); // Ensure proper word spacing
}

module.exports = transliterate;
