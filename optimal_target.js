function findOptimalTargetProbability(params) {
  const { roll_cost, base_chance_percent, upgrade_cost, upgrade_bonus_percent } = params;
  
  const minTarget = base_chance_percent;
  const maxChance = Math.min(100, base_chance_percent + 50 * upgrade_bonus_percent);
  
  let bestTarget = minTarget;
  let bestExpectedScraps = Infinity;
  
  for (let target = minTarget; target <= maxChance; target++) {
    const result = calculateTargetProbability({
      roll_cost,
      base_chance_percent,
      upgrade_cost,
      upgrade_bonus_percent,
      target_percent: target
    });
    
    if (result && result.expected_total_scraps < bestExpectedScraps) {
      bestExpectedScraps = result.expected_total_scraps;
      bestTarget = target;
    }
  }
  
  return bestTarget;
}
