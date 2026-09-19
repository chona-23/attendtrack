const { onRequest } = require('firebase-functions/v2/https');
  const server = import('firebase-frameworks');
  exports.ssrtestchecker4caeb = onRequest({"region":"us-central1"}, (req, res) => server.then(it => it.handle(req, res)));
  