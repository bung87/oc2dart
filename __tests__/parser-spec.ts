import * as path from 'path';
import { fromFile, fromContent, convert } from '../src/';
import * as fs from 'fs';

const filepath = path.join(__dirname, 'GameData.h');
const resultpath = path.join(__dirname, 'game_data.dart');
const content = fs.readFileSync(filepath).toString();

const filepath2 = path.join(__dirname, 'enum_struct.h');
const resultpath2 = path.join(__dirname, 'enum_struct.dart');
const content2 = fs.readFileSync(filepath2).toString();

const filepath3 = path.join(__dirname, 'Skill.h');
const content3 = fs.readFileSync(filepath3).toString();
const resultpath3 = path.join(__dirname, 'skill.dart');

test('Should match GameData.h from file', done => {
  let result = '';
  fromFile(filepath).subscribe(
    (token: any) => {
      result += token.toDartCode() + '\n';
    },
    err => console.log('Error: %s', err),
    () => {
      const output = fs.readFileSync(resultpath).toString();
      expect(result).toEqual(output);
      done();
    }
  );
});

test('Should match GameData.h from content', done => {
  let result = '';

  fromContent(content).subscribe(
    (token: any) => {
      result += token.toDartCode() + '\n';
    },
    err => console.log('Error: %s', err),
    () => {
      const output = fs.readFileSync(resultpath).toString();
      expect(result).toEqual(output);
      done();
    }
  );
});

test('Should convert GameData.h from content', () => {
  const result = convert(content);
  const output = fs.readFileSync(resultpath).toString();
  expect(result).toEqual(output);
});

test('Should convert enum_struct.h from content', () => {
  const result = convert(content2);
  const output = fs.readFileSync(resultpath2).toString();
  expect(result).toEqual(output);
});

test('Should convert Skill.h from content', () => {
  const result = convert(content3);
  const output = fs.readFileSync(resultpath3).toString();
  expect(result).toEqual(output);
});
