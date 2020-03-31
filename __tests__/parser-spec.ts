import * as path from 'path';
import { fromFile, fromContent, convert } from '../src/parser';
import * as fs from 'fs';

const filepath = path.join(__dirname, 'GameData.h');
const resultpath = path.join(__dirname, 'game_data.dart');
const content = fs.readFileSync(filepath).toString();

test('Should match GameData.h from file', done => {
  let result = "";
  fromFile(filepath).subscribe(
    (token: any) => {
      result += token.toDartCode() + "\n"
    },
    err => console.log("Error: %s", err),
    () => {
      const output = fs.readFileSync(resultpath).toString();
      expect(result).toEqual(output)
      done()
    });

});

test('Should match GameData.h from content', done => {
  let result = "";

  fromContent(content).subscribe(
    (token: any) => {
      result += token.toDartCode() + "\n"
    },
    err => console.log("Error: %s", err),
    () => {
      const output = fs.readFileSync(resultpath).toString();
      expect(result).toEqual(output)
      done()
    });

});

test('Should convert GameData.h from content', () => {
  const result = convert(content);
  const output = fs.readFileSync(resultpath).toString();
  expect(result).toEqual(output)

});


