const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  let promise = fetch('https://script.google.com/macros/s/AKfycbw5DW0zkMVIzPEIn4pAYnAgklIhVAXR77fBslEs3b--B7xbCaxtEoP0obqTD7VMBCtW/exec');
  return {
    statusCode: 200,
    body: 'Request accepted.',
  };
};