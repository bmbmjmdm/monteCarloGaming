const events = // enter deck here

const entityTracker = {};

const processEffectArray = (array, type, factor) => {
  array.forEach((entity) => {
    if (Array.isArray(entity)) {
      entity.forEach((subEntity) => {
        if (!entityTracker[subEntity]) {
          entityTracker[subEntity] = { plus: 0, minus: 0, ally: 0, enemy: 0, attachTo:0 };
        }
        entityTracker[subEntity][type] += (1/entity.length) * factor;
      });
    } else {
      if (!entityTracker[entity]) {
        entityTracker[entity] = { plus: 0, minus: 0, ally: 0, enemy: 0, attachTo: 0 };
      }
      entityTracker[entity][type] += factor;
    }
  });
};

let totalMultiEffects = 0

events.forEach((event) => {
  if (event.effects.length > 1) totalMultiEffects++;
  event.effects.forEach((effect) => {
    const factor = 1/event.effects.length
    processEffectArray(effect.plus, 'plus', factor);
    processEffectArray(effect.minus, 'minus', factor);
    processEffectArray(effect.ally, 'ally', factor);
    processEffectArray(effect.enemy, 'enemy', factor);
    processEffectArray(effect.attachTo, 'attachTo', factor);
  });
});

console.log("=============================")
console.log("Total multi effects: ", totalMultiEffects);

const getTotalScore = (entity) => {
  const entityData = entityTracker[entity];
  return entityData.plus - entityData.minus + entityData.ally - entityData.enemy;
}
function roundToPointFive(num) {
  return Math.round(num*2)/2;
}

Object.keys(entityTracker).sort((a,b) => getTotalScore(a) - getTotalScore(b)).forEach((entity) => {
  const entityData = entityTracker[entity];
  const totalScore = getTotalScore(entity)
  console.log("=============================")
  console.log(`${entity}:
  Plus: ${roundToPointFive(entityData.plus)}
  Minus: ${roundToPointFive(entityData.minus)}
  Ally: ${roundToPointFive(entityData.ally)}
  Enemy: ${roundToPointFive(entityData.enemy)}
  AttachTo: ${roundToPointFive(entityData.attachTo)}
  Total Score: ${roundToPointFive(totalScore)}`);
});