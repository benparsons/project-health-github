const octokit = require('@octokit/rest')();
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.db', sqlite3.OPEN_READWRITE);

var owner = 'matrix-org';
var repo = 'synapse';

var repoLastUpdated = db.get(`SELECT updated FROM issues WHERE owner = '${owner}' AND repo = '${repo}' ORDER BY updated desc`);
if (repoLastUpdated) { repoLastUpdated = repoLastUpdated.updated; }

init();

async function init() {
    var issues = await getIssues();
    console.log(issues[0]);
}

async function getIssues() {
    var response = await octokit.issues.getForRepo({
        owner: owner,
        repo: repo,
        state: 'all',
        sort: 'updated'
    });
    return response.data;
}