import * as fs from 'fs';
import * as path from 'path';

const inFileName = 'tezosTokenList2.html';
const outFileName = 'tezosTokenList.json';
const fileContent = fs.readFileSync(path.join(__dirname, inFileName)).toString();

const iNames = fileContent.matchAll(/<h6>(.*)<\/h6>/g);
const iTypes = fileContent.matchAll(/<div class="bage_bage__3nXxU">(.*)<\/div>/g);
const iDescriptions = fileContent.matchAll(/<span class="ModalCell_caption__33ncs">(.*)<\/span><\/div>/g);

const tokens = [];
let nextName: IteratorResult<string[]>;
do {
  nextName = iNames.next();
  if( nextName.done) break;
  tokens.push({
    name: nextName.value[1],
    type: iTypes.next().value[1],
    desc: iDescriptions.next().value[1],
  });
} while (true);

fs.writeFileSync(path.join(__dirname,outFileName), JSON.stringify(tokens));
