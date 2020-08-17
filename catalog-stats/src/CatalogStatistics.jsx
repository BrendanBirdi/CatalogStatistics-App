import React, { Component } from 'react';
import PropTypes from 'prop-types';

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

  setLatLngZoom = (lat, lng, zoom) => {
    Logger.info('INFO:CS: setLatLngZoom');

    this.setState({
      lat,
      lng,
      zoom,
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

  render() {

    return (
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
