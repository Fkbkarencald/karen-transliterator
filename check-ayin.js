const fs = require("fs");
const transliterate = require("./index");

const lines = fs.readFileSync("sgaw-complete-syllable-list.txt", "utf8")
    .split("\n")
    .map(function(l) { return l.trim(); })
    .filter(function(l) { return l && l[0] !== "#"; });

const ayin = "\u1021"; // အ

const hits = lines.filter(function(l) { return l[0] === ayin; });

console.log("Total အ syllables:", hits.length);
console.log("");

hits.forEach(function(syllable) {
    const codepoints = Array.from(syllable).map(function(c) {
        return "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
    });
    const result = transliterate(syllable);
    console.log(syllable + "\t" + result + "\t[" + codepoints.join(" ") + "]");
});
