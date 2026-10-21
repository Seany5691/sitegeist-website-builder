const fs = require("fs");
const path = process.argv[2];
const src = fs.readFileSync(path, "utf8");
try {
  new Function(src);
  console.log("OK");
} catch (e) {
  console.log("ERROR:", e.message);
  // Try to find line via stack
  const m = e.stack.match(/<anonymous>:(\d+):(\d+)/);
  if (m) {
    const lines = src.split("\n");
    // new Function wraps code, line offsets shift; search for likely culprit
    console.log("reported position:", m[1], m[2]);
  }
}
