const mapping = require("./karen-language-mapping.json");

const regex = new RegExp(
    "(က|ခ|ဂ|ဃ|င|စ|ဆ|ၡ|ည|တ|ထ|ဒ|န|ပ|ဖ|ဘ|မ|ယ|ရ|လ|ဝ|သ|ဟ|အ|ဧ)" + // Consonant (Required)
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

        if (consonant && mapping.consonants[consonant]) {
            result += mapping.consonants[consonant];
        }
        if (medial && mapping.medials[medial]) {
            result += mapping.medials[medial];
        }
        // Handle "ၢ" as a vowel **only if it's not part of "ၢ်"**
        if (vowel && vowel !== "ၢ") {
            result += mapping.vowels[vowel];
        }
        else if (vowel && vowel === "ၢ" && tone && tone === '်') {
            result += "ah";
        }
        else if (consonant && !vowel && (tone && tone !== '်')) {
            // If there's no vowel, add "a"
            result += "a";
        }
        else if (vowel && vowel === "ၢ") {
            // If there's no tone
            result += mapping.vowels[vowel];
        }

        if (tone && mapping.tone[tone] !== undefined) {
            result += mapping.tone[tone];
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

    return output.join(" ").replace(/\s+/g, " ").trim(); // Ensure proper word spacing
}

module.exports = transliterate;
