SELECT owner, repo, count(DISTINCT "user.login") as distinct_openers
FROM issues 
WHERE opened > '%DS%' AND opened < date('%DS%', '+31 days')
GROUP BY 1, 2