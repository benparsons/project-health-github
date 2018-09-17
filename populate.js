const octokit = require('@octokit/rest')();
var config = require('./config.json');
octokit.authenticate({
    type: 'oauth',
    token: config.token
});
var moment = require('moment');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.db', sqlite3.OPEN_READWRITE);

var repos = config.repos;

var issues = true;
var commits = true;
var details = true;

// var repoLastUpdated = db.get(`SELECT updated FROM issues WHERE owner = '${owner}' AND repo = '${repo}' ORDER BY updated desc`);
// if (repoLastUpdated) { repoLastUpdated = repoLastUpdated.updated; }

init();

async function init() {
    /* ISSUES */
    if (issues) {
        repos.forEach(async repo => {
            getIssues(repo.owner, repo.repo, 1);
        });
    }

    /* COMMITS */
    if (commits) {
        repos.forEach(async repo => {
            getCommits(repo.owner, repo.repo, 1);
        });
    }

    if (details) {
        repos.forEach(async repo => {
            var response = await octokit.repos.get({
                owner: repo.owner,
                repo: repo.repo
            });
            var insertSql = `
            INSERT INTO repo_details(
                owner, repo, stargazers_count, watchers_count, forks_count, date
            )
            VALUES (
                '${repo.owner}',
                '${repo.repo}',
                ${response.data.stargazers_count},
                ${response.data.watchers_count},
                ${response.data.forks_count},
                '${moment().format()}'
            )
            `;
            db.run(insertSql, function(error) {
                if (error) {
                    console.log(this);
                    console.log(error);
                    process.exit(1);
                }
                if (this.changes !== 1) {
                    console.log("insert failed:");
                    console.log(this);
                    process.exit(1);
                }
            });
        });
    }
}

async function tryUpdateCommit(owner, repo, commit) {
    if (! commit.author) {
        commit.author = {login: commit.commit.author.email };
    }
    if (! commit.committer) {
        commit.committer = {login: commit.commit.author.email };
    }
    return new Promise(resolve => {
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
                console.log(this);
                console.log(error);
                process.exit(1);
            }

            if (this.changes === 0) {
                insertCommit(owner, repo, commit);
            }

            resolve(this.changes);
        });
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
            console.log(this);
            console.log(error);
            process.exit(1);
        }
        if (this.changes === 1) {
            tryUpdateCommit(owner, repo, commit);
        }
    });
}

function tryUpdateIssue(owner, repo, issue) {
    return new Promise(resolve => {
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

            if (this.changes === 0) {
                insertIssue(owner, repo, issue);
            }
            resolve(this.changes);
        });
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
        if (this.changes === 1) {
            tryUpdateIssue(owner, repo, issue);
        }
    });
}

async function getIssues(owner, repo, page) {
    console.log(`getIssues(${owner}, ${repo}, ${page})`);
    var response = await octokit.issues.getForRepo({
        owner: owner,
        repo: repo,
        state: 'all',
        sort: 'updated',
        per_page: 100,
        page: page
    });
    var nextPaged = false;
    await response.data.forEach(async (issue) => {
        var changes = await tryUpdateIssue(owner, repo, issue);
        if ((changes === 0 || page < 5) && ! nextPaged && page < 20) {
            nextPaged = true;
            getIssues(owner, repo, page + 1);
        }
    });
}

async function getCommits(owner, repo, page) {
    console.log(`getCommits(${owner}, ${repo}, ${page})`);
    var response = await octokit.repos.getCommits({
        owner: owner,
        repo: repo,
        per_page: 100,
        page: page
    });
    var nextPaged = false;
    await response.data.forEach(async commit => {
        var changes = await tryUpdateCommit(owner, repo, commit);
        if ((changes === 0 || page < 5) && ! nextPaged && page < 20) {
            nextPaged = true;
            getCommits(owner, repo, page + 1);
        }
    });
}