import * as fs from 'fs';
import * as readline from 'readline';
import { fromEvent, from } from 'rxjs';
import { toDartToken } from './converter';
import { concatAll, filter, map, takeUntil } from 'rxjs/operators';
import * as os from 'os';
import { mapToToken } from './parser';
import { Token } from './token';
// const RegForInterface = /^[\s#\t\/\{\}]/
const filterLine = (x: any) =>
  /^[#\t\/]/.test(x as string) === false && (x as string).length > 0;

export function fromFile(filepath: string) {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(filepath),
  });
  const classes: Token[] = [];
  const converter: {
    [propName: string]: (token: Token) => string;
  } | null = null;
  const self = { classes, converter };
  return fromEvent(readInterface, 'line').pipe(
    filter(filterLine),
    takeUntil(fromEvent(readInterface, 'close')),
    map(mapToToken),
    filter((x: any) => x),
    map(toDartToken, self),
    filter((x: any) => x),
    concatAll()
  );
}

export function fromContent(content: string) {
  const readable = content.split(os.EOL);
  const classes: Token[] = [];
  const converter: {
    [propName: string]: (token: Token) => string;
  } | null = null;
  const self = { classes, converter };
  return from(readable).pipe(
    filter(filterLine),
    map(mapToToken),
    filter((x: any) => x),
    map(toDartToken, self),
    filter((x: any) => x),
    concatAll()
  );
}

export function convert(content: string) {
  const classes: Token[] = [];
  const converter: {
    [propName: string]: (token: Token) => string;
  } | null = null;
  const self = { classes, converter };
  const readable = content.split(os.EOL);
  const flags = { enumOpen: false, structOpen: false, instance: null };
  return (
    readable
      .filter(filterLine)
      .map(mapToToken, flags)
      .filter((x: any) => x)
      .map(toDartToken, self)
      .filter((x: any) => x)
      .flat()
      .map((x: any) => x.toDartCode())
      .join(os.EOL) + os.EOL
  );
}
