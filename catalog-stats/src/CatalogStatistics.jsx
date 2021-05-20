import React, { Component } from 'react';
import PropTypes, { element } from 'prop-types';

/* Bird.i Components */
import MapContainer from './components/map/MapContainer';

/* Bird.i Libs */
import Logger from './libs/logger';

/* Bird.i Services */
import CatalogService from './services/api/catalog';

import './CatalogStatistics.css';

const MIN_ZOOM_LEVEL = 14;
const DEFAULT_CLOUD_COVERAGE = 10


class CatalogStatistics extends Component {
  constructor(props, context) {
    Logger.info('INFO:CS: constructor');
    super(props, context);

    if (!props.apiToken) {
      console.warn('Bird.i: CatalogStatistics requires an apiToken.');
    }

    this.state = {
      lat: props.lat,
      lng: props.lng,
      zoom: props.zoom,
      totalImageCount: 0,
      colourImageCount: 0,
      yearBreakDown: [],
      providerAquired: [],
      imageAquiredEveryQuater: { years: []} ,
      cloudCoverageBuckets: [],
      mapRef: undefined,
      mapCentre: {
        lat: props.lat,
        lng: props.lng,
        zoom: props.zoom,
      },
      minZoomTriggered: false,
    };
  }

  onMapInit = (mapRefObject) => {
    Logger.info('INFO:CS: map init');
    this.setState({
      mapRef: mapRefObject,
    });
  }


  setZoomProgress = (zoom) => {
    Logger.info('INFO:CS: setZoomProgress');
    this.setState({
      zoomInProgress: zoom,
    });
  }


  getImageAquiredPerQuater = (data, year) =>{

    // mapping for month to quarter
    let monthToQuater = [0,0,0,1,1,1,2,2,2,3,3,3];

    // counter containing the count of images in a quarter
    let counter = [0,0,0,0];
    
    // loop through all the images and if the image is of the 
    // specified year, increment the count of the corresponding quarter
    for(let i = 0; i < data.items.length; i++){
      let aqqDate = new Date(data.items[i].acquisitionDate);
      let aqYear = aqqDate.getFullYear();
      let aqMonth = aqqDate.getMonth();

      if(aqYear === year){
        let quater = monthToQuater[aqMonth -1];

        counter[quater]++;
      }

    }

    // if there is at least one quarter without an image belonging to it, return false
    for(let i = 0; i < counter.length; i++){
      if(counter[i] === 0){
         return false;
      }
    }

    // Otherwise, return true.
    return true;
  }



  processResponseData = (data) => {

    this.CalculateAggregationsByYear(data);
    this.CalculateAggregationsByProvider(data);

    let currentYear = (new Date()).getFullYear();
    this.getImageAquiredPerQuaterForEachYear(data,[currentYear -1, currentYear -2, currentYear -3]);
  
    this.setState({totalImageCount: data.items.length});
  }

  
  getImageAquiredPerQuaterForEachYear = (data, years) => {

   let result ={
      years : [
        
      ]
    }

    for (let i=0; i < years.length; i++){

      let outcome = this.getImageAquiredPerQuater(data, years[i]);
      let yearOutcome = {
        "year" : years[i],
        "imageAquiredEveryQuater" : outcome
      }
      result.years.push(yearOutcome)

    }
    this.setState({ imageAquiredEveryQuater : result}); 
  }


  // Calculates the number of images by year
  CalculateAggregationsByYear = (data) =>{
    // this will store a json object 
    // of the form {year: XXXX, itemCount: Y} 
    // where XXXX the year number and where Y the number of images for that year
    let years = [];
    
    for(let i = 0; i < data.items.length; i++){

      // get the necessary data
      let aqqDate = new Date(data.items[i].acquisitionDate);
      let aqYear = aqqDate.getFullYear();

      // check if there is a json object in the arrray for the specified year
      let result = years.find(element => element.year === aqYear);

      if (!result) {
        // if not found, this is a new year - create the json object and add it to the array
        years.push({year: aqYear, itemCount: 1});
      }
      else {
        // if found increment the number of images found
        result.itemCount++;
      }
    }
    this.setState({yearBreakDown: years});

  };

  CalculateAggregationsByProvider = (data) =>{
    // this will store a json object 
    // of the form {prov: XXXX, provCount: Y} 
    // where XXXX the provider name and where Y the number of images for that provider
    let providers = [];

    for(let i = 0; i < data.items.length; i++){
      
      let provider = data.items[i].provider;


      // check if there is a json object in the arrray for the specified provider 
      let providerResult = providers.find(element => element.prov === provider);
      if(!providerResult){
        // if not found, this is a new provider - create the json object and add it to the array
        providers.push({ prov: provider, provCount: 1});
      }
      else{
        // if found increment the number of images found
        providerResult.provCount++;
      }

    }
    this.setState({providerAquired: providers});

  };
  

  CalculateCloudCoverageStatistics = ()  => {
    // variables to keep track of the count of images for varying levels of cloud coverage
    // in accordance to what the API can return
    let countCloudCoverageBelow10 = 0;
    let countCloudCoverageBelow20 = 0;
    let countCloudCoverageBelow30 = 0;
    let countCloudCoverageBelow50 = 0;

    let cloudCoverBuckets = []

    let lat = this.state.lat;
    let lng = this.state.lng;
    let zoom = this.state.zoom;

    // chain the calls to the different levels of cloud visibility that we're interested in
    // after each response, keep track of the number of images corresponding to that call
    CatalogService.getCatalogForPoint(lat, lng, zoom, this.props.apiToken, false, 10)
    .then(data1 => countCloudCoverageBelow10 = data1.items.length)
    .then(() => 
      CatalogService.getCatalogForPoint(lat, lng, zoom, this.props.apiToken, false, 20)
      .then(data2 => countCloudCoverageBelow20 = data2.items.length)
      .then(() => 
        CatalogService.getCatalogForPoint(lat, lng, zoom, this.props.apiToken, false, 30)
        .then(data3 => countCloudCoverageBelow30 = data3.items.length)
        .then(() => 
          CatalogService.getCatalogForPoint(lat, lng, zoom, this.props.apiToken, false, 50)
          .then(data4 => countCloudCoverageBelow50 = data4.items.length)
          .then(
            () => {
              // push all the calculations to the state object so they can be reflected in the ui
              cloudCoverBuckets.push(countCloudCoverageBelow10);
              cloudCoverBuckets.push(countCloudCoverageBelow20 - countCloudCoverageBelow10);
              cloudCoverBuckets.push(countCloudCoverageBelow30 - countCloudCoverageBelow20);
              cloudCoverBuckets.push(countCloudCoverageBelow50 - countCloudCoverageBelow30);
              this.setState({cloudCoverageBuckets: cloudCoverBuckets});
            }
          )
        )
      )
    )
  }

  RunExerciseUseCases = (lat, lng, zoom) => {
      // first fetch all images with the default cloud visibility
      CatalogService.getCatalogForPoint(lat, lng, zoom, this.props.apiToken, true, DEFAULT_CLOUD_COVERAGE)
      .then(data => this.processResponseData(data))
      .then(
        // fetch only the colour images for the same visibility
        CatalogService.getCatalogForPoint(lat, lng, zoom, this.props.apiToken, false, DEFAULT_CLOUD_COVERAGE)
        .then(data => this.setState({colourImageCount: data.items.length}))
        .then(
            this.CalculateCloudCoverageStatistics()
        )
      );    
  }

  setLatLngZoom = (lat, lng, zoom) => {
    Logger.info('INFO:CS: setLatLngZoom');

    this.setState({
      lat,
      lng,
      zoom,
    });
    if (zoom >= MIN_ZOOM_LEVEL) {
      this.RunExerciseUseCases(lat, lng, zoom)
    }
  }

  getColourProportion = () =>{

    let result = this.state.colourImageCount / this.state.totalImageCount * 100;
    return result.toFixed(1);

  };

  setLatLngAfterMouseMove = (lat, lng) => {
    Logger.info('INFO:CS: setLatLngZoom');

    this.setState({
      lat,
      lng
    });
  }

  goToMinZoom = () => {
    Logger.info('INFO:CS: goToMinZoom');
    this.setState({
      zoom: MIN_ZOOM_LEVEL,
      minZoomTriggered: true,
    });
  }

  saveCurrentMapCentre = (lat, lng, zoom) => {
    Logger.info('INFO:CS: saveCurrentMapCentre');
    this.setState({
      mapCentre: {
        lat,
        lng,
        zoom,
      },
    });
  }


  handleBasemapChange = (lat, lng, zoom) => {
    Logger.info('INFO:CS: handleBasemapChange');

    this.saveCurrentMapCentre(lat, lng, zoom);

    // If the basemap change is due to minZoom being triggered,
    // we already have the correct zoom stored in state
    if (this.state.minZoomTriggered) {
      this.setState({
        minZoomTriggered: false,
      });
      return;
    }

    // Always update the lat, lng, zoom state if the basemap
    // zoom has changed
    if (zoom !== this.state.zoom) {
      this.setLatLngZoom(lat, lng, zoom);
      return;
    }

  }

  getYearBreakdown = () =>{

    // creates the UI for the year breakdown
    let response = [];
    let dt =this.state.yearBreakDown;

    for(let i=0; i < dt.length; i++ ){
      response.push(<div>{dt[i].year}:{dt[i].itemCount} </div>);
    }

    return response;

  }

  getProviderAquired = () =>{
    // creates the UI for the provider breakown

    let response = [];
    let prov = this.state.providerAquired;
    for(let i=0; i < prov.length; i++){
      response.push(<div>{prov[i].prov}:{prov[i].provCount}</div>);
    }

    return response;
  }


  getImageEveryQuaterPerYear = () =>{
    // creates the UI for the breakdown of whether a given year 
    // has at least one image in every quarter

    let response = [];
    let years = this.state.imageAquiredEveryQuater.years;

    for(let i=0; i < years.length; i++){
      response.push(<div>{years[i].year} has images every quarter:{years[i].imageAquiredEveryQuater.toString()}</div>);
    }

    return response;
  }

  getCloudCoverageStats = () => {
    // builds the ui for the cloud coverage stats
    let coverageStats = this.state.cloudCoverageBuckets;
    let response = [];
    for(let i=0; i < coverageStats.length; i++)
    {
      response.push(<div>Bucket {i+1}:{coverageStats[i]} </div>);
    }    
    return response;
  }

  render() {

    return (
      <div>
      <div id="image-viewer">
        <pre>
          Lat: {this.state.lat} <br />
          Lng: {this.state.lng} <br />
          Zoom: {this.state.zoom } <br />
          Images Available: {this.state.totalImageCount}  <br />
          Colour Image Count: {this.state.colourImageCount} <br />
          Colour Images %: {this.getColourProportion()} <br />
          Black/White Images %  <br />
          Breakdown by year:  {this.getYearBreakdown()} <br />
          Images acquired provider: {this.getProviderAquired()} <br />
          {this.getImageEveryQuaterPerYear()}
          Cloud Coverage Breakdown: 
          {this.getCloudCoverageStats()}
        </pre>
      </div>
      <div className="imageservice" >
        <div className="imageservice__map-container-wrapper" >
          <MapContainer
            onMapInit={this.onMapInit}
            onReceiveLatLngZoom={this.setLatLngZoom}
            onBasemapChange={this.handleBasemapChange}
            onZoomInProgress={this.setZoomProgress}
            lat={this.state.lat}
            lng={this.state.lng}
            zoom={this.state.zoom}
            zoomInProgress={this.state.zoomInProgress}
            mapStyling={this.props.mapStyling}
            token={this.props.apiToken}
            mapRef={this.state.mapRef}
            minZoomTriggered={this.state.minZoomTriggered}
          />
        </div>
      </div>
      </div>
    );
  }
}

CatalogStatistics.defaultProps = {
  lat: 40.111689,
  lng: -100.92041,
  zoom: 5,
  mapStyling: {
    width: '100%',
    minHeight: '400px',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
};

CatalogStatistics.propTypes = {
  apiToken: PropTypes.string.isRequired,
  lat: PropTypes.number,
  lng: PropTypes.number,
  zoom: PropTypes.number,
  mapStyling: PropTypes.shape(),
};

export default CatalogStatistics;
