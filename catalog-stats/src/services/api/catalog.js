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

const CatalogService = {
  getCatalogMetadataForImage,
};

export default CatalogService;
