'use strict';

const pdftk = require('node-pdftk');
const stamp = require('./stamp');
const merge = require('./merge');

process.env['LD_LIBRARY_PATH'] = `${process.env['LD_LIBRARY_PATH']}:/opt/lib`;

pdftk.configure({
  bin: '/opt/bin/pdftk',
  ignoreWarnings: false,
  tempDir: '/tmp/pdftk',
});

module.exports.stamp = stamp;
module.exports.merge = merge;
