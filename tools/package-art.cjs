const fs=require('fs');
const pages=Object.values(JSON.parse(fs.readFileSync('build/art-candidates.json','utf8')).query.pages);
const names=[
['Claude Monet - Cliff Walk at Pourville - Google Art Project.jpg','Cliff Walk at Pourville','Claude Monet','pourville'],
['Claude Monet - Arrival of the Normandy Train, Gare Saint-Lazare - Google Art Project.jpg','Arrival of the Normandy Train, Gare Saint-Lazare','Claude Monet','normandy'],
['Gustave Caillebotte - Paris Street; Rainy Day - Google Art Project.jpg','Paris Street; Rainy Day'],
['James McNeill Whistler - Nocturne- Blue and Gold--Southampton Water - Google Art Project.jpg','Nocturne: Blue and Gold — Southampton Water'],
['Winslow Homer - The Herring Net - Google Art Project.jpg','The Herring Net'],
['Nicolas Poussin - Landscape with Saint John on Patmos - Google Art Project.jpg','Landscape with Saint John on Patmos'],
['George Inness - The Home of the Heron - Google Art Project.jpg','The Home of the Heron'],
['Paul Cézanne - The Bay of Marseilles, Seen from L\'Estaque - Google Art Project.jpg','The Bay of Marseilles, Seen from L’Estaque'],
['Henri Rousseau - The Waterfall - Google Art Project.jpg','The Waterfall'],
['Georges Seurat - A Sunday on La Grande Jatte -- 1884 - Google Art Project.jpg','A Sunday on La Grande Jatte'],
['Odilon Redon - Flower Clouds - Google Art Project.jpg','Flower Clouds'],
['Winslow Homer - Croquet Scene - Google Art ProjectFXD.jpg','Croquet Scene'],
['Claude Monet River Scene at Bennecourt, Seine.jpg','River Scene at Bennecourt'],
['Claude Monet - Vétheuil, 1901 (Art Institute of Chicago).jpg','Vétheuil'],
['1281 Wheatstack (Snow Effect, Overcast day), 1890-91, 66 x 93 cm, 26 x 36 5-8, The Art Institute of Chicago.jpg','Wheatstack (Snow Effect, Overcast Day)'],
['Wheatstacks (End of Summer), 1890-91 (190 Kb); Oil on canvas, 60 x 100 cm (23 5-8 x 39 3-8 in), The Art Institute of Chicago.jpg','Wheatstacks (End of Summer)'],
['1900 C.Monet Japonski mostek w Giverny..jpg','Water Lily Pond','Claude Monet'],
['Bordighera by Claude Monet 1884.jpg','Bordighera'],
["Monet's Water Lilies.jpg",'Water Lilies'],
['Monet - grainstacks-at-the-end-of-the-day-autumn.jpg','Stacks of Wheat (End of Day, Autumn)'],
['Claude Monet - The Beach at Sainte-Adresse - 1933.439 - Art Institute of Chicago.jpg','The Beach at Sainte-Adresse'],
["Claude Monet - Étretat, The Beach and the Falaise d'Amont - 1964.204 - Art Institute of Chicago.jpg",'Étretat, The Beach and the Falaise d’Amont'],
['Claude Monet - The Departure of the Boats, Étretat - 1922.428 - Art Institute of Chicago.jpg','The Departure of the Boats, Étretat'],
['Claude Monet - Stack of Wheat - 1983.29 - Art Institute of Chicago.jpg','Stack of Wheat'],
['Camille Pissarro - Place du Havre, Paris - Art Institute of Chicago.jpg','Place du Havre, Paris'],
['Camille Pissarro - Bords de la Marne en Hiver.jpg','The Banks of the Marne in Winter'],
['Camille Pissarro - Le Crystal Palace, Londres.jpg','The Crystal Palace'],
['Camille Pissarro, Haymaking at Éragny, 1892, 1961.791, Art Institute of Chicago.jpg','Haymaking at Éragny'],
['Alfred Sisley - A Turn in the Road - 1947.112 - Art Institute of Chicago.jpg','A Turn in the Road'],
['Alfred Sisley - The Seine at Port-Marly, Piles of Sand - 1933.1177 - Art Institute of Chicago.jpg','The Seine at Port-Marly, Piles of Sand']
];
const clean=s=>(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
(async()=>{
 const catalog=[];
 for(let index=0;index<names.length;index++){
  const [name,title,artistOverride,slug]=names[index];
  const page=pages.find(p=>p.title==='File:'+name), info=page?.imageinfo?.[0],meta=info?.extmetadata;
  if(!info||meta.LicenseShortName?.value!=='Public domain')throw Error('Metadados/licença ausentes: '+name);
  const file=(slug||'art-'+String(index+1).padStart(2,'0'))+'.jpg';
  const url=info.thumburl||info.url;
  const out='app/src/main/assets/art/'+file;
  // A marker allows safe retries after an interrupted collection download.
  const marker='build/'+file+'.downloaded';
  if(!fs.existsSync(marker)){
   let response;
   for(let attempt=0;attempt<3;attempt++){
    response=await fetch(url);
    if(response.ok)break;
    if(response.status!==429)throw Error('Image HTTP '+response.status+' '+name);
    await new Promise(resolve=>setTimeout(resolve,10000));
   }
   if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error('Imagem inválida: '+name);
   fs.writeFileSync(out,Buffer.from(await response.arrayBuffer()));
   fs.writeFileSync(marker,'ok');
   await new Promise(resolve=>setTimeout(resolve,1100));
  }
  catalog.push({file,title,artist:artistOverride||clean(meta.Artist?.value),source:info.descriptionurl,license:'Public domain',collection:'Art Institute of Chicago'});
  console.log((index+1)+'/30 '+title);
 }
 fs.writeFileSync('app/src/main/assets/art/catalog.json',JSON.stringify(catalog,null,2));
 fs.writeFileSync('app/src/main/assets/art/SOURCES.md','# Coleção offline — Quadro LDZ\n\n30 obras do Art Institute of Chicago. Reproduções em domínio público obtidas pelo Wikimedia Commons; URLs e licença registradas em catalog.json. Imagens reduzidas para a tela do painel.\n\n'+catalog.map(a=>'- '+a.title+' — '+a.artist+'\n  '+a.source).join('\n'));
})().catch(e=>{console.error(e);process.exitCode=1});
