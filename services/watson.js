var _ = require('underscore'),
  fs = require('fs'),
  wcloud = require('watson-developer-cloud');

var Watson = function(config) {
  var self = this;

  self.api = wcloud.visual_recognition({
    url: config.credentials.url,
    api_key: config.credentials.api_key,
    version: 'v3',
    version_date: '2015-05-19'
  });
  self.name = 'watson';
}

Watson.prototype.detect = function(path, cb) {
  var self = this;

  self.api.classify({
    images_file: fs.createReadStream(path)
  }, function(err, res) {
    // The Watson Visual Recognition API has a file size limit of ~2MB, so it's liable to return an error.
    // TODO: Return a special error just for this case, so the user knows it's a permanent problem for the location.
    if (!err && !res.images[0].hasOwnProperty('error')) {
      var detections = _.pluck(res.images[0].classifiers[0].classes, 'class');
      cb(null, detections);
    } else {
      cb(err || res.images[0].error);
    }
  });
}

module.exports = Watson;
