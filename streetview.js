var sv = require('gpan'),
  fs = require('fs');

module.exports = function(db, zoomLevel) {
  sv.config({
    zoom_level: config.zoomLevel,
    tiles_prefix: 'image_',
    path_to_image: 'panos',
    output_prefix: 'output_',
    tmp_dir_prefix: 'gpan_tmp',
    pub: false
  });

  return {
    savePanorama: sv.savePanorama
  }
}
