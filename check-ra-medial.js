const fs = require("fs");
const lines = fs.readFileSync("sgaw-complete-syllable-list.txt", "utf8")
    .split("\n").map(function(l) { return l.trim(); })
    .filter(function(l) { return l && l[0] !== "#"; });
const ra = "\u101B"; // ရ
const hits = lines.filter(function(l) { return l.length > 1 && l[1] === ra; });
const firstChars = {};
hits.forEach(function(l) {
    firstChars[l[0]] = (firstChars[l[0]] || 0) + 1;
});
console.log("Consonants that take ရ as 2nd char (medial-r):");
Object.keys(firstChars).forEach(function(c) {
    console.log("  " + c + " : " + firstChars[c] + " syllables");
});
console.log("\nSample syllables:");
hits.slice(0, 10).forEach(function(l) {
    const codes = Array.from(l).map(function(c) { return "U+" + c.codePointAt(0).toString(16).toUpperCase(); });
    console.log("  " + l + "  (" + codes.join(" ") + ")");
});
