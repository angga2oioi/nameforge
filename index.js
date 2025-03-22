#!/usr/bin/env node

const jaci = require("jaci");
const { generateNames } = require("./lib/generator");

const start = async (seed, position, maxLength, maxWords, tlds) => {

    if (!seed) {
        seed = await jaci.string("Enter seed : ")
    }

    if (!position) {
        position = await jaci.select("Where should the seed word be placed? (default random) :", {
            options: {
                "start": "S",
                "middle": "M",
                "end": "E",
                "random": "R"
            },
            default: "R"
        })
    }

    if (!maxLength) {
        maxLength = await jaci.number("Enter max length (default 8): ", { default: 8 })
    }

    if (!maxWords) {
        maxWords = await jaci.number("Enter max words (default 20): ", { default: 20 })
    }

    if (!tlds) {
        tlds = await jaci.string("Enter tlds (separated by spaces, default com) : ", { default: "com" })
    }

    await generateNames(seed?.split(" ")?.sort((a, b) => a.length - b.length), position, maxLength, maxWords, tlds?.split(" "))

    const retry = await jaci.select("Do you want to generate more names? (default exit) : ", {
        options: {
            "Retry different settings": "R",
            "Retry same settings": "S",
            "Exit": "E"
        },
        default: "E"
    })

    if (retry === "Retry different settings") {
        start()
    } else if (retry === "Retry same settings") {
        start(seed, position, maxLength, maxWords, tlds)
    } else {
        process.exit(0)
    }

}

start();

