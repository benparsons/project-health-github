USE businessmetrics;
CREATE TABLE advocacy_github_health (
    ds	DATE,
    owner	varchar(100),
    repo	varchar(100),
    issues_opened	INTEGER,
    issues_closed	INTEGER,
    issues_avg_duration	FLOAT,
    issues_distinct_users	INTEGER,
    commit_days	INTEGER,
    distinct_commit_authors	INTEGER,
    stars INTEGER,
    watch INTEGER,
    forks INTEGER
);
ALTER TABLE advocacy_github_health ADD PRIMARY KEY(ds, owner, repo);
