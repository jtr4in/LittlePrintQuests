const path=require('path');
const {renderKit}=require('/home/user/LittlePrintQuests/src/kits/render-kit');
const SAMPLE={childName:'Maya',age:5};
(async()=>{for(const id of process.argv.slice(2)){const dir=path.join(process.env.S,'pages',id);await renderKit({kit:id,...SAMPLE,subjects:[],lenient:true},dir+'.pdf',{pngDir:dir});console.log(id)}})();
