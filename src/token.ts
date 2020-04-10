/*
 ** InstanceMethod - as prefix
 ** StaticMethod + as prefix
 */
export enum TokenType {
  Getter = 'getter',
  Blank = 'blank',
  // Comma = ',',
  Class = '@class',
  Interface = '@interface',
  Property = '@property',
  InstanceMethod = '-',
  StaticMethod = '+',
  EnumOpen = 'typedef enum',
  StructOpen = 'typedef struct',
  EnumClose = 'enum close',
  StructClose = 'struct close',
  Member = 'member',
  BraceOpen = '{',
  BraceClose = '}',
  End = '@end',
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

export class Member {
  constructor(public name: string, public type: string, public value: any) {}
}

export type Param = PositionalParam | NamedParam;

export class Token {
  private namePri: string = '';
  features?: string[];
  tokenType: TokenType = TokenType.Blank;
  type: string = '';
  params?: Param[];
  members?: Member[];
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

  static enum() {
    const self = new Token();
    self.members = [];
    self.tokenType = TokenType.EnumOpen;
    return self;
  }

  static struct() {
    const self = new Token();
    self.members = [];
    self.tokenType = TokenType.StructOpen;
    return self;
  }

  // clone(): Token {
  //     const self = new Token();
  //     self.name = this.name;
  //     self.members = this.members;
  //     self.tokenType = this.tokenType;
  //     return self;
  // }

  set name(v) {
    this.namePri = this.preCheckVarName(v?.trim());
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
    return this.type !== 'void'
      ? `${this.type.length ? this.type.trim() + ' ' : ''}`
      : '';
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
        result = `${this.type} ${this.name}${
          this.body ? '= ' + this.body : ''
        };`;
        break;
      case TokenType.Getter:
        result = `${this.type} get ${this.name} => ${this.body || ''};`;
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
            }(${this.handlePositionalParams()},{ ${this.handleNamedParams()} } ){${this
              .body || ''}}`;
          } else if (hasPositinal) {
            result = `${this.suffixVoid}${
              this.name
            }(${this.handlePositionalParams()} ){${this.body || ''}}`;
          } else if (hasNamed) {
            result = `${this.suffixVoid}${
              this.name
            }({ ${this.handleNamedParams()} } ){${this.body || ''}}`;
          }
        } else {
          result = `${this.suffixVoid}${this.name}() {${this.body || ''}}`;
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
      case TokenType.EnumClose:
        {
          if (this.members) {
            const startFromZero = this.members[0].value === '0';
            if (startFromZero) {
              const members = this.members?.map(x => `  ${x.name},`).join('\n');
              result = `enum ${this.name} {\n${members}\n}`;
            } else {
              const start = parseInt(this.members[0].value, 10);
              const members = this.members
                ?.map(
                  (x, index) => `  static const ${x.name} = ${start + index};`
                )
                .join('\n');
              result = `class ${this.name} {\n${members}\n}`;
            }
          } else {
            result = `enum ${this.name} {\n\n}`;
          }
        }
        break;
      case TokenType.StructClose:
        const members = this.members
          ?.map(x => `  ${x.type} ${x.name};`)
          .join('\n');
        result = `class ${this.name} {\n${members}\n}`;
        break;
      case TokenType.End:
        result = '}';
        break;
      // default:
      //     result = `${this.type} ${this.name}`;
      //     break;
      // case TokenType.InstanceMethod:
    }
    if (
      this.tokenType.valueOf() !== TokenType.Interface &&
      this.tokenType.valueOf() !== TokenType.End &&
      this.tokenType.valueOf() !== TokenType.EnumClose &&
      this.tokenType.valueOf() !== TokenType.StructClose
    ) {
      result = `  ${result}`;
    }
    return result;
  }
}
