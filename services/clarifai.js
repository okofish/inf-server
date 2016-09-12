var fs = require('fs'),
  clarifai = require('clarifai');

var Clarifai = function(config) {
  var self = this;

  self.api = clarifai;
  self.api.initialize(config);
}

Clarifai.prototype.detect = function(path, cb) {
  var self = this;
  
  var bytes = fs.readFileSync(path);
  self.api.getTagsByImageBytes(bytes.toString('base64')).then(
    function(res) {
      //console.log(res);
      cb(null, res.results[0].result.tag.classes);
    },
    function(err) {
      cb(err);
    }
  );
}

module.exports = Clarifai;
