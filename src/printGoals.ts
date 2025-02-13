// @ts-nocheck
import { goals } from './goals';
import fs from 'fs';





// create a new file to write to, deleting the old one if it exists
fs.writeFileSync('goals.txt', '');





const getSymbols = (goal) => {
  let green = []
  let blue = []
  let brown = []
  let purple = []
  let error = []
  for (const entity of goal.plus) {
    let newSymbol
    if (entity === "Druids" || entity === "Trees" || entity === "Animals") {
      green.push("🟢")
    }
    else if (entity === "Wizards" || entity === "Dwarves" || entity === "Dragons") {
      brown.push("🟤")
    }
    else if (entity === "Priests" || entity === "Scientists" || entity === "Philosophers") {
      blue.push("🔵")
    }
    else if (entity === "Fire" || entity === "Water" || entity === "Sky" || entity === "Earth") {
      purple.push("🟣")
    }
    else {
      error.push("❌")
    }
  }
  for (const entity of goal.minus) {
    let newSymbol
    if (entity === "Druids" || entity === "Trees" || entity === "Animals") {
      green.push("🟩")
    }
    else if (entity === "Wizards" || entity === "Dwarves" || entity === "Dragons") {
      brown.push("🟫")
    }
    else if (entity === "Priests" || entity === "Scientists" || entity === "Philosophers") {
      blue.push("🟦")
    }
    else if (entity === "Fire" || entity === "Water" || entity === "Sky" || entity === "Earth") {
      purple.push("🟪")
    }
    else {
      error.push("❌")
    }
  }
  let symbols = green.join('') + blue.join('') + brown.join('') + purple.join('') + error.join('')
  // this is the special cases for "make everyone happy" and "make everyone miserable"
  if (symbols.length === 26) return "🔶"
  // add a space in between every 2 characters aka every 1 symbol (each symbol is composed of 2 characters)
  // if there are no symbols, return a diamond because its a special effect thats based on all entities
  return symbols.length ? symbols.match(/.{1,2}/g).join(' ') : "🔶"
}





for (const goal of goals) {
  const name = goal.name
  const plus = goal.plus.join(', ');
  const minus = goal.minus.join(', ');
  const specialEntity = goal.specialEntity
  const special = goal.special ? "Special" : ""
  const symbols = getSymbols(goal)
  // write each goal line by line to the file
  fs.appendFileSync('goals.txt', `${name}\t\t\t\t${special ? special: plus}\t\t\t${special ? special: minus}\t\t\t${specialEntity}\t\t${symbols}\n`);
 }
