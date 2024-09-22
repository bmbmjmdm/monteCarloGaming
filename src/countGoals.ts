// @ts-nocheck
import { goals } from './goals.js';

const makeEntityMap = () => (
  {
    Dragons: 0,
    Dwarves: 0,
    Wizards: 0,
    Trees: 0,
    Animals: 0,
    Priests: 0,
    Philosophers: 0,
    Scientists: 0,
    Sky: 0,
    Water: 0,
    Fire: 0,
    Earth: 0,
    Druids: 0,
  }
);

// inPlus and inMinus are how many times this entity has appeared in plus and in minus across all goals
// plus is how many times this entity has appeared with another entity in plus
// minus is how many times this entity has appeared with another entity in minus
// opposite is how many times this entity has appeared with another entity on opposite sides of plus and minus
const goalTracker = {};
for (const entity of Object.keys(makeEntityMap())) {
  goalTracker[entity] = {
    inPlus: 0,
    inMinus: 0,
    plus: makeEntityMap(),
    minus: makeEntityMap(),
    opposite: makeEntityMap(),
  }
}

const processGoal = (goal) => {
  for (const plus of goal.plus) {
    goalTracker[plus].inPlus++;
    for (const otherPlus of goal.plus) {
      if (plus !== otherPlus) {
        goalTracker[plus].plus[otherPlus] += 1;
      }
    }
    for (const minus of goal.minus) {
      goalTracker[plus].opposite[minus] += 1;
    }
  }
  for (const minus of goal.minus) {
    goalTracker[minus].inMinus++;
    for (const otherMinus of goal.minus) {
      if (minus !== otherMinus) {
        goalTracker[minus].minus[otherMinus] += 1;
      }
    }
    for (const plus of goal.plus) {
      goalTracker[minus].opposite[plus] += 1;
    }
  }
}

for (const goal of goals) {
  processGoal(goal);
}

// to see a list of entity synergies and anti-synergies across goals, uncomment below

for (const entity in goalTracker) {
  console.log("===============================")
  console.log(entity)
  const entityGoals = goalTracker[entity];
  console.log("Total: " + (entityGoals.inPlus + entityGoals.inMinus));
  console.log("In Plus: " + entityGoals.inPlus);
  console.log("In Minus: " + entityGoals.inMinus);
  const highestPlus = Object.entries(entityGoals.plus).filter((entry) => entry[0] != entity).sort((a, b) => b[1] - a[1])[0];
  const lowestPlus = Object.entries(entityGoals.plus).filter((entry) => entry[0] != entity).sort((a, b) => a[1] - b[1])[0];
  console.log("Most Plus: " + highestPlus[0] + " = " + highestPlus[1]);
  console.log("Least Plus: " + lowestPlus[0] + " = " + lowestPlus[1]);
  const highestMinus = Object.entries(entityGoals.minus).filter((entry) => entry[0] != entity).sort((a, b) => b[1] - a[1])[0];
  const lowestMinus = Object.entries(entityGoals.minus).filter((entry) => entry[0] != entity).sort((a, b) => a[1] - b[1])[0];
  console.log("Most Minus: " + highestMinus[0] + " = " + highestMinus[1]);
  console.log("Least Minus: " + lowestMinus[0] + " = " + lowestMinus[1]);
  const highestOpposite = Object.entries(entityGoals.opposite).filter((entry) => entry[0] != entity).sort((a, b) => b[1] - a[1])[0];
  const lowestOpposite = Object.entries(entityGoals.opposite).filter((entry) => entry[0] != entity).sort((a, b) => a[1] - b[1])[0];
  console.log("Most Opposite: " + highestOpposite[0] + " = " + highestOpposite[1]);
  console.log("Least Opposite: " + lowestOpposite[0] + " = " + lowestOpposite[1]);
}

/*
const constraintTracker ={}

const updateConstraints = () => {
  for (const entity in goalTracker) {
    constraintTracker[entity] = {
      mostPlus: Object.entries(goalTracker[entity].plus).filter((entry) => entry[0] != entity).sort((a, b) => b[1] - a[1]).slice(0, 2),
      leastPlus: Object.entries(goalTracker[entity].plus).filter((entry) => entry[0] != entity).sort((a, b) => a[1] - b[1])[0],
      mostMinus: Object.entries(goalTracker[entity].minus).filter((entry) => entry[0] != entity).sort((a, b) => b[1] - a[1]).slice(0, 2),
      leastMinus: Object.entries(goalTracker[entity].minus).filter((entry) => entry[0] != entity).sort((a, b) => a[1] - b[1])[0],
      mostOpposite: Object.entries(goalTracker[entity].opposite).filter((entry) => entry[0] != entity).sort((a, b) => b[1] - a[1]).slice(0, 2),
      leastOpposite: Object.entries(goalTracker[entity].opposite).filter((entry) => entry[0] != entity).sort((a, b) => a[1] - b[1])[0],
    }
  }
}

// this will create 10 new goals that try to balance the goals based on entity over and under representation with each other via the logging above
// it will also update the constraints as it goes to ensure the new goals are considered for representation

let createdGoals = 0;
while (createdGoals < 30) {
  let plus
  let minus
  // include our newly created goals in the constraints
  updateConstraints()

  while (true) {
    plus = []
    minus = []

    // first find a random entity from the bottom 3 most represented entities
    // NOTE THIS COULD CAUSE AN INFINITE LOOP. If it does, rerun program. If it's consistent, change the 3s to 13s. If it still hangs then its impossible to make more goals that satisfy the "pair random entity with its least opposite and least plus/minus" initiative
    const isPlus = Math.random() < 0.5;
    let randomEntity;
    if (isPlus) {
      randomEntity = Object.entries(goalTracker).sort((a, b) => a[1].inPlus - b[1].inPlus).slice(0, 3)[Math.floor(Math.random() * 3)][0]
    } else {
      randomEntity = Object.entries(goalTracker).sort((a, b) => a[1].inMinus - b[1].inMinus).slice(0, 3)[Math.floor(Math.random() * 3)][0]
    }

    // then randomly add it to minus or plus 
    let ally;
    let enemy;
    if (isPlus) {
      plus.push(randomEntity)
      // then add its least represented plus entity with it 
      ally = constraintTracker[randomEntity].leastPlus[0]
      plus.push(ally)
      // then add its least opposite entity to the minus
      enemy = constraintTracker[randomEntity].leastOpposite[0]
      minus.push(enemy)
    } else {
      minus.push(randomEntity)
      // then add its least represented minus entity with it
      ally = constraintTracker[randomEntity].leastMinus[0]
      minus.push(ally)
      // then add its least opposite entity to the plus
      enemy = constraintTracker[randomEntity].leastOpposite[0]
      plus.push(enemy)
    }

    // then add 2 more random entities to plus or minus
    for (let i = 0; i < 2; i++) {
      let randomEntity2;
      do {
        randomEntity2 = Object.keys(goalTracker)[Math.floor(Math.random() * 13)]
      } while (plus.includes(randomEntity2) || minus.includes(randomEntity2))
      if (Math.random() < 0.5) {
        plus.push(randomEntity2)
      } else {
        minus.push(randomEntity2)
      }
    }

    // if constraints have been broken, restart
    let violation = false;
    for (const entity of plus) {
      const constraints = constraintTracker[entity]
      for (let i = 0; i < 2; i++) {
        if (plus.includes(constraints.mostPlus[i][0])) violation = true
        if (minus.includes(constraints.mostOpposite[i][0])) violation = true
      }
    }
    for (const entity of minus) {
      const constraints = constraintTracker[entity]
      for (let i = 0; i < 2; i++) {
        if (minus.includes(constraints.mostMinus[i][0])) violation = true
        if (plus.includes(constraints.mostOpposite[i][0])) violation = true
      }
    }
    // check to make sure each entity is only represented once
    let allEntities = plus.concat(minus)
    let uniqueEntities = [...new Set(allEntities)]
    if (allEntities.length !== uniqueEntities.length)  violation = true

    if (violation) continue

    // otherwise we're good, break out of the loop
    break
  }

  // parse our new goal so we can add it to constraints during next loop
  processGoal({name: "Custom Goal", plus, minus})
  createdGoals++
  console.log("===================================")
  console.log(plus.join(", "))
  console.log(minus.join(", "))
}*/