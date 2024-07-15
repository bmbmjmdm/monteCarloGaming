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


  const eventNames = new Set<string>()
  // go through goalHistory and add the average score for each goal and event
  for (const goal of Object.values(goalHistory)) {
    goal.average = goal.points / goal.played
    console.log(goal.played)
    for (const event of Object.values(goal.events)) {
      event.average = event.scoreFromGamesWhenPassed / event.seenPassed
      eventNames.add(event.name)
    }
  }
  
  // now go through and make an object where the keys are event names and the values are how many times that event appears in the top 5 events for each goal
  // first initialize the object with all the event names set to 0
  const topEvents: Record<string, {positiveGoals: number, negativeGoals: number, positiveSignificance: number, negativeSignificance: number}> = {}
  for (const eventName of eventNames) {
    topEvents[eventName] = {
      positiveGoals: 0,
      negativeGoals: 0,
      positiveSignificance: 0,
      negativeSignificance: 0
    }
  }
  for (const goal of Object.values(goalHistory)) {
    // sort events within each goal from highest score to lowest
    const sortedEvents = Object.values(goal.events).sort((a, b) => b.average! - a.average!)
    // ok each goal can distribute 0-1 to each event
    // this is based on its position in the list (higher events are worth more)
    // and its average score difference from the goal's average score (higher events are worth more)

    const [maxEvent, minEvent] = sortedEvents.reduce((acc, event) => { 
      return [Math.max(acc[0], event.average!), Math.min(acc[1], event.average!)]
    }, [-Infinity, Infinity])

    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i]
      /*goal average score 10
      event average scores 0 3 7 10 13
      0 should give a "significance" of -1
      3 should give a "significance" of around -0.7
      7 should give around -0.3
      10 should give 0
      13 should give 0.3
      so on. It should never return more than 1 or less than -1
      */
      const range = maxEvent - minEvent;
      const scaledValue = (event.average! - goal.average!) / (range / 2);
      const significance = Math.tanh(scaledValue);
      topEvents[event.name] = {
        positiveGoals: topEvents[event.name].positiveGoals + (significance > 0 ? 1 : 0),
        negativeGoals: topEvents[event.name].negativeGoals + (significance < 0 ? 1 : 0),
        positiveSignificance: topEvents[event.name].positiveSignificance + (significance > 0 ? significance : 0),
        negativeSignificance: topEvents[event.name].negativeSignificance + (significance < 0 ? significance : 0)        
      }
    }
  }
  const topEventsArray = Object.entries(topEvents).sort((a, b) => b[1].significance - a[1].significance)
  for (const event of topEventsArray) {
    const [eventName, {positiveGoals, negativeGoals, positiveSignificance, negativeSignificance}] = event
    const lines =[
      eventName,
      "{",
      "positiveGoals = " + positiveGoals,
      "negativeGoals = " + negativeGoals,
      "positiveSignificance = " + positiveSignificance,
      "negativeSignificance = " + negativeSignificance,
      "}"
    ].join("\n")
    console.log(lines)
  }
  // print the average score for each goal
  const topGoals = Object.values(goalHistory).sort((a, b) => b.average! - a.average!)
  for (const goal of topGoals) {
    console.log(goal.name, goal.average)
  }
}