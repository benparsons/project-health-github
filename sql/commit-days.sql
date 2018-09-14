SELECT owner, repo, count(*) AS commit_days FROM (
	SELECT  owner, repo, substr("author.date",0,11) AS ds, count(*) AS c FROM commits
	WHERE ds > '%DS%'
	GROUP BY 1, 2, 3
	)
GROUP BY 1, 2