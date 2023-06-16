const fs = require('fs');

/*
// readFileSync
console.log('a');
const result = fs.readFileSync('syntax/sample.txt','utf8');
console.log('result', result)

console.log("c")
*/

console.log('a');
fs.readFile('syntax/sample.txt','utf8', (err, result) => {
    console.log('result', result);
});

console.log("c")
