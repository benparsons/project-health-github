SELECT owner, repo, count(*) as issues_closed
FROM issues 
WHERE closed > '2018-08-11'
GROUP BY 1, 2