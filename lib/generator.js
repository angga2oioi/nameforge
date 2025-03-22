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

function generateWord(seeds, position, maxLength) {
    const vowels = "aeiou";
    const consonants = "bcdfghjklmnpqrstvwxyz";
    const consonantClusters = [
        "bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sk", "sl", "sm", "sn", "sp", "st", "sw", "tr", "tw",
        "str", "spr", "scr", "spl", "shr", "thr"
    ];

    // Pick a random seed from the array
    const seed = seeds[Math.floor(Math.random() * seeds.length)];

    let word = Array(maxLength).fill(""); // Create an empty array of maxLength
    let seedPosition;

    // Ensure seedPosition is valid
    if (position === "start") {
        seedPosition = 0;
    } else if (position === "end") {
        seedPosition = maxLength - seed.length;
    } else if (position === "middle") {
        seedPosition = Math.floor((maxLength - seed.length) / 2);
    } else { // Random
        seedPosition = Math.floor(Math.random() * (maxLength - seed.length + 1));
    }

    // Place the seed in the designated position
    for (let i = 0; i < seed.length; i++) {
        word[seedPosition + i] = seed[i];
    }

    let lastChar = "";
    
    // Fill the remaining empty spots with generated characters
    for (let i = 0; i < maxLength; i++) {
        if (word[i] !== "") continue; // Skip already filled seed characters

        if (lastChar && vowels.includes(lastChar)) {
            // If last character is a vowel, use a consonant or cluster
            let useCluster = Math.random() < 0.3 && i + 2 < maxLength; // 30% chance to use a cluster
            let char = useCluster
                ? consonantClusters[Math.floor(Math.random() * consonantClusters.length)]
                : consonants[Math.floor(Math.random() * consonants.length)];

            word[i] = char[0];
            if (useCluster && i + 1 < maxLength) {
                word[i + 1] = char[1]; // Add second letter of the cluster
                i++; // Skip next index
            }
            lastChar = char[char.length - 1];
        } else {
            // If last character is a consonant, add a vowel
            let char = vowels[Math.floor(Math.random() * vowels.length)];
            word[i] = char;
            lastChar = char;
        }
    }

    return word.join(""); // Convert array to string
}

exports.generateNames = async (seeds, position, maxLength, maxWords, tlds) => {
    if (!seeds || !Array.isArray(seeds) || seeds.length === 0 || typeof seeds[0] !== "string" || maxLength <= seeds[0].length || maxWords <= 0 || !Array.isArray(tlds)) {
        throw new Error("Invalid seed, maxLength, maxWords, or tlds");
    }

    const MAX_ATTEMPTS = 1000 * maxWords; // Prevent infinite looping

    const domains = [];
    let attempts = 0;
    const generatedNames = new Set(); // Track generated words

    while (domains.length < maxWords && attempts < MAX_ATTEMPTS) {
        let name = generateWord(seeds, position, maxLength);

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
