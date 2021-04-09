# Cargowhere Backend Server

To install dependencies: `npm install`
To start: `npm start`

#### File directory

```
.
├── README.md
├── package-lock.json
├── package.json
├── src
│   ├── apiController.js
│   ├── app.js
│   ├── controller.js
│   └── index.js
└── utils
    ├── edit.js
    ├── example.db
    ├── master_carpark_data.json
    ├── seed.js
    └── sqlqueries.sql
```

| File                           | Description                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| src/apiController.js           | Handles API calles to external sources (data.gov, LTA, etc)     |
| src/app.js                     | Declares HTTP endpoints for server                              |
| src/controller.js              | Contains functionality for HTTP endpoints                       |
| src/index.js                   | Entrypoint for application                                      |
| utils/edit.js                  | Script if mass editting of master_carpark_data.json is required |
| util/seed.js                   | Script to seed MongoDB with static carpark information          |
| utils/master_carpark_data.json | JSON file containing static carpark information                 |
| utils/example.db               | SQLite database file                                            |
| utils/sqlqueries.sql           | File containing reference SQL queries                           |
