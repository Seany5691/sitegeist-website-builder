const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

const rf = app.indexOf('function renderFeatureField');
console.log('renderFeatureField at', rf);
// find the end of the function
let depth = 0, started = false, end = rf;
for (let i = rf; i < app.length; i++) {
  if (app[i] === '{') { depth++; started = true; }
  else if (app[i] === '}') { depth--; if (started && depth === 0) { end = i + 1; break; } }
}
const body = app.slice(rf, end);
console.log('function length', body.length);
console.log(body);

console.log('\n\n=== upload helpers ===');
for (const fn of ['uploadFeatureFile', 'openFeatureUpload', 'handleFeatureFile', 'uploadFile', 'api/upload']) {
  const i = app.indexOf(fn);
  console.log(fn.padEnd(22), i);
}
const u = app.indexOf("api/upload");
if (u > 0) console.log(app.slice(u - 700, u + 900));
