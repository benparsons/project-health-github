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
  

var oneWeekAgo = moment().subtract(7, 'days').format("YYYY-MM-DD");

db.all(`SELECT * FROM results_issues WHERE ds > ${oneWeekAgo}`, function(err, rows) {
    if (err) { console.log(err); process.exit(1); }
    console.log(rows.length);
    rows.forEach(rows => {
        var sql = `
            INSERT IGNORE INTO advocacy_github_health (
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
                '${rows.ds}',
                '${rows.owner}',
                '${rows.repo}',
                ${rows.issues_opened},
                ${rows.issues_closed},
                ${rows.issues_avg_duration},
                ${rows.issues_distinct_users},
                ${rows.commit_days},
                ${rows.distinct_commit_authors},
                ${rows.stargazers_count},
                ${rows.watchers_count},
                ${rows.forks_count}
            )
        `;
        //console.log(sql); process.exit(0);
        mysqlConn.query(sql);
    });
});