// Navigation
function showSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
    if(id === 'analytics') loadAnalytics();
}

// Show Result
function showResult(id, html) {
    const el = document.getElementById(id);
    el.innerHTML = html;
    el.classList.add('show');
}

// Win Probability
async function predictWinProb() {
    const data = {
        runs:    +document.getElementById('wp-runs').value,
        balls:   +document.getElementById('wp-balls').value,
        wickets: +document.getElementById('wp-wickets').value,
        target:  +document.getElementById('wp-target').value
    };
    const res  = await fetch('/win_prob', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const json = await res.json();
    const prob  = json.win_prob;
    const color = prob >= 60 ? '#22c55e' : prob >= 40 ? '#f59e0b' : '#ef4444';
    const desc  = prob >= 60 ? 'Strong position! Team is likely to win from here.'
                : prob >= 40 ? 'Close contest! Match can go either way.'
                : 'Under pressure! Team needs a strong recovery.';
    showResult('wp-result', `
        <div class="progress-wrap"><div class="progress-bar" style="width:${prob}%;background:${color}"></div></div>
        <div class="progress-labels"><span>0%</span><span>50%</span><span>100%</span></div>
        <div class="big-number" style="color:${color}">${prob}%</div>
        <div class="result-desc">${desc}</div>
    `);
}

// Score Predictor
async function predictScore() {
    const data = {
        runs:    +document.getElementById('sp-runs').value,
        balls:   +document.getElementById('sp-balls').value,
        wickets: +document.getElementById('sp-wickets').value
    };
    const res  = await fetch('/score_pred', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const json = await res.json();
    const score = json.predicted_score;
    const pct   = Math.min((score / 250) * 100, 100);
    const color = score >= 180 ? '#22c55e' : score >= 150 ? '#f59e0b' : '#ef4444';
    const desc  = score >= 180 ? 'Excellent score! Above average IPL total — hard to chase.'
                : score >= 150 ? 'Competitive total! Match is well balanced.'
                : 'Below average score — chasers will have an advantage.';
    showResult('sp-result', `
        <div class="progress-wrap"><div class="progress-bar" style="width:${pct}%;background:${color}"></div></div>
        <div class="progress-labels"><span>0</span><span>125</span><span>250+</span></div>
        <div class="big-number" style="color:${color}">${score} runs</div>
        <div class="result-desc">${desc}</div>
    `);
}

// Best XI
async function getBestXI() {
    const res  = await fetch('/best_xi');
    const data = await res.json();
    let html = `<table><tr><th>Player</th><th>Runs</th><th>SR</th><th>Wickets</th><th>Economy</th></tr>`;
    data.forEach((p,i) => {
        html += `<tr><td><strong>#${i+1} ${p.Player}</strong></td><td>${p.Runs||'-'}</td><td>${p.SR ? (+p.SR).toFixed(1) : '-'}</td><td>${p.Wickets||'-'}</td><td>${p.Economy ? (+p.Economy).toFixed(1) : '-'}</td></tr>`;
    });
    html += `</table><div class="result-desc" style="margin-top:12px">AI selected best XI based on overall IPL performance.</div>`;
    showResult('xi-result', html);
}

// Player Performance
async function predictPlayerPerf() {
    const data = {
        runs:       +document.getElementById('pp-runs').value,
        balls:      +document.getElementById('pp-balls').value,
        dismissals: +document.getElementById('pp-dismissals').value,
        sr:         +document.getElementById('pp-sr').value
    };
    const res  = await fetch('/player_perf', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const json = await res.json();
    const avg   = json.predicted_avg;
    const color = avg >= 40 ? '#22c55e' : avg >= 25 ? '#f59e0b' : '#ef4444';
    const desc  = avg >= 40 ? 'Elite performer! World class batting average.'
                : avg >= 25 ? 'Good performer — consistent contributor.'
                : 'Below average — player struggles against this opponent.';
    showResult('pp-result', `
        <div class="big-number" style="color:${color}">${avg}</div>
        <div class="result-desc">Predicted Batting Average — ${desc}</div>
    `);
}

// Toss Recommender
async function predictToss() {
    const data = {
        venue_enc:     +document.getElementById('toss-venue').value,
        bat_first_win: 1
    };
    const res  = await fetch('/toss', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const json = await res.json();
    const rec   = json.recommendation;
    const color = rec === 'Field' ? '#22c55e' : '#f59e0b';
    const desc  = rec === 'Field' ? 'Fielding first is recommended — dew factor and pitch conditions favour chasing.'
                : 'Batting first is recommended — this venue historically favours teams setting a target.';
    showResult('toss-result', `
        <div class="big-number" style="color:${color}">${rec} First</div>
        <div class="result-desc">${desc}</div>
    `);
}

// Auction Value
async function predictAuction() {
    const data = {
        runs:    +document.getElementById('av-runs').value,
        sr:      +document.getElementById('av-sr').value,
        fours:   +document.getElementById('av-fours').value,
        sixes:   +document.getElementById('av-sixes').value,
        wickets: +document.getElementById('av-wickets').value,
        economy: +document.getElementById('av-economy').value
    };
    const res  = await fetch('/auction', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const json = await res.json();
    const val   = json.auction_value;
    const color = val >= 15 ? '#22c55e' : val >= 8 ? '#f59e0b' : '#ef4444';
    const desc  = val >= 15 ? 'Premium player! Expected to attract top bids at auction.'
                : val >= 8  ? 'Quality player — good value pick for franchises.'
                : 'Budget pick — useful role player for a balanced squad.';
    showResult('av-result', `
        <div class="big-number" style="color:${color}">${val} Cr</div>
        <div class="result-desc">${desc}</div>
    `);
}

// Analytics Charts
let batChartInstance, seasonChartInstance, teamChartInstance;

async function loadAnalytics() {
    try {
        const [batData, seasonData, teamData] = await Promise.all([
            fetch('/analytics/top_batsmen').then(r => r.json()),
            fetch('/analytics/season_matches').then(r => r.json()),
            fetch('/analytics/team_wins').then(r => r.json())
        ]);

        if(batChartInstance) batChartInstance.destroy();
        if(seasonChartInstance) seasonChartInstance.destroy();
        if(teamChartInstance) teamChartInstance.destroy();

        batChartInstance = new Chart(document.getElementById('batChart'), {
            type: 'bar',
            data: {
                labels: batData.map(d => d.Batter),
                datasets: [{ label: 'Total Runs', data: batData.map(d => d.Runs),
                    backgroundColor: '#0A2647', borderRadius: 6 }]
            },
            options: { indexAxis:'y', plugins:{ legend:{ display:false } }, responsive:true }
        });

        seasonChartInstance = new Chart(document.getElementById('seasonChart'), {
            type: 'line',
            data: {
                labels: seasonData.map(d => d.Season),
                datasets: [{ label: 'Matches', data: seasonData.map(d => d.Matches),
                    borderColor: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.1)',
                    tension: 0.4, fill: true, pointRadius: 5 }]
            },
            options: { plugins:{ legend:{ display:false } }, responsive:true }
        });

        teamChartInstance = new Chart(document.getElementById('teamChart'), {
            type: 'doughnut',
            data: {
                labels: teamData.map(d => d.Team),
                datasets: [{ data: teamData.map(d => d.Wins),
                    backgroundColor: ['#0A2647','#FF6B35','#1F4E79','#C84B31','#2E86AB','#A23B72','#F18F01','#C73E1D'] }]
            },
            options: { responsive:true, plugins:{ legend:{ position:'right' } } }
        });
    } catch(e) {
        console.error('Analytics error:', e);
    }
}
