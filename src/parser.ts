import {
  Token,
  TokenType,
  NamedParam,
  PositionalParam,
  Param,
  Member,
} from './token';

export function mapToToken(
  this: {
    enumOpen: boolean;
    structOpen: boolean;
    instance: null | Token;
    previous: any[];
  },
  rawLine: any,
  _: number
): null | Token {
  let result: null | Token = new Token();
  // asterisk left align to varname,
  // multi space in declaration will make token type check fails
  let line = rawLine.replace(/\s*(?=\*)/, '').replace(/\s+/, ' ');
  let tokenFound = false;
  const keys = Object.keys(TokenType);
  outerloop: for (const key of keys) {
    const k = key as keyof typeof TokenType;
    const i = line.indexOf(TokenType[k]);
    // identify the token by line start
    if (i === 0) {
      tokenFound = true;
      let name;

      switch (TokenType[k]) {
        case TokenType.Interface:
          name = line.substring(TokenType[k].length + 1, line.indexOf(':'));
          result.name = name;
          result.tokenType = TokenType[k];
          break outerloop;

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

          result.name = name;
          result.tokenType = TokenType[k];

          break outerloop;
        case TokenType.Property:
          line = line.replace(/\)(?=[\w])/, ') ');
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
          result.name = name;
          result.tokenType = TokenType[k];
          break outerloop;
        case TokenType.EnumOpen:
          this.enumOpen = true;
          this.instance = Token.enum();
          result = null;
          break outerloop;
        case TokenType.StructOpen:
          this.structOpen = true;
          this.instance = Token.struct();
          result = null;
          break outerloop;
        case TokenType.BraceClose:
          if (this.enumOpen) {
            this.enumOpen = false;

            if (this.instance) {
              this.instance.tokenType = TokenType.EnumClose;
              name = line.substring(line.indexOf('}') + 1, line.indexOf(';'));
              this.instance.name = name;
            }
            Object.assign(result, this.instance, { name });
          } else if (this.structOpen) {
            this.structOpen = false;
            if (this.instance) {
              this.instance.tokenType = TokenType.StructClose;
              name = line.substring(line.indexOf('}') + 1, line.indexOf(';'));
              this.instance.name = name;
            }
            Object.assign(result, this.instance, { name });
          } else {
            result = null;
          }
          break outerloop;
        case TokenType.Class:
          name = line.substring(TokenType[k].length + 1, line.length - 1);
          result.name = name;
          result.tokenType = TokenType[k];
          break outerloop;
        case TokenType.End:
          result.tokenType = TokenType[k];
          break outerloop;
        case TokenType.BraceOpen:
          result = null;
          break outerloop;
        default:
          result = null;
          break outerloop;
      }
    }
  }
  if (tokenFound === false) {
    const lastToken = this.previous[this.previous.length - 1];
    if (lastToken && lastToken.tokenType === '@interface') {
      const arr = line.split(/\s+/);
      let name = arr[arr.length - 1];
      name = name.substring(0, name.length - 1);
      const type = arr[arr.length - 2];
      if (result) {
        result.type = type;
        result.name = name.replace(/([\w]+)_$/, '_$1');
        result.tokenType = TokenType.Property;
        return result;
      }
    }
    // in case we can't identify the token by only one line
    // eg. enum or struct property

    if (this.enumOpen || this.structOpen) {
      if (this.instance?.tokenType === TokenType.EnumOpen.valueOf()) {
        const name = line.match(/\w+/)[0];
        const m = line.match(/\d+/);
        const value = m ? m[0] : '';
        this.instance?.members?.push(new Member(name, '', value));
      } else if (this.instance?.tokenType === TokenType.StructOpen.valueOf()) {
        const trimed = line.trim();
        const [type, name] = trimed
          .substring(0, trimed.indexOf(';'))
          .split(' ')
          .map((x: string) => x.trim());
        this.instance?.members?.push(new Member(name, type.trim(), ''));
      }
    }
    result = null;
  } else {
    this.previous.push(result);
  }

  return result;
}
