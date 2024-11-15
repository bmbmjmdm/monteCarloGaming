import type { GameEvent, BoardEntity, Entity } from "./game";

/*
Once I have the first 30 with allies & enemies and affecting 2-3 on average (currently affecting 2), I can testplay with the first 30 cards. It'll be unbalanced but thats also kinda what can happen with the deck anyway. But itll be usable for testing


TODO also i should change the ai for playing the game to have a random amount of info on each event: from 25% of the effects known when making the decision (plus, minus, ally, enemy) to 100%. This would be a more representative model
TODO make the output of running things be in markdown format so i can decipher it easier
- make a little factory for it that you feed in the titles of the sections, etc

get rid of random selectors (random 1 of 3 hitting city, random 1 of 2 for alliance, etc)
each event should affected 2-3 entities
Turn some druids against trees they are way unabalanced
also animals against trees

This is the distribution for all 88ish events
We will focus on the first 30, acknowledging that we'll be throwing the "total score" out of balance due to plus/minus ally/enemy changes,
but instead we'll focus on improving the synergies for now 

=============================
Priests:
  Plus: 12.2
  Minus: 9.5
  Ally: 3.4
  Enemy: 8
  BestSynergy: Philosophers = 4.2
  WorstSynergy: Fire = -2.3
  MostSynergy: Scientists = 13.2
  LeastSynergy: Trees = 2.5
  AttachTo: 6.7
  Total Score: -1.9
=============================
Wizards:
  Plus: 7.8
  Minus: 9.1
  Ally: 4.5
  Enemy: 4.6
  BestSynergy: Dwarves = 3
  WorstSynergy: Water = -2
  MostSynergy: Animals = 7.5
  LeastSynergy: Fire = 1.5
  AttachTo: 5.6
  Total Score: -1.5
=============================
Water:
  Plus: 12
  Minus: 10.5
  Ally: 3.9
  Enemy: 6.5
  BestSynergy: Earth = 3.8
  WorstSynergy: Wizards = -2
  MostSynergy: Earth = 7.8
  LeastSynergy: Dragons = 1
  AttachTo: 8.6
  Total Score: -1.1
=============================
Trees:
  Plus: 10.3
  Minus: 11.8
  Ally: 4.5
  Enemy: 4
  BestSynergy: Druids = 7
  WorstSynergy: Fire = -2.5
  MostSynergy: Druids = 11
  LeastSynergy: Sky = 2.3
  AttachTo: 7
  Total Score: -1
=============================
Druids:
  Plus: 9
  Minus: 7
  Ally: 2.5
  Enemy: 4.9
  BestSynergy: Trees = 7
  WorstSynergy: Fire = -3
  MostSynergy: Trees = 11
  LeastSynergy: Philosophers = 2.5
  AttachTo: 7.5
  Total Score: -0.4
=============================
Dragons:
  Plus: 7.5
  Minus: 6.3
  Ally: 4
  Enemy: 5.3
  BestSynergy: Priests = 3
  WorstSynergy: Water = -1
  MostSynergy: Wizards = 5
  LeastSynergy: Water = 1
  AttachTo: 3.7
  Total Score: 0
=============================
Animals:
  Plus: 9.5
  Minus: 9.5
  Ally: 4
  Enemy: 4
  BestSynergy: Trees = 5.5
  WorstSynergy: Fire = -2
  MostSynergy: Trees = 9.5
  LeastSynergy: Sky = 1
  AttachTo: 5.7
  Total Score: 0
=============================
Scientists:
  Plus: 12.2
  Minus: 11
  Ally: 4
  Enemy: 5
  BestSynergy: Philosophers = 3.7
  WorstSynergy: Fire = -0.8
  MostSynergy: Philosophers = 13.7
  LeastSynergy: Dragons = 2
  AttachTo: 7
  Total Score: 0.2
=============================
Dwarves:
  Plus: 10
  Minus: 7.6
  Ally: 3
  Enemy: 5
  BestSynergy: Wizards = 3
  WorstSynergy: Water = -1
  MostSynergy: Earth = 7.5
  LeastSynergy: Water = 1
  AttachTo: 7.2
  Total Score: 0.4
=============================
Philosophers:
  Plus: 10.7
  Minus: 8.3
  Ally: 2.8
  Enemy: 4
  BestSynergy: Trees = 4.5
  WorstSynergy: Fire = -1.8
  MostSynergy: Scientists = 13.7
  LeastSynergy: Earth = 1.5
  AttachTo: 4.2
  Total Score: 1.2
=============================
Earth:
  Plus: 8.1
  Minus: 6.8
  Ally: 5.9
  Enemy: 6
  BestSynergy: Water = 3.8
  WorstSynergy: Sky = -1
  MostSynergy: Water = 7.8
  LeastSynergy: Wizards = 1.5
  AttachTo: 10.5
  Total Score: 1.3
=============================
Fire:
  Plus: 10.8
  Minus: 10.8
  Ally: 6
  Enemy: 4.4
  BestSynergy: Earth = 0.5
  WorstSynergy: Druids = -3
  MostSynergy: Sky = 7.8
  LeastSynergy: Wizards = 1.5
  AttachTo: 8.6
  Total Score: 1.6
=============================
Sky:
  Plus: 8.8
  Minus: 7.3
  Ally: 7
  Enemy: 4.9
  BestSynergy: Scientists = 1.3
  WorstSynergy: Trees = -1.7
  MostSynergy: Fire = 7.8
  LeastSynergy: Animals = 1
  AttachTo: 9.7
  Total Score: 3.7
=============================
*/

export const events:GameEvent[] = [
  {
    name: "When priests try to steal a baby dragon for their ritual, the plan goes awry and a battle ensues. Long after the priests leave, dragons lash out by fiesting on any animal in sight, trusting their babies deep within caves and earth's embrace.",
    effects: [
      {
        plus: [],
        minus: ["Dragons", "Priests"],
        attachTo: ["Dragons"],
        ally: ["Earth"],
        enemy: ["Animals"],
        relationship: "Caves and Craves"
      },
    ]
  },
  {
    name: "The fire god is betrayed by dwarves, but when they find comfort in the bellies of dragons, the flames grow stronger than ever.",
    effects: [
      {
        plus: ["Fire"],
        minus: [],
        attachTo: ["Fire"],
        ally: ["Dragons"],
        enemy: ["Dwarves"],
        relationship: "Warm Belly"
      }
    ]
  },
  {
    name: "Druids broker an alliance with dragons. The earth god pleads for their druidic worshipers to reconsider, but this only infuriates the dragons.",
    effects: [
      {
        plus: ["Druids", "Dragons"],
        minus: [],
        attachTo: ["Dragons"],
        ally: ["Druids"],
        enemy: ["Earth"],
        relationship: "Alliance"
      }
    ]
  },
  {
    name: "Dragons launch an attack on the city, scorching its engineering marvels to ash. Those engineers convert to worshiping the water god.",
    effects: [
      {
        plus: ["Dragons"],
        minus: ["Scientists"],
        attachTo: ["Scientists"],
        ally: ["Water"],
        enemy: ["Dragons"],
        relationship: "Burnt Wonders"
      }
    ]
  },
  {
    name: "The fire god fills dwarven forges. When the sky fills with dark clouds and ill omens, the dwarves take the sky's warning as a threat.",
    effects: [
      {
        plus: ["Fire", "Dwarves"],
        minus: [],
        attachTo: ["Dwarves"],
        ally: ["Fire"],
        enemy: ["Sky"],
        relationship: "Godly Forge"
      }
    ]
  },
  {
    name: "Scientists showcase experiments discredeting the church. Priests pray to the sky for a sign.",
    effects: [
      {
        plus: ["Scientists", "Sky"],
        minus: ["Priests"],
        attachTo: ["Priests"],
        ally: ["Sky"],
        enemy: ["Scientists"],
        specialEntity: "Scientific Silence",
        relationship: "Threats to Faith"
      }
    ]
  },
  {
    name: "The sky weeps, filling the sea. When the sea goes searching for who hurt them, a lone island is found in the shape of a crude gesture.",
    effects: [
      {
        plus: ["Water"],
        minus: ["Sky"],
        attachTo: ["Water"],
        ally: ["Sky"],
        enemy: ["Earth"],
        specialEntity: "Erosive Liquid",
        relationship: "Sea of Tears"
      }
    ]
  },
  {
    name: "Scientists capture wild animals to use for experiments. As the behavior continues, the sky begins sending them omens to warn when the humans are coming.",
    effects: [
      {
        plus: ["Scientists"],
        minus: ["Animals"],
        attachTo: ["Animals"],
        ally: ["Sky"],
        enemy: ["Scientists"],
        relationship: "Fearful Subjects"
      }
    ]
  },
  {
    name: "During winter solstice, empowered druids call forth the cold, freezing lakes and kindling. An alliance of steam is formed.",
    effects: [
      {
        plus: ["Druids"],
        minus: ["Water", "Fire"],
        attachTo: ["Water"],
        ally: ["Fire"],
        enemy: ["Druids"],
        relationship: "Frostbite"
      },

    ]
  },
  {
    name: "Priests burn heretical philosophy books. Wizards offer to help restore them, befriending the scholars.",
    effects: [
      {
        plus: ["Fire"],
        minus: ["Philosophers"],
        attachTo: ["Philosophers"],
        ally: ["Wizards"],
        enemy: ["Priests"],
        specialEntity: "Sad Scholars",
        relationship: "Burnt Books"
      }
    ]
  },
  {
    name: "The water god swallows ships, eating their treasure. Priests pray to the sky.",
    effects: [
      {
        plus: ["Water"],
        minus: ["Priests"],
        attachTo: ["Priests"],
        ally: ["Sky"],
        enemy: ["Water"],
        relationship: "Stolen Treasure"
      }
    ]
  },
  {
    name: "Wizards create spectral animals to play and mate with the wild ones. Soon, the animals start hanging around the wizards instead of the forest.",
    effects: [
      {
        plus: ["Wizards", "Animals"],
        minus: [],
        attachTo: ["Animals"],
        ally: ["Wizards"],
        enemy: ["Trees"],
        specialEntity: "Shadow Beings",
        relationship: "Spectral Friends"
      }
    ]
  },
  {
    name: "A philosopher and a grand oak contemplate the meaning of life. Druids keep interrupting.",
    effects: [
      {
        plus: ["Philosophers", "Trees"],
        minus: [],
        attachTo: ["Trees"],
        ally: ["Philosophers"],
        enemy: ["Druids"],
        relationship: "Brainstorm"
      }
    ]
  },
  {
    name: "Fresh fire fills city machinery, churning out new technology. The temple finds their members straying.",
    effects: [
      {
        plus: ["Fire", "Scientists"],
        minus: [],
        attachTo: ["Scientists"],
        ally: ["Fire"],
        enemy: ["Priests"],
        specialEntity: "Humanity's Secret Weapon",
        relationship: "Running Hot"
      }
    ]
  },
  {
    name: "Priests plunder gold from Dwarven caves. The small folk pray to the mountain.",
    effects: [
      {
        plus: ["Priests"],
        minus: ["Dwarves"],
        attachTo: ["Dwarves"],
        ally: ["Earth"],
        enemy: ["Priests"],
        specialEntity: "Inconsiderate Monarchy",
        relationship: "Stolen Treasure"
      }
    ]
  },
  {
    name: "Solar flares stoke many flames, disrupt electronics. The nerds plot their revenge... and pet their companions.",
    effects: [
      {
        plus: ["Fire"],
        minus: ["Scientists"],
        attachTo: ["Scientists"],
        ally: ["Animals"],
        enemy: ["Fire"],
        specialEntity: "Sun Spirits",
        relationship: "Fried Circuits"
      }
    ]
  },
  {
    name: "Philosophers question the speed of scientific advancement. As their labs are shut down, researchers pray to the almighty ground.",
    effects: [
      {
        plus: ["Philosophers"],
        minus: ["Scientists"],
        attachTo: ["Scientists"],
        ally: ["Earth"],
        enemy: ["Philosophers"],
        specialEntity: "Rebels",
        relationship: "Strict Regulation"
      }
    ]
  },
  {
    name: "A solar eclipse weakens the fire god, frightens animals. They're not so bright, so they think the trees are to blame. And they pray to the god-like beasts flying across the sky...",
    effects: [
      {
        plus: [],
        minus: ["Fire", "Animals"],
        attachTo: ["Animals"],
        ally: ["Dragons"],
        enemy: ["Trees"],
        specialEntity: "Shadow Beings",
        relationship: "Standing Menacingly"
      }
    ]
  },
  {
    name: "The earth has nightmares, causing earthquakes throughout the forest and mountain. At least the trees can thank the sun for not igniting them.",
    effects: [
      {
        plus: [],
        minus: ["Trees", "Dwarves"],
        attachTo: ["Trees"],
        ally: ["Fire"],
        enemy: ["Earth"],
        specialEntity: "Invasive Plateaus",
        relationship: "Unstable Ground"
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
        enemy: ["Dragons"],
        specialEntity: "Living Crystals",
        relationship: "Magic Plotting"
      }
    ]
  },
  {
    name: "Wizards open a portal to another dimension, unleashing strange creatures into the world under their control, tormenting the natural shepherds. Though the plantlife seems seems to enjoy them.",
    effects: [
      {
        plus: ["Wizards"],
        minus: [],
        attachTo: ["Wizards"],
        ally: ["Trees"],
        enemy: ["Druids"],
        specialEntity: "Living Crystals",
        relationship: "Unnatural Beings"
      }
    ]
  },
  {
    name: "Druids and wizards collaborate to create a protective barrier around the forest, though it drains some waterfalls the druids rely on.",
    effects: [
      {
        plus: ["Trees", "Animals"],
        minus: [],
        attachTo: ["Druids"],
        ally: ["Wizards"],
        enemy: ["Water"],
        relationship: "Defenders of Nature"
      }
    ]
  },
  {
    name: "The water god creates a new river, scarring the landscape, but creating new watering holes and flows of trade, influence. The dwarves promise to patch it up.",
    effects: [
      {
        plus: ["Water", "Animals", "Priests"],
        minus: ["Earth"],
        attachTo: ["Earth"],
        ally: ["Dwarves"],
        enemy: ["Water"],
        specialEntity: "Dripping Temple",
        relationship: "Scarred Landscape"
      }
    ]
  },
  {
    name: "Druids discover ancient texts in the forest, revealing secret knowledge about the gods previously exclusive to wizards. The more they read, the richer the soil gets, but the fewer trees grow...",
    effects: [
      {
        plus: ["Druids"],
        minus: ["Wizards"],
        attachTo: ["Druids"],
        ally: ["Earth"],
        enemy: ["Trees"],
        specialEntity: "Devout Cultists",
        relationship: "Ancient Texts"
      }
    ]
  },
  {
    name: "Dwarves uncover an ancient relic that can control dragons. The sky god courts them for favor, but the relic emits unholy energy that keeps animals awake at night.",
    effects: [
      {
        plus: ["Dwarves"],
        minus: ["Dragons"],
        attachTo: ["Dwarves"],
        ally: ["Sky"],
        enemy: ["Animals"],
        specialEntity: "Armed Guards",
        relationship: "Relic Lust"
      }
    ]
  },
  {
    name: "Scientists chop down oaks to fuel their machines. They even trick Druids into helping them, paying them handsomely.",
    effects: [
      {
        plus: ["Scientists"],
        minus: ["Trees"],
        attachTo: ["Scientists"],
        ally: ["Druids"],
        enemy: ["Trees"],
        relationship: "Dominate Nature"
      }
    ]
  },
  {
    name: "Some dragons give reperations to the forest and its creatures, attracting praise from priests and dismay from wizards.",
    effects: [
      {
        plus: ["Trees", "Animals"],
        minus: [],
        attachTo: ["Priests"],
        ally: ["Dragons"],
        enemy: ["Wizards"],
        specialEntity: "Wings For All",
        relationship: "Reperations"
      }
    ]
  },
  {
    name: "Dragons share ancient wisdom with philosophers, enlightening them with the secrets of fire's destructive and creative forces. The water god is none too pleased.",
    effects: [
      {
        plus: ["Philosophers", "Fire"],
        minus: [],
        attachTo: ["Philosophers"],
        ally: ["Dragons"],
        enemy: ["Water"],
        relationship: "Fiery Favors"
      }
    ]
  },
  {
    name: "Aggressive flooding robs the dens of dragons, causing untold riches to wash into the sea. Dragons aid the growing of trees to act as a barrier.",
    effects: [
      {
        plus: ["Water"],
        minus: ["Dragons"],
        attachTo: ["Dragons"],
        ally: ["Trees"],
        enemy: ["Water"],
        relationship: "Stolen Treasure"
      }
    ]
  },
  {
    name: "Wizards conduct a dangerous ritual with the blood of innocent animals, enhancing their spells with fiery potential.",
    effects: [
      {
        plus: ["Wizards", "Fire"],
        minus: ["Animals"],
        attachTo: ["Wizards"],
        ally: ["Fire"],
        enemy: ["Animals"],
        specialEntity: "Sun Spirits",
        relationship: "Blood Worship"
      }
    ]
  },


  /* ==== 30 above ==== */




  {
    name: "Philosophers write a treatise on the interconnectedness of all mortal beings, influencing various societies.",
    effects: [
      {
        plus: ["Animals", "Druids", "Wizards", "Dwarves", "Dragons", "Trees", "Priests", "Scientists", "Philosophers"],
        minus: [],
        attachTo: ["Animals", "Priests"],
        ally: ["Animals", "Priests"],
        enemy: [],
        specialEntity: "Ecstacy Crystals",
        relationship: "Mortal Love"
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
        enemy: ["Fire"],
        specialEntity: "Invasive Plateaus",
        relationship: "Taste for Fire"
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
        enemy: [],
        specialEntity: "Deep Roots",
        relationship: "Caretakers"
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
        enemy: [],
        specialEntity: "Dripping Temple",
        relationship: "Caretakers"
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
        enemy: ["Earth"],
        relationship: "Unstable Ground"
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
        enemy: ["Wizards"],
        specialEntity: "Drunk Animals",
        relationship: "Betraying Brews"
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
        enemy: [],
        specialEntity: "Scientific Silence",
        relationship: "Flattering Research"
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
        enemy: ["Dwarves"],
        specialEntity: "Miniature Kingdom",
        relationship: "Scarred Landscape"
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
        enemy: [],
        specialEntity: "Ecstacy Crystals",
        relationship: "Lovers"
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
        enemy: ["Philosophers"],
        relationship: "Heretics"
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
        enemy: [],
        specialEntity: "Miniature Kingdom",
        relationship: "Curiosity Conjured the Cat"
      }
    ]
  },




// === 3+ entity events === //
  
  
  
    
  {
    name: "As a catastrophic storm approaches, philosophers sacrifice themselves to quell the sky's madness. But priests sabatoge the effort for their own gain, tricking the sky into seeing the sacrifice as an insult.",
    effects: [
      {
        plus: ["Priests"],
        minus: ["Sky", "Philosophers"],
        attachTo: ["Sky"],
        ally: [],
        enemy: ["Philosophers"],
        relationship: "Accidental Heretics"
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
        enemy: ["Dragons"],
        relationship: "Heretics"
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
        enemy: [],
        relationship: "Quenching Storms"
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
        enemy: ["Water"],
        relationship: "Home Wrecker"
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
        enemy: ["Wizards"],
        relationship: "Scarred Skyscape"
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
        enemy: ["Dwarves"],
        specialEntity: "Ruin and Destruction",
        relationship: "Bloody Invaders"
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
        enemy: ["Priests"],
        relationship: "Heretics"
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
        enemy: ["Dragons"],
        relationship: "God Slayer"
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
        enemy: [],
        specialEntity: "Humanity's Secret Weapon",
        relationship: "Grand Ritual"
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
        enemy: ["Dragons"],
        relationship: "Bloody Invaders"
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
        enemy: ["Wizards"],
        relationship: "Misguided Grievance"
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
        enemy: [],
        relationship: "Defenders of Nature"
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
        enemy: ["Animals"],
        specialEntity: "Rebels",
        relationship: "Culling and Control"
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
        enemy: [],
        specialEntity: "Living Wind",
        relationship: "Comet Gift"
      }
    ]
  },
  {
    name: "A grand oak falls, causing the druids to mourn and the earth to tremble. Though in dire times, they find companionship.",
    effects: [
      {
        plus: [],
        minus: ["Trees", "Earth", "Druids"],
        attachTo: ["Earth", "Druids"],
        ally: ["Druids", "Earth"],
        enemy: [],
        relationship: "Grief and Growth"
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
        enemy: ["Philosophers"],
        relationship: "Democracy"
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
        enemy: ["Scientists"],
        relationship: "Plutocracy"
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
        enemy: ["Priests"],
        specialEntity: "Armed Guards",
        relationship: "Theocracy"
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
        enemy: ["Sky"],
        relationship: "Gluttonous Storms"
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
        enemy: ["Earth"],
        relationship: "Worshipers"
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
        enemy: [],
        specialEntity: "Sad Scholars",
        relationship: "Sacrifice"
      }
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
        enemy: ["Scientists"],
        relationship: "Scarred Landscape"
      }
    ]
  },
  {
    name: "Priests plunder amber from druids, desecrating their sacred stream in the process.",
    effects: [
      {
        plus: ["Priests"],
        minus: ["Druids", "Water"],
        attachTo: ["Druids"],
        ally: [],
        enemy: ["Priests"],
        specialEntity: "Inconsiderate Monarchy",
        relationship: "Stolen Treasure"
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
        enemy: ["Priests"],
        relationship: "Heretics"
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
        enemy: ["Sky"],
        relationship: "Hurtful Tears"
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
        enemy: ["Druids"],
        specialEntity: "Star Wedding",
        relationship: "Heretics"
      }
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
        enemy: [],
        relationship: "Lovers"
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
        enemy: ["Sky"],
        relationship: "Hurtful Tears"
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
        enemy: [],
        relationship: "Worshipers"
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
        enemy: ["Priests"],
        specialEntity: "Drunk Animals",
        relationship: "Polluted Grudge"
      }
    ]
  },
  {
    name: "Dwarven mining is fruiful, but causes rock slides that pummel the forest",
    effects: [
      {
        plus: ["Dwarves"],
        minus: ["Trees", "Druids"],
        attachTo: ["Trees"],
        ally: [],
        enemy: ["Dwarves"],
        relationship: "Bruised Bark"
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
        enemy: [],
        specialEntity: "Deep Roots",
        relationship: "Bare Fruit"
      }
    ]
  },



  
// === conditional events === //




  {
    name: "Tides adorn a beach with treasure, a gift from one god to another",
    effects: [
      {
        plus: ["Earth"],
        minus: [],
        attachTo: ["Earth"],
        ally: ["Water"],
        enemy: [],
        relationship: "Lovers"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Earth"].value > 0,
        plus: ["Water"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: [],
        relationship: ""
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
        enemy: [],
        relationship: "Lovers"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => Math.random() < 0.5,
        plus: ["Water"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: [],
        relationship: ""
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
        enemy: [],
        relationship: "Veterinarian Friends"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Animals"].allies.filter(ally => ally === "Scientists").length > 1 || board["Animals"].allies.includes("Priests") || board["Animals"].allies.includes("Philosophers"),
        plus: [],
        minus: ["Scientists", "Priests", "Philosophers"],
        attachTo: [],
        ally: [],
        enemy: [],
        relationship: ""
      }
    ]
  },
  {
    name: "The water god is weakened by a nightmare of the fire god, causing a drought to plague the city. Sparks lurk",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Fire"].value > 1,
        plus: [],
        minus: ["Water", "Priests", "Philosophers", "Scientists"],
        attachTo: ["Water"],
        ally: [],
        enemy: ["Fire"],
        relationship: "Nightmares"
      },
      {
        plus: [],
        minus: ["Water", ["Priests", "Philosophers", "Scientists"]],
        attachTo: ["Water"],
        ally: [],
        enemy: ["Fire"],
        relationship: "Nightmares"
      }
    ]
  },
  {
    name: "As the Earth turns its back on the Dwarves in their time of need, the dwarves pray to distant gods for new ore and revenge.",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => Math.random() > 0.5,
        plus: ["Dwarves"],
        minus: ["Earth"],
        attachTo: ["Dwarves"],
        ally: [],
        enemy: ["Earth"],
        specialEntity: "Erosive Liquid",
        relationship: "Rival Meteor Worshiper"
      },
      {
        plus: [],
        minus: ["Dwarves", "Earth"],
        attachTo: ["Dwarves"],
        ally: [],
        enemy: ["Earth"],
        specialEntity: "Erosive Liquid",
        relationship: "Rival Meteor Worshiper"
      }
    ]
  },
  {
    name: "The dwarves and the city start an exchange program, sharing knowledge but erupting in discrimination",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => Math.random() < 0.5,
        plus: ["Dwarves", ["Scientists", "Priests", "Philosophers"]],
        minus: [],
        attachTo: ["Scientists", "Priests", "Philosophers"],
        ally: [],
        enemy: ["Dwarves"],
        specialEntity: "Friendship Ban",
        relationship: "Discrimination"
      },
      {
        plus: ["Dwarves", ["Scientists", "Priests", "Philosophers"]],
        minus: [],
        attachTo: ["Dwarves"],
        ally: [],
        enemy: ["Scientists"],
        specialEntity: "Friendship Ban",
        relationship: "Discrimination"
      }
    ]
  },
  {
    name: "A priest prays, the most well god responds",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Fire"].value > board["Water"].value && board["Fire"].value > board["Earth"].value && board["Fire"].value > board["Sky"].value,
        plus: ["Fire"],
        minus: [],
        attachTo: ["Fire"],
        ally: ["Priests"],
        enemy: [],
        relationship: "Worshipers"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Water"].value > board["Fire"].value && board["Water"].value > board["Earth"].value && board["Water"].value > board["Sky"].value,
        plus: ["Water"],
        minus: [],
        attachTo: ["Water"],
        ally: ["Priests"],
        enemy: [],
        relationship: "Worshipers"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Earth"].value > board["Fire"].value && board["Earth"].value > board["Water"].value && board["Earth"].value > board["Sky"].value,
        plus: ["Earth"],
        minus: [],
        attachTo: ["Earth"],
        ally: ["Priests"],
        enemy: [],
        relationship: "Worshipers"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Sky"].value > board["Fire"].value && board["Sky"].value > board["Earth"].value && board["Sky"].value > board["Water"].value,
        plus: ["Sky"],
        minus: [],
        attachTo: ["Sky"],
        ally: ["Priests"],
        enemy: [],
        relationship: "Worshipers"
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
        enemy: [],
        relationship: ""
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Fire"].value > 0 && (board["Water"].value < 1 || board["Druids"].value < 1),
        plus: ["Fire"],
        minus: ["Animals", "Druids"],
        attachTo: ["Druids", "Animals", "Trees"],
        ally: [],
        enemy: ["Fire"],
        relationship: "Worshipers"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Druids"].value > 0 && board["Water"].value > 0,
        plus: ["Trees", "Water"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: [],
        relationship: ""
      },
    ]
  },
  {
    name: "Druids pray to the water god to douse fires and heal the forest with rain.",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Druids"].value > 0 || board["Water"].value > 0,
        plus: ["Trees", "Water", "Druids"],
        minus: ["Fire"],
        attachTo: ["Water"],
        ally: ["Trees"],
        enemy: [],
        relationship: "Cleansing Rain"
      }
    ]
  },
  {
    name: "Wet soil and happy gods spring forth new, green life",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Earth"].value > 0 && board["Water"].value > 0,
        plus: ["Earth", "Water", "Trees"],
        minus: [],
        attachTo: ["Earth", "Water"],
        ally: ["Water", "Earth"],
        enemy: [],
        relationship: "Lovers"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Earth"].value <= 0 || board["Water"].value <= 0,
        plus: [],
        minus: [],
        attachTo: ["Earth", "Water"],
        ally: ["Water", "Earth"],
        enemy: [],
        relationship: "Lovers"
      }
    ]
  },
  {
    name: "A philosopher tries to help the sky god, but it's risky",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Philosophers"].value > board["Sky"].value,
        plus: ["Sky", "Philosophers"],
        minus: [],
        attachTo: ["Sky"],
        ally: ["Philosophers"],
        enemy: [],
        relationship: "Emotional Support"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Philosophers"].value <= board["Sky"].value,
        plus: [],
        minus: ["Sky", "Philosophers"],
        attachTo: ["Sky"],
        ally: ["Philosophers"],
        enemy: [],
        relationship: "Emotional Support"
      }
    ]
  },
  {
    name: "A wizard challenges the sky, competing with the lightning",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Wizards"].value > board["Sky"].value,
        plus: ["Wizards"],
        minus: ["Sky"],
        attachTo: ["Sky"],
        ally: [],
        enemy: ["Wizards"],
        specialEntity: "Living Wind",
        relationship: "Sore Loser"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Wizards"].value <= board["Sky"].value,
        plus: ["Sky"],
        minus: ["Wizards"],
        attachTo: ["Wizards"],
        ally: [],
        enemy: ["Sky"],
        specialEntity: "Living Wind",
        relationship: "Sore Loser"
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
        enemy: [],
        specialEntity: "Star Wedding",
        relationship: "Lovers"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Sky"].value > 0,
        plus: ["Earth"],
        minus: [],
        attachTo: [],
        ally: [],
        enemy: [],
        relationship: ""
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Sky"].value < 0,
        plus: [],
        minus: ["Earth"],
        attachTo: [],
        ally: [],
        enemy: [],
        relationship: ""
      },
    ]
  },
  {
    name: "Dwarves unearth a slumbering demon, trying to enslave it before it awakens. They enlist the help of scientists, promising to return the favor.",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Dwarves"].value > 1 || board["Scientists"].value > 1,
        plus: ["Dwarves"],
        minus: [],
        attachTo: ["Dwarves"],
        ally: ["Scientists"],
        enemy: [],
        specialEntity: "Devout Cultists",
        relationship: "Demon Help"
      },
      {
        plus: [],
        minus: ["Dwarves"],
        attachTo: ["Dwarves"],
        ally: ["Scientists"],
        enemy: [],
        specialEntity: "Devout Cultists",
        relationship: "Demon Help"
      }
    ]
  },
  {
    name: "If dwarves dig deep enough, they'll upset the Earth's belly, and the fire god will see their time to strike, causing it to erupt in volcanoes.",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Dwarves"].value > 1,
        plus: ["Fire"],
        minus: ["Trees", "Druids", "Scientists", "Animals", "Priests", "Philosophers", "Earth", "Wizards"],
        attachTo: ["Earth"],
        ally: [],
        enemy: ["Fire"],
        relationship: "Eruption Scars"
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
        enemy: [],
        relationship: "Magical Growth"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Trees"].value > 1,
        plus: [],
        minus: ["Scientists", "Priests", "Dwarves", "Wizards"],
        attachTo: [],
        ally: [],
        enemy: [],
        relationship: ""
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
        enemy: [],
        specialEntity: "Wings For All",
        relationship: "Veterinarian Friends"
      },
      {
        plus: ["Scientists", "Scientists"],
        minus: ["Animals", "Priests", "Philosophers"],
        attachTo: ["Animals", "Priests", "Philosophers"],
        ally: [],
        enemy: ["Scientists"],
        specialEntity: "Wings For All",
        relationship: "Bad Vaccines"
      }
    ]
  },
  {
    name: "The sky god and the fire god clash, causing thunderstorms and wildfires.",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Sky"].value > board["Fire"].value,
        plus: ["Sky"],
        minus: ["Fire", "Dragons"],
        attachTo: ["Fire"],
        ally: [],
        enemy: ["Sky"],
        specialEntity: "Ruin and Destruction",
        relationship: "Sizzle and Scars"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Fire"].value > board["Sky"].value,
        plus: ["Fire"],
        minus: ["Sky", "Trees"],
        attachTo: ["Sky"],
        ally: [],
        enemy: ["Fire"],
        specialEntity: "Ruin and Destruction",
        relationship: "Smoke and Scars"
      },
      {
        plus: [],
        minus: ["Sky", "Fire"],
        attachTo: ["Sky", "Fire"],
        ally: [],
        enemy: ["Sky", "Fire"],
        specialEntity: "Ruin and Destruction",
        relationship: "Battle Scars"
      }
    ]
  },
  {
    name: "A druid conjures a magical storm to engulf the mountain, battering anyone in the sky",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Wizards"].value > 1 && board["Dragons"].value > 0,
        plus: [],
        minus: ["Dragons", "Wizards"],
        attachTo: ["Dragons", "Wizards"],
        ally: [],
        enemy: ["Druids"],
        relationship: "Spiteful Storm"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Wizards"].value > 1,
        plus: [],
        minus: ["Wizards"],
        attachTo: ["Wizards"],
        ally: [],
        enemy: ["Druids"],
        relationship: "Spiteful Storm"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Dragons"].value > 0,
        plus: [],
        minus: ["Dragons"],
        attachTo: ["Dragons"],
        ally: [],
        enemy: ["Druids"],
        relationship: "Spiteful Storm"
      }
    ]
  },
  {
    name: "Druids casts a spell for nice weather if they're strong enough",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Druids"].value > 0,
        plus: ["Sky", "Druids"],
        minus: ["Fire", "Water"],
        attachTo: ["Druids"],
        ally: ["Sky"],
        enemy: [],
        relationship: "Fair-Weather Friends"
      }
    ]
  },
  {
    name: "The water god’s rage causes the city to flood; only the priests can quell them ",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Priests"].value < 1,
        plus: ["Water"],
        minus: ["Priests", "Philosophers", "Scientists"],
        attachTo: ["Priests"],
        ally: [],
        enemy: ["Water"],
        relationship: "Heretics"
      },
      {
        plus: [],
        minus: [],
        attachTo: ["Water"],
        ally: ["Priests"],
        enemy: [],
        relationship: "Worshipers"
      }
    ]
  },
  {
    name: "Dwarves, wizards, and dragons compete to harvest a rare magical ore, leading to conflict and sabotage.",
    effects: [
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Dwarves"].value > board["Wizards"].value && board["Dwarves"].value > board["Dragons"].value,
        plus: ["Dwarves", "Dwarves"],
        minus: [],
        attachTo: ["Dragons", "Wizards"],
        ally: [],
        enemy: ["Dwarves"],
        specialEntity: "Friendship Ban",
        relationship: "Ore Wars"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Dragons"].value > board["Wizards"].value && board["Dragons"].value > board["Dwarves"].value,
        plus: ["Dragons", "Dragons"],
        minus: [],
        attachTo: ["Wizards", "Dwarves"],
        ally: [],
        enemy: ["Dragons"],
        specialEntity: "Friendship Ban",
        relationship: "Ore Wars"
      },
      {
        condition: (board:Record<Entity, BoardEntity>) => board["Wizards"].value > board["Dragons"].value && board["Wizards"].value > board["Dwarves"].value,
        plus: ["Wizards", "Wizards"],
        minus: [],
        attachTo: ["Dwarves", "Dragons"],
        ally: [],
        enemy: ["Wizards"],
        specialEntity: "Friendship Ban",
        relationship: "Ore Wars"
      },
      {
        plus: [],
        minus: ["Dragons", "Wizards", "Dwarves"],
        attachTo: [],
        ally: [],
        enemy: [],
        specialEntity: "Friendship Ban",
        relationship: "Ore Wars"
      }
    ]
  },
 ]