SELECT owner, repo, count(*) as issues_opened
FROM issues 
WHERE opened > '%DS%' AND opened < date('%DS%', '+31 days')
GROUP BY 1, 2