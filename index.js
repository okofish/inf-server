var config = {
  defaultService: 'google',
  zoomLevel: 3,
  classLimit: 5
}
//console.log(require('./auth.json').watson.credentials.url)
var _ = require('underscore'),
  sv = require('gpan'),
  fs = require('fs'),
  express = require('express'),
  app = express(),
  auth = require('./auth.json'),
  Google = require('./services/google'),
  Watson = require('./services/watson'),
  Clarifai = require('./services/clarifai'),
  gvision = new Google(auth.google),
  wvision = new Watson(auth.watson),
  cvision = new Clarifai(auth.clarifai);

sv.config({
  zoom_level: config.zoomLevel,
  tiles_prefix: 'image_',
  path_to_image: 'panos',
  output_prefix: 'output_',
  tmp_dir_prefix: 'gpan_tmp',
  pub: false
});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/identify/:service/:panoID', function(req, res, next) {
  var panoID = req.params.panoID;
  console.log('Identification request received for panorama ' + panoID)
  sv.savePanorama(panoID, function(err, path) {
    if (!err) {
      console.log('Panorama ' + panoID + ' saved at ' + path)

      var services = {
        google: gvision,
        watson: wvision,
        clarifai: cvision
      };
      var service = services[req.params.service] || services[config.defaultService] || services.clarifai;

      service.detect(path, function(err, detections) {
        if (!err) {
          res.send({
            detections: detections.slice(0, config.classLimit),
            error: null
          });
        } else {
          next(err);
        }
      }, req.query)
    } else {
      next(err);
    }
  });
});

app.get('/up', function(req, res, next) {
  res.send('ok');
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).send({
    error: {
      code: 500,
      message: 'Whoops! We had an error classifying the objects in this scene. Try typing "look", or reloading the game and selecting a different classification service.'
    }
  });
});

var port = 8000;
app.listen(port, function() {
  console.log('inf-server listening on port ' + port + '!');
});
