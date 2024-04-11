const fs = require("fs");

fs.readFile(
  "/Users/chirenchen/mountainProject/products/6617c31bf35c0a40bcd6d812.json",
  "utf8",
  (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    const jsonData = JSON.parse(data);
    console.log(jsonData.details);
    for (let i = 0; i < jsonData.details.length; i++) {
      console.log(jsonData.details[i].name);
    }
  }
);
