var sv = require('gpan'),
  fs = require('fs');

module.exports = function(db, zoomLevel) {
  var checkForSave = function(id, cb) {
    db.findOne({
      pano: id
    }, function(err, doc) {
      if (!err && doc) {
        cb(null, doc.file);
      } else {
        sv.savePanorama(id, cb);
      }
    })
  }

  sv.config({
    zoom_level: zoomLevel,
    tiles_prefix: 'image_',
    path_to_image: 'panos',
    output_prefix: 'output_',
    tmp_dir_prefix: 'gpan_tmp',
    pub: false
  });

  return {
    savePanorama: checkForSave
  }
}
