// @ts-nocheck
import { goals } from './goals';
import fs from 'fs';

// create a new file to write to, deleting the old one if it exists
fs.writeFileSync('goals.txt', '');

 for (const goal of goals) {
  const name = goal.name
  const plus = goal.plus.join(', ');
  const minus = goal.minus.join(', ');
  const specialEntity = goal.specialEntity
  const special = goal.special ? "Special" : ""
  // write each goal line by line to the file
  fs.appendFileSync('goals.txt', `${name}\t\t\t\t${special ? special: plus}\t\t\t${special ? special: minus}\t\t\t${specialEntity}\n`);
 }
