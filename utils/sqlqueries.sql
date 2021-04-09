CREATE TABLE Carpark 
(
identifier TEXT PRIMARY KEY,
agency TEXT NOT NULL,
name TEXT NOT NULL,
code TEXT,
availableLots_H INTEGER,
availableLots_L INTEGER,
availableLots_car INTEGER,
availableLots_motorcycle INTEGER,
coordinate_x REAL NOT NULL,
coordinate_y REAL NOT NULL,
latitude REAL NOT NULL,
longitude REAL NOT NULL,
lotType TEXT,
totalLots_H INTEGER,
totalLots_L INTEGER,
totalLots_car INTEGER,
totalLots_motorcycle INTEGER
);

CREATE TABLE HDBFields (
  identifier TEXT,
  car_park_basement NUMERIC,
  car_park_decks INTEGER,
  car_park_type TEXT,
  free_parking TEXT,
  gantry_height REAL,
  night_parking TEXT,
  short_term_parking TEXT,
  type_of_parking_system TEXT,
  FOREIGN KEY(identifier) REFERENCES Carpark(identifier)
);

CREATE TABLE LTAFields (
  identifier TEXT,
  category TEXT,
  saturday_rate TEXT,
  sunday_publicholiday_rate TEXT,
  weekdays_rate_1 TEXT,
  weekdays_rate_2 TEXT,
  FOREIGN KEY(identifier) REFERENCES Carpark(identifier)
);

CREATE TABLE URAFields (
  identifier TEXT,
  parkCapacity INTEGER,
  parkingSystem TEXT,
  startTime TEXT,
  satdayMin TEXT,
  satdayRate TEXT,
  sunPHMin TEXT,
  sunPHRate TEXT,
  weekdayMin TEXT,
  weekdayRate TEXT,
  FOREIGN KEY(identifier) REFERENCES Carpark(identifier)
);

INSERT INTO Carpark ()