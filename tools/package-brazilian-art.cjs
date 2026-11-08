const fs=require('fs');
const root='app/src/main/assets/art/';
const pages=Object.values(JSON.parse(fs.readFileSync('build/art-candidates.json','utf8')).query.pages);
const choices=[
 ['Almeida Júnior - Seascape, Guarujá - Google Art Project.jpg','Marinha, Guarujá','Almeida Júnior'],
 ['Almeida Júnior - Landscape at the Rio das Pedras - Google Art Project.jpg','Paisagem do Sítio Rio das Pedras','Almeida Júnior'],
 ['Benedito Calixto - Baía de São Vicente, 1905.jpg','Baía de São Vicente','Benedito Calixto'],
 ['Benedito Calixto de Jesus - Jardim à Beira-mar (Paisagem), 1894.jpg','Jardim à Beira-mar','Benedito Calixto'],
 ['Antônio Parreiras - Canto de Praia, 1886.jpg','Canto de Praia','Antônio Parreiras'],
 ['Antônio Parreiras - Paisagem (Água parada).JPG','Paisagem (Água parada)','Antônio Parreiras'],
 ['EliseuVisconti-P519-Paisagem de Santa Teresa.jpg','Paisagem de Santa Teresa','Eliseu Visconti'],
 ['EliseuVisconti-P518-Paisagem de Ipanema.jpg','Paisagem de Ipanema','Eliseu Visconti'],
 ['Abigail de Andrade, 1888, Estrada do Mundo Novo com Pão de Açúcar ao Fundo.jpg','Estrada do Mundo Novo com Pão de Açúcar ao Fundo','Abigail de Andrade'],
 ['Abigail de Andrade - Trecho de paisagem.jpg','Trecho de paisagem','Abigail de Andrade']
];
(async()=>{
 const additions=[];
 for(let i=0;i<choices.length;i++){
  const [name,title,artist]=choices[i],page=pages.find(p=>p.title==='File:'+name),info=page?.imageinfo?.[0];
  if(info?.extmetadata?.LicenseShortName?.value!=='Public domain')throw Error('Licença não confirmada: '+name);
  const file='br-'+String(i+1).padStart(2,'0')+'.jpg';
  if(!fs.existsSync(root+file)){
   let response;
   for(let attempt=0;attempt<4;attempt++){
    response=await fetch(info.thumburl||info.url);
    if(response.status!==429)break;
    const delay=Math.max(15,Number(response.headers.get('retry-after'))||0);
    console.log('Limite temporário; aguardando '+delay+'s.');
    await new Promise(resolve=>setTimeout(resolve,delay*1000));
   }
   if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error('Imagem HTTP '+response.status);
   fs.writeFileSync(root+file,Buffer.from(await response.arrayBuffer()));
  }
  additions.push({file,title,artist,source:info.descriptionurl,license:'Public domain',collection:'Arte brasileira',brazilian:true});
  console.log((i+1)+'/10 '+artist+' — '+title);
  await new Promise(resolve=>setTimeout(resolve,1100));
 }
 const original=JSON.parse(fs.readFileSync(root+'catalog.json')).filter(a=>!a.brazilian);
 if(original.length!==30)throw Error('Esperadas 30 pinturas originais');
 const combined=[];for(let i=0;i<10;i++)combined.push(...original.slice(i*3,i*3+3),additions[i]);
 fs.writeFileSync(root+'catalog.json',JSON.stringify(combined,null,2));
 fs.writeFileSync(root+'SOURCES.md','# Coleção offline — Quadro LDZ\n\n40 pinturas: 30 do Art Institute of Chicago e 10 de artistas brasileiros. Reproduções em domínio público, com licença e origem individual no catálogo.\n\n'+combined.map(a=>'- '+a.title+' — '+a.artist+' ('+a.collection+')\n  '+a.source).join('\n')+'\n\nTarsila do Amaral não foi incluída: a artista faleceu em 1973 e não foi localizada licença livre para redistribuição no Brasil. Referências: https://masp.org.br/exposicoes/tarsila-popular e https://www.gov.br/cultura/pt-br/assuntos/direitos-autorais/perguntas-frequentes/perguntas-frequentes\n');
})().catch(e=>{console.error(e);process.exitCode=1});
