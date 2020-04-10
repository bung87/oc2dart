import * as fs from 'fs';
import * as readline from 'readline';
import { fromEvent, from } from 'rxjs';
import { toDartToken } from './converter';
import { concatAll, filter, map, takeUntil } from 'rxjs/operators';
import * as os from 'os';
import { mapToToken } from './parser';
import { Token } from './token';

// @ts-ignore:next-line
import * as stringify from 'json-stable-stringify-without-jsonify';
// const RegForInterface = /^[\s#\t\/\{\}]/
const filterLine = (x: any) =>
  /^[#\t\/]/.test(x as string) === false && (x as string).trim().length > 0;

function prop(propName: string) {
  return (data: any) => {
    return data[propName];
  };
}

function unique(propName?: string, keyStore?: any) {
  keyStore = keyStore || new Set();

  let keyfn = stringify;
  if (typeof propName === 'string') {
    keyfn = prop(propName);
  } else if (typeof propName === 'function') {
    keyfn = propName;
  }

  return filter((data: any, _: number) => {
    const key = keyfn(data);

    if (keyStore.has(key)) {
      return false;
    }

    keyStore.add(key);
    return true;
  });
}

export function fromFile(filepath: string) {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(filepath),
  });
  const classes: Token[] = [];
  const converter: {
    [propName: string]: (token: Token) => string;
  } | null = null;
  const previous: any[] = [];
  const self = { classes, converter, previous };
  const flags = {
    enumOpen: false,
    structOpen: false,
    instance: null,
    previous,
  };
  return fromEvent(readInterface, 'line').pipe(
    filter(filterLine),
    takeUntil(fromEvent(readInterface, 'close')),
    map(mapToToken, flags),
    filter((x: any) => x),
    map(toDartToken, self),
    filter((x: any) => x),
    unique(),
    concatAll()
  );
}

export function fromContent(content: string) {
  const readable = content.split(os.EOL);
  const classes: Token[] = [];
  const converter: {
    [propName: string]: (token: Token) => string;
  } | null = null;
  const previous: any[] = [];
  const self = { classes, converter, previous };
  const flags = {
    enumOpen: false,
    structOpen: false,
    instance: null,
    previous,
  };
  return from(readable).pipe(
    filter(filterLine),
    map(mapToToken, flags),
    filter((x: any) => x),
    map(toDartToken, self),
    filter((x: any) => x),
    unique(),
    concatAll()
  );
}

export function convert(content: string) {
  const classes: Token[] = [];
  const converter: {
    [propName: string]: (token: Token) => string;
  } | null = null;
  const previous: any[] = [];
  const self = { classes, converter, previous };
  const readable = content.split(os.EOL);
  const flags = {
    enumOpen: false,
    structOpen: false,
    instance: null,
    previous,
  };
  return (
    readable
      .filter(filterLine)
      .map(mapToToken, flags)
      .filter((x: any) => x)
      .map(toDartToken, self)
      .filter((x: any) => x)
      .flat()
      .map((x: any) => x.toDartCode())
      .filter((value, index, a) => {
        return a.indexOf(value) === index;
      })
      .join(os.EOL) + os.EOL
  );
}
