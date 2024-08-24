const events = [
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
        ally: ["Animals", "Priests", "Philosophers"],
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
    name: "Dragons hoard mystical artifacts, so Wizards and Scientists work together to take them.",
    effects: [
      {
        plus: ["Dragons"],
        minus: [],
        attachTo: ["Wizards"],
        ally: ["Scientists"],
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
        attachTo: ["Dwarves", "Animals", "Priests"],
        ally: ["Dwarves", "Animals", "Priests"],
        enemy: []
      }
    ]
  },
  {
    name: "Wizards open a portal to another dimension, unleashing strange creatures into the world under their control.",
    effects: [
      {
        plus: ["Wizards"],
        minus: [],
        attachTo: ["Wizards"],
        ally: [],
        enemy: ["Druids", "Dragons"]
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
    name: "Druids discover ancient texts in the forest, revealing secret knowledge about the gods previously exclusive to wizards.",
    effects: [
      {
        plus: ["Druids"],
        minus: ["Wizards"],
        attachTo: ["Druids"],
        ally: ["Sky", "Fire", "Water", "Earth"],
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
    name: "A comet foretold by Wizards illuminates the sky, filling it and philosophers with cosmic wisdom.",
    effects: [
      {
        plus: ["Philosophers", "Sky"],
        minus: [],
        attachTo: ["Sky"],
        ally: ["Wizards", "Philosophers"],
        enemy: []
      }
    ]
  },
  {
    name: "In a desperate act, priests invoke the fire god to smite the earth, causing devastation but granting them divine favor.",
    effects: [
      {
        plus: ["Priests", "Fire"],
        minus: ["Earth"],
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
        enemy: ["Wizards", "Dragons"]
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
    name: "Wizards create brews in the bellies of great oaks, fueling their spells with primal energy, which fuel the trees in turn. ",
    effects: [
      {
        plus: ["Wizards", "Trees"],
        minus: [],
        attachTo: ["Trees"],
        ally: ["Wizards"],
        enemy: []
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
        ally: ["Philosophers", "Scientists"],
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
        enemy: ["Dwarves", "Dragons"]
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
    name: "As a catastrophic storm approaches, Priests and Philosophers join forces to combat the sky's madness",
    effects: [
      {
        plus: ["Priests", "Philosophers"],
        minus: ["Sky"],
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
        enemy: ["Dragons", "Dwarves", "Wizards"]
      }
    ]
  },
 ]

const entityTracker = {};

const processEffectArray = (array, type, factor = 1) => {
  array.forEach((entity) => {
    if (Array.isArray(entity)) {
      entity.forEach((subEntity) => {
        if (!entityTracker[subEntity]) {
          entityTracker[subEntity] = { plus: 0, minus: 0, ally: 0, enemy: 0, attachTo:0 };
        }
        entityTracker[subEntity][type] += (1/entity.length) * factor;
      });
    } else {
      if (!entityTracker[entity]) {
        entityTracker[entity] = { plus: 0, minus: 0, ally: 0, enemy: 0, attachTo: 0 };
      }
      // AttachTo, ally, and enemy only allow a single entity to be chosen, so we need to divide by array length
      let thereCanOnlyBeOne = 1
      if (type === "attachTo" || type === "ally" || type === "enemy") {
        thereCanOnlyBeOne = 1/array.length
      }
      entityTracker[entity][type] += thereCanOnlyBeOne * factor;
    }
  });
};

let totalMultiEffects = 0

events.forEach((event) => {
  // resolve all effects
  let rollingFactor = 1;
  for (const effect of event.effects) {
    // if a conditional effect fails, it gets skipped
    // if a conditional effect passes, no more effects are checked
    // we can assume a condition has a 50% chance of succeeding
    // because of that, theres a 50% chance of the current effect happening as well as a 50% chance of the next (and all future) effects happening
    if (effect.condition) rollingFactor = rollingFactor / 2
    processEffectArray(effect.plus, 'plus', rollingFactor);
    processEffectArray(effect.minus, 'minus', rollingFactor);
    processEffectArray(effect.ally, 'ally', rollingFactor);
    processEffectArray(effect.enemy, 'enemy', rollingFactor);
    processEffectArray(effect.attachTo, 'attachTo', rollingFactor);
  }
});

console.log("=============================")

const getTotalScore = (entity) => {
  const entityData = entityTracker[entity];
  return entityData.plus - entityData.minus + entityData.ally - entityData.enemy;
}
function roundToPointFive(num) {
  return Math.round(num*2)/2;
}
function roundToPointTen(num) {
  return Math.round(num*10)/10;
}

Object.keys(entityTracker).sort((a,b) => getTotalScore(a) - getTotalScore(b)).forEach((entity) => {
  const entityData = entityTracker[entity];
  const totalScore = getTotalScore(entity)
  console.log("=============================")
  console.log(`${entity}:
  Plus: ${roundToPointTen(entityData.plus)}
  Minus: ${roundToPointTen(entityData.minus)}
  Ally: ${roundToPointTen(entityData.ally)}
  Enemy: ${roundToPointTen(entityData.enemy)}
  AttachTo: ${roundToPointTen(entityData.attachTo)}
  Total Score: ${roundToPointTen(totalScore)}`);
});

// print the average attachTo score
const totalAttachTo = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].attachTo, 0);
console.log("=============================")
console.log(`Average AttachTo: ${roundToPointTen(totalAttachTo / Object.keys(entityTracker).length)}`)

// print average plus 
const totalPlus = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].plus, 0);
console.log("=============================")
console.log(`Average Plus: ${roundToPointTen(totalPlus / Object.keys(entityTracker).length)}`)

// print average minus
const totalMinus = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].minus, 0);
console.log("=============================")
console.log(`Average Minus: ${roundToPointTen(totalMinus / Object.keys(entityTracker).length)}`)

// print average ally
const totalAlly = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].ally, 0);
console.log("=============================")
console.log(`Average Ally: ${roundToPointTen(totalAlly / Object.keys(entityTracker).length)}`)

// print average enemy
const totalEnemy = Object.keys(entityTracker).reduce((acc, entity) => acc + entityTracker[entity].enemy, 0);
console.log("=============================")
console.log(`Average Enemy: ${roundToPointTen(totalEnemy / Object.keys(entityTracker).length)}`)