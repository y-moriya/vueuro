const fetch = require('node-fetch');

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event, context) => {
  fetch('https://script.google.com/macros/s/AKfycbyrOZE9oA0s6q3nIgjXSq04lVPcRX6AwJi_GvJ3N6CJ0kUXH3v_XbyijcKRLVmRVJnC/exec');
  await _sleep(2000);
  return {
    statusCode: 200,
    body: 'Request accepted.',
  };
};