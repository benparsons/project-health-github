SELECT owner, repo, count(*) as issues_closed
FROM issues 
WHERE closed > '%DS%' AND closed < date('%DS%', '+31 days') AND closed != 'null'
GROUP BY 1, 2