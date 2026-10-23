const path=require('path'),R='/home/user/LittlePrintQuests/src/';
const {renderPdf}=require(R+'generator/render');
const {renderActivities}=require(R+'kits/render-kit');
const {renderParty}=require(R+'party/render-party');
const out=process.argv[2];
(async()=>{
 await renderPdf({theme:'dino',childName:'Maya',age:5,spots:['front_door','shoe_rack','kitchen_table','couch','bookshelf','bathtub','toy_box','bed']},path.join(out,'hunt.pdf'),{pngDir:path.join(out,'hunt')});console.log('hunt');
 await renderActivities({kit:'unicorn',childName:'Maya',age:5,subjects:[],lenient:true},path.join(out,'act.pdf'),{pngDir:path.join(out,'act')});console.log('act');
 await renderParty({theme:'dino',childName:'Maya',age:5,party:{date:'Saturday, June 3',time:'2–4 pm',place:'Our house',rsvp:'Text Mom'}},path.join(out,'party.pdf'),{pngDir:path.join(out,'party')});console.log('party');
})().catch(e=>{console.error(e);process.exit(1)});
