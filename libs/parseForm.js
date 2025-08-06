// libs/parseForm.js
import Busboy from 'busboy';

export const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    const files = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const buffer = [];
      file.on('data', (data) => buffer.push(data));
      file.on('end', () => {
        files[fieldname] = {
          buffer: Buffer.concat(buffer),
          filename,
          mimetype,
        };
      });
    });

    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on('finish', () => {
      resolve({ fields, files });
    });

    req.pipe(busboy);
  });
