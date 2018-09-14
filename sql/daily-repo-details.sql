SELECT owner, repo, MAX(date), stargazers_count, watchers_count, forks_count, substr("date",0,11) as ds
FROM repo_details
GROUP BY 1, 2