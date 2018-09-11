const octokit = require('@octokit/rest')();
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.db', sqlite3.OPEN_READWRITE);

var repos = [
    {owner: 'matrix-org', repo: 'synapse'},
    {owner: 'mujx', repo: 'nheko'},
    {owner: 'tulir', repo: 'gomuks'}
];

// var repoLastUpdated = db.get(`SELECT updated FROM issues WHERE owner = '${owner}' AND repo = '${repo}' ORDER BY updated desc`);
// if (repoLastUpdated) { repoLastUpdated = repoLastUpdated.updated; }

init();

async function init() {
    repos.forEach(async repo => {
        var issues = await getIssues(repo.owner, repo.repo);
        issues.forEach((issue) => {
            tryUpdate(repo.owner, repo.repo, issue);
        });
    });
}

function tryUpdate(owner, repo, issue) {
    var updateSql = 
    `UPDATE issues
    SET 
    is_pull = ${issue.pull_request ? 1 : 0},
    opened = '${issue.created_at}',
    updated = '${issue.updated_at}',
    closed = '${issue.closed_at}',
    'user.login' = '${issue.user.login}',
    'user.assoc' = '${issue.author_association}'
    WHERE
    owner = '${owner}' AND
    repo = '${repo}' AND
    number = ${issue.number}
    `;
    db.run(updateSql, function(error) {
        if (error) {
            console.log(error);
            process.exit(1);
        }

        console.log(this);
        if (this.changes === 0) {
            insertIssue(owner, repo, issue);
        }
    });
}

function insertIssue(owner, repo, issue) {
    var insertSql = 
    `INSERT INTO issues
    (owner, repo, number)
    VALUES
    ('${owner}', '${repo}', ${issue.number})
    `;
    db.run(insertSql, function(error) {
        if (error) {
            console.log(error);
            process.exit(1);
        }
        console.log(this);
        if (this.changes === 1) {
            tryUpdate(owner, repo, issue);
        }
    });
}

async function getIssues(owner, repo) {
    var response = await octokit.issues.getForRepo({
        owner: owner,
        repo: repo,
        state: 'all',
        sort: 'updated'
    });
    return response.data;
}