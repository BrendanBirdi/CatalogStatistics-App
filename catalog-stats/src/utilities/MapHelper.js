const COORDINATES_DECIMAL_PLACE_LIMIT = 6;

const LATITUDE_REGEX = /^(-?[1-8]?\d(?:\.\d{1,})?|90(?:\.0{1,8})?)$/;
const LONGITUDE_REGEX = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,})?|180(?:\.0{1,8})?)$/;

function parseLatLng(lat, lng) {

  return {
    'lat': parseFloat(Number.parseFloat(lat).toFixed(COORDINATES_DECIMAL_PLACE_LIMIT)),
    'lng': parseFloat(Number.parseFloat(lng).toFixed(COORDINATES_DECIMAL_PLACE_LIMIT))
  }
}

function validateLatLng(lat, lng) {

  if ((typeof lat) === 'string') {
    lat = lat.trim();
  }

  if ((typeof lng) === 'string') {
    lng = lng.trim();
  }

  return lat.match(LATITUDE_REGEX) && lng.match(LONGITUDE_REGEX)
}

function getViewport(lat, lng, zoom) {
  return {
    center: [lat, lng],
    zoom,
  };
}

function isLatLngFormat(string) {
  // Matches two digits, separated by a comma and any whitespace
  // Does not include checking that the lat/lng are within bounds.
  const twoNumbersRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  return twoNumbersRegex.test(string);
}


const MapHelper = {
  parseLatLng,
  validateLatLng,
  getViewport,
  isLatLngFormat,
};

export default MapHelper;
