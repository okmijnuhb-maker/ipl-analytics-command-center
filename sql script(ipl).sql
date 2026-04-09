USE ipl_analytics;
SHOW TABLES;

--  Total Matches Per Season
SELECT Season, COUNT(*) AS Total_Matches
FROM matches
GROUP BY Season
ORDER BY Season;

--  Most Successful Teams (All Time Wins)
SELECT Winner AS Team, COUNT(*) AS Total_Wins
FROM matches
WHERE Winner != 'No Result'
GROUP BY Winner
ORDER BY Total_Wins DESC;

--  Toss Impact on Match Result
SELECT `Toss Decision`, 
       COUNT(*) AS Total_Matches,
       SUM(`Toss Win Match Win`) AS Won_After_Toss,
       ROUND(SUM(`Toss Win Match Win`) * 100.0 / COUNT(*), 2) AS Win_Percentage
FROM matches
GROUP BY `Toss Decision`;

--  Top 10 Run Scorers All Time
SELECT Batter, 
       SUM(`Batsman Runs`) AS Total_Runs,
       COUNT(DISTINCT `Match Id`) AS Matches,
       ROUND(SUM(`Batsman Runs`) * 100.0 / COUNT(*), 2) AS Strike_Rate
FROM deliveries
GROUP BY Batter
ORDER BY Total_Runs DESC
LIMIT 10;

--  Top 10 Wicket Takers All Time (Fixed)
SELECT d.Bowler,
       COUNT(*) AS Wickets,
       ROUND(e.Total_Runs * 6.0 / e.Total_Balls, 2) AS Economy
FROM deliveries d
JOIN (
    SELECT Bowler, SUM(`Total Runs`) AS Total_Runs, COUNT(*) AS Total_Balls
    FROM deliveries GROUP BY Bowler
) e ON d.Bowler = e.Bowler
WHERE `Dismissal Kind` NOT IN ('Run Out','Retired Hurt','Obstructing The Field','Not Out')
GROUP BY d.Bowler, e.Total_Runs, e.Total_Balls
ORDER BY Wickets DESC
LIMIT 10;

--  Highest Scoring Venues
SELECT m.Venue, ROUND(AVG(d.Total_Runs), 2) AS Avg_Score
FROM matches m
JOIN (SELECT `Match Id`, SUM(`Total Runs`) AS Total_Runs FROM deliveries WHERE Inning = 1 GROUP BY `Match Id`) d 
ON m.Id = d.`Match Id`
GROUP BY m.Venue ORDER BY Avg_Score DESC LIMIT 10;

--  Orange Cap Winners Each Season
WITH season_runs AS (
    SELECT m.Season, d.Batter, SUM(d.`Batsman Runs`) AS Runs,
    RANK() OVER (PARTITION BY m.Season ORDER BY SUM(d.`Batsman Runs`) DESC) AS rnk
    FROM deliveries d JOIN matches m ON d.`Match Id` = m.Id
    GROUP BY m.Season, d.Batter
)
SELECT Season, Batter AS Orange_Cap, Runs FROM season_runs WHERE rnk = 1 ORDER BY Season;

-- Purple Cap Winners Each Season
WITH season_wkts AS (
    SELECT m.Season, d.Bowler, COUNT(*) AS Wickets,
    RANK() OVER (PARTITION BY m.Season ORDER BY COUNT(*) DESC) AS rnk
    FROM deliveries d JOIN matches m ON d.`Match Id` = m.Id
    WHERE d.`Dismissal Kind` NOT IN ('Run Out','Retired Hurt','Obstructing The Field','Not Out')
    GROUP BY m.Season, d.Bowler
)
SELECT Season, Bowler AS Purple_Cap, Wickets FROM season_wkts WHERE rnk = 1 ORDER BY Season;

--  Head to Head MI vs CSK
SELECT Winner, COUNT(*) AS Wins
FROM matches
WHERE (Team1 = 'Mumbai Indians' AND Team2 = 'Chennai Super Kings')
OR (Team1 = 'Chennai Super Kings' AND Team2 = 'Mumbai Indians')
GROUP BY Winner;

--  Most Sixes Hit By Each Team
SELECT `Batting Team`, COUNT(*) AS Total_Sixes
FROM deliveries
WHERE `Batsman Runs` = 6
GROUP BY `Batting Team`
ORDER BY Total_Sixes DESC;

-- Best Powerplay Teams
SELECT batting_team, ROUND(AVG(pp_runs), 2) AS Avg_Powerplay_Score
FROM (
    SELECT `Match Id`, `Batting Team` AS batting_team, SUM(`Total Runs`) AS pp_runs
    FROM deliveries 
    WHERE `Over` BETWEEN 1 AND 6
    GROUP BY `Match Id`, `Batting Team`
) pp
GROUP BY batting_team
ORDER BY Avg_Powerplay_Score DESC;

--  Best Death Over Bowlers
SELECT d.Bowler,
       ROUND(SUM(d.`Total Runs`) * 6.0 / COUNT(*), 2) AS Death_Economy,
       SUM(d.`Is Wicket`) AS Wickets
FROM deliveries d
WHERE d.`Over` BETWEEN 16 AND 20
GROUP BY d.Bowler
HAVING COUNT(DISTINCT d.`Match Id`) >= 20
ORDER BY Death_Economy ASC
LIMIT 10;

--  Query 13 — Most Player of the Match Awards
SELECT `Player Of Match`, COUNT(*) AS Awards
FROM matches
WHERE `Player Of Match` != 'N/A'
GROUP BY `Player Of Match`
ORDER BY Awards DESC
LIMIT 10;

-- Batting First vs Chasing Win % By Season
SELECT Season,
       ROUND(AVG(`Bat First Win`) * 100, 2) AS Bat_First_Win_Pct,
       ROUND((1 - AVG(`Bat First Win`)) * 100, 2) AS Chase_Win_Pct
FROM matches
WHERE Winner != 'No Result'
GROUP BY Season
ORDER BY Season;

--  Most Consistent Batsmen
SELECT Batter,
       COUNT(DISTINCT `Match Id`) AS Matches,
       SUM(`Batsman Runs`) AS Total_Runs,
       ROUND(SUM(`Batsman Runs`) / COUNT(DISTINCT `Match Id`), 2) AS Avg_Per_Match
FROM deliveries
GROUP BY Batter
HAVING Matches >= 50
ORDER BY Avg_Per_Match DESC
LIMIT 10;

--  Most Boundaries Per Team Per Season
SELECT m.Season, d.`Batting Team`,
       SUM(d.`Is Four`) AS Fours,
       SUM(d.`Is Six`) AS Sixes,
       SUM(d.`Is Boundary`) AS Total_Boundaries
FROM deliveries d JOIN matches m ON d.`Match Id` = m.Id
GROUP BY m.Season, d.`Batting Team`
ORDER BY Total_Boundaries DESC
LIMIT 10;

--  Super Over Matches & Winners
SELECT Season, Team1, Team2, Winner
FROM matches
WHERE `Super Over` = 'Y'
ORDER BY Season;

--  Fastest Scorers (Min 500 Runs)
SELECT Batter,
       SUM(`Batsman Runs`) AS Runs,
       COUNT(*) AS Balls,
       ROUND(SUM(`Batsman Runs`) * 100.0 / COUNT(*), 2) AS Strike_Rate
FROM deliveries
WHERE `Extras Type` IS NULL
GROUP BY Batter
HAVING Runs >= 500
ORDER BY Strike_Rate DESC
LIMIT 10;

--  Most Dot Balls Bowled
SELECT Bowler,
       SUM(CASE WHEN `Total Runs` = 0 THEN 1 ELSE 0 END) AS Dot_Balls,
       COUNT(*) AS Total_Balls,
       ROUND(SUM(CASE WHEN `Total Runs` = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS Dot_Pct
FROM deliveries
GROUP BY Bowler
HAVING Total_Balls >= 500
ORDER BY Dot_Balls DESC
LIMIT 10;

--  IPL Trophy Winners Summary
SELECT `Ipl Winner`, 
       COUNT(DISTINCT Season) AS Titles,
       GROUP_CONCAT(DISTINCT Season ORDER BY Season) AS Winning_Seasons
FROM matches
GROUP BY `Ipl Winner`
ORDER BY Titles DESC;

