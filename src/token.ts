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
    ) { }
}

export class NamedParam {
    constructor(
        public name: string,
        public type: string,
        public varname: string
    ) { }
}

export type Param = PositionalParam | NamedParam;

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
        this.namePri = this.preCheckVarName(v.trim());
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