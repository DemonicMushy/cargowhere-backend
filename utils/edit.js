const fs = require("fs");

/* 
This script is for mass editing of all carpark information
*/

const allCarparks = JSON.parse(fs.readFileSync("./master_carpark_data.json"));

var allCarpark2 = [];
Object.keys(allCarparks).forEach((key) => {
  console.log(key);
  allCarpark2.push({ identifier: key, ...allCarparks[key] });
});

fs.writeFileSync("./newdata.json", JSON.stringify(allCarpark2));
