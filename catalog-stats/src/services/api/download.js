import { request } from '../../libs/request';

const DOWNLOADER = process.env.REACT_APP_PORTAL_DOWNLOADER;
const ROUTE = '/download';
const STORE_ROUTE = '/store';

function getDownload(downloadData) {
  return request({
    route: `${ROUTE}`,
    url: `${ROUTE}/lat/${downloadData.lat}/lng/${downloadData.lng}/zoom/${downloadData.zoom}/id/${downloadData.id}?token=${downloadData.token}`,
    responseType: 'blob',
    method: 'GET',
  }, DOWNLOADER, true);
}

function storeDownload(downloadData) {
  return request({
    route: `${STORE_ROUTE}`,
    url: `${STORE_ROUTE}/lat/${downloadData.lat}/lng/${downloadData.lng}/zoom/${downloadData.zoom}/id/${downloadData.id}?token=${downloadData.token}&format=${downloadData.format}`,
    method: 'GET',
  }, DOWNLOADER);
}

const DownloadService = {
  getDownload,
  storeDownload,
};

export default DownloadService;
