// @ts-nocheck
import { events } from './events';
import fs from 'fs';

// create a new file to write to, deleting the old one if it exists
fs.writeFileSync('events.txt', '');

// TODO currently we only have have philosopher/scientist/priest for array entities, so if we ever have others we have to consider them
const convertEntity = (entity) => {
  if (typeof entity === 'object') {
    return "City"
  }
  else return entity;
}

// for each event, print each entity that gets plus or minus 
// then prent any special entity thats added to the board
 const convertEffectText = (event) => {
  let effectText = '';
  for (const entity of event.plus) {
    const sanitizedEntity = convertEntity(entity);
    effectText += `${sanitizedEntity}+, `;
  }
  for (const entity of event.minus) {
    const sanitizedEntity = convertEntity(entity);
    effectText += `${sanitizedEntity}-, `;
  }
  if (event.specialEntity) {
    effectText += `${event.specialEntity}~, `;
  }
  // remove the last , and space
  effectText = effectText.slice(0, -2);
  return effectText;
 }


 for (const event of events) {
  const name = event.name
  if (event.effects.length > 1) {
    fs.appendFileSync('events.txt', `${name}\t\t\t\t\tMultiple Effects\n`)
    continue;
  }
  const effect = event.effects[0];
  const effectText = convertEffectText(effect);
  const attachTo = effect.attachTo.join(', ');
  const enemies = effect.enemy.join(', ');
  const allies = effect.ally.join(', ');
  const relationshipName = effect.relationship
  // write each goal line by line to the file
  fs.appendFileSync('events.txt', `${name}\t\t\t\t\t${effectText}\t\t\t\t${attachTo}\t\t${enemies}\t\t${allies}\t\t${relationshipName}\n`)
 }
