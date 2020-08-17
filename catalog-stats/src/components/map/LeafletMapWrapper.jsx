import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Map as LeafletMap,
  LayersControl,
  ZoomControl,
} from 'react-leaflet';
import { GoogleLayer } from 'react-leaflet-google-v2';

import Logger from '../../libs/logger';
import MapHelper from '../../utilities/MapHelper';

import './LeafletMapWrapper.css';


const { BaseLayer } = LayersControl;

const DEFAULT_LAT = 40.111689;
const DEFAULT_LNG = -100.92041;
const DEFAULT_ZOOM = 5;
const DEFAULT_CLICK_ZOOM_LEVEL = 14;
const MAP_BOUNDS = [[-85.0, -180.0], [85.0, 180.0]];
const ZOOM_END_TIMEOUT = 1000; // 1 second

const GOOGLE_KEY = process.env.REACT_APP_IMAGESERVICE_GOOGLE_MAP_API_KEY;
const GOOGLE_STYLES = [
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
];


class LeafletMapWrapper extends Component {
  constructor(props) {
    super(props);
    const initialViewport = MapHelper.getViewport(props.lat, props.lng, props.zoom);

    this.state = {
      viewport: initialViewport,
    };
  }

  componentDidUpdate(previousProps) {
    Logger.info('INFO:LMW: componentDidUpdate');

    if (
      this.props.minZoomTriggered
      && this.props.zoom !== previousProps.zoom
    ) {
      this.setMapZoom(this.props.zoom);
    }
  }

  onReceiveLatLngZoom = (lat, lng, zoom) => {
    Logger.info('INFO:LMW: onReceiveLatLngZoom');
    const parsedInput = MapHelper.parseLatLng(lat, lng);
    this.props.onReceiveLatLngZoom(parsedInput.lat, parsedInput.lng, zoom);
  }

  onLeafletMapClick = (event) => {

    // this currently sets the lat lng to the center of the basemap - NOT the viewer
    Logger.info('INFO:LMW: onLeafletMapClick');
    const { lat, lng } = event.latlng;
    let zoom = this.state.leaflet.getZoom();

    if (zoom < DEFAULT_CLICK_ZOOM_LEVEL) {
      zoom = DEFAULT_CLICK_ZOOM_LEVEL;
    }

    this.setState({ viewport: MapHelper.getViewport(lat, lng, zoom) });
    this.onReceiveLatLngZoom(lat, lng, zoom);
  }

  onViewportChanged = (viewportEvent) => {
    // triggers any time the lat, lng and zoom of the map change
    // AFTER they have finished changing. Fires at the end of a drag event.
    Logger.info('INFO:LMW: onViewportChanged');
    if (!viewportEvent.center) {
      return;
    }
    this.setState({ viewport: viewportEvent });
    const parsedInput = MapHelper.parseLatLng(viewportEvent.center[0], viewportEvent.center[1]);
    this.props.onBasemapChange(parsedInput.lat, parsedInput.lng, viewportEvent.zoom);
  }

  onDrag = () => {
    Logger.info('INFO:LMW: onDrag');
  }

  onDragEnd = () => {
    Logger.info('INFO:LMW: onDragEnd');
  }

  onZoomStart = () => {
    Logger.info('INFO:LMW: zoom starting');
    this.props.onZoomInProgress(true);
  }

  onZoomEnd = () => {
    Logger.info('INFO:LMW: zoom ended');

    /*
      We're using a timeout object here because leaflet does discrete scrolling.
      This means that if the viewer is visible, a user could be charged for images
      at zoom levels they don't care about. This hack will have to remain
      until Leaflet implement continuous scrolling.

      See:
      - https://github.com/Leaflet/Leaflet/issues/4610
      - https://github.com/Leaflet/Leaflet/issues/4696
    */
    if (this.zoomEndTimeout && !this.zoomEndTimeout.cleared) {
      this.zoomEndTimeout.clear();
    }

    this.zoomEndTimeout = this.zoomTimeout(() => {
      this.props.onZoomInProgress(false);
    }, ZOOM_END_TIMEOUT);
  }

  /* Hack for creating a timeout object. */
  zoomTimeout = (fn, interval) => {
    let timeoutObject = {};
    timeoutObject.id = setTimeout(fn, interval);
    timeoutObject.cleared = false;
    timeoutObject.clear = function () {
        timeoutObject.cleared = true;
        clearTimeout(timeoutObject.id);
    };

    return timeoutObject;
  }

  setMapCenter = (lat, lng) => {
    Logger.info('INFO:LMW: setMapCenter');
    // Leaflet's 'flyTo' is an animated alternative, but this is
    // pretty intense when travelling over long distances.
    this.state.leaflet.panTo([lat, lng]);
  }

  setMapZoom = (zoom) => {
    Logger.info('INFO:LMW: setMapZoom');
    this.state.leaflet.setZoom(zoom);
  }

  handleLeafletMapApi = (event) => {
    Logger.info('INFO:LMW: handleLeafletMapApi');
    const leafletMapObject = event.target;

    this.setState({
      leaflet: leafletMapObject,
    });

    const mapRefObject = {
      provider: 'leaflet',
      map: leafletMapObject,
    };

    this.props.onMapInit(mapRefObject);

    // This timeout fixes a known issue where the leaflet map initialises
    // as grey until the window is resized. This triggers an automatic function
    // that leaflet usually calls on window resize, which is being called too early on
    // first init of the map.
    // See: https://stackoverflow.com/questions/24412325/resizing-a-leaflet-map-on-container-resize
    setTimeout(() => { leafletMapObject.invalidateSize(); }, 100);
  }

  chooseBasemaps = () => {

    // If we're on desktop, the user sees an option to choose between different basemaps.
    return (
      <LayersControl position="bottomleft">
        <BaseLayer checked name="Google Satellite">
          <GoogleLayer
            googlekey={GOOGLE_KEY}
            maptype="HYBRID"
            styles={GOOGLE_STYLES}
            maxNativeZoom={20}
            maxZoom={21}
          />
        </BaseLayer>
        <BaseLayer name="Google Streets">
          <GoogleLayer
            googlekey={GOOGLE_KEY}
            maptype="ROADMAP"
            styles={GOOGLE_STYLES}
            maxNativeZoom={20}
            maxZoom={21}
          />
        </BaseLayer>
      </LayersControl>
    );
  }

  render() {
    return (
      <div id="primary-map" className="primary-map" ref={map => this.map = map}>
        <LeafletMap
          id="leaflet-map"
          viewport={this.state.viewport}
          minZoom={3}
          maxZoom={20}
          attributionControl={false}
          zoomControl={false}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          maxBounds={MAP_BOUNDS}
          maxBoundsViscosity={1.0}
          whenReady={this.handleLeafletMapApi}
          onClick={this.onLeafletMapClick}
          onViewportChanged={this.onViewportChanged}
          onZoomStart={this.onZoomStart}
          onZoomEnd={this.onZoomEnd}
          animate={true}
          onDrag={this.onDrag}
          onDragEnd={this.onDragEnd}
          inertia={false}
        >
          <ZoomControl position="bottomright" />
          {this.chooseBasemaps()}
        </LeafletMap>
        {this.props.copyright ? <span id="data-supplier-copyright">{this.props.copyright}</span> : null }
      </div>
    );
  }
}

LeafletMapWrapper.propTypes = {
  lat: PropTypes.number,
  lng: PropTypes.number,
  zoom: PropTypes.number,
  onReceiveLatLngZoom: PropTypes.func.isRequired,
  onMapInit: PropTypes.func.isRequired,
  onBasemapChange: PropTypes.func.isRequired,
  onZoomInProgress: PropTypes.func.isRequired,
};

LeafletMapWrapper.defaultProps = {
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
  zoom: DEFAULT_ZOOM,
};

export default LeafletMapWrapper;
