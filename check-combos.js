const fs = require("fs");
const mapping = require("./karen-language-mapping.json");

const syllables = new Set(
    fs.readFileSync("sgaw-complete-syllable-list.txt", "utf8")
        .split("\n")
        .map(function(l) { return l.trim(); })
        .filter(function(l) { return l && !l.startsWith("#"); })
);

console.log("Total syllables in list:", syllables.size);

const consonants = Object.keys(mapping.consonants);
const medials = Object.keys(mapping.medials);

console.log("\n── Consonant + Medial combinations ──");
console.log("(checking if consonant+medial prefix exists in any syllable)\n");

for (const c of consonants) {
    const results = [];
    for (const m of medials) {
        const prefix = c + m;
        // a consonant+medial combo "exists" if any syllable starts with it
        const exists = [...syllables].some(function(s) { return s.startsWith(prefix); });
        results.push(m + ":" + (exists ? "yes" : " NO"));
    }
    console.log(mapping.consonants[c].padEnd(4) + " " + c + "  " + results.join("  "));
}
