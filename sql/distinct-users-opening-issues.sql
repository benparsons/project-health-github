SELECT owner, repo, count(DISTINCT "user.login") as distinct_openers
FROM issues 
WHERE opened > '2018-08-11'
GROUP BY 1, 2