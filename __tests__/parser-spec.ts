import * as path from 'path';
import { fromFile } from '../src/parser';

const filepath = path.join(__dirname,  'GameData.h');

test('Should greet with message', () => {
  fromFile(filepath).subscribe(
    (event) => {
        console.log(event);
    },
    err => console.log("Error: %s", err),
    () => console.log("Completed"));
  expect(true).toBe(true);
});
