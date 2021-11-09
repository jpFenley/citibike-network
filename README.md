# citibike-network

### stations.json
Each item is a station and has the station name and the coordinates

### paths.json
Each item is a path from one station to another (there could be a path from Station A to B and from B to A). There are 9 columns representing the different combinations 
(day/night/all, weekday/weekend/all) of rides types. For each column, there is a corresponding rank column with the suffix _R. For example, for the column 'Weekday', there is also
a column named 'Weekday_R', which corresponds to the rank that path has for that category. 

So, for showing the top k paths for a combination you want to display all paths where combination_R is less than k. So, use the value in the count column to affect how the edge looks,
and use the rank column to identify whether that path should be plotted.

Additioanlly, although there are around 100k path combinations, I only selected those that have at least one combination that ranks in the top 1000 paths. We can edit this
later on if we find it to be too few or too many.
