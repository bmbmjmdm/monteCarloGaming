import { Worker, isMainThread, parentPort } from 'worker_threads';
import os from 'os';
import { BoardHistoryType, Entity, game, GoalHistoryType } from './game';

if (isMainThread) {
  const numCPUs = os.cpus().length;
  const numWorkers = numCPUs;
  let resultsGoals:GoalHistoryType[] = [];
  let resultsBoards:BoardHistoryType[] = [];
  let completedWorkers = 0;

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('./dist/gameParallel.js');

    worker.on('message', (message) => {
      console.log("Worker " + i + " completed");
      resultsGoals = resultsGoals.concat(message.goalHistory);
      resultsBoards = resultsBoards.concat(message.boardHistory);
      completedWorkers++;

      if (completedWorkers === numWorkers) {
        gatherResults(resultsGoals, resultsBoards)
      }
    });

    worker.on('error', (err) => {
      console.error(`Worker ${i} error:`, err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker ${i} stopped with exit code ${code}`);
      }
    });
  }
} else {
  parentPort?.postMessage(game());
}



function allGoalHistoriesInOne (goalHistoryArr: GoalHistoryType[]):GoalHistoryType {
  // combine all goal histories into one goalHistory object
  return goalHistoryArr.reduce((acc, curHistory) => {
    for (const goal of Object.values(curHistory)) {
      if (!acc[goal.name]) { // if goal doesn't exist yet, add it
        acc[goal.name] = goal;
      } else { // if goal already exists, add the points and played games to the existing goal
        acc[goal.name].points += goal.points;
        acc[goal.name].played += goal.played;
        // go through the events and add the points and played games to the existing events
        for (const event of Object.values(goal.events)) {
          if (!acc[goal.name].events[event.name]) { // if event doesn't exist yet, add it
            acc[goal.name].events[event.name] = event;
          } else { // if event already exists, add the points and played games to the existing event
            acc[goal.name].events[event.name].seenPassed += event.seenPassed;
            acc[goal.name].events[event.name].scoreFromGamesWhenPassed += event.scoreFromGamesWhenPassed;
          }
        }
      }
    }
    return acc;
  }, {} as GoalHistoryType);
}

function allBoardHistoriesInOne (boardHistoryArr:BoardHistoryType[]):BoardHistoryType {
  // combine all board history into one object
  return boardHistoryArr.reduce((acc, curHistory) => {
    for(const entity of Object.keys(curHistory) as Entity[]) {
      if (!acc[entity]) {
        acc[entity] = {
          points: 0,
          games: 0,
          absolutePoint: 0,
        }
      }
      const currenPoints = curHistory[entity].points
      const currentAbsolutePoint = curHistory[entity].absolutePoint
      const currentGames = curHistory[entity].games
      const accumulatedEntity = acc[entity]
      accumulatedEntity.points += currenPoints
      accumulatedEntity.games += currentGames
      accumulatedEntity.absolutePoint += currentAbsolutePoint
    }
  return acc;
}, {} as BoardHistoryType);
}

function printBoardEntitiesAvgScores(boardHistory:BoardHistoryType) { 
  const entityKeys = Object.keys(boardHistory) as Entity[]
  const entities = entityKeys.map(entity => ({name: entity, ...boardHistory[entity]})).sort((a, b) => (b.points/b.games) - (a.points/a.games))
  for (const entity of entities) {
    console.log(`${entity.name} has an average score/absoluteScore of \n${entity.points/entity.games}\n${entity.absolutePoint/entity.games}`)
  }
}

function gatherResults(goalHistoryArr: GoalHistoryType[], boardHistoryArr:BoardHistoryType[]) {
  const goalHistory = allGoalHistoriesInOne(goalHistoryArr);
  const boardHistory = allBoardHistoriesInOne(boardHistoryArr);

  printBoardEntitiesAvgScores(boardHistory)


  const eventNames = new Set<string>();
  // go through goalHistory and add the average score for each goal and event
  for (const goal of Object.values(goalHistory)) {
    goal.average = goal.points / goal.played;
    for (const event of Object.values(goal.events)) {
      event.average = event.scoreFromGamesWhenPassed / event.seenPassed;
      eventNames.add(event.name);
    }
  }
  
  // now go through and make an object where the keys are event names and the values are how many times that event appears in the top events for each goal
  const topEvents: Record<string, {positiveGoals: Record<string, number>, negativeGoals: Record<string, number>, positiveSignificance: number, negativeSignificance: number}> = {};
  for (const eventName of eventNames) {
    topEvents[eventName] = {
      positiveGoals: {},
      negativeGoals: {},
      positiveSignificance: 0,
      negativeSignificance: 0
    };
  }

  // for each goal, go through the events and add the significance of the event to the topEvents object
  // significance is how much an event impacts a goal's score.
  // positive significance is how much the event helps the goal
  // negative significance is how much the event hurts the goal
  // positiveGoals and negativeGoals keep track of how much this goal is helped/hurt by each event
  for (const goal of Object.values(goalHistory)) {
    const sortedEvents = Object.values(goal.events).sort((a, b) => b.average! - a.average!);
    const [maxEvent, minEvent] = sortedEvents.reduce((acc, event) => [Math.max(acc[0], event.average!), Math.min(acc[1], event.average!)], [-Infinity, Infinity]);
    const range = maxEvent - minEvent;

    for (const event of sortedEvents) {
      const scaledValue = (event.average! - goal.average!) / (range / 2);
      const significance = Math.tanh(scaledValue);
      if (significance > 0) {
        topEvents[event.name].positiveGoals[goal.name] = significance;
        topEvents[event.name].positiveSignificance += significance;
      } else {
        topEvents[event.name].negativeGoals[goal.name] = significance;
        topEvents[event.name].negativeSignificance += significance;
      }
    }
  }

  const topEventsArray = Object.entries(topEvents).sort((a, b) => (b[1].positiveSignificance + b[1].negativeSignificance) - (a[1].positiveSignificance + a[1].negativeSignificance));
  for (const event of topEventsArray) {
    const [eventName, {positiveGoals, negativeGoals, positiveSignificance, negativeSignificance}] = event;
    const lines =[
      eventName,
      "{",
      "positiveGoals = " + Object.entries(positiveGoals).join(', '),
      "negativeGoals = " + Object.entries(negativeGoals).join(', '),
      "positiveSignificance = " + positiveSignificance,
      "negativeSignificance = " + negativeSignificance,
      "}"
    ].join("\n");
    console.log(lines);
  }

  // Initialize goal relationships
  for (const goal of Object.values(goalHistory)) {
    goal.relationships = {};
    for (const otherGoal of Object.values(goalHistory)) {
      if (goal.name !== otherGoal.name) {
        goal.relationships[otherGoal.name] = { positiveTogether: 0, negativeTogether: 0 };
      }
    }
  }

  // Update goal relationships:
  // Each goal sees how much they want to team up with another goal for each event
  // aka if we both want this event to happen, how important is it for me? therefore, I can update how much this shared interest strengthens our relationship
  // this works in the negative direction too; how much does this shared event hurt us both?
  for (const event of topEventsArray) {
    const [eventName, {positiveGoals, negativeGoals}] = event;
    for (const posGoal in positiveGoals) {
      for (const otherGoal in positiveGoals) {
        if (posGoal !== otherGoal) {
          goalHistory[posGoal].relationships![otherGoal].positiveTogether += positiveGoals[posGoal];
        }
      }
    }
    for (const negGoal in negativeGoals) {
      for (const otherGoal in negativeGoals) {
        if (negGoal !== otherGoal) {
          goalHistory[negGoal].relationships![otherGoal].negativeTogether  += negativeGoals[negGoal];
        }
      }
    }
  }

  // Print the average score and relationships for each goal
  const orderedGoals = Object.values(goalHistory).sort((a, b) => b.average! - a.average!);
  for (const goal of orderedGoals) {
    console.log(goal.name, goal.average);
    console.log("Relationships:");
    for (const [otherGoal, {positiveTogether, negativeTogether}] of Object.entries(goal.relationships!)) {
      console.log(`  ${otherGoal}: { positiveTogether: ${positiveTogether}, negativeTogether: ${negativeTogether} }`);
    }
  }
}

/*
==========BALANCING GOALS

so in an ideal world:
- each event has positiveGoals === negativeGoals
- each event has positiveSignificance === negativeSignificance
- each event has similar, but doesn't need to be equal, positiveSignificance
- each event has similar, but doesn't need to be equal, negativeSignificance
- each goal has the same or similar number for positiveTogether and negativeTogether for each other goal
- each goal has close to 0 for average score, with an average absolute of 10 or something (whatever I think a good average score to be)
- optional: each entity has an average score of 0 and an average absolute of 2.5

=========Balancing notes

a very high positiveTogether and/or very low negativeTogether mean that goals are allies
the closer to 0 these are the closer those goals are enemies
positive/negative doesnt matter here, just how far it is from 0

a very high positiveSignificance indicates what? 
that these events are aiding their supported goals more than others
vice versa for negative

THIS DOES A GREAT JOB BALANCING:
https://chatgpt.com/c/b36dce43-c6ba-4092-a06f-5b9291a097fb

Run countEntities with node countEntities.js after pasting a copy of the event deck into it.
This will chow how many times each entity appears in event effects
We can probably update that file to also be used with a goal deck and show how many times each entity appears in goal requirements
*/


/*
first change events to be balanced for entitites
then change goals to be balanced for entities
then change events to be balanced for entity-pairs
then change goals to be balanced for entity-pairs

Then repeat as needed
*/

/*
use countEntities to see what events need to be changed (add/remove entity +, -, allies, enemies)
150ish + effects
150ish - effects
50+ allies
50+ enemies
with 13 entities, that means each entity should average out to:
10 +
10 -
5 allies
5 enemies
=============================
Scientists:
  Plus: 12
  Minus: 12
  Ally: 2.5
  Enemy: 9
  AttachTo: 10
  Total Score: -6.5
=============================
Earth:
  Plus: 4
  Minus: 8.5
  Ally: 4.5
  Enemy: 3
  AttachTo: 12.5
  Total Score: -5
=============================
Dwarves:
  Plus: 8.5
  Minus: 7.5
  Ally: 1
  Enemy: 6
  AttachTo: 9
  Total Score: -3.5
=============================
Priests:
  Plus: 13
  Minus: 10
  Ally: 5
  Enemy: 8.5
  AttachTo: 11.5
  Total Score: -1.5
=============================
Dragons:
  Plus: 9.5
  Minus: 5
  Ally: 3
  Enemy: 8.5
  AttachTo: 5
  Total Score: -0.5
=============================
Druids:
  Plus: 10
  Minus: 7.5
  Ally: 2
  Enemy: 4
  AttachTo: 13
  Total Score: -0.5
=============================
Trees:
  Plus: 10.5
  Minus: 11
  Ally: 3.5
  Enemy: 1
  AttachTo: 10.5
  Total Score: 2
=============================
Philosophers:
  Plus: 12.5
  Minus: 8.5
  Ally: 5.5
  Enemy: 7.5
  AttachTo: 9
  Total Score: 2
=============================
Fire:
  Plus: 12
  Minus: 10.5
  Ally: 6
  Enemy: 5
  AttachTo: 8
  Total Score: 2.5
=============================
Sky:
  Plus: 9
  Minus: 7.5
  Ally: 5.5
  Enemy: 3.5
  AttachTo: 12
  Total Score: 3
=============================
Animals:
  Plus: 8.5
  Minus: 6.5
  Ally: 2.5
  Enemy: 1
  AttachTo: 7.5
  Total Score: 3.5
=============================
Water:
  Plus: 11.5
  Minus: 6.5
  Ally: 4
  Enemy: 4.5
  AttachTo: 11
  Total Score: 5
=============================
Wizards:
  Plus: 9
  Minus: 5
  Ally: 8.5
  Enemy: 2.5
  AttachTo: 7.5
  Total Score: 10.5
*/