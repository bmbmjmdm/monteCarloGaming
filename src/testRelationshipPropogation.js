// days is the number of times to run the experiment, higher is slower but more accurate
const days = 1000;
// these are the number of events drawn. 15 = 10 * 1.5
// events are assumed to affect 2-3 entities each
const events = 15;
let totalSumAffected = 0;
let allDaysSums = [];

for (let i = 0; i < days; i++) {
  let totalAffected = 0;
  let daysSums = [];

  function propogateToAllies(entity, visited) {
    if (visited.includes(entity)) {
      return;
    }
    visited.push(entity);
    totalAffected++;
    for (const [ally, enemy] of entities[entity]) {
      propogateToAllies(ally, visited);
    }
  }
  
  function propogateToEnemies(entity, visited) {
    if (visited.includes(entity)) {
      return;
    }
    visited.push(entity);
    totalAffected++;
    for (const [ally, enemy] of entities[entity]) {
      propogateToEnemies(enemy, visited);
    }
  }

  const entities = [];
  for(let i = 0; i < 13; i++) {
    entities.push([])
  }

  //each entity is an array of [ally, enemy] pairs. each ally is a number from 0 to 12, each enemy is a number from 0 to 12
  // when spoken about in code, an entity is usually the index of itself in the entities array

  for (let i = 0; i < events; i++) {
    let eventSum = 0;
    let lastEffected = totalAffected
    // generate 3 random affected entities
    const affectedEntity1 = Math.floor(Math.random() * 13);
    let affectedEntity2 = Math.floor(Math.random() * 13);
    while (affectedEntity1 === affectedEntity2) {
      affectedEntity2 = Math.floor(Math.random() * 13);
    }
    let affectedEntity3 = Math.floor(Math.random() * 13);
    while (affectedEntity1 === affectedEntity3 || affectedEntity2 === affectedEntity3) {
      affectedEntity3 = Math.floor(Math.random() * 13);
    }
    const allAffectedEntities = [affectedEntity1, affectedEntity2];
    if (Math.random() < 0.5) {
      allAffectedEntities.push(affectedEntity3);
    }

    // for each one, decide if it propogates to allies or enemies
    for (const affected of allAffectedEntities) {
      if (Math.random() < 0.5) {
        propogateToAllies(affected, []);
      }
      else {
        propogateToEnemies(affected, []);
      }
    }

    // attach this card to an random entity now with random allies and random enemies
    const attachTo = Math.floor(Math.random() * 13);
    let ally = Math.floor(Math.random() * 13);
    while (attachTo === ally) {
      ally = Math.floor(Math.random() * 13);
    }
    let enemy = Math.floor(Math.random() * 13);
    while (enemy === ally || enemy === attachTo) {
      enemy = Math.floor(Math.random() * 13);
    }
    entities[attachTo].push([ally, enemy]);

    eventSum = totalAffected - lastEffected - allAffectedEntities.length
    daysSums.push(eventSum)
  }

  allDaysSums.push(daysSums)
  totalSumAffected += totalAffected;
}

console.log("Average affected entities per day: ", totalSumAffected / days);
console.log("Average propogation each day: ")
for (let i = 0; i < events; i++) {
  let todayTotal = 0;
  for (let j = 0; j < days; j++) {
    todayTotal += allDaysSums[j][i]
  }
  console.log(todayTotal / days)
}