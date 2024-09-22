import { events } from './events'
import { goals } from './goals'
import { cloneDeep } from 'lodash'

const DEBUG = false;
const STRATEGY = true;
const PLAYS = 2000000;

function log (message:string) {
  if (DEBUG) console.log(message)
}

export type Entity = "Scientists" | "Priests" | "Philosophers" | "Trees" | "Animals" | "Druids" | "Wizards" | "Dragons" | "Dwarves" | "Water" | "Fire" | "Earth" | "Sky"
export type SpecialEntity = "Armed Guards" | "Devout Cultists" | "Invasive Plateaus" | "Dripping Temple" | "Sad Scholars" | "Ruin and Destruction" | "Deep Roots" | "Erosive Liquid" | "Sun Spirits" | "Shadow Beings" | "Inconsiderate Monarchy" | "Living Wind" | "Star Wedding" | "Friendship Ban" | "Wings For All" | "Living Crystals" | "Ecstacy Crystals" | "Humanity's Secret Weapon" | "Rebels" | "Drunk Animals" | "Miniature Kingdom" | "Scientific Silence"

export type GameEvent = {
  name: string,
  effects: EventEffect[]
}

type EventEffect = {
  condition?: (board:Record<Entity, BoardEntity>) => boolean,
  plus: (Entity | Entity[])[],
  minus: (Entity | Entity[])[],
  attachTo: Entity[],
  ally: Entity[],
  enemy: Entity[],
  relationship: String,
  specialEntity?: SpecialEntity
}

export type Goal = {
  name: string,
  plus: Entity[],
  minus: Entity[],
  specialEntity: SpecialEntity,
  special?: (board:Record<Entity, BoardEntity>) => number
}

export type BoardEntity = {
  value: number,
  allies: Entity[],
  enemies: Entity[]
}

export type GoalHistoryType =  Record<string, {
  name: string,
  played: number,
  points: number,
  average?: number,
  events: Record<string, {
    name: string,
    seenPassed: number,
    scoreFromGamesWhenPassed: number,
    average?: number,
  }> 
  relationships?: Record<string, {
    positiveTogether: number,
    negativeTogether: number
  }>
}>

export type BoardHistoryType = Record<Entity, {
  games: number,
  points: number,
  absolutePoint: number,
}>


export function game() {

  
let board: Record<Entity, BoardEntity>
let deck: GameEvent[]
let players: Goal[]
let pile1: GameEvent[] = []
let pile2: GameEvent[] = []
let goalDeck: Goal[]
const goalHistory: GoalHistoryType = {}
let boardHistory: BoardHistoryType = {} as BoardHistoryType
let eventHistory: string[] = []

// we'll see whether goals gang up too easily based on the preferred events for each goal afterwards


// ==================== Event Deck ====================

function createDeck() {
log("==Creating new deck")
  // These DO NOT include the effects of special entities or special events (mainly the wierd wizard ones)
 deck = cloneDeep(events)
}

function shuffleDeck() {
  log("==Shuffling deck")
  deck = deck.sort(() => Math.random() - 0.5)
}

function discardEvents() {
  log("==Discarding events")
  pile1 = []
  pile2 = []
}

function drawEvents() {
  log("==Drawing events")
  pile1 = pile1.concat(deck.splice(0, 2))
  pile2 = pile2.concat(deck.splice(0, 1))
}

// ==================== Goal Deck ====================

function createGoalDeck() {
  log("==Creating new Goal deck")
  goalDeck = cloneDeep(goals)
}

function shuffleGoalDeck() {
  log("==Shuffling Goal deck")
  goalDeck = goalDeck.sort(() => Math.random() - 0.5)
}

function drawGoals() {
  log("==Drawing goals")
  players = goalDeck.splice(0, 5)
}

// ==================== Board ====================

function resolveEvents(pile: GameEvent[]) {
  log("==Resolving event pile")
  for (const event of pile) {
    //most events have 1 effect without a condition. however if it does have a condition, check that before applying it:
    // If that condition fails, go to the next effect. Otherwise, resolve that effect and dont go to the next effect(s)
    // Non-conditional effects will always resolve and try to continue to the next effect
    for (const effect of event.effects) {
      if (effect.condition) {
        if (effect.condition(board)) {
          log("Resolving conditional event effect")
          resolveEffect(effect)
          break
        }
        else {
          continue;
        }
      }
      log("Resolving non-conditional event effect")
      resolveEffect(effect)
    }
  }
}

function resolveEffect(effect: EventEffect) {
  // each plus/minus member is either a string corresponding to a board entity or
  // an array of such strings. if its an array, we choose one randomly
  const getChange = (plusMinus:Entity|Entity[]) => {
    if (typeof plusMinus === "string") {
      return plusMinus
    }
    else {
      return plusMinus[Math.floor(Math.random() * plusMinus.length)]
    }
  }
  // go through the plus/minuses and increment or decrement them on the board as such
  for (const plus of effect.plus) {
    log("Resolving plus")
    changeBoard(getChange(plus), 1, [])
  }
  for (const minus of effect.minus) {
    log("Resolving minus")
    changeBoard(getChange(minus), -1, [])
  }
  // afterwards apply the relationship if there is one
  if (effect.attachTo.length) resolveRelationship(effect)
}

function changeBoard(name: Entity, amount: number, resolvedRelationships: Entity[]) {
  log("Changing entity value")
  // update the entity's value by amount
  const boardEntity = board[name]
  log(name)
  boardEntity.value += amount;
  // make sure the boardEntity.value doesn't go above 5 or below -5
  if (boardEntity.value > 5) {
    log("Entity is maxed out")
    boardEntity.value = 5
  }
  if (boardEntity.value < -5) {
    log("Entity is minned out")
    boardEntity.value = -5
  }
  
  // check to see if we've resolved this entity's relationships yet during this event
  if (!resolvedRelationships.includes(name)) {
    // remember that we've resolved this entity's relationships
    resolvedRelationships.push(name)

    // update all allies or enemies 
    if (amount > 0) {
      for (const ally of boardEntity.allies) {
        log("Propogating change to ally")
        changeBoard(ally, amount, resolvedRelationships)
      }
    }
    else {
      for (const enemy of boardEntity.enemies) {
        log("Propogating change to enemy")
        changeBoard(enemy, amount, resolvedRelationships)
      }
    }
  }
}

function resolveRelationship(effect: EventEffect) {
  log("Attaching relationship")
  // pick a random attachTo
  const attachTo = effect.attachTo[Math.floor(Math.random() * effect.attachTo.length)]
  // make copies so we dont modify the original event
  const ally = [...effect.ally];
  const enemy = [...effect.enemy];
  const relationshipToArray = ally.length ? ally : enemy
  const relationship = ally.length ? "allies" : "enemies";
  // incase the entity we are attaching to is also in the array of ally/enemy, remove it
  const removeIndex = relationshipToArray.indexOf(attachTo)
  if (removeIndex > -1) relationshipToArray.splice(removeIndex, 1)
  // pick a random ally/enemy
  const relationshipTo = relationshipToArray[Math.floor(Math.random() * relationshipToArray.length)]
  // update the relationship on the board
  const boardEntity = board[attachTo]
  boardEntity[relationship].push(relationshipTo)
}

function createBoard() {
  log("==Creating new board")
  board = {
    Scientists: {
      value: 0,
      allies: [],
      enemies: []
    },
    Priests: {
      value: 0,
      allies: [],
      enemies: []
    },
    Philosophers: {
      value: 0,
      allies: [],
      enemies: []
    },
    Trees: {
      value: 0,
      allies: [],
      enemies: []
    },
    Animals: {
      value: 0,
      allies: [],
      enemies: []
    },
    Druids: {
      value: 0,
      allies: [],
      enemies: []
    },
    Wizards: {
      value: 0,
      allies: [],
      enemies: []
    },
    Dragons: {
      value: 0,
      allies: [],
      enemies: []
    },
    Dwarves: {
      value: 0,
      allies: [],
      enemies: []
    },
    Water: {
      value: 0,
      allies: [],
      enemies: []
    },
    Fire: {
      value: 0,
      allies: [],
      enemies: []
    },
    Earth: {
      value: 0,
      allies: [],
      enemies: []
    },
    Sky: {
      value: 0,
      allies: [],
      enemies: []
    },
  }
  if(!boardHistory.Scientists) boardHistory = {
    'Scientists': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Priests': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Philosophers': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Trees': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Animals': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Druids': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Wizards': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Dragons': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Dwarves': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Water': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Fire': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Earth': {
      games: 0,
      points: 0,
      absolutePoint: 0
    },
    'Sky': {
      games: 0,
      points: 0,
      absolutePoint: 0
    }
  }
}

// ==================== History ====================

function recordEventHistory(pile: GameEvent[]) {
  for (const event of pile) {
    log("Storing event history")
    eventHistory.push(event.name)
  }
}

function recordGoalHistory() {
  log("==Recording history")
  for (const goal of players) {
    const score = calculateGoalScore(goal)
    // add the goal if this is the first time using it
    if (!goalHistory[goal.name]) {
      goalHistory[goal.name] = {
        name: goal.name,
        played: 0,
        points: 0,
        events: {}
      }
    }
    // update the goal's stats
    goalHistory[goal.name].played++
    goalHistory[goal.name].points += score
    // update the goal's events
    for (const event of eventHistory) {
      // add the event if this is the first time using it with this goal
      if (!goalHistory[goal.name].events[event]) {
        goalHistory[goal.name].events[event] = {
          name: event,
          seenPassed: 0,
          scoreFromGamesWhenPassed: 0
        }
      }
      // update the event's stats
      goalHistory[goal.name].events[event].seenPassed++
      goalHistory[goal.name].events[event].scoreFromGamesWhenPassed += score
    }
  }
  // also record board history
  for(const entity of Object.keys(board) as Entity[]) {
    const entityValue = board[entity].value
    const entityHistory = boardHistory[entity]
    entityHistory.games++
    entityHistory.points += entityValue
    entityHistory.absolutePoint += Math.abs(entityValue)
  }
  // TODO uncomment the above and fix it so we arent keeping track of millions of boards
  // clear events for next game
  eventHistory = []
}

function calculateGoalScore(goal: Goal) {
  log("Calculating goal score")
  let score = 0
  for (const plus of goal.plus) {
    score += board[plus].value
  }
  for (const minus of goal.minus) {
    score -= board[minus].value
  }
  if (goal.special) {
    score += goal.special(board)
  }
  return score
}

// ==================== Simulation ====================

function playTurn() {
  log("===Playing Turn")
  drawEvents()
  let chosenPile; 
  if (STRATEGY) {
    let pile1Votes = 0;
    let pile2Votes = 0;
    // for every goal and every event, add up how likely that goal wants that event to be passed
    const playersDesires = players.map(player => ({
      pile1: pile1.reduce((acc, event) => acc + calculateEventVoteDesire(event, player), 0),
      pile2: pile2.reduce((acc, event) => acc + calculateEventVoteDesire(event, player), 0)
    }))
    // for each goal, see which pile they vote on and tally up the votes
    for (const player of playersDesires) {
      if (player.pile1 > player.pile2) {
        pile1Votes++
      }
      else if (player.pile2 > player.pile1) {
        pile2Votes++
      }
    }
    // flip a coin if the votes are equal
    chosenPile = pile1Votes > pile2Votes ? pile1 : pile2Votes > pile1Votes ? pile2 : Math.random() < 0.5 ? pile1 : pile2
  }
  else {
    // we're not using strategy, just pick a pile randomly
    chosenPile = Math.random() < 0.5 ? pile1 : pile2
  }
  resolveEvents(chosenPile)
  recordEventHistory(chosenPile)
  discardEvents()
}

// determine how much this goal likes/dislikes this event
function calculateEventVoteDesire(event: GameEvent, goal: Goal) {
  const goalPlus = goal.plus;
  const goalMinus = goal.minus;
  // list all potential plus entities in this event
  const eventPlus = new Set(event.effects.map(effect => effect.plus).flat());
  // list all potential minus entities in this event
  const eventMinus = new Set(event.effects.map(effect => effect.plus).flat());
  // for now ignore allies/enemies
  // calculate how well the event's plus/minus lines up with the goal's plus/minus
  let score = 0;
  for (const entity of goalPlus) {
    if (eventPlus.has(entity)) score++;
    if (eventMinus.has(entity)) score--;
  }
  for (const entity of goalMinus) {
    if (eventPlus.has(entity)) score--;
    if (eventMinus.has(entity)) score++;
  }
  return score;
}

function playGame() {
  log("====Playing Game")
  createDeck()
  createGoalDeck()
  createBoard()
  shuffleDeck()
  shuffleGoalDeck()
  drawGoals()

  for (let i = 0; i < 10; i++) {
    playTurn()
  }

  recordGoalHistory()
}

for (let i = 0; i < PLAYS; i++) {
  playGame()
}
return  {
  goalHistory,
  boardHistory
}
}














// UNUSED

/*

// we're going to assume the game starts fresh each time, not going through the whole deck before shuffling discard back in like the rules recomend

const discard = []
const goalDiscard = []
function shuffleDiscardIntoDeck() {
  deck = deck.concat(discard)
  discard = []
  shuffleDeck()
}


function shuffleDiscardIntoGoalDeck() {
  goalDeck = goalDeck.concat(goalDiscard)
  goalDiscard = []
  shuffleGoalDeck()
}


// old versions of functions that use the discard

function discardEvents() {
  discard = discard.concat(pile1)
  discard = discard.concat(pile2)
  pile1 = []
  pile2 = []
}

function drawEvents() {
  let drew = 0;
  if (deck.length < 3) {
    drew = deck.length
    pile1 = pile1.concat(deck)
    shuffleDiscardIntoDeck()
  }
  pile1 = pile1.concat(deck.splice(0, 2 - drew))
  pile2 = pile2.concat(deck.splice(0, 1))
}
function discardGoals() {
  goalDiscard = goalDiscard.concat(players)
  players = []
}

function drawGoals() {
  let drew = 0;
  if (goalDeck.length < 5) {
    drew = goalDeck.length
    players = players.concat(goalDeck)
    shuffleDiscardIntoGoalDeck()
  }
  players = players.concat(goalDeck.splice(0, 5 - drew))
}
*/
