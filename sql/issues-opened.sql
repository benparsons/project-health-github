SELECT owner, repo, count(*) as issues_opened
FROM issues 
WHERE opened > '%DS%'
GROUP BY 1, 2