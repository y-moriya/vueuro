const fetch = require('node-fetch');

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event, context) => {
  fetch('https://script.google.com/macros/s/AKfycby1pjttwtClrDnqy7hRffTjPp_WxMnMnb1zbplyOJEpOykegifMv5GzQwx2RTrSYyLf/exec');
  await _sleep(2000);
  return {
    statusCode: 200,
    body: 'Request accepted.',
  };
};