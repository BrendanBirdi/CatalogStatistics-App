
function info(msg) {
  if (process.env.REACT_APP_IMAGESERVICE_LOG_INFO !== 'true') {
    return;
  }

  console.log(msg);
}

function debug(msg) {
  if (process.env.REACT_APP_IMAGESERVICE_LOG_DEBUG !== 'true') {
    return;
  }

  console.debug(msg);
}

function error(msg) {
  if (process.env.REACT_APP_IMAGESERVICE_LOG_ERROR !== 'true') {
    return;
  }

  console.error(msg);
}

const Logger = {
  info,
  debug,
  error
}

export default Logger;