SELECT owner, repo, count(DISTINCT "user.login") as distinct_openers
FROM issues 
WHERE opened > '%DS%'
GROUP BY 1, 2