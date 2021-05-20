import { request } from '../../libs/request';

import MapHelper from '../../utilities/MapHelper';

function getCatalogMetadataForImage(id, token) {

  const route = '/catalog/metadata/';

  return request({
    route: `${route}`,
    url: `${route}id/${id}/token/${token}`,
    method: 'GET',
  }, process.env.REACT_APP_IMAGESERVICE_CATALOG_ENDPOINT);
}

function getCatalogForPoint(lat, lng, zoom, token, blackAndWhiteAllowed, cloudCover) {

  const route = '/catalog/';
  
  return request({
    route: `${route}`,
    url: `${route}lat/${lat}/lng/${lng}/zoom/${zoom}/token/${token}/?blackAndWhiteAllowed=${blackAndWhiteAllowed}&cloudCover=${cloudCover}`,
    method: 'GET',
  }, process.env.REACT_APP_IMAGESERVICE_CATALOG_ENDPOINT);
}


const CatalogService = {
  getCatalogMetadataForImage,
  getCatalogForPoint,
};

export default CatalogService;
