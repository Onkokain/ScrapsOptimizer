function calculateTargetProbability(params) {
  const { roll_cost, base_chance_percent, upgrade_cost, upgrade_bonus_percent, target_percent } = params;
  
  const p_base = base_chance_percent / 100;
  const upgrade_bonus = upgrade_bonus_percent / 100;
  const target = target_percent / 100;
  
  if (target <= 0 || target > 1) return null;
  if (p_base >= target) {
    const n = 1;
    return {
      upgrades: 0,
      rolls: n,
      p_k: p_base,
      upgrade_scraps: 0,
      roll_scraps: n * roll_cost,
      total_scraps: n * roll_cost,
      actual_chance: p_base,
      expected_rolls: 1 / p_base,
      expected_roll_scraps: roll_cost / p_base,
      expected_total_scraps: roll_cost / p_base
    };
  }
  
  let best = null;
  const max_k = 50;
  
  for (let k = 0; k <= max_k; k++) {
    const p_k = Math.min(1, p_base + k * upgrade_bonus);
    
    if (p_k >= 1) {
      const n = 1;
      const upgrade_scraps = k * upgrade_cost;
      const roll_scraps = n * roll_cost;
      const total_scraps = upgrade_scraps + roll_scraps;
      
      if (!best || total_scraps < best.total_scraps) {
        best = {
          upgrades: k,
          rolls: n,
          p_k,
          upgrade_scraps,
          roll_scraps,
          total_scraps,
          actual_chance: 1,
          expected_rolls: 1,
          expected_roll_scraps: roll_cost,
          expected_total_scraps: upgrade_scraps + roll_cost
        };
      }
      break;
    }
    
    if (p_k >= target) {
      const n = 1;
      const upgrade_scraps = k * upgrade_cost;
      const roll_scraps = n * roll_cost;
      const total_scraps = upgrade_scraps + roll_scraps;
      
      if (!best || total_scraps < best.total_scraps) {
        best = {
          upgrades: k,
          rolls: n,
          p_k,
          upgrade_scraps,
          roll_scraps,
          total_scraps,
          actual_chance: p_k,
          expected_rolls: 1 / p_k,
          expected_roll_scraps: roll_cost / p_k,
          expected_total_scraps: upgrade_scraps + roll_cost / p_k
        };
      }
      continue;
    }
    
    const n = Math.ceil(Math.log(1 - target) / Math.log(1 - p_k));
    const upgrade_scraps = k * upgrade_cost;
    const roll_scraps = n * roll_cost;
    const total_scraps = upgrade_scraps + roll_scraps;
    const actual_chance = 1 - Math.pow(1 - p_k, n);
    
    if (!best || total_scraps < best.total_scraps) {
      best = {
        upgrades: k,
        rolls: n,
        p_k,
        upgrade_scraps,
        roll_scraps,
        total_scraps,
        actual_chance,
        expected_rolls: 1 / p_k,
        expected_roll_scraps: roll_cost / p_k,
        expected_total_scraps: upgrade_scraps + roll_cost / p_k
      };
    }
  }
  
  return best;
}
