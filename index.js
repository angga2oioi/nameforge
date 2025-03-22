//@ts-check

const jaci = require("jaci");
const { generateNames } = require("./lib/generator");

const start = async () => {
    
    const seed = await jaci.string("Enter seed : ")
    const maxLength = await jaci.number("Enter max length : ")
    const maxWords = await jaci.number("Enter max words : ")
    const tlds = await jaci.string("Enter tlds (separated by spaces) : ")

    await generateNames(seed, maxLength, maxWords, tlds?.split(" "))

    process.exit(0)

}

start();

