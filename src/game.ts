const DEBUG = false;
const PLAYS = 2000000;

function log (message:string) {
  if (DEBUG) console.log(message)
}

type Entity = "Scientists" | "Priests" | "Philosophers" | "Trees" | "Animals" | "Druids" | "Wizards" | "Dragons" | "Dwarves" | "Water" | "Fire" | "Earth" | "Sky"

type GameEvent = {
  name: string,
  effects: EventEffect[]
}

type EventEffect = {
  condition?: () => boolean,
  plus: (Entity | Entity[])[],
  minus: (Entity | Entity[])[],
  attachTo: Entity[],
  ally: Entity[],
  enemy: Entity[]
}

type Goal = {
  name: string,
  plus: Entity[],
  minus: Entity[],
  special?: () => number
}

type BoardEntity = {
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

export type BoardHistoryType = Record<Entity, BoardEntity>[]


export function game() {

  
let board: Record<Entity, BoardEntity>
let deck: GameEvent[]
let players: Goal[]
let pile1: GameEvent[] = []
let pile2: GameEvent[] = []
let goalDeck: Goal[]
const goalHistory: GoalHistoryType = {}
let boardHistory: BoardHistoryType = []
let eventHistory: string[] = []

// example of board
/*
{
 Scientists: {
  value: 0,
  allies: ["Trees"],
  enemies: []
 }
}
*/

// example event
/*
{
  name: "Event Name",
  effects: [{ //most events have 1 effect without a condition. however if it does have a condition, you check that before applying it. if that condition fails, go to the next effect. otherwise, dont go to the next effect(s)
  condition?: () => {},
  plus: ["Animal", ["Scientist", "Philosopher", "Priest"], "Animal"], //an array within the array means pick 1 randomly
  minus: ["Tree"],
  attachTo: ["Tree"], //can have multiple to pick randomly
  ally: null,
  enemy: ["Animal"] // can have multiple here, will be selected randomly but remove whoever its attached to
}]
}
*/

// example goal
/*
{
  name: "Goal Name",
  plus: ["Animal", "Fire", "Scientist"],
  minus: ["Tree", "Druid"],
}
*/

// example goal history
/*
'Goal Name': {
  name: "Goal Name",
  // This tells us the average score for this goal
  played: 0,
  points: 0,
  events: {
    // This tells us the average score for this goal when this particular event passes
    'Event Name': {
      name: "Event Name",
      seenPassed: 0,
      scoreFromGamesWhenPassed: 0
    },
    // Do this for all events, then we can rank these to find the "most beneficial" events for this goal
    ...
  }
}
*/

// no need to have goals vote. just pick a winner randomly.
// we'll see whether goals gang up too easily based on the preferred events for each goal afterwards
// this also gets rid of bias that prevents us from seeing the true power/preferedness of each event


// ==================== Event Deck ====================

function createDeck() {
log("==Creating new deck")
  // These DO NOT include the effects of special entities or special events (mainly the wierd wizard ones)
 deck = [
  {
    name: "Dwarven mining is fruiful, but causes rock slides that punnel the forest",
    effects: [
      {
        plus: ["Dwarves"],
        minus: ["Trees", "Druids"],
        attachTo: ["Trees"],
        ally: [],
        enemy: ["Dwarves"]
      }
    ]
  },
  {
    name: "Priests try to catch a dragon for a ritual",
    effects: [
      {
        condition: () => board["Priests"].value > board["Dragons"].value,
        plus: ["Priests", "Priests"],
        minus: ["Dragons"],
        attachTo: ["Dragons"],
        ally: [],
        enemy: ["Priests"]
      },
      {
        condition: () => board["Priests"].value <= board["Dragons"].value,
        plus: [],
        minus: ["Priests"],
        attachTo: ["Dragons"],
        ally: [],
        enemy: ["Priests"]
      },
    ]
  },
  {
    name: "The fire god fills the bellies of dragons",
    effects: [
      {
        plus: ["Dragons", "Fire"],
        minus: [],
        attachTo: ["Dragons"],
        ally: ["Fire"],
        enemy: []
      }
    ]
  },
  {
    name: "Great Oaks bare fruit of wisdom for all forest dwellers",
    effects: [
      {
        plus: ["Animals", "Druids"],
        minus: [],
        attachTo: ["Trees"],
        ally: ["Animals"],
        enemy: []
      }
    ]
  },
  {
    name: "Wet soil and happy gods spring forth new, green life",
    effects: [
      {
        condition: () => board["Earth"].value > 0 && board["Water"].value > 0,
        plus: ["Earth", "Water", "Trees"],
        minus: [],
        attachTo: ["Earth", "Water"],
        ally: ["Water", "Earth"],
        enemy: []
      },
      {
        condition: () => board["Earth"].value <= 0 || board["Water"].value <= 0,
        plus: [],
        minus: [],
        attachTo: ["Earth", "Water"],
        ally: ["Water", "Earth"],
        enemy: []
      }
    ]
  },
  {
    name: "Druids broker an alliance with dragons",
    effects: [
      {
        plus: ["Druids", "Dragons"],
        minus: [],
        attachTo: ["Druids", "Dragons"],
        ally: ["Dragons", "Druids"],
        enemy: []
      }
    ]
  },
  {
    name: "Dragons launch an attack on the city, plundering it",
    effects: [
      {
        plus: ["Dragons"],
        minus: [["Scientists", "Priests", "Philosophers"]],
        attachTo: ["Scientists", "Priests", "Philosophers"],
        ally: [],
        enemy: ["Dragons"]
      }
    ]
  },
  {
    name: "A philosopher tries to help the sky god, but it's risky",
    effects: [
      {
        condition: () => board["Philosophers"].value > board["Sky"].value,
        plus: ["Sky", "Philosophers"],
        minus: [],
        attachTo: ["Sky"],
        ally: ["Philosophers"],
        enemy: []
      },
      {
        condition: () => board["Philosophers"].value <= board["Sky"].value,
        plus: [],
        minus: ["Sky", "Philosophers"],
        attachTo: ["Sky"],
        ally: ["Philosophers"],
        enemy: []
      }
    ]
  },
  {
    name: "A wizard challenges the sky, competing with the lightning",
    effects: [
      {
        condition: () => board["Wizards"].value > board["Sky"].value,
        plus: ["Wizards"],
        minus: ["Sky"],
        attachTo: ["Sky"],
        ally: ["Wizards"],
        enemy: []
      },
      {
        condition: () => board["Wizards"].value <= board["Sky"].value,
        plus: ["Sky"],
        minus: ["Wizards"],
        attachTo: ["Wizards"],
        ally: ["Sky"],
        enemy: []
      }
    ]
  },
  {
    name: "The fire god fills dwarven forges",
    effects: [
      {
        plus: ["Fire", "Dwarves"],
        minus: [],
        attachTo: ["Dwarves"],
        ally: ["Fire"],
        enemy: []
      }
    ]
  },
  {
    name: "Runoff from the city infects many lakes and shores",
    effects: [
      {
        plus: [],
        minus: ["Animals", "Trees", "Water"],
        attachTo: ["Water"],
        ally: [],
        enemy: ["Scientists", "Priests", "Philosophers"]
      }
    ]
  },
  {
    name: "Scientists showcase experiments discredeting the church",
    effects: [
      {
        plus: ["Scientists"],
        minus: ["Priests"],
        attachTo: ["Priests"],
        ally: [],
        enemy: ["Scientists"]
      }
    ]
  },
  {
    name: "Sirens steal technology",
    effects: [
      {
        plus: ["Water"],
        minus: ["Scientists"],
        attachTo: ["Scientists"],
        ally: [],
        enemy: ["Water"]
      }
    ]
  },
  {
    name: "A priest prays, the most well god responds",
    effects: [
      {
        condition: () => board["Fire"].value > board["Water"].value && board["Fire"].value > board["Earth"].value && board["Fire"].value > board["Sky"].value,
        plus: ["Fire"],
        minus: [],
        attachTo: ["Fire"],
        ally: ["Priests"],
        enemy: []
      },
      {
        condition: () => board["Water"].value > board["Fire"].value && board["Water"].value > board["Earth"].value && board["Water"].value > board["Sky"].value,
        plus: ["Water"],
        minus: [],
        attachTo: ["Water"],
        ally: ["Priests"],
        enemy: []
      },
      {
        condition: () => board["Earth"].value > board["Fire"].value && board["Earth"].value > board["Water"].value && board["Earth"].value > board["Sky"].value,
        plus: ["Earth"],
        minus: [],
        attachTo: ["Earth"],
        ally: ["Priests"],
        enemy: []
      },
      {
        condition: () => board["Sky"].value > board["Fire"].value && board["Sky"].value > board["Earth"].value && board["Sky"].value > board["Water"].value,
        plus: ["Sky"],
        minus: [],
        attachTo: ["Sky"],
        ally: ["Priests"],
        enemy: []
      }
    ]
  },
  {
    name: "A draught plagues the forest, sparks lurk",
    effects: [
      {
        plus: [],
        minus: ["Trees"],
        attachTo: [],
        ally: [],
        enemy: []
      },
      {
        condition: () => board["Fire"].value > 0,
        plus: [],
        minus: ["Animals", "Druids"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "The sky weeps, filling the sea",
    effects: [
      {
        plus: ["Water"],
        minus: ["Sky"],
        attachTo: ["Water"],
        ally: ["Sky"],
        enemy: []
      }
    ]
  },
  {
    name: "The sky weeps, watering crops and dousing flames",
    effects: [
      {
        plus: [["Priests", "Philosophers", "Scientists"]],
        minus: ["Fire", "Sky"],
        attachTo: ["Fire"],
        ally: [],
        enemy: ["Sky"]
      }
    ]
  },
  {
    name: "The dwarves and the city start an exchange program, sharing knowledge but erupting in discrimination",
    effects: [
      {
        condition: () => Math.random() < 0.5,
        plus: ["Dwarves", ["Scientists", "Priests", "Philosophers"]],
        minus: [],
        attachTo: ["Scientists", "Priests", "Philosophers"],
        ally: [],
        enemy: ["Dwarves"]
      },
      {
        plus: ["Dwarves", ["Scientists", "Priests", "Philosophers"]],
        minus: [],
        attachTo: ["Dwarves"],
        ally: [],
        enemy: ["Scientists", "Priests", "Philosophers"]
      }
    ]
  },
  {
    name: "Mouse scientsits capture wild animals to use for experiments",
    effects: [
      {
        plus: ["Scientists"],
        minus: ["Animals"],
        attachTo: ["Animals"],
        ally: [],
        enemy: ["Scientists"]
      }
    ]
  },
  {
    name: "Dwarves pray to distant gods for new ore",
    effects: [
      {
        condition: () => Math.random() > 0.5,
        plus: ["Dwarves", "Dwarves", "Earth", "Earth"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: []
      },
      {
        plus: [],
        minus: ["Dwarves", "Earth"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "If things are warm enough, iceburgs melt, raising the sea",
    effects: [
      {
        condition: () => board["Fire"].value > 0,
        plus: ["Water"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "The sky and water gods dance, hurricanes batter the city",
    effects: [
      {
        plus: ["Sky", "Water"],
        minus: [["Scientists", "Priests", "Philosophers"], ["Scientists", "Priests", "Philosophers"]],
        attachTo: ["Sky", "Water"],
        ally: ["Sky", "Water"],
        enemy: []
      }
    ]
  },
  {
    name: "Priests burn heretical philosophy books",
    effects: [
      {
        plus: ["Fire"],
        minus: ["Philosophers"],
        attachTo: ["Philosophers"],
        ally: [],
        enemy: ["Priests"]
      }
    ]
  },
  {
    name: "The water god swallows ships, eating their treasure",
    effects: [
      {
        plus: ["Water"],
        minus: ["Priests"],
        attachTo: ["Priests"],
        ally: [],
        enemy: ["Water"]
      }
    ]
  },
  {
    name: "Wizards create spectral animals to play and mate with the wild ones",
    effects: [
      {
        plus: ["Wizards", "Animals"],
        minus: [],
        attachTo: ["Animals"],
        ally: ["Wizards"],
        enemy: []
      }
    ]
  },
  {
    name: "The planets align, empowering all the gods",
    effects: [
      {
        plus: ["Water", "Fire", "Earth", "Sky"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "The water god polishes stones for the earth god, erasing dwarven inscriptions on them",
    effects: [
      {
        plus: ["Earth"],
        minus: ["Dwarves"],
        attachTo: ["Earth"],
        ally: ["Water"],
        enemy: []
      },
      {
        condition: () => Math.random() < 0.5,
        plus: ["Water"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "The sky weeps, watering the forest and dousing flames",
    effects: [
      {
        plus: ["Trees"],
        minus: ["Sky", "Fire"],
        attachTo: ["Fire"],
        ally: [],
        enemy: ["Sky"]
      }
    ]
  },
  {
    name: "A strange disease spreads through the wild animals, threatening the city as well",
    effects: [
      {
        plus: [],
        minus: ["Animals"],
        attachTo: [],
        ally: [],
        enemy: []
      },
      {
        condition: () => board["Animals"].allies.includes("Scientists") || board["Animals"].allies.includes("Priests") || board["Animals"].allies.includes("Philosophers"),
        plus: [],
        minus: ["Scientists", "Priests", "Philosophers"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "A draught plagues the city, sparks lurk",
    effects: [
      {
        condition: () => board["Fire"].value > 1,
        plus: [],
        minus: ["Priests", "Philosophers", "Scientists"],
        attachTo: [],
        ally: [],
        enemy: []
      },
      {
        plus: [],
        minus: [["Priests", "Philosophers", "Scientists"]],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "A philosopher and a grand oak contemplate the meaning of life",
    effects: [
      {
        plus: ["Philosophers", "Trees"],
        minus: [],
        attachTo: ["Trees", "Philosophers"],
        ally: ["Philosophers", "Trees"],
        enemy: []
      }
    ]
  },
  {
    name: "The sky god spreads wisdom through the city, but at a cost",
    effects: [
      {
        plus: ["Scientists", "Priests", "Philosophers"],
        minus: [],
        attachTo: ["Sky"],
        ally: [],
        enemy: ["Scientists", "Priests", "Philosophers"]
      }
    ]
  },
  {
    name: "Tides adorn a beach with treasure, a gift from one god to another",
    effects: [
      {
        plus: ["Earth"],
        minus: [],
        attachTo: ["Earth"],
        ally: ["Water"],
        enemy: []
      },
      {
        condition: () => board["Earth"].value > 0,
        plus: ["Water"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "Dogs plunder amber from druids",
    effects: [
      {
        plus: ["Priests"],
        minus: ["Druids"],
        attachTo: ["Druids"],
        ally: [],
        enemy: ["Priests"]
      }
    ]
  },
  {
    name: "Fresh fire fills city machinery",
    effects: [
      {
        plus: ["Fire", "Scientists"],
        minus: [],
        attachTo: ["Scientists"],
        ally: ["Fire"],
        enemy: []
      }
    ]
  },
  {
    name: "Dogs plunder gold from Dwarven caves",
    effects: [
      {
        plus: ["Priests"],
        minus: ["Dwarves"],
        attachTo: ["Dwarves"],
        ally: [],
        enemy: ["Priests"]
      }
    ]
  },
  {
    name: "Solar flares stoke many flames, disrupt electronics",
    effects: [
      {
        plus: ["Fire"],
        minus: ["Scientists"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "Philosophers question the speed of scientific advancement",
    effects: [
      {
        plus: ["Philosophers"],
        minus: ["Scientists"],
        attachTo: ["Scientists"],
        ally: [],
        enemy: ["Philosophers"]
      }
    ]
  },
  {
    name: "A mountain comes alive, using trees as brushes to paint the sky a painting",
    effects: [
      {
        plus: ["Sky"],
        minus: ["Trees"],
        attachTo: ["Sky"],
        ally: ["Earth"],
        enemy: []
      },
      {
        condition: () => board["Sky"].value > 0,
        plus: ["Earth"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: []
      },
      {
        condition: () => board["Sky"].value < 0,
        plus: [],
        minus: ["Earth"],
        attachTo: [],
        ally: [],
        enemy: []
      },
    ]
  },
  {
    name: "Scientists design an aqueduct carving through the mountain",
    effects: [
      {
        plus: ["Scientists"],
        minus: ["Earth"],
        attachTo: ["Earth"],
        ally: [],
        enemy: ["Scientists"]
      }
    ]
  },
  {
    name: "A solar eclipse weakens the fire god, frightens animals",
    effects: [
      {
        plus: [],
        minus: ["Fire", "Animals"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "A scientist's experiment goes wrong and erupts in flames in the city",
    effects: [
      {
        plus: ["Fire"],
        minus: ["Scientists"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "Dwarves unearth a slumbering demon, trying to enslave it before it awakens",
    effects: [
      {
        condition: () => board["Dwarves"].value > 1,
        plus: ["Dwarves", "Dwarves"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: []
      },
      {
        plus: [],
        minus: ["Dwarves", "Dwarves"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "The sky god drinks sea and eats earth with tornados",
    effects: [
      {
        plus: ["Sky"],
        minus: ["Water", "Earth"],
        attachTo: ["Water", "Earth"],
        ally: [],
        enemy: ["Sky"]
      }
    ]
  },
  {
    name: "Druids and priests pray to the planets",
    effects: [
      {
        condition: () => Math.random() < 0.5,
        plus: ["Druids", "Priests", "Druids", "Priests"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "The earth has nightmares, causing earthquakes around the world",
    effects: [
      {
        plus: [],
        minus: ["Trees", "Scientists", "Dwarves"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  }
 ]
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
  goalDeck = [
    {
      name: "Mists and Dew",
      plus: ["Druids", "Water", "Sky", "Trees"],
      minus: ["Fire"]
    },
    {
      name: "Forges Forge Forward",
      plus: ["Fire", "Dwarves", "Dragons", "Scientists"],
      minus: ["Water"]
    },
    {
      name: "They're too powerful, they must be stopped",
      plus: [],
      minus: ["Wizards", "Dragons", "Water", "Fire", "Earth", "Sky"]
    },
    {
      name: "Get High (Physically)",
      plus: ["Sky", "Trees", "Scientists", "Dragons"],
      minus: []
    },
    {
      name: "Buldoze and level the land",
      plus: [],
      minus: ["Trees", "Druids", "Scientists", "Earth"]
    },
    {
      name: "Maintain the status quo",
      plus: [],
      minus: [],
      special: () => {
        let total = 0
        for (const entity of Object.values(board)) {
          if (entity.value > 0) total -= entity.value
          else if (entity.value < 0) total += entity.value
          else total += 6
        }
        return total
      }
    },
    {
      name: "Extreme Differences",
      plus: [],
      minus: [],
      special: () => {
        let highest = 0
        let lowest = 0
        for (const entity of Object.values(board)) {
          if (entity.value > highest) highest = entity.value
          if (entity.value < lowest) lowest = entity.value
        }
        return (highest - lowest)/2
      }
    },
    {
      name: "Make everyone miserable",
      plus: [],
      minus: ["Druids", "Wizards", "Priests", "Scientists", "Dwarves", "Trees", "Fire", "Water", "Philosophers", "Earth", "Sky", "Animals", "Dragons"],
    },
    {
      name: "Make everyone happy",
      plus: ["Druids", "Wizards", "Priests", "Scientists", "Dwarves", "Trees", "Fire", "Water", "Philosophers", "Earth", "Sky", "Animals", "Dragons"],
      minus: [],
    },
    {
      name: "Revive a forgotten God",
      plus: ["Druids", "Wizards", "Priests", "Scientists", "Dwarves"],
      minus: [],
    },
    {
      name: "Boil the soil and those that hide",
      plus: ["Water", "Fire"],
      minus: ["Dwarves", "Trees", "Earth"],
    },
    {
      name: "Live simply, live slow",
      plus: ["Philosophers", "Earth", "Trees", "Dwarves"],
      minus: ["Scientists", "Fire", "Dragons"]
    },
    {
      name: "Silence is golden",
      plus: ["Trees", "Druids", "Philosophers"],
      minus: ["Priests", "Scientists"]
    },
    {
      name: "Unrestrained Flames",
      plus: ["Fire"],
      minus: ["Water", "Druids", "Trees"]
    }
  ]
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
    for (const effect of event.effects) {
      if (effect.condition) {
        if (effect.condition()) {
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
  //boardHistory.push({...board})
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
    score += goal.special()
  }
  return score
}

// ==================== Simulation ====================

function playTurn() {
  log("===Playing Turn")
  drawEvents()
  const randomPile = Math.random() < 0.5 ? pile1 : pile2
  resolveEvents(randomPile)
  recordEventHistory(randomPile)
  discardEvents()
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
