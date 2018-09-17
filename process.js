const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.db', sqlite3.OPEN_READWRITE);
const fs = require('fs');
var moment = require('moment');
var config = require('./config.json');

var queries = [];
var givenDate = moment();
if (process.argv[2]) {
    givenDate = moment(process.argv[2]);
}
var todayDs = givenDate.format("YYYY-MM-DD");
var minus30Days = givenDate.subtract(30, 'days').format("YYYY-MM-DD");
fs.readdirSync('sql/').forEach(file => {
    queries[file.replace(/\.sql/, '')] = fs.readFileSync('sql/' + file, 'utf-8').replace(/%DS%/g, minus30Days);
});

processData();

function processData() {

    db.serialize(function() {
        config.repos.forEach(repo => {
            var insertRowsSql = `
            INSERT OR IGNORE INTO results_issues (
            ds, owner, repo
            ) VALUES (
                '${todayDs}', '${repo.owner}', '${repo.repo}'
            )
            `;
            db.run(insertRowsSql);
        });
        db.all(queries['issues-opened'], (err, rows) => {
            if (err) { console.log(err); process.exit(1); }
            rows.forEach(row => {
                updateIssuesOpened(row);
            });
        });
        db.all(queries['issues-closed'], (err, rows) => {
            if (err) { console.log(err); process.exit(1); }
            rows.forEach(row => {
                updateIssuesClosed(row);
            });
        });
        db.all(queries['duration-inc-open-issues'], (err, rows) => {
            if (err) { console.log(err); process.exit(1); }
            rows.forEach(row => {
                updateIssuesDuration(row);
            });
        });
        db.all(queries['distinct-users-opening-issues'], (err, rows) => {
            if (err) { console.log(err); process.exit(1); }
            rows.forEach(row => {
                updateIssuesDistinctOpeners(row);
            });
        });
        db.all(queries['commit-days'], (err, rows) => {
            if (err) { console.log(err); process.exit(1); }
            rows.forEach(row => {
                updateCommitDays(row);
            });
        });
        db.all(queries['distinct-commit-authors'], (err, rows) => {
            if (err) { console.log(err); process.exit(1); }
            rows.forEach(row => {
                updateDistinctCommitAuthors(row);
            });
        });
        db.all(queries['daily-repo-details'], (err, rows) => {
            if (err) { console.log(err); process.exit(1); }
            rows.forEach(row => {
                updateRepoDetails(row);
            });
        });
    });
}

function updateRepoDetails(row) {
    //stargazers_count, watchers_count, forks_count
    var updateSql = `
    UPDATE results_issues
    SET
    stargazers_count = ${row.stargazers_count},
    watchers_count = ${row.watchers_count},
    forks_count = ${row.forks_count}
    WHERE
    ds = '${row.ds}'
    AND owner = '${row.owner}'
    AND repo = '${row.repo}'
    `;
    db.run(updateSql, function (err) {
        if (err) { console.log(err); process.exit(1); }
    });
}

function updateIssuesClosed(row) {
    var updateSql = `
    UPDATE results_issues
    SET
    issues_closed = ${row.issues_closed}
    WHERE
    ds = '${todayDs}'
    AND owner = '${row.owner}'
    AND repo = '${row.repo}'
    `;
    db.run(updateSql, function (err) {
        if (err) { console.log(err); process.exit(1); }
    });
}

function updateIssuesOpened(row) {
    var updateSql = `
    UPDATE results_issues
    SET
    issues_opened = ${row.issues_opened}
    WHERE
    ds = '${todayDs}'
    AND owner = '${row.owner}'
    AND repo = '${row.repo}'
    `;
    db.run(updateSql, function (err) {
        if (err) { console.log(err); process.exit(1); }
    });
}

function updateIssuesDuration(row) {
    var updateSql = `
    UPDATE results_issues
    SET
    issues_avg_duration = ${row.duration}
    WHERE
    ds = '${todayDs}'
    AND owner = '${row.owner}'
    AND repo = '${row.repo}'
    `;
    db.run(updateSql, function (err) {
        if (err) { console.log(err); process.exit(1); }
    });
}

function updateIssuesDistinctOpeners(row) {
    var updateSql = `
    UPDATE results_issues
    SET
    issues_distinct_users = ${row.distinct_openers}
    WHERE
    ds = '${todayDs}'
    AND owner = '${row.owner}'
    AND repo = '${row.repo}'
    `;
    db.run(updateSql, function (err) {
        if (err) { console.log(err); process.exit(1); }
    });
}

function updateCommitDays(row) {
    var updateSql = `
    UPDATE results_issues
    SET
    commit_days = ${row.commit_days}
    WHERE
    ds = '${todayDs}'
    AND owner = '${row.owner}'
    AND repo = '${row.repo}'
    `;
    db.run(updateSql, function (err) {
        if (err) { console.log(err); process.exit(1); }
    });
}

function updateDistinctCommitAuthors(row) {
    var updateSql = `
    UPDATE results_issues
    SET
    distinct_commit_authors = ${row.distinct_commit_authors}
    WHERE
    ds = '${todayDs}'
    AND owner = '${row.owner}'
    AND repo = '${row.repo}'
    `;
    db.run(updateSql, function (err) {
        if (err) { console.log(err); process.exit(1); }
    });
}