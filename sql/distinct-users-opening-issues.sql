SELECT owner, repo, count(DISTINCT "user.login")
FROM issues 
WHERE opened > '2018-08-11'
GROUP BY 1, 2