SELECT owner, repo, 
AVG(julianday(case when closed != 'null' then closed else date('now') end) - julianday(opened)) as duration
FROM issues 
WHERE closed > '2018-08-11' OR closed = 'null'
GROUP BY 1, 2