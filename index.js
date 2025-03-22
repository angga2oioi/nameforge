#!/usr/bin/env node

const jaci = require("jaci");
const { generateNames } = require("./lib/generator");

const start = async (seed, position, maxLength, maxWords, tlds) => {

    if (!seed) {
        seed = await jaci.string("Enter seed : ")
    }

    if (!position) {
        position = await jaci.select("Where should the seed word be placed? :", {
            options: {
                "start": "S",
                "middle": "M",
                "end": "E",
                "random": "R"
            }
        })
    }

    if (!maxLength) {
        maxLength = await jaci.number("Enter max length : ")
    }

    if (!maxWords) {
        maxWords = await jaci.number("Enter max words : ")
    }

    if (!tlds) {
        tlds = await jaci.string("Enter tlds (separated by spaces) : ")
    }

    await generateNames(seed, position, maxLength, maxWords, tlds?.split(" "))

    const retry = await jaci.select("Do you want to generate more names? : ", {
        options: {
            "Retry different settings": "R",
            "Retry same settings": "S",
            "Exit": "E"
        }
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

