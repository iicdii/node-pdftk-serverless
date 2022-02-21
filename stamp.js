'use strict';

const pdftk = require('node-pdftk');
const parser = require('lambda-multipart-parser');
const fs = require('fs').promises;

module.exports = async (event) => {
  const { files } = await parser.parse(event);
  const inputFile = files.find(n => n.fieldname === 'input');
  const stampFile = files.find(n => n.fieldname === 'stamp');
  const inputPdfPath = '/tmp/input.pdf';
  const stampPdfPath = '/tmp/stamp.pdf';
  await Promise.all([
    fs.writeFile(inputPdfPath, inputFile.content),
    fs.writeFile(stampPdfPath, stampFile.content)
  ]);

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
