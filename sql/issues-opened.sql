SELECT owner, repo, count(*) as issues_opened
FROM issues 
WHERE opened > '2018-08-11'
GROUP BY 1, 2