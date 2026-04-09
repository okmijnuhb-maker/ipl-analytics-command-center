from flask import Flask, request, jsonify, render_template
import pickle, numpy as np, pandas as pd, os

app = Flask(__name__)

BASE      = os.path.dirname(os.path.abspath(__file__))
path      = os.path.join(BASE, '..', 'ml_models')
data_path = os.path.join(BASE, '..', 'data')

# Load Models
model_wp = pickle.load(open(os.path.join(path,'win_probability_model.pkl'),'rb'))
model_sp = pickle.load(open(os.path.join(path,'score_predictor_model.pkl'),'rb'))
model_td = pickle.load(open(os.path.join(path,'toss_recommender_model.pkl'),'rb'))
model_av = pickle.load(open(os.path.join(path,'auction_value_model.pkl'),'rb'))
model_pp = pickle.load(open(os.path.join(path,'player_performance_model.pkl'),'rb'))
best_xi  = pd.read_csv(os.path.join(path,'best_xi.csv'))

# Load CSVs for analytics
matches_df    = pd.read_csv(os.path.join(data_path,'matches_clean.csv'))
deliveries_df = pd.read_csv(os.path.join(data_path,'deliveries_clean.csv'))

@app.route('/')
def home(): return render_template('index.html')

@app.route('/win_prob', methods=['POST'])
def win_prob():
    d = request.json
    runs, balls, wickets = d['runs'], d['balls'], d['wickets']
    balls_left = 120 - balls
    crr  = runs / balls * 6 if balls > 0 else 0
    rrr  = (d['target'] - runs) / (balls_left / 6) if balls_left > 0 else 0
    prob = model_wp.predict_proba([[runs, balls, wickets, balls_left, crr, rrr]])[0][1]
    return jsonify({'win_prob': round(float(prob)*100, 2)})

@app.route('/score_pred', methods=['POST'])
def score_pred():
    d = request.json
    runs, balls, wickets = d['runs'], d['balls'], d['wickets']
    balls_left = 120 - balls
    crr  = runs / balls * 6 if balls > 0 else 0
    pred = model_sp.predict([[runs, balls, wickets, balls_left, crr]])[0]
    return jsonify({'predicted_score': round(float(pred))})

@app.route('/toss', methods=['POST'])
def toss():
    d    = request.json
    pred = model_td.predict([[d['venue_enc'], d['bat_first_win']]])[0]
    return jsonify({'recommendation': 'Field' if pred == 1 else 'Bat'})

@app.route('/auction', methods=['POST'])
def auction():
    d    = request.json
    pred = model_av.predict([[d['runs'], d['sr'], d['fours'], d['sixes'], d['wickets'], d['economy']]])[0]
    return jsonify({'auction_value': round(float(pred), 2)})

@app.route('/player_perf', methods=['POST'])
def player_perf():
    d    = request.json
    pred = model_pp.predict([[d['runs'], d['balls'], d['dismissals'], d['sr']]])[0]
    return jsonify({'predicted_avg': round(float(pred), 2)})

@app.route('/best_xi')
def get_best_xi():
    return jsonify(best_xi.fillna('').to_dict(orient='records'))

@app.route('/analytics/top_batsmen')
def top_batsmen():
    result = deliveries_df.groupby('Batter')['Batsman Runs'].sum().reset_index()
    result.columns = ['Batter','Runs']
    return jsonify(result.sort_values('Runs', ascending=False).head(10).to_dict(orient='records'))

@app.route('/analytics/season_matches')
def season_matches():
    result = matches_df.groupby('Season').size().reset_index(name='Matches')
    return jsonify(result.sort_values('Season').to_dict(orient='records'))

@app.route('/analytics/team_wins')
def team_wins():
    result = matches_df[matches_df['Winner'] != 'No Result'].groupby('Winner').size().reset_index(name='Wins')
    return jsonify(result.sort_values('Wins', ascending=False).head(8).to_dict(orient='records'))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
