# CatalogStatistics App

An example Standalone React App to visualise Bird.i's Catalog Data

## Dependencies

* [npm version 5+](https://www.npmjs.com/get-npm?utm_source=house&utm_medium=homepage&utm_campaign=free%20orgs&utm_term=Install%20npm)
* [node version 6+](https://nodejs.org/en/download/)

### 1. Run the App

For Linux:
```
:$ cd catalog-stats/
:$ npm install
:$ npm start
```

For Windows:
```
:$ cd catalog-stats/
:$ npm install
:$ npm start:win
```

### Remarks on approach taken

This application has had a mousemove event added that fires notifications (debounced) in order to make it more responsive during the run. 

The following use cases have been satisfied, by presenting information in text format in an overlay div.
1. How many images in total are available over location X
2. How many images, broken down by year, are available over location X
3. What is the proportion of images acquired by each provider over location X
4. Does location X have an image acquired every quarter for the last 1, 2 & 3 years
5. What is the proportion of colour images Vs black & white images over location X
6. What is the breakdown of images for the following cloud cover buckets over location X:
    a. 0-9.99 %
    b. 10-19.99 %
    c. 20-29.99 %
    d. > 30 %


### Further opportunities for improvement

1. CatalogStatistics.jsx can be improved by moving the image-viewer into a component of its own
2. The information could be displayed in a more engaging format, in the form of graphs rather than text
