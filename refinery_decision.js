function calculateRefineryDecision(params) {
  const {
    roll_cost,
    base_chance_percent,
    upgrade_cost,
    upgrade_bonus_percent,
    upgrades_owned,
    max_additional_upgrades,
    expected_future_rolls = 0,
    cap_at_100 = true
  } = params;

  const amort_factor = 1 + expected_future_rolls;
  const effective_upgrade_cost = upgrade_cost / amort_factor;
  const max_k = Math.min(max_additional_upgrades, 50);

  const summary_table = [];
  let best_k = 0;
  let best_score = -1;

  for (let k = 0; k <= max_k; k++) {
    const total_upgrades = upgrades_owned + k;
    let chance_percent_k = base_chance_percent + total_upgrades * upgrade_bonus_percent;
    
    if (cap_at_100) {
      chance_percent_k = Math.min(100, chance_percent_k);
    }

    const p_k = chance_percent_k / 100;
    const total_effective_cost_this_roll = roll_cost + k * effective_upgrade_cost;
    const score_k = total_effective_cost_this_roll > 0 ? p_k / total_effective_cost_this_roll : 0;

    summary_table.push({
      k,
      chance_percent: parseFloat(chance_percent_k.toFixed(8)),
      p_k: parseFloat(p_k.toFixed(8)),
      effective_upgrade_cost: parseFloat(effective_upgrade_cost.toFixed(8)),
      total_effective_cost_this_roll: parseFloat(total_effective_cost_this_roll.toFixed(8)),
      score: parseFloat(score_k.toFixed(8))
    });

    if (score_k > best_score) {
      best_score = score_k;
      best_k = k;
    }
  }

  const best_entry = summary_table[best_k];
  
  return {
    decision: {
      buy_upgrades: best_k,
      reason: best_k === 0 
        ? "No upgrades needed - base efficiency is optimal"
        : `Buying ${best_k} upgrade${best_k > 1 ? 's' : ''} maximizes success-per-scrap`,
      score: best_entry.score,
      p_after_upgrades_percent: best_entry.chance_percent,
      effective_cost_this_roll: best_entry.total_effective_cost_this_roll
    },
    summary_table
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateRefineryDecision };
}
