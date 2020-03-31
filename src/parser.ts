import * as fs from 'fs';
import * as readline from 'readline';
import { fromEvent, from } from 'rxjs';
import { toDartToken } from './converter';
import { concatAll, filter, map, takeUntil } from 'rxjs/operators';
import * as os from 'os';
/*
 ** InstanceMethod - as prefix
 ** StaticMethod + as prefix
 */
export enum TokenType {
  Getter = '',
  Blank = '',
  End = '@end',
  BraceOpen = '{',
  BraceClose = '}',
  Comma = ',',
  Class = '@class',
  Interface = '@interface',
  Property = '@property',
  InstanceMethod = '-',
  StaticMethod = '+',
}

export class PositionalParam {
  constructor(
    public pos: number,
    public type: string,
    public varname: string
  ) {}
}

export class NamedParam {
  constructor(
    public name: string,
    public type: string,
    public varname: string
  ) {}
}

type Param = PositionalParam | NamedParam;

export class Token {
  private namePri: string = '';
  features?: string[];
  tokenType: TokenType = TokenType.Blank;
  type: string = '';
  params?: Param[];
  body?: string;
  static property(): Token {
    const self = new Token();
    self.tokenType = TokenType.Property;
    return self;
  }
  static instanceMethod() {
    const self = new Token();
    self.tokenType = TokenType.InstanceMethod;
    return self;
  }

  static staticMethod() {
    const self = new Token();
    self.tokenType = TokenType.StaticMethod;
    return self;
  }
  set name(v) {
    this.namePri = v.trim();
  }
  get name() {
    return this.namePri;
  }
  privateToGetter(): Token {
    const getter = new Token();
    Object.assign(getter, this);
    getter.tokenType = TokenType.Getter;
    getter.body = getter.name;
    getter.name = `${getter.name.substr(1)}`;
    return getter;
  }
  handlePositionalParams() {
    const positionalParams = this.params
      ?.filter(x => x instanceof PositionalParam)
      .sort((a, b) => (a as PositionalParam).pos - (b as PositionalParam).pos);
    return positionalParams
      ?.map(x => `${x.type} ${this.preCheckVarName(x.varname)}`)
      .join(',')
      .trim();
  }
  handleNamedParams() {
    const namedParams = this.params?.filter(x => x instanceof NamedParam);
    return namedParams
      ?.map(x => `${this.preCheckVarName(x.varname)}: ${x.type} `)
      .join(',')
      .trim();
  }
  get suffixVoid() {
    return this.type !== 'void' ? `${this.type.trim()} ` : '';
  }
  preCheckVarName(s: string): string {
    const keywords: { [propName: string]: string } = { num: 'id' };
    if (Object.keys(keywords).includes(s)) {
      return keywords[s];
    } else {
      return s;
    }
  }
  toDartCode() {
    let result = '';
    switch (this.tokenType) {
      case TokenType.Interface:
        result = `class ${this.name}{`;
        break;
      case TokenType.Property:
        result = `${this.type} ${this.name};`;
        break;
      case TokenType.Getter:
        result = `${this.type} get ${this.name} => ${this.body};`;
        break;
      case TokenType.InstanceMethod:
        if (this.params) {
          const hasPositinal = this.params.some(
            x => x instanceof PositionalParam
          );
          const hasNamed = this.params.some(x => x instanceof NamedParam);
          if (hasPositinal && hasNamed) {
            result = `${this.suffixVoid}${
              this.name
            }(${this.handlePositionalParams()},{ ${this.handleNamedParams()} } ){}`;
          } else if (hasPositinal) {
            result = `${this.suffixVoid}${
              this.name
            }(${this.handlePositionalParams()} ){}`;
          } else if (hasNamed) {
            result = `${this.suffixVoid}${
              this.name
            }({ ${this.handleNamedParams()} } ){}`;
          }
        } else {
          result = `${this.suffixVoid}${this.name}() {}`;
        }
        break;
      case TokenType.StaticMethod:
        if (this.params) {
          const hasPositinal = this.params.some(
            x => x instanceof PositionalParam
          );
          const hasNamed = this.params.some(x => x instanceof NamedParam);
          if (hasPositinal && hasNamed) {
            result = `static ${this.suffixVoid}${
              this.name
            }(${this.handlePositionalParams()},{ ${this.handleNamedParams()} } ){}`;
          } else if (hasPositinal) {
            result = `static ${this.suffixVoid}${
              this.name
            }(${this.handlePositionalParams()} ){}`;
          } else if (hasNamed) {
            result = `static ${this.suffixVoid}${
              this.name
            }({ ${this.handleNamedParams()} } ){}`;
          }
        } else {
          result = `static ${this.suffixVoid}${this.name}() {}`;
        }
        break;
      case TokenType.End:
        return '}';
      default:
        result = this.toString();
        break;
      // case TokenType.InstanceMethod:
    }
    if (
      this.tokenType.valueOf() !== TokenType.Interface &&
      this.tokenType.valueOf() !== TokenType.End
    ) {
      result = `  ${result}`;
    }
    return result;
  }
}

function mapToToken(line: any, _: number): Token {
  const result = new Token();
  Object.keys(TokenType).forEach(key => {
    const k = key as keyof typeof TokenType;
    const i = line.indexOf(TokenType[k]);
    if (i !== -1) {
      let name;
      const id = line.substring(TokenType[k].length + 1, line.length - 1);
      switch (TokenType[k]) {
        case TokenType.Interface:
          name = line.substring(TokenType[k].length + 1, line.indexOf(':'));
          break;
        case TokenType.StaticMethod:
        case TokenType.InstanceMethod:
          const sep = line.indexOf(':');
          const hasParams = sep !== -1 ? true : false;
          name = line
            .substring(
              line.indexOf(')') + 1,
              hasParams ? sep : line.lastIndexOf(';')
            )
            .trim();
          result.type = line.substring(
            line.indexOf('(') + 1,
            line.indexOf(')')
          );

          if (hasParams) {
            const paramsStr = line.substring(
              line.indexOf(':') + 1,
              line.lastIndexOf(';')
            );
            const paramsArr = paramsStr.split(' ');
            let pos = 0;
            const params: Param[] = [];
            paramsArr.forEach((s: string) => {
              const isNamed = s.indexOf(':') !== -1;
              if (isNamed) {
                const name = s.substring(0, s.indexOf(':'));
                const type = s.substring(s.indexOf('(') + 1, s.indexOf(')'));
                const varname = s.substr(s.indexOf(')') + 1);
                params.push(new NamedParam(name, type, varname));
              } else {
                const varname = s.substr(s.indexOf(')') + 1);
                const type = s.substring(s.indexOf('(') + 1, s.indexOf(')'));
                params.push(new PositionalParam(pos, type, varname));
                pos++;
              }
            });
            result.params = params;
          }
          break;
        case TokenType.Property:
          const arr = line.split(/\s+/);
          name = arr[arr.length - 1];
          name = name.substring(0, name.length - 1);
          let type = arr[arr.length - 2];
          let features;
          const ci = type.indexOf(')');
          // may have no space between features and type
          if (ci !== -1) {
            features = type.substring(0, ci + 1);
            type = type.substr(ci + 1);
          } else {
            features = arr[arr.length - 3];
          }
          result.type = type;
          result.features = features
            .substring(1, features.length - 1)
            .split(',');
          break;
        default:
          name = id;
          break;
      }
      result.name = name;
      result.tokenType = TokenType[k];
    }
  });

  return result;
}

const filterLine = (x: any) =>
  /^[\s#\t\/\{\}]/.test(x as string) === false && (x as string).length > 0;

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
    map(toDartToken, self),
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
    map(toDartToken, self),
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
  return (
    readable
      .filter(filterLine)
      .map(mapToToken)
      .map(toDartToken, self)
      .flat()
      .map(x => x.toDartCode())
      .join(os.EOL) + os.EOL
  );
}
