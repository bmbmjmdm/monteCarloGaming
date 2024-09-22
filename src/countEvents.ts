// @ts-nocheck
import { events } from './events.js';

const entityTracker = {};
const makeEntityMap = () => (
  {
    Dragons: {total: 0, absolute: 0},
    Dwarves: {total: 0, absolute: 0},
    Wizards: {total: 0, absolute: 0},
    Trees: {total: 0, absolute: 0},
    Animals: {total: 0, absolute: 0},
    Priests: {total: 0, absolute: 0},
    Philosophers: {total: 0, absolute: 0},
    Scientists: {total: 0, absolute: 0},
    Sky: {total: 0, absolute: 0},
    Water: {total: 0, absolute: 0},
    Fire: {total: 0, absolute: 0},
    Earth: {total: 0, absolute: 0},
    Druids: {total: 0, absolute: 0},
  }
);

// keep track of how many times each entity appears in plus, minus, attachTo, ally, and enemy across all events/effects
const processEffectArray = (array, type, factor = 1) => {
  array.forEach((entity) => {
    // if theres an array within minus or plus (there wont be one within the others), we have to choose 1 of the entities to apply the effect to, not all of them. because we're simulating the effects of that, we do so by assuming itll hit each entity 1/length times
    if (Array.isArray(entity)) {
      entity.forEach((subEntity) => {
        if (!entityTracker[subEntity]) {
          entityTracker[subEntity] = { plus: 0, minus: 0, ally: 0, enemy: 0, attachTo:0, map: makeEntityMap() };
        }
        entityTracker[subEntity][type] += (1/entity.length) * factor;
      });
    } else {
      if (!entityTracker[entity]) {
        entityTracker[entity] = { plus: 0, minus: 0, ally: 0, enemy: 0, attachTo: 0, map: makeEntityMap() };
      }
      // AttachTo, ally, and enemy only allow a single entity to be chosen, so we need to divide by array length
      let thereCanOnlyBeOne = 1
      if (type === "attachTo" || type === "ally" || type === "enemy") {
        thereCanOnlyBeOne = 1/array.length
      }
      entityTracker[entity][type] += thereCanOnlyBeOne * factor;
    }
  });
};

// keep track of how many times each entity appears alongside or on opposing sides of effects for each other entity
// alongside = both are in plus or both are in minus
// opposing = one is in plus and the other is in minus
// alongside = one is in attachTo and the other is in ally (dont double count from previous alongside)
// opposing = one is in attachTo and the other is in enemy (dont double count from previous opposing)
const processSynergies = (effect, factor) => {
  const positiveEntities = new Set();
  const negativeEntities = new Set();
  const recordedAlongside = new Set();
  const recordedOpposed = new Set();
  // we have to deconstruct any sub arrays within plus and minus 
  for (const entity of effect.plus) {
    if (Array.isArray(entity)) {
      entity.forEach((subEntity) => {
        positiveEntities.add([subEntity, factor/entity.length]);
      });
    } else {
      positiveEntities.add([entity, factor]);
    }
  }
  for (const entity of effect.minus) {
    if (Array.isArray(entity)) {
      entity.forEach((subEntity) => {
        negativeEntities.add([subEntity, factor/entity.length]);
      });
    } else {
      negativeEntities.add([entity, factor]);
    }
  }

  // count up synergies for positive entities in plus/minus
  for (const [positiveEntity, entFactor] of positiveEntities) {
    // alongside synergies
    for (const [otherPositiveEntity, oEntFactor] of positiveEntities) {
      const trueFactor = Math.min(entFactor, oEntFactor);
      if (positiveEntity === otherPositiveEntity) continue;
      else {
        entityTracker[positiveEntity].map[otherPositiveEntity].total += trueFactor;
        entityTracker[positiveEntity].map[otherPositiveEntity].absolute += trueFactor;
        // its ok that this is order-dependent because we're gonna track the opposite order in a later loop
        recordedAlongside.add(`${positiveEntity}-${otherPositiveEntity}`);
      }
    }
    // opposing synergies
    for (const [negativeEntity, oEntFactor] of negativeEntities) {
      const trueFactor = Math.min(entFactor, oEntFactor);
      if (positiveEntity === negativeEntity) continue;
      else {
        entityTracker[positiveEntity].map[negativeEntity].total -= trueFactor;
        entityTracker[positiveEntity].map[negativeEntity].absolute += trueFactor;
        // its ok that this is order-dependent because we're gonna track the opposite order in a later loop
        recordedOpposed.add(`${positiveEntity}-${negativeEntity}`);
      }
    }
  }

  // count up synergies for negative entities in plus/minus
  for (const [negativeEntity, entFactor] of negativeEntities) {
    // alongside synergies
    for (const [otherNegativeEntity, oEntFactor] of negativeEntities) {
      const trueFactor = Math.min(entFactor, oEntFactor);
      if (negativeEntity === otherNegativeEntity) continue;
      else {
        entityTracker[negativeEntity].map[otherNegativeEntity].total += trueFactor;
        entityTracker[negativeEntity].map[otherNegativeEntity].absolute += trueFactor;
        // its ok that this is order-dependent because we're gonna track the opposite order in a later loop
        recordedAlongside.add(`${negativeEntity}-${otherNegativeEntity}`);
      }
    }
    // opposing synergies
    for (const [positiveEntity, oEntFactor] of positiveEntities) {
      const trueFactor = Math.min(entFactor, oEntFactor);
      if (negativeEntity === positiveEntity) continue;
      else {
        entityTracker[negativeEntity].map[positiveEntity].total -= trueFactor;
        entityTracker[negativeEntity].map[positiveEntity].absolute += trueFactor;
        // its ok that this is order-dependent because we're gonna track the opposite order in a later loop
        recordedOpposed.add(`${negativeEntity}-${positiveEntity}`);
      }
    }
  }

  // count up synergies for positive entities in attachTo/ally
  for (const entity of effect.attachTo) {
    for (const ally of effect.ally) {
      // since we only choose 1 ally and 1 attach to, we have to divide by the array length
      // we give 1 increment of leway to account for when the same entity(s) appears in both arrays
      const trueFactor = factor / Math.max(1, (effect.attachTo.length - 1 + effect.ally.length - 1));
      if (entity === ally) continue;
      if (recordedAlongside.has(`${entity}-${ally}`) || recordedAlongside.has(`${ally}-${entity}`)) continue;
      else {
        entityTracker[entity].map[ally].total += trueFactor;
        entityTracker[entity].map[ally].absolute += trueFactor;
        entityTracker[ally].map[entity].total += trueFactor;
        entityTracker[ally].map[entity].absolute += trueFactor;
      }
    }
    for (const enemy of effect.enemy) {
      // since we only choose 1 enemy and 1 attach to, we have to divide by the array length
      // we give 1 increment of leway to account for when the same entity(s) appears in both arrays
      const trueFactor = factor / Math.max(1, (effect.attachTo.length - 1 + effect.enemy.length - 1));
      if (entity === enemy) continue;
      if (recordedOpposed.has(`${entity}-${enemy}`) || recordedOpposed.has(`${enemy}-${entity}`)) continue;
      else {
        entityTracker[entity].map[enemy].total -= trueFactor;
        entityTracker[entity].map[enemy].absolute += trueFactor;
        entityTracker[enemy].map[entity].total -= trueFactor;
        entityTracker[enemy].map[entity].absolute += trueFactor;
      }
    }
  }
}

events.forEach((event) => {
  // resolve all effects
  let rollingFactor = 1;
  for (const effect of event.effects) {
    // if a conditional effect fails, it gets skipped
    // if a conditional effect passes, no more effects are checked
    // we can assume a condition has a 50% chance of succeeding
    // because of that, theres a 50% chance of the current effect happening as well as a 50% chance of the next (and all future) effects happening
    if (effect.condition) rollingFactor = rollingFactor / 2
    processEffectArray(effect.plus, 'plus', rollingFactor);
    processEffectArray(effect.minus, 'minus', rollingFactor);
    processEffectArray(effect.ally, 'ally', rollingFactor);
    processEffectArray(effect.enemy, 'enemy', rollingFactor);
    processEffectArray(effect.attachTo, 'attachTo', rollingFactor);
    processSynergies(effect, rollingFactor);
  }
});

console.log("=============================")

const getTotalScore = (entity) => {
  const entityData = entityTracker[entity];
  return entityData.plus - entityData.minus + entityData.ally - entityData.enemy;
}
function roundToPointFive(num) {
  return Math.round(num*2)/2;
}
function roundToPointTen(num) {
  return Math.round(num*10)/10;
}

function removeKey (keys, key) {
  return keys.filter((k) => k !== key);
}

// sort the entities by lowest to highest total score and print stats for each
Object.keys(entityTracker).sort((a,b) => getTotalScore(a) - getTotalScore(b)).forEach((entity) => {
  const entityData = entityTracker[entity];
  const totalScore = getTotalScore(entity);
  const bestSynergy = Object.keys(entityData.map).sort((a,b) => entityData.map[a].total - entityData.map[b].total).reverse()[0];
  const worstSynergy = Object.keys(entityData.map).sort((a,b) => entityData.map[a].total - entityData.map[b].total)[0];
  const mostSynergy = Object.keys(entityData.map).sort((a,b) => entityData.map[a].absolute - entityData.map[b].absolute).reverse()[0];
  const leastSynergy = removeKey(Object.keys(entityData.map), entity).sort((a,b) => entityData.map[a].absolute - entityData.map[b].absolute)[0];
  console.log("=============================")
  console.log(`${entity}:
  Plus: ${roundToPointTen(entityData.plus)}
  Minus: ${roundToPointTen(entityData.minus)}
  Ally: ${roundToPointTen(entityData.ally)}
  Enemy: ${roundToPointTen(entityData.enemy)}
  BestSynergy: ${bestSynergy} = ${roundToPointTen(entityData.map[bestSynergy].total)}
  WorstSynergy: ${worstSynergy} = ${roundToPointTen(entityData.map[worstSynergy].total)}
  MostSynergy: ${mostSynergy} = ${roundToPointTen(entityData.map[mostSynergy].absolute)}
  LeastSynergy: ${leastSynergy} = ${roundToPointTen(entityData.map[leastSynergy].absolute)}
  AttachTo: ${roundToPointTen(entityData.attachTo)}
  Total Score: ${roundToPointTen(totalScore)}`);
});

// print the average attachTo score
const totalAttachTo = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].attachTo, 0);
console.log("==")
console.log("==")
console.log("==")
console.log("==")
console.log("==")
console.log("==")
console.log("=============================")
console.log(`Average AttachTo: ${roundToPointTen(totalAttachTo / Object.keys(entityTracker).length)}`)

// print average plus 
const totalPlus = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].plus, 0);
console.log("=============================")
console.log(`Average Plus: ${roundToPointTen(totalPlus / Object.keys(entityTracker).length)}`)

// print average minus
const totalMinus = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].minus, 0);
console.log("=============================")
console.log(`Average Minus: ${roundToPointTen(totalMinus / Object.keys(entityTracker).length)}`)

// print average ally
const totalAlly = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].ally, 0);
console.log("=============================")
console.log(`Average Ally: ${roundToPointTen(totalAlly / Object.keys(entityTracker).length)}`)

// print average enemy
const totalEnemy = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].enemy, 0);
console.log("=============================")
console.log(`Average Enemy: ${roundToPointTen(totalEnemy / Object.keys(entityTracker).length)}`)

// print average totalSynergy
const totalSynergy = Object.values(entityTracker).reduce((acc, entity) => acc + (Object.values(entity.map).reduce((acc2, entity2) => acc2 + entity2.total, 0)/12), 0);
console.log("=============================")
console.log(`Average Total Synergy: ${roundToPointTen(totalSynergy / Object.keys(entityTracker).length)}`)

// print average absoluteSynergy
const absoluteSynergy = Object.values(entityTracker).reduce((acc, entity) => acc + (Object.values(entity.map).reduce((acc2, entity2) => acc2 + entity2.absolute, 0)/12), 0)
console.log("=============================")
console.log(`Average Absolute Synergy: ${roundToPointTen(absoluteSynergy / Object.keys(entityTracker).length)}`)