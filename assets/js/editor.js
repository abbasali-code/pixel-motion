const $=(s,scope=root)=>scope.querySelector(s);
const uid=()=>crypto.randomUUID?crypto.randomUUID():"layer-"+Date.now()+"-"+Math.random().toString(16).slice(2);
let p,root,canvas,ctx,selected=null,uiLang="fa",onChange=()=>{},resizeHandler,saveTimer=0,drag=null;
const words={
 fa:{back:"پروژه‌ها",save:"ذخیره پروژه",png:"خروجی PNG",saved:"ذخیره شد",layers:"لایه‌ها",properties:"تنظیمات",text:"متن لوگو",fontSize:"اندازه متن",weight:"ضخامت",color:"رنگ",canvas:"پیش‌نمایش",templates:"قالب‌های آماده",background:"پس‌زمینه",solid:"رنگی",transparent:"شفاف",select:"یک لایه را انتخاب کن",dragHint:"برای جابه‌جایی، لوگو را با ماوس بگیر و بکش",templateTip:"یکی از طرح‌ها را انتخاب کن؛ همه‌چیز آماده است!",templateDone:"قالب آماده شد",layer:"لایه",emptyLayers:"این قالب لایه‌ای ندارد",position:"جابه‌جایی با ماوس",english:"English"},
 en:{back:"Projects",save:"Save project",png:"Export PNG",saved:"Saved",layers:"Layers",properties:"Properties",text:"Logo text",fontSize:"Text size",weight:"Weight",color:"Color",canvas:"Preview",templates:"Ready-made templates",background:"Background",solid:"Solid",transparent:"Transparent",select:"Select a layer",dragHint:"Drag the logo with your mouse to move it",templateTip:"Choose a design. Everything is ready!",templateDone:"Template applied",layer:"Layer",emptyLayers:"This template has no layers",position:"Drag to move",english:"فارسی"}
};
const t=k=>(words[uiLang]||words.fa)[k]||k;
const active=()=>p.layers.find(x=>x.id===selected);
const changed=()=>{clearTimeout(saveTimer);saveTimer=setTimeout(()=>onChange(p),250);const s=$("#pmSaveState");if(s)s.textContent=t("saved")};
const textLayer=(name,text,size,color,x,y,weight=700)=>({id:uid(),type:"text",name,text,fontSize:size,color,x,y,weight,scale:1,rotation:0,opacity:1,visible:true});
const shapeLayer=(name,shape,color,x,y,width=240,height=150,radius=90)=>({id:uid(),type:"shape",name,shape,color,x,y,width,height,radius,scale:1,rotation:0,opacity:1,visible:true});
const templateDefs=[
 {id:"clean",fa:"مینیمال",en:"Minimal",icon:"Aa",make:()=>[textLayer("نام برند","PROPIXEL",126,"#238653",p.width/2,p.height/2),textLayer("شعار","CREATIVE STUDIO",28,"#668574",p.width/2,p.height/2+105,500)]},
 {id:"badge",fa:"نشان برند",en:"Brand badge",icon:"◉",make:()=>[shapeLayer("نشان بیرونی","circle","#238653",p.width/2,p.height/2,0,0,250),shapeLayer("مرکز نشان","circle","#f3faf5",p.width/2,p.height/2,0,0,205),textLayer("حرف برند","P",230,"#238653",p.width/2,p.height/2+8,800)]},
 {id:"stack",fa:"چیدمان دوخطی",en:"Stacked",icon:"▤",make:()=>[textLayer("خط اول","PIXEL",145,"#238653",p.width/2,p.height/2-75,800),textLayer("خط دوم","MOTION",105,"#243b2e",p.width/2,p.height/2+75,600)]},
 {id:"underline",fa:"خط زیرین",en:"Underline",icon:"━",make:()=>[textLayer("نام برند","NOVA",155,"#243b2e",p.width/2,p.height/2-28,800),shapeLayer("خط سبز","rect","#238653",p.width/2,p.height/2+100,390,12),textLayer("توضیح","DESIGN IN MOTION",25,"#668574",p.width/2,p.height/2+160,600)]},
 {id:"monogram",fa:"مونوگرام",en:"Monogram",icon:"P",make:()=>[textLayer("حرف اصلی","P",360,"#238653",p.width/2,p.height/2+15,800),textLayer("نام برند","PROPIXEL",48,"#243b2e",p.width/2,p.height/2+205,700)]},
 {id:"orbit",fa:"مدار",en:"Orbit",icon:"◎",make:()=>[shapeLayer("دایره اصلی","circle","#238653",p.width/2,p.height/2,0,0,175),shapeLayer("نقطه مداری","circle","#9ad5ae",p.width/2+210,p.height/2-150,0,0,48),textLayer("حرف برند","X",180,"#ffffff",p.width/2,p.height/2+5,800)]},
 {id:"pill",fa:"کپسولی",en:"Capsule",icon:"▰",make:()=>[shapeLayer("زمینه کپسولی","rect","#238653",p.width/2,p.height/2,520,210),textLayer("نام برند","PIXEL",112,"#ffffff",p.width/2,p.height/2+8,800)]},
 {id:"frame",fa:"قاب مدرن",en:"Frame",icon:"▣",make:()=>[shapeLayer("قاب","rect","#d9efdf",p.width/2,p.height/2,660,430),shapeLayer("مرکز","rect","#f7fbf8",p.width/2,p.height/2,620,390),textLayer("نام برند","STUDIO",118,"#238653",p.width/2,p.height/2+5,800)]},
 {id:"double",fa:"دو دایره",en:"Double circle",icon:"◉",make:()=>[shapeLayer("دایره چپ","circle","#238653",p.width/2-95,p.height/2,0,0,170),shapeLayer("دایره راست","circle","#86c99d",p.width/2+95,p.height/2,0,0,170),textLayer("نام برند","DUO",70,"#ffffff",p.width/2,p.height/2+5,800)]},
 {id:"corner",fa:"گوشه‌دار",en:"Corner mark",icon:"⌜",make:()=>[shapeLayer("بلوک سبز","rect","#238653",p.width/2-175,p.height/2,190,280),textLayer("حرف برند","A",230,"#ffffff",p.width/2-175,p.height/2+8,800),textLayer("نام برند","ABBASALI",65,"#243b2e",p.width/2+115,p.height/2+5,700)]},
 {id:"wide",fa:"کشیده",en:"Wide wordmark",icon:"━━",make:()=>[textLayer("نام برند","MOTION",150,"#238653",p.width/2,p.height/2-15,800),textLayer("شعار","MAKE IT MOVE",27,"#668574",p.width/2,p.height/2+105,600)]},
 {id:"spark",fa:"نقطه تأکید",en:"Accent dot",icon:"●",make:()=>[textLayer("نام برند","PIXEL",145,"#243b2e",p.width/2-15,p.height/2,800),shapeLayer("نقطه سبز","circle","#238653",p.width/2+250,p.height/2-80,0,0,32)]},
 {id:"vertical",fa:"عمودی",en:"Vertical",icon:"↕",make:()=>[textLayer("خط اول","P",190,"#238653",p.width/2,p.height/2-115,800),textLayer("خط دوم","M",190,"#243b2e",p.width/2,p.height/2+70,800),textLayer("توضیح","PIXEL MOTION",25,"#668574",p.width/2,p.height/2+205,600)]},
 {id:"soft",fa:"سبز ملایم",en:"Soft green",icon:"❋",make:()=>[shapeLayer("پس‌زمینه نرم","circle","#d9efdf",p.width/2,p.height/2,0,0,260),textLayer("نام برند","hello",145,"#238653",p.width/2,p.height/2+5,600)]},
 {id:"contrast",fa:"کنتراست",en:"Contrast",icon:"◐",make:()=>[shapeLayer("نیمه سبز","rect","#238653",p.width/2-155,p.height/2,310,300),textLayer("خط اول","PRO",130,"#ffffff",p.width/2-155,p.height/2-5,800),textLayer("خط دوم","PIXEL",115,"#238653",p.width/2+155,p.height/2-5,800)]},
 {id:"outline",fa:"قاب دایره‌ای",en:"Circle label",icon:"◯",make:()=>[shapeLayer("دایره","circle","#e4f3e9",p.width/2,p.height/2,0,0,245),textLayer("نام برند","NOVA",125,"#238653",p.width/2,p.height/2-5,800),textLayer("توضیح","EST. 2026",24,"#668574",p.width/2,p.height/2+100,600)]}
];
function draw(){
 if(!ctx)return;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 if(p.background.type!=="transparent"){ctx.fillStyle=p.background.color||"#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height)}
 for(const l of p.layers){
  if(l.visible===false)continue;
  ctx.save();ctx.globalAlpha=l.opacity??1;ctx.translate(l.x??p.width/2,l.y??p.height/2);ctx.rotate((l.rotation||0)*Math.PI/180);ctx.scale(l.scale||1,l.scale||1);
  if(l.type==="text"){ctx.fillStyle=l.color||"#243b2e";ctx.font=(l.weight||700)+" "+(l.fontSize||100)+"px Vazirmatn,Arial,sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(l.text||"Logo",0,0)}
  else if(l.type==="shape"){ctx.fillStyle=l.color||"#238653";if(l.shape==="circle"){ctx.beginPath();ctx.arc(0,0,l.radius||90,0,Math.PI*2);ctx.fill()}else{const w=l.width||240,h=l.height||150;ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,Math.min(22,h/5));ctx.fill()}}
  else if(l.type==="image"&&l.src){let im=new Image();im.src=l.src;if(im.complete&&im.naturalWidth)ctx.drawImage(im,-(l.width||im.width)/2,-(l.height||im.height)/2,l.width||im.width,l.height||im.height);else im.onload=draw}
  ctx.restore();
 }
 const l=active();
 if(l&&l.visible!==false){
  const b=bounds(l);ctx.save();ctx.translate(l.x,l.y);ctx.rotate((l.rotation||0)*Math.PI/180);ctx.scale(l.scale||1,l.scale||1);ctx.strokeStyle="#238653";ctx.lineWidth=Math.max(2,p.width/600);ctx.setLineDash([10,7]);ctx.strokeRect(-b.w/2-12,-b.h/2-12,b.w+24,b.h+24);ctx.setLineDash([]);ctx.fillStyle="#238653";ctx.beginPath();ctx.arc(b.w/2+12,b.h/2+12,7,0,Math.PI*2);ctx.fill();ctx.restore();
 }
}
function bounds(l){
 if(l.type==="text"){ctx.save();ctx.font=(l.weight||700)+" "+(l.fontSize||100)+"px Vazirmatn,Arial,sans-serif";const w=ctx.measureText(l.text||"Logo").width;ctx.restore();return {w:w*(l.scale||1),h:(l.fontSize||100)*1.35*(l.scale||1)}}
 if(l.type==="shape")return {w:(l.shape==="circle"?2*(l.radius||90):(l.width||240))*(l.scale||1),h:(l.shape==="circle"?2*(l.radius||90):(l.height||150))*(l.scale||1)};
 return {w:(l.width||180)*(l.scale||1),h:(l.height||180)*(l.scale||1)};
}
function hit(l,x,y){
 const b=bounds(l),dx=x-l.x,dy=y-l.y,a=-(l.rotation||0)*Math.PI/180,rx=dx*Math.cos(a)-dy*Math.sin(a),ry=dx*Math.sin(a)+dy*Math.cos(a);
 return Math.abs(rx)<=b.w/2+12&&Math.abs(ry)<=b.h/2+12;
}
function select(id){selected=id;renderLayers();renderProps();draw()}
function renderLayers(){
 const box=$("#layerList");box.replaceChildren();
 [...p.layers].reverse().forEach(l=>{
  const row=document.createElement("div");row.className="pm-layer-row"+(l.id===selected?" active":"");
  const b=document.createElement("button");b.className="pm-layer";b.type="button";
  const icon=document.createElement("span");icon.className="pm-layer-icon";icon.textContent=l.type==="text"?"T":l.type==="image"?"▧":"◩";
  const name=document.createElement("span");name.className="pm-layer-name";name.textContent=l.name||l.text||t("layer");
  b.append(icon,name);b.onclick=()=>select(l.id);
  const eye=document.createElement("button");eye.className="pm-layer-action";eye.type="button";eye.textContent=l.visible===false?"○":"◉";eye.title=uiLang==="fa"?"نمایش/مخفی":"Show/hide";eye.onclick=()=>{l.visible=l.visible===false;renderLayers();draw();changed()};
  const del=document.createElement("button");del.className="pm-layer-action danger";del.type="button";del.textContent="×";del.title=uiLang==="fa"?"حذف لایه":"Delete layer";del.onclick=()=>{p.layers=p.layers.filter(x=>x.id!==l.id);if(selected===l.id)selected=p.layers.at(-1)?.id||null;renderLayers();renderProps();draw();changed()};
  row.append(b,eye,del);box.append(row);
 });
}
function addField(box,label,key,value,type="text",min,max){
 const wrap=document.createElement("label");wrap.className="pm-field";const title=document.createElement("span");title.textContent=label;const input=document.createElement("input");input.type=type;input.value=value??"";
 if(min!==undefined)input.min=min;if(max!==undefined)input.max=max;
 input.oninput=()=>{const l=active();if(!l)return;l[key]=type==="number"?Number(input.value):input.value;draw();changed()};
 wrap.append(title,input);box.append(wrap);
}
function renderProps(){
 const box=$("#propertyPanel");box.replaceChildren();const l=active();
 if(!l){box.textContent=t("select");return}
 const title=document.createElement("strong");title.className="pm-selected-title";title.textContent=l.name||l.text||t("layer");box.append(title);
 if(l.type==="text"){addField(box,t("text"),"text",l.text);addField(box,t("fontSize"),"fontSize",l.fontSize||100,"number",12,500);addField(box,t("weight"),"weight",l.weight||700,"number",100,900)}
 else if(l.type==="shape"){addField(box,uiLang==="fa"?"عرض":"Width","width",l.width||240,"number",20,1200);addField(box,uiLang==="fa"?"ارتفاع":"Height","height",l.height||150,"number",20,1200)}
 addField(box,t("color"),"color",l.color||"#238653","color");
 const note=document.createElement("p");note.className="pm-drag-note";note.textContent=t("dragHint");box.append(note);
}
function renderTemplates(){
 const box=$("#pmTemplates");box.replaceChildren();
 templateDefs.forEach(def=>{
  const b=document.createElement("button");b.type="button";b.className="pm-template-card"+(p.templateId===def.id?" active":"");b.dataset.template=def.id;
  const icon=document.createElement("span");icon.className="pm-template-icon";icon.textContent=def.icon;
  const name=document.createElement("strong");name.textContent=uiLang==="fa"?def.fa:def.en;
  b.append(icon,name);b.onclick=()=>applyTemplate(def.id);box.append(b);
 });
}
function applyTemplate(id){
 const def=templateDefs.find(x=>x.id===id);if(!def)return;
 p.layers=def.make();p.templateId=id;p.background={type:"transparent",color:"#ffffff"};if($("#pmBackground"))$("#pmBackground").value="transparent";p.effects=[];p.keyframes=[];
 selected=p.layers.find(x=>x.type==="text")?.id||p.layers[0]?.id||null;
 renderAll();changed();const toast=$("#pmToast");toast.textContent=t("templateDone");toast.hidden=false;clearTimeout(toast._timer);toast._timer=setTimeout(()=>toast.hidden=true,1600);
}
function renderAll(){renderLayers();renderProps();renderTemplates();draw()}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function png(){draw();canvas.toBlob(blob=>blob&&download(blob,(p.name||"pixel-motion")+".png"))}
function pmf(){download(new Blob([JSON.stringify({...p,format:"PMF",version:"1.0"},null,2)],{type:"application/json"}),(p.name||"project")+".pmf")}
function build(){
 root.innerHTML='<div class="pm-workspace"><header class="pm-toolbar"><div class="pm-toolbar-left"><button class="pm-btn" id="pmBack">← '+t("back")+'</button><strong class="pm-brand">Pixel <b>Motion</b></strong><span class="pm-doc-name"></span></div><div class="pm-toolbar-right"><span class="pm-save-state" id="pmSaveState">'+t("saved")+'</span><button class="pm-btn" id="pmLang">'+(uiLang==="fa"?"EN":"فا")+'</button><button class="pm-btn" id="exportPMF">'+t("save")+'</button><button class="pm-btn pm-primary" id="exportPNG">'+t("png")+'</button></div></header><main class="pm-main"><aside class="pm-side pm-left"><div class="pm-panel-head"><strong>'+t("layers")+'</strong><span class="pm-panel-count" id="pmLayerCount"></span></div><div id="layerList" class="pm-layer-list"></div><div class="pm-panel-head"><strong>'+t("properties")+'</strong></div><div id="propertyPanel" class="pm-properties"></div></aside><section class="pm-center"><div class="pm-stage-top"><span>'+t("canvas")+' · '+p.width+' × '+p.height+'</span><span class="pm-stage-zoom">100%</span></div><div class="pm-stage"><canvas id="pmCanvas"></canvas></div><div class="pm-transport"><span class="pm-drag-symbol">✥</span><span class="pm-transport-hint">'+t("dragHint")+'</span></div></section><aside class="pm-side pm-right"><div class="pm-panel-head"><strong>'+t("templates")+'</strong><span class="pm-panel-count">16</span></div><div class="pm-template-tip">'+t("templateTip")+'</div><div id="pmTemplates" class="pm-templates"></div><div class="pm-panel-head pm-bg-head"><strong>'+t("background")+'</strong></div><div class="pm-background-controls"><select id="pmBackground"><option value="transparent">'+t("transparent")+'</option><option value="solid">'+t("solid")+'</option></select><input id="pmBackgroundColor" type="color" value="'+(p.background.color||"#ffffff")+'" aria-label="'+t("background")+'"></div></aside></main><div id="pmToast" class="pm-toast" hidden></div></div>';
 $(".pm-doc-name").textContent=p.name||"Untitled";
}
function setupCanvas(){
 canvas=$("#pmCanvas");ctx=canvas.getContext("2d");canvas.width=p.width;canvas.height=p.height;
 const stage=$(".pm-stage"),maxW=Math.max(220,stage.clientWidth-36),maxH=Math.max(220,stage.clientHeight-36),ratio=Math.min(maxW/p.width,maxH/p.height,1);
 canvas.style.width=Math.round(p.width*ratio)+"px";canvas.style.height=Math.round(p.height*ratio)+"px";canvas.style.touchAction="none";
}
function pointerPoint(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*p.width,y:(e.clientY-r.top)/r.height*p.height}}
function pointerDown(e){
 const pt=pointerPoint(e),hitLayer=[...p.layers].reverse().find(l=>l.visible!==false&&hit(l,pt.x,pt.y));
 if(!hitLayer){selected=null;renderLayers();renderProps();draw();return}
 selected=hitLayer.id;const dx=pt.x-hitLayer.x,dy=pt.y-hitLayer.y;drag={id:hitLayer.id,dx,dy,moved:false};canvas.setPointerCapture(e.pointerId);canvas.style.cursor="grabbing";renderLayers();renderProps();draw();
}
function pointerMove(e){
 if(!drag)return;const l=p.layers.find(x=>x.id===drag.id);if(!l)return;const pt=pointerPoint(e);l.x=Math.round(pt.x-drag.dx);l.y=Math.round(pt.y-drag.dy);drag.moved=true;draw();
}
function pointerUp(){if(drag?.moved){changed();renderProps()}drag=null;if(canvas)canvas.style.cursor="grab"}
function bindEvents(callbacks){
 $("#pmBack").onclick=()=>callbacks.onBack?.();
 $("#pmLang").onclick=()=>{uiLang=uiLang==="fa"?"en":"fa";document.documentElement.lang=uiLang;document.documentElement.dir=uiLang==="fa"?"rtl":"ltr";localStorage.setItem("pm-language",uiLang);window.dispatchEvent(new CustomEvent("pm-language-change",{detail:uiLang}));build();setupCanvas();renderAll();bindEvents(callbacks)};
 $("#exportPMF").onclick=pmf;$("#exportPNG").onclick=png;
 $("#pmBackground").value=p.background.type||"transparent";$("#pmBackground").onchange=e=>{p.background.type=e.target.value;draw();changed()};
 $("#pmBackgroundColor").oninput=e=>{p.background.color=e.target.value;if(p.background.type!=="solid"){$("#pmBackground").value="solid";p.background.type="solid"}draw();changed()};
 canvas.addEventListener("pointerdown",pointerDown);canvas.addEventListener("pointermove",pointerMove);canvas.addEventListener("pointerup",pointerUp);canvas.addEventListener("pointercancel",pointerUp);
}
export function mountEditor(element,project,callbacks={}){
 root=element;p=project;p.layers||=[];p.duration=Number(p.duration)||10;p.fps=Number(p.fps)||30;p.background||={type:"transparent",color:"#ffffff"};p.effects=[];p.keyframes=[];
 p.layers.forEach(l=>{delete l.keyframes});
 onChange=callbacks.onChange||(()=>{});uiLang=document.documentElement.lang==="en"?"en":"fa";
 if(!p.layers.length){const def=templateDefs[0];p.layers=def.make();p.templateId=def.id}
 selected=p.layers.find(x=>x.type==="text")?.id||p.layers[0]?.id||null;
 build();setupCanvas();renderAll();bindEvents(callbacks);
 resizeHandler=()=>{if(canvas){setupCanvas();draw()}};window.addEventListener("resize",resizeHandler);
 return {destroy(){clearTimeout(saveTimer);onChange(p);window.removeEventListener("resize",resizeHandler)}};
}
