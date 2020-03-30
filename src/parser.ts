
import * as fs from 'fs';
import * as readline from 'readline';
import { fromEvent } from 'rxjs';
import { getConverter } from './converter';

const { concatAll, map, filter, takeUntil } = require('rxjs/operators');
/*
** InstanceMethod - as prefix
** StaticMethod + as prefix
*/
export enum TokenType { Blank = "", End = '@end', BraceOpen = '{', BraceClose = '}', Comma = ',', Class = '@class', Interface = '@interface', Property = '@property', InstanceMethod = '-', StaticMethod = '+' }

export class PositionalParam {
    constructor(public pos: number, public type: string) { }
}


export class NamedParam {

    constructor(public name: string, public type: string, public varname: string) { }
}

type Param = PositionalParam | NamedParam

export class Token {
    name: string = "";
    features?: string[];
    tokenType: TokenType = TokenType.Blank;
    type: string = "";
    params?: Param[]
    body?: string
    constructor() { }
    static property(): Token {
        const self = new Token;
        self.tokenType = TokenType.Property
        return self;
    }
    privateToGetter(): Token {
        const getter = new Token;
        Object.assign(getter, this);
        getter.tokenType = TokenType.InstanceMethod
        getter.body = getter.name
        getter.name = `get ${getter.name.substr(1)}`
        return getter
    }
}

function mapToToken(line: any, _index: number, _: any): Token {
    let result = new Token();
    Object.keys(TokenType).forEach(key => {
        const k = key as keyof typeof TokenType;
        const i = line.indexOf(TokenType[k]);
        if (i !== -1) {
            let name;
            const id = line.substring(TokenType[k].length + 1, line.length - 1);
            switch (TokenType[k]) {
                case TokenType.StaticMethod:
                case TokenType.InstanceMethod:
                    const sep = line.indexOf(':');
                    const hasParams = sep !== -1 ? true : false;
                    name = line.substring(line.indexOf(')') + 1, hasParams ? sep : line.lastIndexOf(';')).trim()
                    result.type = line.substring(line.indexOf('(') + 1, line.indexOf(')'))

                    if (hasParams) {
                        const paramsStr = line.substring(line.indexOf(':') + 1, line.lastIndexOf(';'));
                        const paramsArr = paramsStr.split(' ')
                        let pos = 0;
                        let params: Param[] = [];
                        paramsArr.forEach((s: string) => {
                            const isNamed = s.indexOf(':') !== -1;
                            if (isNamed) {
                                const name = s.substring(0, s.indexOf(':'));
                                const type = s.substring(s.indexOf('(') + 1, s.indexOf(')'))
                                const varname = s.substr(s.indexOf(')') + 1)
                                params.push(new NamedParam(name, type, varname));
                            } else {
                                const type = s.substring(s.indexOf('(') + 1, s.indexOf(')'))
                                params.push(new PositionalParam(pos, type));
                                pos++;
                            }
                        });
                        result.params = params;

                    }
                    break;
                case TokenType.Property:
                    const arr = line.split(/\s+/)
                    name = arr[arr.length - 1]
                    name = name.substring(0, name.length - 1)
                    let type = arr[arr.length - 2]
                    let features;
                    const ci = type.indexOf(')');
                    // may have no space between features and type
                    if (ci !== -1) {

                        features = type.substring(0, ci + 1)
                        type = type.substr(ci + 1)

                    } else {
                        features = arr[arr.length - 3];

                    }
                    result.type = type;
                    result.features = features.substring(1, features.length - 1).split(",")
                    break;
                default:
                    name = id;
                    break;
            }
            result.name = name;
            result.tokenType = TokenType[k]
        }
    });

    return result;
}

const classes: Token[] = []

let converter: { [propName: string]: (token: Token) => string; };

function toDartToken(token: Token): Token[] {
    const result: Token[] = []
    switch (token.tokenType) {
        case TokenType.Class:
            classes.push(token);
            break;
        case TokenType.Property:
            if (!converter) {
                console.log("!converter")
                converter = getConverter(classes);
            }
            if (token.features?.includes("readonly")) {
                const t = Token.property()
                t.name = `_${token.name}`
                t.type = converter[token.type](token) as string;
                const t2 = t.privateToGetter();
                result.push(t)
                result.push(t2)
            } else if (token.features?.includes('readwrite')) {
                const t = new Token()
                t.name = token.name
                t.type = converter[token.type](token) as string;
                result.push(t)
            }
            break;
        case TokenType.InstanceMethod:
            result.push(token)
            break;
        case TokenType.StaticMethod:
            result.push(token)
            break;
    }
    return result
}

export function fromFile(filepath: string) {
    console.log(classes.length);
    const readInterface = readline.createInterface({
        input: fs.createReadStream(filepath)
    });
    
    return fromEvent(readInterface, 'line')
        .pipe(
            filter((x: string) => /^[\s#\t\/\{\}]/.test(x as string) === false && (x as string).length > 0),
            takeUntil(fromEvent(readInterface, 'close')),
            map(mapToToken),
            map(toDartToken), concatAll()
        )

}



