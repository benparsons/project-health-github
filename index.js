const octokit = require('@octokit/rest')();
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.db', sqlite3.OPEN_READWRITE);

var repos = [
    {owner: 'matrix-org', repo: 'synapse'},
    {owner: 'mujx', repo: 'nheko'},
    {owner: 'tulir', repo: 'gomuks'}
];

var issues = true;
var commits = true;

// var repoLastUpdated = db.get(`SELECT updated FROM issues WHERE owner = '${owner}' AND repo = '${repo}' ORDER BY updated desc`);
// if (repoLastUpdated) { repoLastUpdated = repoLastUpdated.updated; }

init();

async function init() {
    /* ISSUES */
    if (issues) {
        repos.forEach(async repo => {
            var issues = await getIssues(repo.owner, repo.repo);
            issues.forEach((issue) => {
                tryUpdateIssue(repo.owner, repo.repo, issue);
            });
        });
    }

    if (commits) {
        repos.forEach(async repo => {
            var response = await octokit.repos.getCommits({
                owner: repo.owner,
                repo: repo.repo,
                per_page: 100
            });
            response.data.forEach(commit => {
                tryUpdateCommit(repo.owner, repo.repo, commit);
            });
        });
    }
}

function tryUpdateCommit(owner, repo, commit) {
    var updateSql =
    `UPDATE commits
    SET
    'author.login' = '${commit.author.login}',
    'author.date' = '${commit.commit.author.date}',
    'committer.login' = '${commit.committer.login}',
    'committer.date' = '${commit.commit.committer.date}'
    WHERE
    owner = '${owner}' AND
    repo = '${repo}' AND
    sha = '${commit.sha}'
    `;
    
    db.run(updateSql, function(error) {
        if (error) {
            console.log(error);
            process.exit(1);
        }

        console.log(this);
        if (this.changes === 0) {
            insertCommit(owner, repo, commit);
        }
    });
}

function insertCommit(owner, repo, commit) {
    var insertSql = 
    `INSERT INTO commits
    (owner, repo, sha)
    VALUES
    ('${owner}', '${repo}', '${commit.sha}')
    `;
    db.run(insertSql, function(error) {
        if (error) {
            console.log(error);
            process.exit(1);
        }
        console.log(this);
        if (this.changes === 1) {
            tryUpdateCommit(owner, repo, commit);
        }
    });
}

function tryUpdateIssue(owner, repo, issue) {
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
            tryUpdateIssue(owner, repo, issue);
        }
    });
}

async function getIssues(owner, repo) {
    var response = await octokit.issues.getForRepo({
        owner: owner,
        repo: repo,
        state: 'all',
        sort: 'updated',
        per_page: 100
    });
    return response.data;
}