const fs = require('fs');
const img = fs.readFileSync('./src/images/dst_logo.png');
const b64 = img.toString('base64');
const out = `export const dstLogoBase64 = 'data:image/png;base64,${b64}';`;
fs.writeFileSync('./src/utils/logoBase64.js', out);
console.log('Done, size:', out.length);
