SELECT owner, repo, count(*) as distinct_commit_authors FROM (
SELECT DISTINCT owner, repo, "author.login" FROM commits
	WHERE "author.date" > '2018-08-11'
)
GROUP BY 1, 2