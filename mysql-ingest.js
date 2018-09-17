const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.db', sqlite3.OPEN_READWRITE);
var moment = require('moment');
var config = require('./config.json');
var mysql = require('mysql');
var mysqlConn = mysql.createConnection(config.mysqlLocal);
mysqlConn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
  

var oneWeekAgo = moment().subtract(50, 'days').format("YYYY-MM-DD");

db.all(`SELECT * FROM results_issues WHERE ds > ${oneWeekAgo}`, function(err, rows) {
    if (err) { console.log(err); process.exit(1); }
    console.log(rows.length);
    var rowsHandled = 0;
    rows.forEach(row => {
        var sql = `
            REPLACE INTO advocacy_github_health (
                ds,
                owner,
                repo,
                issues_opened,
                issues_closed,
                issues_avg_duration,
                issues_distinct_users,
                commit_days,
                distinct_commit_authors,
                stars,
                watch,forks
            ) VALUES (
                '${row.ds}',
                '${row.owner}',
                '${row.repo}',
                ${row.issues_opened},
                ${row.issues_closed},
                ${row.issues_avg_duration},
                ${row.issues_distinct_users},
                ${row.commit_days},
                ${row.distinct_commit_authors},
                ${row.stargazers_count},
                ${row.watchers_count},
                ${row.forks_count}
            )
        `;
        mysqlConn.query(sql, function() {
            rowsHandled++;
            if (rowsHandled === rows.length) {
                process.exit(0);
            }
        });
    });
});