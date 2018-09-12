const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.db', sqlite3.OPEN_READWRITE);
const fs = require('fs');

var queries = [];
fs.readdirSync('sql/').forEach(file => {
    queries[file.replace(/\.sql/, '')] = {query: fs.readFileSync('sql/' + file, 'utf-8')};
});

console.log(queries);
console.log(Object.keys(queries));

Object.keys(queries).forEach(query => {
    //console.log(query);

    db.all(queries[query].query, function(err, rows) {
        if (err) { console.log(err); process.exit(1); }
        queries[query].result = rows;
        //console.log(rows);
    });
});

setTimeout(printQ, 2*1000);
function printQ() { console.log(queries); }