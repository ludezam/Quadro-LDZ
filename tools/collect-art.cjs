const fs = require('fs');
const base = 'https://commons.wikimedia.org/w/api.php';
async function api(params) {
 const response = await fetch(base + '?' + new URLSearchParams({format:'json', ...params}));
 if (!response.ok) throw Error('Commons HTTP ' + response.status);
 const data = await response.json(); if(data.error) throw Error(JSON.stringify(data.error)); return data;
}
(async()=>{
 const data = await api({action:'query',redirects:'1',generator:'search',gsrsearch:process.argv[2]||'"Art Institute of Chicago" (Monet OR Sisley OR Pissarro OR Cézanne OR Caillebotte OR Inness OR Renoir OR Corot) filetype:bitmap -intitle:detail -intitle:wall',gsrnamespace:'6',gsrlimit:'50',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1280'});
 fs.mkdirSync('build',{recursive:true});
 const file='build/art-candidates.json';
 const previous=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{query:{pages:{}}};
 Object.assign(previous.query.pages,data.query.pages);
 fs.writeFileSync(file,JSON.stringify(previous,null,2));
 for(const p of Object.values(data.query.pages)){const i=p.imageinfo?.[0],m=i?.extmetadata||{};if(i)console.log(JSON.stringify({title:p.title,license:m.LicenseShortName?.value,artist:m.Artist?.value?.replace(/<[^>]+>/g,'').slice(0,100)}))}
})().catch(e=>{console.error(e);process.exitCode=1});
