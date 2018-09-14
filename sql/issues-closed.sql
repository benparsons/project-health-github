SELECT owner, repo, count(*) as issues_closed
FROM issues 
WHERE closed > '%DS%' AND closed != 'null'
GROUP BY 1, 2