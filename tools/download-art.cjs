const fs = require('fs');
(async () => {
  for (const [name, file] of [
    ['pourville', 'Claude Monet - Cliff Walk at Pourville - Google Art Project.jpg'],
    ['normandy', 'Claude Monet - Arrival of the Normandy Train, Gare Saint-Lazare - Google Art Project.jpg']
  ]) {
    const page = await fetch('https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file));
    const html = await page.text();
    const match = html.match(/href="(https:\/\/upload.wikimedia.org[^"]+)"/);
    if (!match) throw Error('No public image link: ' + page.status);
    const response = await fetch(match[1].replace(/&amp;/g, '&'));
    if (!response.ok || !response.headers.get('content-type').startsWith('image/')) throw Error('Image HTTP ' + response.status);
    fs.mkdirSync('app/src/main/assets/art', {recursive: true});
    const path = 'app/src/main/assets/art/' + name + '.jpg';
    fs.writeFileSync(path, Buffer.from(await response.arrayBuffer()));
    console.log(path, fs.statSync(path).size);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
