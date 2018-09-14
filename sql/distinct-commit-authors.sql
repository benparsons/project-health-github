SELECT owner, repo, count(*) as distinct_commit_authors FROM (
SELECT DISTINCT owner, repo, "author.login" FROM commits
	WHERE "author.date" > '%DS%'
)
GROUP BY 1, 2