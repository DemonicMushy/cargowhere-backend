const availabilityData = require("./apiController");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./carparks_sqlite.db");

const handleBasicAuth = (req, res, next) => {
  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64")
    .toString()
    .split(":");
  if (login === "cargowhere" && password === "cargowhere") {
    next();
  } else {
    res.status(401).send("Unauthorized.");
  }
  return;
};

// get static carpark data
const getStaticCarparkData = (req, res, next) => {
  db.all(
    `SELECT Carpark.identifier, Carpark.agency, Carpark.name, Carpark.code, 
    Carpark.availableLots_H, Carpark.availableLots_L, Carpark.availableLots_car, Carpark.availableLots_motorcycle,
    Carpark.coordinate_x, Carpark.coordinate_y, Carpark.latitude, Carpark.longitude, Carpark.lotType,
    Carpark.totalLots_H, Carpark.totalLots_L, Carpark.totalLots_car, Carpark.totalLots_motorcycle,
    HDBFields.car_park_basement, HDBFields.car_park_decks, HDBFields.car_park_type, HDBFields.free_parking,
    HDBFields.gantry_height, HDBFields.night_parking, HDBFields.short_term_parking, HDBFields.type_of_parking_system,
    LTAFields.category, LTAFields.saturday_rate, LTAFields.sunday_publicholiday_rate, 
    LTAFields.weekdays_rate_1, LTAFields.weekdays_rate_2,
    URAFields.parkCapacity, URAFields.parkingSystem, URAFields.startTime,
    URAFields.satdayMin, URAFields.satdayRate, sunPHMin, URAFields.sunPHRate,
    URAFields.weekdayMin, URAFields.weekdayRate
    FROM Carpark 
    LEFT JOIN HDBFields ON Carpark.identifier = HDBFields.identifier
    LEFT JOIN URAFields ON Carpark.identifier = URAFields.identifier
    LEFT JOIN LTAFields ON Carpark.identifier = LTAFields.identifier
    WHERE Carpark.lotType = 'Car' OR Carpark.lotType = ''
  `,
    (err, rows) => {
      rows = rows.map((val) => {
        var temp = {
          identifier: val.identifier,
          agency: val.agency, // LTA/URA/HDB
          name: val.name,
          code: val.code,
          lotType: val.lotType, // C/Y/L/H
          latitude: val.latitude,
          longitude: val.longitude,
          coordinates: {
            x: val.coordinate_x,
            y: val.coordinate_y,
          },
          uraFields: {
            weekdayMin: val.weekdayMin,
            weekdayRate: val.weekdayRate,
            satdayMin: val.satdayMin,
            satdayRate: val.satdayRate,
            sunPHMin: val.sunPHMin,
            sunPHRate: val.sunPHRate,
            parkCapacity: val.parkCapacity,
            startTime: val.startTime,
            endTime: val.endTime,
            parkingSystem: val.parkingSystem,
          },
          hdbFields: {
            short_term_parking: val.short_term_parking,
            free_parking: val.free_parking,
            night_parking: val.night_parking,
            type_of_parking_system: val.type_of_parking_system,
            car_park_type: val.car_park_type,
            car_park_decks: val.car_park_decks,
            gantry_height: val.gantry_height,
            car_park_basement: val.car_park_basement,
          },
          ltaFields: {
            weekdays_rate_1: val.weekdays_rate_1,
            weekdays_rate_2: val.weekdays_rate_2,
            saturday_rate: val.saturday_rate,
            sunday_publicholiday_rate: val.sunday_publicholiday_rate,
            category: val.category,
          },
          availableLots_car: val.availableLots_car,
          totalLots_car: val.totalLots_car,
          availableLots_motorcycle: val.availableLots_motorcycle,
          totalLots_motorcycle: val.totalLots_motorcycle,
          availableLots_L: val.availableLots_L,
          totalLots_L: val.totalLots_L,
          availableLots_H: val.availableLots_H,
          totalLots_H: val.totalLots_H,
        };
        if (val.agency === "HDB") {
          delete temp.ltaFields;
          delete temp.uraFields;
        } else if (val.agency === "URA") {
          delete temp.hdbFields;
          delete temp.ltaFields;
        } else if (val.agency === "LTA") {
          delete temp.hdbFields;
          delete temp.uraFields;
        }
        return temp;
      });
      res.json({ carparks: rows });
    }
  );
};

const getAvailablility = (req, res, next) => {
  res.status(200).json(availabilityData);
};

module.exports = {
  handleBasicAuth,
  getStaticCarparkData,
  getAvailablility,
};
