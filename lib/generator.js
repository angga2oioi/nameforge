const dns = require("dns").promises;

async function checkDomainAvailability(domain) {
    try {
        await dns.resolveAny(domain);
        return false; // Domain is taken
    } catch (error) {
        if (error.code === "ENOTFOUND") {
            console.log(`${domain} ✅`);
            return true; // Domain is available
        } else {
            return false; // Treat as unavailable in case of unknown errors
        }
    }
}

function generateWord(seed, position, maxLength) {
    const vowels = "aeiou";
    const consonants = "bcdfghjklmnpqrstvwxyz";
    const consonantClusters = [
        "bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sk", "sl", "sm", "sn", "sp", "st", "sw", "tr", "tw",
        "str", "spr", "scr", "spl", "shr", "thr"
    ];

    // 🎯 Choose a **random length** between (seed.length + 1) and maxLength
    const targetLength = Math.floor(Math.random() * (maxLength - seed.length)) + (seed.length + 1);

    let word = "";
    let seedPosition;
    if (position === "start") {
        seedPosition = 0;
    } else if (position === "end") {
        seedPosition = wordLength - seed.length;
    } else if (position === "middle") {
        seedPosition = Math.floor((wordLength - seed.length) / 2);
    } else { // Random
        seedPosition = Math.floor(Math.random() * (wordLength - seed.length + 1));
    }

    let lastChar = "";

    for (let i = 0; i < targetLength; i++) {
        if (i >= seedPosition && i < seedPosition + seed.length) {
            word += seed[i - seedPosition];
            lastChar = seed[i - seedPosition];
        } else {
            if (word.length > 0 && vowels.includes(lastChar)) {
                // If last character is a vowel, use a consonant or cluster
                let useCluster = Math.random() < 0.3 && word.length + 2 <= targetLength; // 30% chance to use a cluster
                let char = useCluster
                    ? consonantClusters[Math.floor(Math.random() * consonantClusters.length)]
                    : consonants[Math.floor(Math.random() * consonants.length)];

                word += char;
                lastChar = char[char.length - 1]; // Last character of the added cluster
            } else {
                // If last character is a consonant, add a vowel
                let char = vowels[Math.floor(Math.random() * vowels.length)];
                word += char;
                lastChar = char;
            }
        }
    }
    return word;
}


exports.generateNames = async (seed, position, maxLength, maxWords, tlds) => {
    if (!seed || typeof seed !== "string" || maxLength <= seed.length || maxWords <= 0 || !Array.isArray(tlds)) {
        throw new Error("Invalid seed, maxLength, maxWords, or tlds");
    }

    const MAX_ATTEMPTS = 1000 * maxWords; // Prevent infinite looping

    const domains = [];
    let attempts = 0;
    const generatedNames = new Set(); // Track generated words

    while (domains.length < maxWords && attempts < MAX_ATTEMPTS) {
        let name = generateWord(seed, position, maxLength);

        // Avoid regenerating the same name
        if (generatedNames.has(name)) {
            attempts++;
            continue;
        }

        generatedNames.add(name); // Store unique name

        for (const tld of tlds) {
            const domain = `${name}.${tld}`;

            if (domains.includes(domain)) continue;

            const isAvailable = await checkDomainAvailability(domain);

            if (isAvailable) {
                domains.push(domain);
                // ✅ Stop early if maxWords is reached
                if (domains.length >= maxWords) break;
            }
        }

        attempts++;
    }

}
