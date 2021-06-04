exports.handler = async (event, context) => {
  setTimeout(() => {
    fetch('https://script.google.com/macros/s/AKfycbw5DW0zkMVIzPEIn4pAYnAgklIhVAXR77fBslEs3b--B7xbCaxtEoP0obqTD7VMBCtW/exec');
  }, 1000);
  return {
    statusCode: 200,
    body: 'Request accepted.',
  };
};