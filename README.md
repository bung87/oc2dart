
# oc2dart  

convert Objective-C header to dart


## Usage  

``` typescript
import { fromFile,fromContent } from 'oc2dart';
let result = "";
fromFile(filepath).subscribe(
(token:any) => {
    result += token.toDartCode() + "\n"
},
err => console.log("Error: %s", err),
() => {
    
});

fromContent(content).subscribe(
(token:any) => {
    result += token.toDartCode() + "\n"
},
err => console.log("Error: %s", err),
() => {
    
});

```