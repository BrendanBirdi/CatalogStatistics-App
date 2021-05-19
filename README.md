# CatalogStatistics App

An example Standalone React App to visualise Bird.i's Catalog Data

## Dependencies

* [npm version 5+](https://www.npmjs.com/get-npm?utm_source=house&utm_medium=homepage&utm_campaign=free%20orgs&utm_term=Install%20npm)
* [node version 6+](https://nodejs.org/en/download/)

### 1. Run the App

```
:$ cd catalog-stats/
:$ npm install
:$ npm start
```


### Caution - Environment variable setting
Please note that the package.json scripts have been modified to work on a windows machine.
For this to work on Linux the scripts need to change.

e.g. for Windows, in package.json it is: 
```
    "build:dev": "set REACT_APP_ENV=dev&& npm run build",
```
Otherwise it is 
```
    "build:dev": "REACT_APP_ENV=dev npm run build",
```