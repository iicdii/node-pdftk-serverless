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

  let inputFile, stampFile;
  for (let file of files) {
    if (file.fieldname === 'input') inputFile = file;
    if (file.fieldname === 'stamp') stampFile = file;
  }

  if (!inputFile || !stampFile) {
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: 'input and stamp fields are required.',
        },
        null,
        2
      ),
    };
  }

  const inputPdfPath = '/tmp/input.pdf';
  const stampPdfPath = '/tmp/stamp.pdf';
  try {
    await Promise.all([
      fs.writeFile(inputPdfPath, inputFile.content),
      fs.writeFile(stampPdfPath, stampFile.content)
    ]);
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: 'Failed to save PDF',
          input: event,
        },
        null,
        2
      ),
    };
  }

  let buffer;
  try {
    // split pages into first page and rest pages
    await Promise.all([
      pdftk
        .input(inputPdfPath)
        .cat('1')
        .output('/tmp/first_page.pdf'),
      pdftk
        .input(inputPdfPath)
        .cat('2-end')
        .output('/tmp/rest_pages.pdf')
    ]);

    // stamp first page
    await pdftk
      .input('/tmp/first_page.pdf')
      .stamp(stampPdfPath)
      .output('/tmp/first_page_with_stamp.pdf');

    // merge stamp first page and rest pages
    buffer = await pdftk
      .input(['/tmp/first_page_with_stamp.pdf', '/tmp/rest_pages.pdf'])
      .cat()
      .output();
  } catch (e) {
    console.error('pdftk error', e);
    return {
      statusCode: 500,
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
