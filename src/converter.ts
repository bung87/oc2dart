import { Token, TokenType } from './parser';
import { calculateLevDistance } from './utils';

export function getConverter(classes: Token[]): { [propName: string]: (token: Token, arg?: any) => string; } {
    const handleArr = (token: Token) => {

        const name = token.name
        // tslint:disable-next-line: no-unused-expression
        let cls: Array<{ name: string, dis: number }> | null = null;
        let found;
        if (/[A-Z]/.test(name)) {
            const words = name.split(/(?=[A-Z])/)
            const theName = words.find(x => classes.find(y => calculateLevDistance(y.name, x) < 5))
            // tslint:disable-next-line: prefer-conditional-expression
            if (theName) {
                cls = classes.map(x => ({ 'name': x.name, 'dis': calculateLevDistance(x.name, theName) }))

            }

        } else {
            cls = classes.map(x => ({ 'name': x.name, 'dis': calculateLevDistance(x.name, name) }))
        }
        if (cls) {
            cls.sort((a, b) => a.dis - b.dis)
            const minObj = cls.find(x => x.dis < 4)
            if (minObj) {
                found = minObj.name
            }
        }

        if (found) {
            return `List<${found}>`
        } else {
            return `List<dynamic>`
        }


    }
    const underlyingObj = {

        'int': (token: Token) => token.type,
        'NSString*': (_: Token) => 'String',
        'BOOL': (_: Token) => 'bool',
        'void': (_: Token) => 'void',
        'NSArray*': handleArr,
        'NSMutableArray*': handleArr,
        'NSDictionary*': (_: Token) => {
            return `Map`
        }
    };

    const proxyHandler = {
        get(obj: any, name: string) {
            if (Object.keys(obj).includes(name)) {
                return obj[name];
            } else {
                // console.log(name,233)
                return (token: Token) => token.type.replace(/[^A-Za-z0-9\s]/, "");
            }

        }

    }
    return new Proxy(underlyingObj, proxyHandler);
}

export function toDartToken(this: any, token: Token): Token[] {
    const result: Token[] = []
    switch (token.tokenType) {
        case TokenType.Class:
            this.classes.push(token);
            break;
        case TokenType.Property:
            if (!this.converter) {
                this.converter = getConverter(this.classes);
            }
            if (token.features?.includes("readonly")) {
                const t = Token.property()
                t.name = `_${token.name}`
                t.type = this.converter[token.type](token) as string;
                const t2 = t.privateToGetter();
                result.push(t)
                result.push(t2)
            } else if (token.features?.includes('readwrite')) {
                const t = Token.property()
                t.name = token.name
                t.type = this.converter[token.type](token) as string;
                result.push(t)
            }
            break;
        case TokenType.InstanceMethod:
            {
                const t = Token.instanceMethod()
                t.name = token.name
                t.type = this.converter[token.type](token)
                t.params = token.params?.map(x => {
                    let y = Object.create(Object.getPrototypeOf(x));
                    Object.assign(y, { ...x, type: this.converter[x.type](x) })
                    return y
                })
                result.push(t)
            }
            break;
        case TokenType.StaticMethod:
            {
                const t = Token.staticMethod()
                t.name = token.name
                t.type = this.converter[token.type](token)
                t.params = token.params?.map(x => {
                    let y = Object.create(Object.getPrototypeOf(x));
                    Object.assign(y, { ...x, type: this.converter[x.type](x) })
                    return y
                });
                result.push(t)

            }

            break;
        default:
            result.push(token);
            break;
    }
    return result
}