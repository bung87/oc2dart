import {  Token } from './parser';
import {calculateLevDistance} from './utils';

export function getConverter(classes:Token[]) :{ [propName: string]: (token: Token) => string; }{
    return    {
        'int': (token: Token) => token.type,
        'NSString*': (_: Token) => 'string',
        'NSMutableArray*': (token: Token) => {
    
            const name = token.name
            // tslint:disable-next-line: no-unused-expression
            let cls: Array<{ name: string, dis: number }> | null = null;
            let found;
            if (/[A-Z]/.test(name)) {
                const words = name.split(/(?=[A-Z])/)
                const theName = words.find(x => classes.find( y=> calculateLevDistance(y.name,x) < 5 ) )
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
    
    
        },
        'NSDictionary*': (_: Token) => {
            return `Map`
        }
    }
}