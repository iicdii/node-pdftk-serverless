'use strict';

const pdftk = require('node-pdftk');
const parser = require('lambda-multipart-parser');
const fs = require('fs').promises;

module.exports = async (event) => {
  // Fix busboy issue - https://github.com/mscdex/busboy/issues/210
  Object.keys(event.headers).forEach((key) => {
    const value = event.headers[key];
    delete event.headers[key];
    event.headers[key.toLowerCase()] = value;
  }, {});
  const { files } = await parser.parse(event);

  const inputPdfPaths = [];
  const writePromises = [];
  for (let fileIndex in files) {
    const file = files[fileIndex];
    const savePath = `/tmp/input_${fileIndex}.pdf`;
    inputPdfPaths.push(savePath);
    writePromises.push(fs.writeFile(savePath, file.content))
  }

  await Promise.all(writePromises);

  let buffer;
  try {
    // merge all in one
    buffer = await pdftk
      .input(inputPdfPaths)
      .cat()
      .output();
  } catch (e) {
    console.error('pdftk error', e);
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: 'Failed to merge PDF',
          input: event,
        },
        null,
        2
      ),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
};
