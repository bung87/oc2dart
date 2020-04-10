import { Token, TokenType, Param, Member } from './token';
import { calculateLevDistance } from './utils';

export function getConverter(
  classes: Token[]
): { [propName: string]: (token: Token, arg?: any) => string } {
  const handleArr = (token: Token) => {
    const name = token.name;
    // tslint:disable-next-line: no-unused-expression
    let cls: Array<{ name: string; dis: number }> | null = null;
    let found;
    if (/[A-Z]/.test(name)) {
      const words = name.split(/(?=[A-Z])/);
      const theName = words.find(x =>
        classes.find(y => calculateLevDistance(y.name, x) < 5)
      );
      // tslint:disable-next-line: prefer-conditional-expression
      if (theName) {
        cls = classes.map(x => ({
          name: x.name,
          dis: calculateLevDistance(x.name, theName),
        }));
      }
    } else {
      cls = classes.map(x => ({
        name: x.name,
        dis: calculateLevDistance(x.name, name),
      }));
    }
    if (cls) {
      cls.sort((a, b) => a.dis - b.dis);
      const minObj = cls.find(x => x.dis < 4);
      if (minObj) {
        found = minObj.name;
      }
    }

    if (found) {
      return `List<${found}>`;
    } else {
      return `List<dynamic>`;
    }
  };
  const underlyingObj = {
    int: (token: Token | Member) => token.type,
    'NSString*': (_: Token | Member) => 'String',
    BOOL: (_: Token | Member) => 'bool',
    void: (_: Token | Member) => 'void',
    float:(_: Token | Member) => 'double',
    'NSMutableString*': (_: Token | Member) => 'String',
    id: (_: Token | Member) => 'dynamic',
    'NSNumber*': (_: Token | Member) => 'num',
    'NSArray*': handleArr,
    'NSMutableArray*': handleArr,
    'NSDictionary*': (_: Token | Member) => {
      return `Map`;
    },
  };

  const proxyHandler = {
    get(obj: any, name: string) {
      if (Object.keys(obj).includes(name)) {
        return obj[name];
      } else {
        return (token: Token) => token.type.replace(/[^A-Za-z0-9\s]/, '');
      }
    },
  };
  return new Proxy(underlyingObj, proxyHandler);
}

export function toDartToken(this: any, token: any): Token[] {
  const result: Token[] = [];
  switch (token.tokenType) {
    case TokenType.Class:
      this.classes.push(token);
      break;
    case TokenType.Property:
      if (!this.converter) {
        this.converter = getConverter(this.classes);
      }
      if (token.features?.includes('readonly')) {
        const t = Token.property();
        t.name = `_${token.name}`;
        t.type = this.converter[token.type](token) as string;
        const t2 = t.privateToGetter();
        result.push(t);
        result.push(t2);
      } else if (token.features?.includes('readwrite')) {
        const t = Token.property();
        t.name = token.name;
        t.type = this.converter[token.type](token) as string;
        result.push(t);
      } else {
        const t = Token.property();
        t.name = token.name;
        t.type = this.converter[token.type](token) as string;
        result.push(t);
      }
      break;
    case TokenType.InstanceMethod:
      if (!this.converter) {
        this.converter = getConverter(this.classes);
      }
      {
        const t = Token.instanceMethod();
        t.name = token.name;
        t.type = this.converter[token.type](token);
        t.params = token.params?.map((x: any) => {
          const y = Object.create(Object.getPrototypeOf(x));
          Object.assign(y, { ...x, type: this.converter[x.type](x) });
          return y;
        });
        result.push(t);
      }
      break;
    case TokenType.StaticMethod:
      {
        if (!this.converter) {
          this.converter = getConverter(this.classes);
        }
        const t = Token.staticMethod();
        t.name = token.name;
        t.type = this.converter[token.type](token);
        t.params = token.params?.map((x: Param) => {
          const y = Object.create(Object.getPrototypeOf(x));
          Object.assign(y, { ...x, type: this.converter[x.type](x) });
          return y;
        });
        if(typeof t.params === "undefined" || t.params.length === 0){
          
          if(this.previous.filter( (x:any) => x).some( (x:Token) => {
            // console.log(x,t);
            return x.tokenType === TokenType.Interface && x.name === t.type
          })){
            const t2 = Token.property();
            t2.type = `static final ${t.type}`
            t2.name = "_singleton";
            t2.body = `${t.type}._internal()`;
            const t3 = Token.instanceMethod()
            t3.type ="factory";
            t3.name = t.type
            t3.body = "return _singleton;";
            const t4 = Token.instanceMethod();
            t4.name = `${t.type}._internal`;
            result.push(t2,t3,t4);
            return result;
          }
        }
        result.push(t);
        
      }
      break;
    case TokenType.StructClose:
      if (!this.converter) {
        this.converter = getConverter(this.classes);
      }
      const t = token;
      t.members = t.members?.map((x: Member) => {
        const y = Object.create(Object.getPrototypeOf(x));
        Object.assign(y, { ...x, type: this.converter[x.type](x) });
        return y;
      });
      result.push(t);
      break;
    default:
      result.push(token);
      break;
  }
  return result;
}
