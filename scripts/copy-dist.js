const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'client', 'dist');
const dest = path.join(__dirname, '..', 'dist');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log('Successfully copied client/dist to root dist for deployment.');
} else {
  console.error('Source directory client/dist does not exist.');
  process.exit(1);
}