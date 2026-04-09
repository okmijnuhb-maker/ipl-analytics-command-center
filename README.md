# IPL Analytics Command Center

An end-to-end Data Science project built on IPL data from 2008–2024. Covers the complete data science lifecycle — data cleaning, SQL analysis, machine learning, SHAP explainability, and a live web application.

**Live App:** https://web-production-80918.up.railway.app

---

## Project Overview

| Phase | Description | Tools |
|---|---|---|
| Data Cleaning | 1095 matches, 260K+ ball-by-ball records cleaned | Python, Pandas |
| SQL Analysis | 20 queries covering teams, players, venues | MySQL |
| ML Models | 6 models — win probability, score, auction value | XGBoost, Random Forest |
| Explainability | SHAP analysis for all 4 tree-based models | SHAP |
| Web App | Live predictions with interactive UI | Flask, HTML/CSS/JS |

---

## Live Web App

👉 **https://web-production-80918.up.railway.app**

The app has 8 sections:

- **Win Probability** — predict win % from current match situation
- **Score Predictor** — predict final innings score
- **Best XI** — AI recommended playing 11
- **Player Performance** — predict batting average vs opponent
- **Toss Recommender** — bat or field by venue
- **Auction Value** — predict IPL auction price in Crores
- **Analytics** — top batsmen, matches per season, team wins charts
- **About** — developer profile and project stats

---

## ML Models

| Model | Algorithm | Score |
|---|---|---|
| Win Probability | XGBoost Classifier | ROC-AUC: 0.7581 |
| Score Predictor | XGBoost Regressor | R²: 0.53, MAE: 15.63 |
| Best XI Selector | Weighted Scoring | Top 7 batsmen + 4 bowlers |
| Player Performance | Random Forest | R²: 0.9928 |
| Toss Recommender | Logistic Regression | Accuracy: 0.6575 |
| Auction Value | Gradient Boosting | R²: 0.9825 |

---

## SHAP Insights

| Model | Top Feature | Key Insight |
|---|---|---|
| Win Probability | RRR | Required run rate drives win chance |
| Score Predictor | CRR | Current run rate best predicts final score |
| Player Performance | Runs | Total runs most important for average |
| Auction Value | Wickets | Bowlers dominate IPL auction prices |

---

## Project Structure

```
ipl-analytics-command-center/
├── Notebooks/               # Jupyter notebooks
│   ├── 01_data_cleaning.ipynb
│   ├── 02_ml_models.ipynb
│   └── 03_shap_explainability.ipynb
├── ml_models/               # Saved .pkl model files
├── SHAP Plots/              # 12 SHAP visualization images
├── webapp/                  # Flask web application
│   ├── app.py
│   ├── templates/index.html
│   └── static/
├── IPL_SQL_Query_Results.docx
├── sql_script.sql
├── requirements.txt
└── Procfile
```

---

## SQL Analysis (20 Queries)

Key findings from the SQL analysis:

- Mumbai Indians lead all-time wins with **144 victories**
- V Kohli is the all-time top scorer with **8014 runs**
- YS Chahal leads wicket takers with **205 wickets**
- Fielding first wins **53.55%** of matches after winning toss
- **2009** had the highest match count (117 matches)
- DA Warner won the Orange Cap **3 times** (2015, 2017, 2019)

Full query outputs are in `IPL_SQL_Query_Results.docx`

---

## Tech Stack

- **Python** — Pandas, NumPy, scikit-learn, XGBoost, SHAP
- **MySQL** — Database storage and SQL analysis
- **Flask** — Backend API
- **HTML/CSS/JavaScript** — Frontend with Chart.js
- **Railway** — Cloud deployment

---

## Dataset

- **Source:** Kaggle IPL Complete Dataset (2008–2024)
- **Matches:** 1,095 records
- **Deliveries:** 260,920 ball-by-ball records
- **Seasons:** 2007 to 2024 (16 seasons)

---

## Developer

**J. Charan Reddy** — Data Scientist & Analyst

---
