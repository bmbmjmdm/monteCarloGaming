import { Worker, isMainThread, parentPort } from 'worker_threads';
import os from 'os';
import { BoardHistoryType, game, GoalHistoryType } from './game';

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



function gatherResults(goalHistoryArr: GoalHistoryType[], boardHistoryArr:BoardHistoryType[]) {
  // combine all goal history into one object
  const goalHistory: GoalHistoryType = goalHistoryArr.reduce((acc, curHistory) => {
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

  // combine all board history into one object
  const boardHistory: BoardHistoryType = boardHistoryArr.reduce((acc, curHistory) => {
    acc.push(...curHistory)
    return acc;
  }, [] as BoardHistoryType);

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
      "negativeGoals = " + Object.entries(positiveGoals).join(', '),
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
  const topGoals = Object.values(goalHistory).sort((a, b) => b.average! - a.average!);
  for (const goal of topGoals) {
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



=========Balancing notes

a very high positiveTogether and/or very low negativeTogether mean that goals are allies
the closer to 0 these are the closer those goals are enemies
positive/negative doesnt matter here, just how far it is from 0

a very high positiveSignificance indicates what? 
that these events are aiding their supported goals more than others
vice versa for negative
*/