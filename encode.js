// encode.js
const fs = require("fs");
const key = fs.readFileSync("./online-learning-platform-2b49a-firebase-adminsdk-fbsvc-4ed2bb6bb2.json", "utf8");
const base64 = Buffer.from(key).toString("base64");
console.log(base64);