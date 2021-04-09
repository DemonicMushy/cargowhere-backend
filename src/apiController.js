/** @module apiController */
const axios = require("axios");

// Declare global variables
const INTERVAL = 60000; // in ms
let availabilityData = { data: null };
let dailyKey = ["", -1];
let currentDate = new Date().getDate();

// Check daily key for URA API
/**
 * Checks if the key to access URA API is valid,
 * if not, make request for new key and save in global variable
 * @function
 * @name checkDailyKey
 * @returns {null}
 */
async function checkDailyKey() {
  currentDate = new Date().getDate();
  if (dailyKey[1] !== currentDate) {
    console.log("Key is outdated, fetching new daily key");
    return axios
      .get("https://www.ura.gov.sg/uraDataService/insertNewToken.action", {
        headers: {
          AccessKey: "406a0603-5173-44f5-b1d1-8135cffefd52",
        },
      })
      .then((response) => {
        dailyKey[0] = response["data"]["Result"];
        dailyKey[1] = currentDate;
      });
  }
  return;
}

/**
 * 
 * @function
 * @name retrieveFromLTA
 * @returns {Promise} Promise object that resolves with the availability data from LTA
 */
async function retrieveFromLTA() {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2",
        {
          headers: {
            AccountKey: "Hj3YzBxVTuGhFO/OhXDVJQ==",
            accept: "application/json",
          },
        }
      )
      .then((response) => {
        resolve(response.data.value);
      })
      .catch((e) => {
        reject("Unable to get data for LTA");
      });
  });
}

/**
 * 
 * @function
 * @name retrieveFromURA
 * @returns {Promise} Promise object that resolves with the availability data from URA
 */
async function retrieveFromURA() {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Availability",
        {
          headers: {
            Accesskey: "406a0603-5173-44f5-b1d1-8135cffefd52",
            Token: dailyKey[0],
          },
        }
      )
      .then((response) => {
        resolve(response.data.Result);
      })
      .catch((error) => {
        reject("Unable to get data for URA");
      });
  });
}

/**
 * 
 * @function
 * @name retrieveFromHDB
 * @returns {Promise} Promise object that resolves with the availability data from HDB
 */
async function retrieveFromHDB() {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.data.gov.sg/v1/transport/carpark-availability")
      .then((response) => {
        resolve(response.data.items[0].carpark_data);
      })
      .catch((error) => {
        reject("Unable to get data for HDB");
      });
  });
}

// Get Availability Data
/**
 * Fetches availability data from all API sources, formats the data, 
 * and saves into global variable
 * @function
 * @name getData
 * @returns {null}
 */
async function getData() {
  await checkDailyKey();
  console.log("Fetching carpark availability...");
  axios
    .all([
      // LTA
      retrieveFromLTA(),
      // URA
      retrieveFromURA(),
      // HDB
      retrieveFromHDB(),
    ])
    .then((responseArr) => {
      console.log("Formatting results...");
      const resultObj = {};
      let key = "";
      let lotType = "";
      let availHeader = "";
      //format LTA response
      responseArr[0].forEach((obj) => {
        key = "LTA" + "_" + obj["Development"].replace(/\s|\(|\)|&|\//g, "");
        switch (obj["LotType"]) {
          case "C":
            availHeader = "availableLots_car";
            break;
          case "Y":
            availHeader = "availableLots_motorcycle";
            break;
          default:
            availHeader = "availableLots_" + obj["LotType"];
            break;
        }
        if (key in resultObj)
          resultObj[key][availHeader] = obj["AvailableLots"];
        else resultObj[key] = { [availHeader]: obj["AvailableLots"] };
      });
      //format URA response
      responseArr[1].forEach((obj) => {
        switch (obj["lotType"]) {
          case "C":
            lotType = "Car";
            availHeader = "availableLots_car";
            break;
          case "M":
            lotType = "Motorcycle";
            availHeader = "availableLots_motorcycle";
            break;
          case "H":
            lotType = "Heavy Vehicle";
            availHeader = "availableLots_" + obj["lotType"];
            break;
          default:
            lotType = obj["LotType"];
            availHeader = "availableLots_" + obj["lotType"];
            break;
        }
      });
      // format HDB response
      responseArr[2].forEach((obj) => {
        key = "HDB" + "_" + obj["carpark_number"];
        resultObj[key] = {};
        obj["carpark_info"].forEach((availInfo) => {
          switch (availInfo["lot_type"]) {
            case "C":
              lotType = "car";
              break;
            case "Y":
              lotType = "motorcycle";
              break;
            default:
              lotType = availInfo["lot_type"];
              break;
          }
          resultObj[key]["totalLots_" + lotType] = Number(
            availInfo["total_lots"]
          );
          resultObj[key]["availableLots_" + lotType] = Number(
            availInfo["lots_available"]
          );
        });
      });
      availabilityData.data = resultObj;
      console.log("Formatting done.");

      // console.log("Checking availability data against database...");
      // update();
      // console.log(availabilityData);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// Compare and update availability data against database
function update() {
  console.log("Fetching updated data...");
  console.log("Data retrieved");
  console.log("Checking for new updates...");
  updateData = {};
  let oldObj = {};
  let updateFields = {};
  Object.keys(availabilityData).forEach((key) => {
    oldObj = oldData[key];
    updateFields = {};
    // If oldObj is undefined, key is not present in database, due to naming inconsistencies on from the API data
    if (oldObj) {
      Object.keys(availabilityData[key]).forEach((field) => {
        if (oldObj[field] !== availabilityData[key][field]) {
          // database data is outdated
          updateFields[field] = availabilityData[key][field];
          // update oldData object so it can be reused in the next cycle
          oldObj[field] = availabilityData[key][field];
        }
      });
    }
    if (Object.keys(updateFields).length !== 0) {
      updateData[key] = updateFields;
      /*
            console.log('Update found for ' + key);
            console.log(updateData[key]);
             */
    }
  });

  if (Object.keys(updateData).length === 0) {
    console.log("No updates found");
  } else {
    /* Couldn't get this to work, maybe updating all at once not supported. It overrwrites instead of updating
        ref
            .update(updateData)
            .then(() => console.log('Database updated'))
            .catch((error) => {
                console.log('error adding document');
            })
         */
    Object.keys(updateData).forEach((key) => {
      ref = database.ref("/" + key);
      ref.update(updateData[key]).catch((error) => {
        console.log("error adding data");
      });
    });
    console.log("Database updated");
  }

  console.log("Process complete, setting timeout for 60s");
  // subsequent runs will make use of the updated oldData file instead of querying the database
  setTimeout(checkDailyKey, INTERVAL);
}

getData();
// run this function every INTERVAL milliseconds
setInterval(() => {
  getData();
}, INTERVAL);
module.exports = availabilityData;
