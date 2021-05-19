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

    let monthToQuater = [0,0,0,1,1,1,2,2,2,3,3,3];
    let counter = [0,0,0,0];
    
    for(let i = 0; i < data.items.length; i++){
      let aqqDate = new Date(data.items[i].acquisitionDate);
      let aqYear = aqqDate.getFullYear();
      let aqMonth = aqqDate.getMonth();

      if(aqYear === year){
        let quater = monthToQuater[aqMonth -1];

        counter[quater]++;
      }

    }

    for(let i = 0; i < counter.length; i++){
      if(counter[i] === 0){
         return false;
      }
    }

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


  CalculateAggregationsByYear = (data) =>{
    let years = [];
    
    for(let i = 0; i < data.items.length; i++){

      let aqqDate = new Date(data.items[i].acquisitionDate);
      let aqYear = aqqDate.getFullYear();

      let result = years.find(element => element.year === aqYear);
      if (!result) {
        years.push({year: aqYear, itemCount: 1});
      }
      else {
        result.itemCount++;
      }
    }
      this.setState({yearBreakDown: years});

  };

  CalculateAggregationsByProvider = (data) =>{
    let providers = [];

    for(let i = 0; i < data.items.length; i++){
      let provider = data.items[i].provider;
      let providerResult = providers.find(element => element.prov === provider);
      if(!providerResult){
        providers.push({ prov: provider, provCount: 1});
      }
      else{
        providerResult.provCount++;
      }

    }
    this.setState({providerAquired: providers});

  };
  

  setLatLngZoom = (lat, lng, zoom) => {
    Logger.info('INFO:CS: setLatLngZoom');

    this.setState({
      lat,
      lng,
      zoom,
    });
    if (zoom >= MIN_ZOOM_LEVEL) {

      // first fetch all images
      CatalogService.getCatalogForPoint(lat, lng, zoom, this.props.apiToken, true, 10)
      .then(data => this.processResponseData(data))
      .then(
        // fetch only the colour images
        CatalogService.getCatalogForPoint(lat, lng, zoom, this.props.apiToken, false, 10)
        .then(data => this.setState({colourImageCount: data.items.length}))
      );
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

    let response = [];
    let dt =this.state.yearBreakDown;

    for(let i=0; i < dt.length; i++ ){
      response.push(<div>{dt[i].year}:{dt[i].itemCount} </div>);
    }

    return response;

  }

  getProvierAquired = () =>{
    let response = [];
    let prov = this.state.providerAquired;
    for(let i=0; i < prov.length; i++){
      response.push(<div>{prov[i].prov}:{prov[i].provCount}</div>);
    }

    return response;
  }


  getImageEveryQuaterPerYear = () =>{
    let response = [];
    let years = this.state.imageAquiredEveryQuater.years;

    for(let i=0; i < years.length; i++){
      response.push(<div>{years[i].year} has images every quarter:{years[i].imageAquiredEveryQuater.toString()}</div>);
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
          Images acquired provider: {this.getProvierAquired()} <br />
          {this.getImageEveryQuaterPerYear()}


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
