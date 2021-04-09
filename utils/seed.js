const fs = require("fs");
// const mongoose = require("mongoose");
var sqlite3 = require("sqlite3").verbose();

/*
This script is to seed the database with the master copy of all carpark information
 */

var db = new sqlite3.Database("./example.db");

// mongoose.connect("mongodb://localhost/cz2006", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function () {
//   // we're connected!
//   console.log("connected");
// });

// const carparkSchema = new mongoose.Schema({
//   identifier: String,
//   agency: String, // LTA/URA/HDB
//   name: String,
//   code: String,
//   lotType: String, // C/Y/L/H
//   latitude: Number,
//   longitude: Number,
//   coordinates: {
//     x: Number,
//     y: Number,
//   },
//   uraFields: {
//     weekdayMin: String,
//     weekdayRate: String,
//     satdayMin: String,
//     satdayRate: String,
//     sunPHMin: String,
//     sunPHRate: String,
//     parkCapacity: String,
//     startTime: String,
//     endTime: String,
//     parkingSystem: String,
//   },
//   hdbFields: {
//     short_term_parking: String,
//     free_parking: String,
//     night_parking: String,
//     type_of_parking_system: String,
//     car_park_type: String,
//     car_park_decks: String,
//     gantry_height: String,
//     car_park_basement: String,
//   },
//   ltaFields: {
//     weekdays_rate_1: String,
//     weekdays_rate_2: String,
//     saturday_rate: String,
//     sunday_publicholiday_rate: String,
//     category: String,
//   },
//   availableLots_car: Number,
//   totalLots_car: Number,
//   availableLots_motorcycle: Number,
//   totalLots_motorcycle: Number,
//   availableLots_L: Number,
//   totalLots_L: Number,
//   availableLots_H: Number,
//   totalLots_H: Number,
// });

// const Carpark = mongoose.model("Carpark", carparkSchema);

const allCarparks = JSON.parse(fs.readFileSync("./master_carpark_data.json"));

allCarparks.forEach((val) => {
  db.run(
    `INSERT INTO Carpark (identifier, agency, name, code, 
    coordinate_x, coordinate_y, latitude, longitude, lotType, 
    totalLots_H, totalLots_L, totalLots_car, totalLots_motorcycle) 
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      val.identifier,
      val.agency,
      val.name,
      val.code,
      val.coordinates.x,
      val.coordinates.y,
      val.latitude,
      val.longitude,
      val.lotType,
      val.totalLots_H,
      val.totalLots_L,
      val.totalLots_car,
      val.totalLots_motorcycle,
    ],
    (err) => {
      console.log("Carpark added.");
      console.log(err);
    }
  );
  if (val.agency === "HDB") {
    db.run(
      `INSERT INTO HDBFields (identifier,
    car_park_basement, car_park_decks, car_park_type,
    free_parking, gantry_height, night_parking,
    short_term_parking, type_of_parking_system) 
    VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        val.identifier,
        val.hdbFields.car_park_basement,
        val.hdbFields.car_park_decks,
        val.hdbFields.car_park_type,
        val.hdbFields.free_parking,
        val.hdbFields.gantry_height,
        val.hdbFields.night_parking,
        val.hdbFields.short_term_parking,
        val.hdbFields.type_of_parking_system,
      ],
      (err) => {
        console.log("HDB Fields added.");
        console.log(err);
      }
    );
  } else if (val.agency === "LTA") {
    db.run(
      `INSERT INTO LTAFields (identifier,
      category,
      saturday_rate, sunday_publicholiday_rate,
      weekdays_rate_1, weekdays_rate_2) 
      VALUES(?,?,?,?,?,?)`,
      [
        val.identifier,
        val.ltaFields.category,
        val.ltaFields.saturday_rate,
        val.ltaFields.sunday_publicholiday_rate,
        val.ltaFields.weekdays_rate_1,
        val.ltaFields.weekdays_rate_2,
      ],
      (err) => {
        console.log("LTA Fields added.");
        console.log(err);
      }
    );
  } else if (val.agency === "URA") {
    db.run(
      `INSERT INTO URAFields (identifier,
    parkCapacity, parkingSystem, startTime,
    satdayMin, satdayRate,
    sunPHMin, sunPHRate,
    weekdayMin, weekdayRate) 
    VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        val.identifier,
        val.uraFields.parkCapacity,
        val.uraFields.parkingSystem,
        val.uraFields.satdayMin,
        val.uraFields.satdayRate,
        val.uraFields.sunPHMin,
        val.uraFields.sunPHRate,
        val.uraFields.weekdayMin,
        val.uraFields.weekdayRate,
      ],
      (err) => {
        console.log("URA Fields added.");
        console.log(err);
      }
    );
  }
});