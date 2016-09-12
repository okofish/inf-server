var _ = require('underscore'),
  gcloud = require('google-cloud');

var Google = function(config) {
  var self = this;

  self.api = gcloud(config).vision();
}

Google.prototype.detect = function(path, cb, query) {
  var self = this;

  // TODO: If/when https://github.com/GoogleCloudPlatform/gcloud-node/pull/1342 is merged, add latitude and longitude from query in ImageContext
  self.api.detect(path, {
    types: ['labels', 'landmarks']
  }, function(err, res) {
    if (!err) {
      //console.log(JSON.stringify(apiRes));

      var detections = res.labels || [];
      _.each(res.landmarks || [], function(landmark) {
        /*
          The rules for whether to prepend "the" to the name of a landmark or geographic location
          are actually incredibly complex, so for now we'll pass it along unchanged.
          If you can help wih this, don't hesitate to submit a pull request!

          Related: https://en.wikipedia.org/wiki/The#Geographical_names
        */
        // FIXME: Add rules to determine whether or not to use the definite article here

        // We could just do this with Array.concat, but we want to leave room for more complex logic.
        detections.push(landmark);
      });

      cb(null, detections);
    } else {
      cb(err);
    }
  });
}

module.exports = Google;
