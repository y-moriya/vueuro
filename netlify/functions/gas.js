const fetch = require('node-fetch');

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event, context) => {
  fetch('https://script.google.com/macros/s/AKfycbw5DW0zkMVIzPEIn4pAYnAgklIhVAXR77fBslEs3b--B7xbCaxtEoP0obqTD7VMBCtW/exec');
  _sleep(2000);
  return {
    statusCode: 200,
    body: 'Request accepted.',
  };
};