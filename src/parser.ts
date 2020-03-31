
import { Token, TokenType, NamedParam, PositionalParam, Param } from './token';


export function mapToToken(rawLine: any, _: number): Token {
  const result = new Token();
  let line = rawLine.replace(/\s*(?=\*)/, '');
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
