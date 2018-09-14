CREATE TABLE IF NOT EXISTS "issues" (
	`owner`	TEXT,
	`repo`	TEXT,
	`number`	INTEGER,
	`is_pull`	INTEGER,
	`opened`	TEXT,
	`updated`	TEXT,
	`closed`	TEXT,
	`user.login`	TEXT,
	`user.assoc`	TEXT
);
CREATE TABLE `commits` (
	`owner`	TEXT,
	`repo`	TEXT,
	`author.login`	TEXT,
	`author.date`	TEXT,
	`committer.login`	TEXT,
	`committer.date`	TEXT,
	`sha`	TEXT
);
CREATE TABLE `repo_details` (
	`owner`	TEXT,
	`repo`	TEXT,
	`stargazers_count`	INTEGER,
	`watchers_count`	INTEGER,
	`forks_count`	INTEGER,
	`date`	TEXT
);
CREATE TABLE IF NOT EXISTS "results_issues" (
	`ds`	TEXT,
	`owner`	TEXT,
	`repo`	TEXT,
	`issues_opened`	INTEGER,
	`issues_closed`	INTEGER,
	`issues_avg_duration`	REAL,
	`issues_distinct_users`	INTEGER,
	`commit_days`	INTEGER,
	`distinct_commit_authors`	INTEGER,
	`stargazers_count`	INTEGER,
	`watchers_count`	INTEGER,
	`forks_count`	INTEGER,
	PRIMARY KEY(`ds`,`owner`,`repo`)
);
