const DEBUG = false;
const STRATEGY = true;
const PLAYS = 2000000;

function log (message:string) {
  if (DEBUG) console.log(message)
}

export type Entity = "Scientists" | "Priests" | "Philosophers" | "Trees" | "Animals" | "Druids" | "Wizards" | "Dragons" | "Dwarves" | "Water" | "Fire" | "Earth" | "Sky"

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
    name: "When priests try to steal a baby dragon for their ritual, the plan goes awry and a battle ensues. Long after the priests leave, dragons lash out by fiesting on any animal in sight.",
    effects: [
      {
        plus: [],
        minus: ["Dragons", "Priests"],
        attachTo: ["Dragons"],
        ally: [],
        enemy: ["Animals"]
      },
    ]
  },
  {
    name: "The fire god finds comfort in the bellies of dragons",
    effects: [
      {
        plus: ["Fire"],
        minus: [],
        attachTo: ["Fire"],
        ally: ["Dragons"],
        enemy: []
      }
    ]
  },
  {
    name: "Great Oaks bare fruit of wisdom for all forest dwellers, but it takes a lot of water",
    effects: [
      {
        plus: ["Animals", "Druids"],
        minus: ["Water"],
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
        ally: [],
        enemy: ["Wizards"]
      },
      {
        condition: () => board["Wizards"].value <= board["Sky"].value,
        plus: ["Sky"],
        minus: ["Wizards"],
        attachTo: ["Wizards"],
        ally: [],
        enemy: ["Sky"]
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
    name: "Runoff from the city temples infects many lakes and shores",
    effects: [
      {
        plus: [],
        minus: ["Animals", "Trees", "Water"],
        attachTo: ["Water"],
        ally: [],
        enemy: ["Priests"]
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
    name: "Dwarves pray and give tribute to the Earth, asking it to ground the wizards' magic.",
    effects: [
      {
        plus: ["Earth", "Dwarves"],
        minus: ["Wizards"],
        attachTo: ["Earth"],
        ally: ["Dwarves"],
        enemy: []
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
    name: "A drought plagues the forest, prompting druids to seek help from the water god. The fire god licks its lips with sparks on dry wood",
    effects: [
      {
        plus: [],
        minus: ["Trees", "Water"],
        attachTo: [],
        ally: [],
        enemy: []
      },
      {
        condition: () => board["Fire"].value > 0 && (board["Water"].value < 1 || board["Druids"].value < 1),
        plus: ["Fire"],
        minus: ["Animals", "Druids"],
        attachTo: ["Druids", "Animals", "Trees"],
        ally: [],
        enemy: ["Fire"]
      },
      {
        condition: () => board["Druids"].value > 0 && board["Water"].value > 0,
        plus: ["Trees", "Water"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: []
      },
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
    name: "The sky weeps, watering the city's crops and dousing flames",
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
        enemy: ["Scientists"]
      }
    ]
  },
  {
    name: "Mouse scientists capture wild animals to use for experiments",
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
    name: "As the Earth turns its back on the Dwarves in their time of need, the dwarves pray to distant gods for new ore and revenge.",
    effects: [
      {
        condition: () => Math.random() > 0.5,
        plus: ["Dwarves"],
        minus: ["Earth"],
        attachTo: ["Dwarves"],
        ally: [],
        enemy: ["Earth"]
      },
      {
        plus: [],
        minus: ["Dwarves", "Earth"],
        attachTo: ["Dwarves"],
        ally: [],
        enemy: ["Earth"]
      }
    ]
  },
  {
    name: "During the winter solstice, druids call forth a powerful snow, freezing the lakes and kindling.",
    effects: [
      {
        plus: [],
        minus: ["Water", "Fire"],
        attachTo: ["Water", "Fire"],
        ally: [],
        enemy: ["Druids"]
      },

    ]
  },
  {
    name: "The sky and water gods dance, hurricanes batter the city",
    effects: [
      {
        plus: ["Sky", "Water"],
        minus: [["Scientists", "Priests", "Philosophers"]],
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
    name: "The planets align in the sky, demanding all other gods pay tribute. Druids curse it, call it an omen.",
    effects: [
      {
        plus: ["Sky"],
        minus: ["Water", "Fire", "Earth"],
        attachTo: ["Sky"],
        ally: [],
        enemy: ["Druids"]
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
        plus: ["Trees", "Water"],
        minus: ["Sky", "Fire"],
        attachTo: ["Fire"],
        ally: [],
        enemy: ["Sky"]
      }
    ]
  },
  {
    name: "A strange disease spreads through the wild animals, threatening the city as well. The scientists try to help",
    effects: [
      {
        plus: [],
        minus: ["Animals"],
        attachTo: ["Animals"],
        ally: ["Scientists"],
        enemy: []
      },
      {
        condition: () => board["Animals"].allies.filter(ally => ally === "Scientists").length > 1 || board["Animals"].allies.includes("Priests") || board["Animals"].allies.includes("Philosophers"),
        plus: [],
        minus: ["Scientists", "Priests", "Philosophers"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "The water god is weakened by a nightmare of the fire god, causing a drought to plague the city. Sparks lurk",
    effects: [
      {
        condition: () => board["Fire"].value > 1,
        plus: [],
        minus: ["Water", "Priests", "Philosophers", "Scientists"],
        attachTo: ["Water"],
        ally: [],
        enemy: ["Fire"]
      },
      {
        plus: [],
        minus: ["Water", ["Priests", "Philosophers", "Scientists"]],
        attachTo: ["Water"],
        ally: [],
        enemy: ["Fire"]
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
    name: "The sky god spreads wisdom through the city, but discovers heretical texts",
    effects: [
      {
        plus: ["Scientists", "Priests", "Philosophers"],
        minus: [],
        attachTo: ["Sky"],
        ally: [],
        enemy: ["Priests"]
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
    name: "Dogs plunder amber from druids, desecrating their sacred stream in the process.",
    effects: [
      {
        plus: ["Priests"],
        minus: ["Druids", "Water"],
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
    name: "Solar flares stoke many flames, disrupt electronics. The nerds plot their revenge... ",
    effects: [
      {
        plus: ["Fire"],
        minus: ["Scientists"],
        attachTo: ["Scientists"],
        ally: [],
        enemy: ["Fire"]
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
    name: "Scientists design an aqueduct carving through the mountain, draining precious water",
    effects: [
      {
        plus: ["Scientists"],
        minus: ["Earth", "Water"],
        attachTo: ["Earth"],
        ally: [],
        enemy: ["Scientists"]
      }
    ]
  },
  {
    name: "A solar eclipse weakens the fire god, frightens animals. They're not so bright, so they think the trees are to blame.",
    effects: [
      {
        plus: [],
        minus: ["Fire", "Animals"],
        attachTo: ["Animals"],
        ally: [],
        enemy: ["Trees"]
      }
    ]
  },
  {
    name: "A scientist's experiment goes wrong and erupts in flames, engulfing them and their animal subjects.",
    effects: [
      {
        plus: ["Fire"],
        minus: ["Scientists", "Animals"],
        attachTo: ["Fire"],
        ally: ["Scientists"],
        enemy: []
      }
    ]
  },
  {
    name: "Dwarves unearth a slumbering demon, trying to enslave it before it awakens. They enlist the help of scientists, promising to return the favor.",
    effects: [
      {
        condition: () => board["Dwarves"].value > 1 || board["Scientists"].value > 1,
        plus: ["Dwarves"],
        minus: [],
        attachTo: ["Dwarves"],
        ally: ["Scientists"],
        enemy: []
      },
      {
        plus: [],
        minus: ["Dwarves"],
        attachTo: ["Dwarves"],
        ally: ["Scientists"],
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
    name: "Druids and priests pray to to the Earth for a healthy harvest",
    effects: [
      {
        plus: ["Druids", "Priests", "Earth"],
        minus: [],
        attachTo: ["Druids", "Priests"],
        ally: [],
        enemy: ["Earth"]
      }
    ]
  },
  {
    name: "The earth has nightmares, causing earthquakes around the world",
    effects: [
      {
        plus: [],
        minus: ["Trees", "Dwarves"],
        attachTo: ["Trees", "Dwarves"],
        ally: [],
        enemy: ["Earth"]
      }
    ]
  },
  {
    name: "If dwarves dig deep enough, they'll upset the Earth's belly, and the fire god will see their time to strike, causing it to erupt in volcanoes.",
    effects: [
      {
        condition: () => board["Dwarves"].value > 1,
        plus: ["Fire"],
        minus: ["Trees", "Druids", "Scientists", "Animals", "Priests", "Philosophers", "Earth", "Wizards"],
        attachTo: ["Earth"],
        ally: [],
        enemy: ["Fire"]
      }
    ]
  },
  {
    name: "Philosophers devise a new form of city government, challenging existing power structures.",
    effects: [
      {
        plus: ["Philosophers"],
        minus: ["Scientists", "Priests"],
        attachTo: ["Scientists", "Priests"],
        ally: [],
        enemy: ["Philosophers"]
      }
    ]
  },
  {
    name: "Scientists' inventions make them extremely wealthy, letting them buy the city government",
    effects: [
      {
        plus: ["Scientists"],
        minus: ["Philosophers", "Priests"],
        attachTo: ["Philosophers", "Priests"],
        ally: [],
        enemy: ["Scientists"]
      }
    ]
  },
  {
    name: "Priests hold a coup with their many followers, taking control of the city government",
    effects: [
      {
        plus: ["Priests"],
        minus: ["Philosophers", "Scientists"],
        attachTo: ["Philosophers", "Scientists"],
        ally: [],
        enemy: ["Priests"]
      }
    ]
  },
  {
    name: "Druidic rituals empower the forest, causing it to expand into nearby territories, but use up all the water.",
    effects: [
      {
        plus: ["Trees"],
        minus: ["Water"],
        attachTo: ["Druids"],
        ally: ["Trees"],
        enemy: []
      },
      {
        condition: () => board["Trees"].value > 1,
        plus: [],
        minus: ["Scientists", "Priests", "Dwarves", "Wizards"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "Druids pray to the water god to douse fires and heal the forest with rain.",
    effects: [
      {
        condition: () => board["Druids"].value > 0 || board["Water"].value > 0,
        plus: ["Trees", "Water", "Druids"],
        minus: ["Fire"],
        attachTo: ["Water"],
        ally: ["Trees"],
        enemy: []
      }
    ]
  },
  {
    name: "Scientists develop a strange vaccine, seemingly saving the city and many wild animals.",
    effects: [
      {
        condition: () => Math.random() < 0.5,
        plus: ["Scientists", "Animals", "Priests", "Philosophers"],
        minus: [],
        attachTo: ["Scientists"],
        ally: ["Animals"],
        enemy: []
      },
      {
        plus: ["Scientists", "Scientists"],
        minus: ["Animals", "Priests", "Philosophers"],
        attachTo: ["Animals", "Priests", "Philosophers"],
        ally: [],
        enemy: ["Scientists"]
      }
    ]
  },
  {
    name: "Wizards summon a benign comet, causing the sky to light up with strange colors and mystical energy.",
    effects: [
      {
        plus: ["Wizards", "Druids", "Sky"],
        minus: [],
        attachTo: ["Sky"],
        ally: ["Wizards"],
        enemy: []
      }
    ]
  },
  {
    name: "A grand oak falls, causing the druids to mourn and the earth to tremble. Though in dire times, they find companionship. ",
    effects: [
      {
        plus: [],
        minus: ["Trees", "Earth", "Druids"],
        attachTo: ["Earth", "Druids"],
        ally: ["Druids", "Earth"],
        enemy: []
      }
    ]
  },
  {
    name: "Dragons hoard mystical artifacts, so wizards lay a plan. They decide to embolden the dwarves, teach them their magics, and see what happens...",
    effects: [
      {
        plus: ["Dragons"],
        minus: [],
        attachTo: ["Wizards"],
        ally: ["Dwarves"],
        enemy: []
      }
    ]
  },
  {
    name: "Wild animals form a pack and raid the city, driven by hunger and desperation.",
    effects: [
      {
        plus: ["Animals"],
        minus: ["Priests", "Philosophers", "Scientists"],
        attachTo: ["Priests", "Philosophers", "Scientists"],
        ally: [],
        enemy: ["Animals"]
      }
    ]
  },
  {
    name: "The sky god and the fire god clash, causing thunderstorms and wildfires.",
    effects: [
      {
        condition: () => board["Sky"].value > board["Fire"].value,
        plus: ["Sky"],
        minus: ["Fire", "Dragons"],
        attachTo: ["Fire"],
        ally: [],
        enemy: ["Sky"]
      },
      {
        condition: () => board["Fire"].value > board["Sky"].value,
        plus: ["Fire"],
        minus: ["Sky", "Trees"],
        attachTo: ["Sky"],
        ally: [],
        enemy: ["Fire"]
      },
      {
        plus: [],
        minus: ["Sky", "Fire"],
        attachTo: ["Sky", "Fire"],
        ally: [],
        enemy: ["Sky", "Fire"]
      }
    ]
  },
  {
    name: "Philosophers write a treatise on the interconnectedness of all mortal beings, influencing various societies.",
    effects: [
      {
        plus: ["Animals", "Druids", "Wizards", "Dwarves", "Dragons", "Trees", "Priests", "Scientists", "Philosophers"],
        minus: [],
        attachTo: ["Animals", "Priests"],
        ally: ["Animals", "Priests"],
        enemy: []
      }
    ]
  },
  {
    name: "Wizards open a portal to another dimension, unleashing strange creatures into the world under their control, upsetting the natural shepherds.",
    effects: [
      {
        plus: ["Wizards"],
        minus: [],
        attachTo: ["Wizards"],
        ally: [],
        enemy: ["Druids"]
      }
    ]
  },
  {
    name: "Druids and wizards collaborate to create a protective barrier around the forest.",
    effects: [
      {
        plus: ["Trees", "Animals", "Druids"],
        minus: [],
        attachTo: ["Druids"],
        ally: ["Wizards"],
        enemy: []
      }
    ]
  },
  {
    name: "The water god creates a new river, altering the landscape and the flow of trade.",
    effects: [
      {
        plus: ["Water", "Trees", "Animals", "Priests"],
        minus: ["Earth"],
        attachTo: ["Earth"],
        ally: [],
        enemy: ["Water"]
      }
    ]
  },
  {
    name: "Druids discover ancient texts in the forest, revealing secret knowledge about the gods previously exclusive to wizards. The more they read, the richer the soil gets.",
    effects: [
      {
        plus: ["Druids"],
        minus: ["Wizards"],
        attachTo: ["Druids"],
        ally: ["Earth"],
        enemy: []
      }
    ]
  },
  {
    name: "A druid conjures a magical storm to engulf the mountain, battering anyone in the sky",
    effects: [
      {
        condition: () => board["Wizards"].value > 1 && board["Dragons"].value > 0,
        plus: [],
        minus: ["Dragons", "Wizards"],
        attachTo: ["Dragons", "Wizards"],
        ally: [],
        enemy: ["Druids"]
      },
      {
        condition: () => board["Wizards"].value > 1,
        plus: [],
        minus: ["Wizards"],
        attachTo: ["Wizards"],
        ally: [],
        enemy: ["Druids"]
      },
      {
        condition: () => board["Dragons"].value > 0,
        plus: [],
        minus: ["Dragons"],
        attachTo: ["Dragons"],
        ally: [],
        enemy: ["Druids"]
      }
    ]
  },
  {
    name: "Dwarves uncover an ancient relic that can control dragons, attracting the attention of many",
    effects: [
      {
        plus: ["Dwarves"],
        minus: ["Dragons"],
        attachTo: ["Priests", "Wizards", "Druids"],
        ally: [],
        enemy: ["Dwarves"]
      }
    ]
  },
  {
    name: "Druids casts a spell for nice weather if they're strong enough",
    effects: [
      {
        condition: () => board["Druids"].value > 0,
        plus: ["Sky", "Druids"],
        minus: ["Fire", "Water"],
        attachTo: ["Druids"],
        ally: ["Sky"],
        enemy: []
      }
    ]
  },
  {
    name: "Philosophers and druids form an alliance to protect the forest from industrial expansion by the city.",
    effects: [
      {
        plus: ["Philosophers", "Druids"],
        minus: ["Scientists"],
        attachTo: ["Druids", "Philosophers"],
        ally: ["Trees"],
        enemy: []
      }
    ]
  },
  {
    name: "The water god’s rage causes the city to flood; only the priests can quell them ",
    effects: [
      {
        condition: () => board["Priests"].value < 1,
        plus: ["Water"],
        minus: ["Priests", "Philosophers", "Scientists"],
        attachTo: ["Priests"],
        ally: [],
        enemy: ["Water"]
      },
      {
        plus: [],
        minus: [],
        attachTo: ["Water"],
        ally: ["Priests"],
        enemy: []
      }
    ]
  },
  {
    name: "Dwarves, wizards, and dragons compete to harvest a rare magical ore, leading to conflict and sabotage.",
    effects: [
      {
        condition: () => board["Dwarves"].value > board["Wizards"].value && board["Dwarves"].value > board["Dragons"].value,
        plus: ["Dwarves", "Dwarves"],
        minus: [],
        attachTo: ["Dragons", "Wizards"],
        ally: [],
        enemy: ["Dwarves"]
      },
      {
        condition: () => board["Dragons"].value > board["Wizards"].value && board["Dragons"].value > board["Dwarves"].value,
        plus: ["Dragons", "Dragons"],
        minus: [],
        attachTo: ["Wizards", "Dwarves"],
        ally: [],
        enemy: ["Dragons"]
      },
      {
        condition: () => board["Wizards"].value > board["Dragons"].value && board["Wizards"].value > board["Dwarves"].value,
        plus: ["Wizards", "Wizards"],
        minus: [],
        attachTo: ["Dwarves", "Dragons"],
        ally: [],
        enemy: ["Wizards"]
      },
      {
        plus: [],
        minus: ["Dragons", "Wizards", "Dwarves"],
        attachTo: [],
        ally: [],
        enemy: []
      }
    ]
  },
  {
    name: "Scientists chop down oaks to fuel their machines. Propoganda turns the city against nature, animals and all.",
    effects: [
      {
        plus: ["Scientists"],
        minus: ["Trees"],
        attachTo: ["Scientists"],
        ally: [],
        enemy: ["Animals"]
      }
    ]
  },
  {
    name: "Wizards discover an ancient ritual binding them with dragons, granting them shared knowledge and power",
    effects: [
      {
        plus: ["Wizards", "Dragons"],
        minus: [],
        attachTo: ["Wizards", "Dragons"],
        ally: ["Wizards", "Dragons"],
        enemy: []
      }
    ]
  },
  {
    name: "Scientists create a new technology that saps the life of nearby groves. They lie and blame the wizards for this, which works.",
    effects: [
      {
        plus: ["Scientists"],
        minus: ["Trees", "Druids", "Animals"],
        attachTo: ["Druids", "Animals"],
        ally: [],
        enemy: ["Wizards"]
      }
    ]
  },
  {
    name: "Dragons share ancient wisdom with philosophers, enlightening them with the secrets of fire's destructive and creative forces.",
    effects: [
      {
        plus: ["Philosophers", "Fire"],
        minus: [],
        attachTo: ["Philosophers"],
        ally: ["Dragons"],
        enemy: []
      }
    ]
  },
  {
    name: "Priests and Wizards join forces in a powerful ritual, channeling the divine and arcane together, while curious creatures join.",
    effects: [
      {
        plus: ["Priests", "Wizards", "Animals"],
        minus: [],
        attachTo: ["Priests", "Wizards"],
        ally: ["Priests", "Wizards"],
        enemy: []
      }
    ]
  },
  {
    name: "Dragons, in pursuit of a hidden treasure, invade the forest, clashing with druids and their animal allies.",
    effects: [
      {
        plus: ["Dragons"],
        minus: ["Trees", "Druids", "Animals"],
        attachTo: ["Trees", "Druids", "Animals"],
        ally: [],
        enemy: ["Dragons"]
      }
    ]
  },
  {
    name: "Aggressive flooding robs the dens of dragons, causing untold riches to wash into the sea.",
    effects: [
      {
        plus: ["Water"],
        minus: ["Dragons"],
        attachTo: ["Dragons"],
        ally: [],
        enemy: ["Water"]
      }
    ]
  },
  {
    name: "In a desperate act, priests invoke the Earth to swollow the flames of the world whole, causing devastation but saving the priest's temples, and giving the Earth a taste for fire.",
    effects: [
      {
        plus: ["Priests", "Earth"],
        minus: ["Fire"],
        attachTo: ["Earth"],
        ally: [],
        enemy: ["Fire"]
      }
    ]
  },
  {
    name: "Wizards conduct a dangerous ritual to harness the power of the fire god, enhancing their spells with fiery potency.",
    effects: [
      {
        plus: ["Wizards", "Fire"],
        minus: [],
        attachTo: ["Wizards"],
        ally: ["Fire"],
        enemy: []
      }
    ]
  },
  {
    name: "Philosophers restore ancient, sacred groves, bringing new life to the earth.",
    effects: [
      {
        plus: ["Earth", "Trees"],
        minus: [],
        attachTo: ["Earth", "Trees"],
        ally: ["Philosophers"],
        enemy: []
      }
    ]
  },
  {
    name: "Dragons fly into the heart of a tempest, eating the raging elements of sky and fire.",
    effects: [
      {
        plus: ["Dragons"],
        minus: ["Sky", "Fire"],
        attachTo: ["Sky", "Fire"],
        ally: [],
        enemy: ["Dragons"]
      }
    ]
  },
  {
    name: "Priests assemble their congregation to clean the polluted waters, restoring balance to the seas.",
    effects: [
      {
        plus: ["Water"],
        minus: [],
        attachTo: ["Water"],
        ally: ["Priests"],
        enemy: []
      }
    ]
  },
  {
    name: "The earth churns in its sleep, uprooting trees and dwarven tunnels",
    effects: [
      {
        plus: [],
        minus: ["Dwarves", "Trees"],
        attachTo: ["Dwarves", "Trees"],
        ally: [],
        enemy: ["Earth"]
      }
    ]
  },
  {
    name: "A fierce battle erupts between wizards and dragons in the sky, scarring the ozone.",
    effects: [
      {
        plus: [],
        minus: ["Wizards", "Dragons", "Sky"],
        attachTo: ["Sky"],
        ally: [],
        enemy: ["Wizards"]
      }
    ]
  },
  {
    name: "Dwarves grow bold and venture out of the mountains, clearing vast swaths of forest and their druid protectors",
    effects: [
      {
        plus: ["Dwarves"],
        minus: ["Trees", "Druids"],
        attachTo: ["Trees", "Druids"],
        ally: [],
        enemy: ["Dwarves"]
      }
    ]
  },
  {
    name: "Priests chant down the fire god, protecting the forest from a consuming blaze.",
    effects: [
      {
        plus: ["Priests", "Trees"],
        minus: ["Fire"],
        attachTo: ["Fire"],
        ally: [],
        enemy: ["Priests"]
      }
    ]
  },
  {
    name: "Wizards create brews in the bellies of great oaks, fueling their spells with primal energy. The trees grow massive and wicked, skewering the wizards in time.",
    effects: [
      {
        plus: ["Wizards", "Trees"],
        minus: [],
        attachTo: ["Trees"],
        ally: [],
        enemy: ["Wizards"]
      }
    ]
  },
  {
    name: "The water god sends a deluge to punish the dwarves for their greed, flooding their mountain home. Wizards are caught in the crossfire.",
    effects: [
      {
        plus: ["Water"],
        minus: ["Dwarves", "Wizards"],
        attachTo: ["Dwarves"],
        ally: [],
        enemy: ["Water"]
      }
    ]
  },
  {
    name: "Philosophers and Scientists collaborate on a study of the stars, unlocking new knowledge and flattering the sky. ",
    effects: [
      {
        plus: ["Philosophers", "Scientists"],
        minus: [],
        attachTo: ["Sky"],
        ally: ["Scientists"],
        enemy: []
      }
    ]
  },
  {
    name: "After years of conflict, dwarves and dragons agree to a truce, carving up the mountain’s resources.",
    effects: [
      {
        plus: ["Dwarves", "Dragons"],
        minus: [],
        attachTo: ["Earth"],
        ally: [],
        enemy: ["Dwarves"]
      }
    ]
  },
  {
    name: "The fire and earth gods churn the planet's core, making hot and hard love",
    effects: [
      {
        plus: ["Fire", "Earth"],
        minus: [],
        attachTo: ["Earth"],
        ally: ["Fire"],
        enemy: []
      }
    ]
  },
  {
    name: "A torrential storm washes over the world, filling the rivers, lakes, and clouds. Many wizards' homes are washed away on the cliff sides.",
    effects: [
      {
        plus: ["Sky", "Water"],
        minus: ["Wizards"],
        attachTo: ["Water"],
        ally: ["Sky"],
        enemy: []
      }
    ]
  },
  {
    name: "Philosophers hold a grand debate on the ethics of using fire’s destructive power",
    effects: [
      {
        plus: ["Philosophers"],
        minus: ["Fire"],
        attachTo: ["Fire"],
        ally: [],
        enemy: ["Philosophers"]
      }
    ]
  },
  {
    name: "Wizards imbue wild animals with magical abilities, but they can't be controlled. For some reason the wizards keep doing it...",
    effects: [
      {
        plus: ["Animals"],
        minus: ["Wizards"],
        attachTo: ["Wizards"],
        ally: ["Animals"],
        enemy: []
      }
    ]
  },
  {
    name: "As a catastrophic storm approaches, philosophers sacrifice themselves to quell the sky's madness. But priests sabatoge the effort for their own gain, tricking the sky into seeing the sacrifice as an insult.",
    effects: [
      {
        plus: ["Priests"],
        minus: ["Sky", "Philosophers"],
        attachTo: ["Sky"],
        ally: [],
        enemy: ["Philosophers"]
      }
    ]
  },
  {
    name: "The mountain residents grow restless in the sweltering heat, curse the sun, and erupt in aimless violence",
    effects: [
      {
        plus: [],
        minus: ["Dragons", "Dwarves", "Wizards"],
        attachTo: ["Fire"],
        ally: [],
        enemy: ["Dragons"]
      }
    ]
  },
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
    },
    {
      name: "Orgy",
      plus: ["Earth", "Water", "Sky"],
      minus: ["Priests", ]
    },
    {
      name: "Control everything",
      plus: ["Priests", "Scientists", "Wizards"],
      minus: ["Animals", "Dragons", "Fire"]
    },
    {
      name: "Grow Nature",
      plus: ["Earth", "Animals", "Water", "Trees", "Druids"],
      minus: ["Fire"]
    },
    {
      name: "Screw the old ways",
      plus: ["Scientists"],
      minus: ["Dwarves", "Dragons", "Priests", "Animals"]
    },
    {
      name: "Clouds Cloud Minds",
      plus: [],
      minus: ["Sky", "Philosophers", "Scientists", "Wizards"]
    },
    {
      name: "Overpowering the weak",
      plus: ["Priests", "Dragons"],
      minus: ["Philosophers","Animals"]
    },
    {
      name: "Be Free",
      plus: ["Philosophers", "Animals"],
      minus: ["Dwarves", "Priests"]
    },
    {
      name: "Down with hippies and their friends",
      plus: [],
      minus: ["Philosophers", "Animals", "Druids", "Trees"]
    },
    {
      name: "New Creatures",
      plus: ["Animals", "Wizards", "Scientists", "Druids"],
      minus: []
    },
    {
      name: "Dull Darkness",
      plus: ["Dwarves",],
      minus: ["Sky", "Wizards", "Fire"]
    },
    {
      name: "Old tall ones grow as their friends and distant foes fall",
      plus: ["Trees"],
      minus: ["Wizards", "Dwarves", "Earth", "Druids"]
    },
    {
      name: "The hard are chipped by a gnawing, swinging world",
      plus: ["Sky", "Animals", "Dwarves"],
      minus: ["Dragons", "Trees"]
    },
    {
      name: "Steamy beacors threaten the divine and arcane ",
      plus: ["Scientists", "Fire", "Water"],
      minus: ["Wizards", "Priests"]
    },
    {
      name: "Fly into me, away from the core",
      plus: ["Dragons", "Wizards", "Sky"],
      minus: ["Fire", "Earth"]
    },
    {
      name: "The squishy and fluid lose to the hard and hardened",
      plus: ["Dwarves", "Dragons", "Earth"],
      minus: ["Druids", "Water"]
    },
    {
      name: "All those moral beings can shove it, I'm going to grow you unnatural",
      plus: ["Wizards", "Trees"],
      minus: ["Druids", "Priests", "Philosophers"]
    },
    {
      name: "After lots of (great) debate and chaos, two godly parents consume their child flower child",
      plus: ["Wizards", "Philosophers", "Water", "Earth"],
      minus: ["Trees"]
    },
    {
      name: "The city interferes with a world-wide ritual by powerful beings, coming out on top and striking them down ",
      plus: ["Priests", "Philosophers"],
      minus: ["Dragons", "Druids", "Sky"]
    },
    {
      name: "DONT GIVE ME A SPEACH; DIE!",
      plus: ["Wizards", "Fire"],
      minus: ["Priests", "Philosophers"]
    },
    {
      name: "The small triumph over the holier than though",
      plus: ["Dwarves", "Animals"],
      minus: ["Sky", "Priests"]
    },
    {
      name: "Lovers day and night, forever. At the cost of wild and calm creators",
      plus: ["Sky", "Earth"],
      minus: ["Wizards", "Dwarves", "Fire", "Scientists"]
    },
    {
      name: "Run along the ground, wild and free, or fly across the heavens with untold powers. As long as you're not wet",
      plus: ["Wizards", "Sky", "Earth", "Animals"],
      minus: ["Water"]
    },
    {
      name: "Just a boy in a sandbox vs ancient ungodly beings, and winning",
      plus: ["Scientists", "Earth"],
      minus: ["Dragons", "Dwarves", "Druids"]
    },
    {
      name: "My flock cannot be tamed. We rule the land. Cower low, stand to be burned, and no chanting or praying can help.",
      plus: ["Dragons"],
      minus: ["Dwarves", "Trees", "Priests"]
    },
    {
      name: "pray to the wet claws, discard the dirt ",
      plus: ["Water", "Dragons", "Animals", "Priests"],
      minus: ["Earth"]
    },
    {
      name: "We pray that the clouds dry up and wither, that picks and thoughts grow dull, yet we stay strong",
      plus: ["Priests"],
      minus: ["Water", "Dwarves", "Sky", "Philosophers"]
    },
    {
      name: "lab or wild, the rats go thirsty, but they teach us about meaning of life",
      plus: ["Philosophers"],
      minus: ["Animals", "Water", "Scientists"]
    },
    {
      name: "Mind and breath grow, spastic beings stumble, just live naturally",
      plus: ["Philosophers", "Dragons", "Druids"],
      minus: ["Animals", "Wizards"]
    },
    {
      name: "you were supposed to protect them you selfish magic hobo",
      plus: ["Druids"],
      minus: ["Earth", "Animals", "Trees"]
    },
    {
      name: "Sun temples, ruined theses, and heavenly crying",
      plus: ["Fire", "Priests"],
      minus: ["Scientists", "Sky", "Philosophers"]
    },
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
    // Non-conditional effects will always resolve and try to continue to the next effect
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
    score += goal.special()
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
