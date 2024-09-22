import type { Goal, Entity, BoardEntity } from './game';

export const goals: Goal[] = [
  {
    name: "Mists and Dew",
    plus: ["Druids", "Water", "Sky", "Trees"],
    minus: ["Fire"],
    specialEntity: "Dripping Temple"
  },
  {
    name: "Forges Forge Forward",
    plus: ["Fire", "Dwarves", "Dragons", "Scientists"],
    minus: ["Water"],
    specialEntity: "Sun Spirits"
  },
  {
    name: "They're too powerful, they must be stopped",
    plus: [],
    minus: ["Wizards", "Dragons", "Water", "Fire", "Earth", "Sky"],
    specialEntity: "Humanity's Secret Weapon"
  },
  {
    name: "Get High (Physically)",
    plus: ["Sky", "Trees", "Scientists", "Dragons"],
    minus: [],
    specialEntity: "Invasive Plateaus"
  },
  {
    name: "Buldoze and level the land",
    plus: [],
    minus: ["Trees", "Druids", "Scientists", "Earth"],
    specialEntity: "Invasive Plateaus"
  },
  {
    name: "Maintain the status quo",
    plus: [],
    minus: [],
    special: (board:Record<Entity, BoardEntity>) => {
      let total = 0
      for (const entity of Object.values(board)) {
        if (entity.value > 0) total -= entity.value
        else if (entity.value < 0) total += entity.value
        else total += 6
      }
      return total
    },
    specialEntity: "Armed Guards"
  },
  {
    name: "Extreme Differences",
    plus: [],
    minus: [],
    special: (board:Record<Entity, BoardEntity>) => {
      let highest = 0
      let lowest = 0
      for (const entity of Object.values(board)) {
        if (entity.value > highest) highest = entity.value
        if (entity.value < lowest) lowest = entity.value
      }
      return (highest - lowest)/2
    },
    specialEntity: "Devout Cultists"
  },
  {
    name: "Make everyone miserable",
    plus: [],
    minus: ["Druids", "Wizards", "Priests", "Scientists", "Dwarves", "Trees", "Fire", "Water", "Philosophers", "Earth", "Sky", "Animals", "Dragons"],
    specialEntity: "Friendship Ban"
  },
  {
    name: "Make everyone happy",
    plus: ["Druids", "Wizards", "Priests", "Scientists", "Dwarves", "Trees", "Fire", "Water", "Philosophers", "Earth", "Sky", "Animals", "Dragons"],
    minus: [],
    specialEntity: "Ecstacy Crystals"
  },
  {
    name: "Revive a forgotten God",
    plus: ["Druids", "Wizards", "Priests", "Scientists", "Dwarves"],
    minus: [],
    specialEntity: "Devout Cultists"
  },
  {
    name: "Boil the soil and those that hide",
    plus: ["Water", "Fire"],
    minus: ["Dwarves", "Trees", "Earth"],
    specialEntity: "Erosive Liquid"
  },
  {
    name: "Live simply, live slow",
    plus: ["Philosophers", "Earth", "Trees", "Dwarves"],
    minus: ["Scientists", "Fire", "Dragons"],
    specialEntity: "Dripping Temple"
  },
  {
    name: "Silence is golden",
    plus: ["Trees", "Druids", "Philosophers"],
    minus: ["Priests", "Scientists"],
    specialEntity: "Scientific Silence"
  },
  {
    name: "Unrestrained Flames",
    plus: ["Fire"],
    minus: ["Water", "Druids", "Trees"],
    specialEntity: "Sun Spirits"
  },
  {
    name: "All-powerful Orgy",
    plus: ["Earth", "Water", "Sky"],
    minus: ["Priests", ],
    specialEntity: "Ecstacy Crystals"
  },
  {
    name: "Control everything",
    plus: ["Priests", "Scientists", "Wizards"],
    minus: ["Animals", "Dragons", "Fire"],
    specialEntity: "Armed Guards"
  },
  {
    name: "Grow Nature",
    plus: ["Earth", "Animals", "Water", "Trees", "Druids"],
    minus: ["Fire"],
    specialEntity: "Deep Roots"
  },
  {
    name: "Screw the old ways",
    plus: ["Scientists"],
    minus: ["Dwarves", "Dragons", "Priests", "Animals"],
    specialEntity: "Rebels"
  },
  {
    name: "Clouds Cloud Minds",
    plus: [],
    minus: ["Sky", "Philosophers", "Scientists", "Wizards"],
    specialEntity: "Shadow Beings"
  },
  {
    name: "Overpowering the weak",
    plus: ["Priests", "Dragons"],
    minus: ["Philosophers","Animals"],
    specialEntity: "Inconsiderate Monarchy"
  },
  {
    name: "Be Free",
    plus: ["Philosophers", "Animals"],
    minus: ["Dwarves", "Priests"],
    specialEntity: "Living Wind"
  },
  {
    name: "Down with hippies and their friends",
    plus: [],
    minus: ["Philosophers", "Animals", "Druids", "Trees"],
    specialEntity: "Friendship Ban"
  },
  {
    name: "New Creatures",
    plus: ["Animals", "Wizards", "Scientists", "Druids"],
    minus: [],
    specialEntity: "Living Crystals"
  },
  {
    name: "Dull Darkness",
    plus: ["Dwarves",],
    minus: ["Sky", "Wizards", "Fire"],
    specialEntity: "Shadow Beings"
  },
  {
    name: "Old tall ones grow as their friends and distant foes fall",
    plus: ["Trees"],
    minus: ["Wizards", "Dwarves", "Earth", "Druids"],
    specialEntity: "Deep Roots"
  },
  {
    name: "The hard are chipped by a gnawing, swinging world and wild wind",
    plus: ["Sky", "Animals", "Dwarves"],
    minus: ["Dragons", "Trees"],
    specialEntity: "Living Wind"
  },
  {
    name: "Steamy beakers threaten the arcane",
    plus: ["Scientists", "Fire", "Water"],
    minus: ["Wizards", "Priests"],
    specialEntity: "Scientific Silence"
  },
  {
    name: "Fly into me, away from the core",
    plus: ["Dragons", "Wizards", "Sky"],
    minus: ["Fire", "Earth"],
    specialEntity: "Wings For All"
  },
  {
    name: "The squishy and fluid lose to the hard and hardened",
    plus: ["Dwarves", "Dragons", "Earth"],
    minus: ["Druids", "Water"],
    specialEntity: "Living Crystals"
  },
  {
    name: "All those moral beings can shove it, I'm going to grow you unnatural",
    plus: ["Wizards", "Trees"],
    minus: ["Druids", "Priests", "Philosophers"],
    specialEntity: "Rebels"
  },
  {
    name: "After lots of (great) debate and chaos, two godly parents consume their child flower child",
    plus: ["Wizards", "Philosophers", "Water", "Earth"],
    minus: ["Trees"],
    specialEntity: "Star Wedding"
  },
  {
    name: "The city interferes with a world-wide ritual by powerful beings, coming out on top and striking them down ",
    plus: ["Priests", "Philosophers"],
    minus: ["Dragons", "Druids", "Sky"],
    specialEntity: "Humanity's Secret Weapon"
  },
  {
    name: "DONT GIVE ME A SPEACH; DIE!",
    plus: ["Wizards", "Fire"],
    minus: ["Priests", "Philosophers"],
    specialEntity: "Ruin and Destruction"
  },
  {
    name: "The small triumph over the holier than though",
    plus: ["Dwarves", "Animals"],
    minus: ["Sky", "Priests"],
    specialEntity: "Miniature Kingdom"
  },
  {
    name: "Lovers day and night, forever. At the cost of wild and calm creators suffering",
    plus: ["Sky", "Earth"],
    minus: ["Wizards", "Dwarves", "Fire", "Scientists"],
    specialEntity: "Star Wedding"
  },
  {
    name: "Run along the ground, wild and free, or fly across the heavens with untold powers. As long as you're not wet",
    plus: ["Wizards", "Sky", "Earth", "Animals"],
    minus: ["Water"],
    specialEntity: "Wings For All"
  },
  {
    name: "Just a boy in a sandbox vs ancient ungodly beings, and winning",
    plus: ["Scientists", "Earth"],
    minus: ["Dragons", "Dwarves", "Druids"],
    specialEntity: "Miniature Kingdom"
  },
  {
    name: "My flock cannot be tamed. We rule the land. Cower low, stand to be burned, and no chanting or praying can help.",
    plus: ["Dragons"],
    minus: ["Dwarves", "Trees", "Priests"],
    specialEntity: "Ruin and Destruction"
  },
  {
    name: "Pray to the wet claws, discard the dirt ",
    plus: ["Water", "Dragons", "Animals", "Priests"],
    minus: ["Earth"],
    specialEntity: "Erosive Liquid"
  },
  {
    name: "We pray that the clouds dry up and wither, that picks and thoughts grow dull, yet we stay strong",
    plus: ["Priests"],
    minus: ["Water", "Dwarves", "Sky", "Philosophers"],
    specialEntity: "Inconsiderate Monarchy"
  },
  {
    name: "Lab or wild, the rats go thirsty, but they teach us about meaning of life",
    plus: ["Philosophers"],
    minus: ["Animals", "Water", "Scientists"],
    specialEntity: "Sad Scholars"
  },
  {
    name: "Mind and breath grow, spastic beings stumble, just live naturally",
    plus: ["Philosophers", "Dragons", "Druids"],
    minus: ["Animals", "Wizards"],
    specialEntity: "Drunk Animals"
  },
  {
    name: "You were supposed to protect them you selfish magic hobo",
    plus: ["Druids"],
    minus: ["Earth", "Animals", "Trees"],
    specialEntity: "Drunk Animals"
  },
  {
    name: "Sun temples, ruined theses, and heavenly crying",
    plus: ["Fire", "Priests"],
    minus: ["Scientists", "Sky", "Philosophers"],
    specialEntity: "Sad Scholars"
  },
]