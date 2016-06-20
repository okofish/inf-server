var config = {
  defaultService: 'google',
  zoomLevel: 3,
  classLimit: 5
}
//console.log(require('./auth.json').watson.credentials.url)
var _ = require('underscore'),
  fs = require('fs'),
  db = require('monkii')('localhost/inf').get('results'),
  express = require('express'),
  app = express(),
  auth = require('./auth.json'),
  sv = require('./streetview.js')(db, config.zoomLevel),
  Google = require('./services/google'),
  Watson = require('./services/watson'),
  Clarifai = require('./services/clarifai'),
  gvision = new Google(auth.google),
  wvision = new Watson(auth.watson),
  cvision = new Clarifai(auth.clarifai);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/identify/:service/:panoID', function(req, res, next) {
  var panoID = req.params.panoID;
  console.log('Identification request received for panorama ' + panoID);

  var services = {
    google: gvision,
    watson: wvision,
    clarifai: cvision
  };
  var service = services[req.params.service] || services[config.defaultService] || services.clarifai;

  db.findOne({
    pano: panoID,
    service: service.name
  }, function(err, doc) {
    if (doc && doc.result && !err) {
      res.send(doc.result);
    } else {
      sv.savePanorama(panoID, function(err, path) {
        if (!err) {
          console.log('Panorama ' + panoID + ' saved at ' + path)

          service.detect(path, function(err, detections) {
            if (!err) {
              var result = {
                detections: detections.slice(0, config.classLimit),
                error: null
              };

              db.insert({
                pano: panoID,
                service: service.name,
                file: path,
                result: result
              }, function(err) {
                if (err) {
                  // adding this to the db isn't critical, so we won't let any mongo errors affect the response
                  console.error(err);
                }
                res.send(result);
              });
            } else {
              next(err);
            }
          }, req.query)
        } else {
          next(err);
        }
      });
    }
  })
});

app.get('/up', function(req, res, next) {
  res.send('ok');
});

app.get('/', function(req, res, next) {
  res.send('Hi! I\'m the API server for <a href="http://inf.jesse.ws">Interactive Nonfiction</a>. You can view my source code <a href="http://github.com/okofish/inf-server">here</a>.');
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
