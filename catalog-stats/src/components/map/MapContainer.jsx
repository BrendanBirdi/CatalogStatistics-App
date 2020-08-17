import React, { Component } from 'react';
import sizeMe from 'react-sizeme';
import PropTypes from 'prop-types';

import Logger from '../../libs/logger.js';
import { updatePointerEvents } from '../../utilities/pointerFunctions';
import LeafletMapWrapper from './LeafletMapWrapper';

const MAP_PROVIDER = process.env.REACT_APP_MAP_PROVIDER;

class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapProvider: MAP_PROVIDER,
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(previousProps) {

  }

  onMapInit = (mapRefObject) => {
    Logger.info('INFO:MC: onMapInit');
    this.props.onMapInit(mapRefObject);
  }

  onReceiveLatLngZoom = (lat, lng, zoom) => {
    Logger.info('INFO:MC: onReceiveLatLngZoom');
    this.props.onReceiveLatLngZoom(lat, lng, zoom);
  }

  onZoomInProgress = (zoom) => {
    Logger.info('INFO:MC: onZoomInProgress');
    this.props.onZoomInProgress(zoom);
  }

  // primaryMapSelector = () => {
  //   switch (this.state.mapProvider) {
  //     case 'leaflet':
  //       return this.renderLeaflet();
  //     // case 'google':
  //       // return this.renderGoogle();
  //     default:
  //       return null;
  //   }
  // }

  renderLeaflet = () => (
    <LeafletMapWrapper
      lat={this.props.lat}
      lng={this.props.lng}
      zoom={this.props.zoom}
      onMapInit={this.onMapInit}
      onReceiveLatLngZoom={this.onReceiveLatLngZoom}
      onBasemapChange={this.props.onBasemapChange}
      onZoomInProgress={this.onZoomInProgress}
      imageViewer={this.imageViewerRef}
      minZoomTriggered={this.props.minZoomTriggered}
      token={this.props.token}
    />
  );

  render() {
    return (
      <div
        id="map-container"
        ref={(ref) => { this.mapContainer = ref; }}
        onMouseMove={updatePointerEvents}
      >

        {this.renderLeaflet()}

      </div>
    );
  }
}

MapContainer.propTypes = {
  onMapInit: PropTypes.func.isRequired,
  onReceiveLatLngZoom: PropTypes.func.isRequired,
  onBasemapChange: PropTypes.func.isRequired,
  onZoomInProgress: PropTypes.func.isRequired,
  lat: PropTypes.number,
  lng: PropTypes.number,
  zoom: PropTypes.number,
  zoomInProgress: PropTypes.bool,
  mapRef: PropTypes.object,
  mapStyling: PropTypes.any,
  token: PropTypes.string,
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
};

MapContainer.defaultProps = {
  mapRef: undefined,
  zoomInProgress: false,
  lat: undefined,
  lng: undefined,
  zoom: undefined,
  token: undefined,
  size: undefined,
};

export default sizeMe({ monitorHeight: true })(MapContainer);
