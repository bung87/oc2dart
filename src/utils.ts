export function calculateLevDistance(src: string, tgt: string): number {
  let realCost: number;

  // tslint:disable-next-line: one-variable-per-declaration
  let srcLength = src.length,
    tgtLength = tgt.length,
    tempString: string,
    tempLength: number; // for swapping

  const resultMatrix = new Array();
  resultMatrix[0] = new Array(); // Multi dimensional

  // To limit the space in minimum of source and target,
  // we make sure that srcLength is greater than tgtLength
  if (srcLength < tgtLength) {
    tempString = src;
    src = tgt;
    tgt = tempString;
    tempLength = srcLength;
    srcLength = tgtLength;
    tgtLength = tempLength;
  }

  for (let c = 0; c < tgtLength + 1; c++) {
    resultMatrix[0][c] = c;
  }

  for (let i = 1; i < srcLength + 1; i++) {
    resultMatrix[i] = new Array();
    resultMatrix[i][0] = i;
    for (let j = 1; j < tgtLength + 1; j++) {
      realCost = src.charAt(i - 1) === tgt.charAt(j - 1) ? 0 : 1;
      resultMatrix[i][j] = Math.min(
        resultMatrix[i - 1][j] + 1,
        resultMatrix[i][j - 1] + 1,
        resultMatrix[i - 1][j - 1] + realCost // same logic as our previous example.
      );
    }
  }

  return resultMatrix[srcLength][tgtLength];
}
