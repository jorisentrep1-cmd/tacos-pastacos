const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
let reviews = [];
const templates = {
  slow:{keywords:['lent','attente','long','délai'],responses:["Nous sommes désolés du délai. C'est une priorité pour nous.","Nous regrettons l'attente. Merci de votre compréhension."]},
  cold:{keywords:['froid','froide','tiède'],responses:["Nous regrettons la température du plat. Revenez nous voir !","Nous nous excusons. C'est contraire à nos standards."]},
  quality:{keywords:['mauvais','décevant','nul','bof'],responses:["Nous regrettons votre expérience. Vos retours nous aident.","Désolés de ne pas avoir répondu à vos attentes."]},
  default:{responses:["Merci de votre retour. Nous espérons vous revoir bientôt.","Nous prenons votre avis très au sérieux."]}
};
function generateResponse(text) {
  const lower=(text||'').toLowerCase();
  for(const[cat,data]of Object.entries(templates)){if(cat==='default')continue;for(const kw of data.keywords){if(lower.includes(kw))return data.responses[Math.floor(Math.random()*data.responses.length)];}}
  return templates.default.responses[Math.floor(Math.random()*templates.default.responses.length)];
}
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.post('/api/reviews',(req,res)=>{
  const{name,rating,comment,restaurantName}=req.body;
  if(!rating||!restaurantName)return res.status(400).json({error:'Rating requis'});
  const review={id:Date.now(),name:name||'Anonyme',rating:parseInt(rating),comment:comment||'',restaurantName,timestamp:new Date().toISOString(),aiResponse:null};
  if(parseInt(rating)<4&&comment){review.aiResponse=generateResponse(comment);}
  reviews.push(review);
  return res.json({success:true,review,aiResponse:review.aiResponse});
});
app.get('/api/reviews',(req,res)=>res.json({reviews,total:reviews.length}));
app.get('/api/health',(req,res)=>res.json({status:'OK'}));
if(require.main===module)app.listen(PORT,()=>console.log('Serveur sur http://localhost:'+PORT));
module.exports=app;