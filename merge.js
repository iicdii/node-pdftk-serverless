'use strict';

const pdftk = require('node-pdftk');
const parser = require('lambda-multipart-parser');
const fs = require('fs').promises;

module.exports = async (event) => {
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
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Failed to handle PDF',
          input: event,
        },
        null,
        2
      ),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Success',
        base64: buffer.toString('base64'),
      },
      null,
      2
    ),
  };
};
