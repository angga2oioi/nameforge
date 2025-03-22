const axios = require("axios");

async function checkDomainAvailability(domain) {
    try {
        await axios.get(`http://${domain}`, {
            timeout: 3000,  // Prevent hanging
            maxRedirects: 0 // Don't follow redirects
        });
        // console.log(`${domain} ❌`);
        return false;
    } catch (error) {
        if (error.response) {
            // console.log(`${domain} ❌`);
            return false;
        } else {
            console.log(`${domain} ✅`);
            return true;
        }
    }
}

function generateWord(seed, maxLength) {
    const vowels = "aeiou";
    const consonants = "bcdfghjklmnpqrstvwxyz";
    const consonantClusters = [
        "bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sk", "sl", "sm", "sn", "sp", "st", "sw", "tr", "tw",
        "str", "spr", "scr", "spl", "shr", "thr"
    ];

    // 🎯 Choose a **random length** between (seed.length + 1) and maxLength
    const targetLength = Math.floor(Math.random() * (maxLength - seed.length)) + (seed.length + 1);

    let word = "";
    let seedPosition = Math.floor(Math.random() * (targetLength - seed.length + 1));
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


exports.generateNames = async (seed, maxLength, maxWords, tlds) => {
    if (!seed || typeof seed !== "string" || maxLength <= seed.length || maxWords <= 0 || !Array.isArray(tlds)) {
        throw new Error("Invalid seed, maxLength, maxWords, or tlds");
    }

    const MAX_ATTEMPTS = 1000; // Prevent infinite looping

    const domains = [];
    let attempts = 0;
    const generatedNames = new Set(); // Track generated words

    while (domains.length < maxWords && attempts < MAX_ATTEMPTS) {
        let name = generateWord(seed, maxLength);

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

            if (!isAvailable) {
                domains.push(domain);

                // ✅ Stop early if maxWords is reached
                if (domains.length >= maxWords) break;
            }
        }

        attempts++;
    }

}
