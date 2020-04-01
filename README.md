
# oc2dart  [![Build Status](https://travis-ci.org/bung87/oc2dart.svg?branch=master)](https://travis-ci.org/bung87/oc2dart)  [![Total alerts](https://img.shields.io/lgtm/alerts/g/bung87/oc2dart.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/bung87/oc2dart/alerts/) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/bung87/oc2dart.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/bung87/oc2dart/context:javascript) [![Npm Version](https://badgen.net/npm/v/oc2dart)](https://www.npmjs.com/package/oc2dart)  ![npm: total downloads](https://badgen.net/npm/dt/oc2dart) ![Types](https://badgen.net/npm/types/oc2dart) ![Dep](https://badgen.net/david/dep/bung87/oc2dart) ![license](https://badgen.net/npm/license/oc2dart)

convert Objective-C header to dart


## Usage  

``` typescript
import { fromFile,fromContent,convert } from 'oc2dart';
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

const dartCode = convert(content)

```

## Editor support  

[oc2dart-vscode-extension](https://marketplace.visualstudio.com/items?itemName=bung87.oc2dart)