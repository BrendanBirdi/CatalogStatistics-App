import { request } from '../../libs/request';

function getImage(imageId, x, y, zoom, requestId, token, providerToken, cancelSource) {
  const route = '/image/';

  return request({
    route: `${route}`,
    url: `${route}id/${imageId}/x/${x}/y/${y}/z/${zoom}/`,
    method: 'GET',
    params: {
      requestId,
      token,
    },
    headers: providerToken,
    responseType: 'blob',
    cancelToken: cancelSource.token,
  }, process.env.REACT_APP_IMAGESERVICE_IMAGE_ENDPOINT);
}

const ImageAPIService = {
  getImage,
};

export default ImageAPIService;
