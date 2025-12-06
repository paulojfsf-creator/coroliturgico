// ==== app-main.js (versão estável simplificada v1.3) ====

// Partes do programa
const PROGRAM_PARTS=[
{id:'entrada',label:'Entrada'}, {id:'atoPenitencial',label:'Ato Penitencial'},
{id:'gloria',label:'Glória'}, {id:'salmo',label:'Salmo Responsorial'},
{id:'aclamacao',label:'Aclamação ao Evangelho'}, {id:'ofertorio',label:'Ofertório'},
{id:'santo',label:'Santo'}, {id:'paiNosso',label:'Pai Nosso'},
{id:'paz',label:'Paz'}, {id:'cordeiro',label:'Cordeiro de Deus'},
{id:'comunhao',label:'Comunhão'}, {id:'acaoGracas',label:'Ação de Graças'},
{id:'final',label:'Final'}
];
window.PROGRAM_PARTS=PROGRAM_PARTS;

let songs=[],history=[],songUsageHistory=[],partLyricsOverrides={};

// ==== Utilitários ====
function formatDateIsoToPt(iso){
 if(!iso)return'';const[d,m,y]=iso.split('-');return`${y}-${m}-${d}`;
}

// ==== Liturgia simples ====
function getLiturgicalInfo(date){
 const day=date.getDay();
 const title= day===0 ? "Domingo" : "Dia Ferial";
 const color= day===0 ? "Verde" : "Verde";
 return {title,color};
}
function updateLiturgicalFromDate(){
 const inp=document.getElementById("date");
 if(!inp||!inp.value)return;
 const dt=new Date(inp.value+"T00:00:00");
 const info=getLiturgicalInfo(dt);
 const t=document.getElementById("liturgicalTitle");
 const c=document.getElementById("liturgicalColor");
 if(t)t.value=info.title;
 if(c)c.value=info.color;
}

// ==== Catalogo ====

function loadCsvFromGoogleSheets(){
 const url="https://docs.google.com/spreadsheets/d/e/2PACX-1vTv7BD5eoTpio0s2Vjb6YCuZNmjCyG_leoWxl6v-IkIMV-LiJZNmCwhqA9j68IESZQJiU-H3ri3_flR/pub?gid=1808635095&single=true&output=csv";
 fetch(url)
  .then(r=>r.text())
  .then(text=>{
    const rows = text.split(/\r?\n/).filter(line=>line.trim().length>0);
    if(!rows.length){songs=[]; populateProgramSelects(); renderSongsTable(); return;}
    const headers = rows[0].split(',');
    songs = rows.slice(1).map(line=>{
      const cols = line.split(',');
      const obj = {};
      headers.forEach((h,i)=>{ obj[h.trim()] = (cols[i]||'').trim(); });
      return obj;
    });
    populateProgramSelects();
    renderSongsTable();
  })
  .catch(err=>{
    console.error("Erro ao carregar CSV:", err);
    const c=document.getElementById("songsTableContainer");
    if(c) c.innerHTML="<p>Erro ao carregar catálogo.</p>";
  });
}
function populateProgramSelects(){
 PROGRAM_PARTS.forEach(p=>{
   const sel=document.getElementById(p.id); if(!sel)return;
   const cur=sel.value; sel.innerHTML='<option value=""></option>';
   songs.forEach(s=>{
    const t=s["Título"]||s["Titulo"]||s["titulo"]||""; 
    if(t){const o=document.createElement("option");o.value=t;o.textContent=t;sel.appendChild(o);}
   });
   if(cur)sel.value=cur;
 });
}
function renderSongsTable(){
 const c=document.getElementById("songsTableContainer"); if(!c)return;
 if(!songs.length){c.innerHTML="<p>Nenhum cântico.</p>";return;}
 let h="<table><tr><th>Título</th><th>Tema</th></tr>";
 songs.forEach(s=>{
   const t=s["Título"]||s["Titulo"]||s["titulo"]||"";
   const tema=s["Tema"]||"";
   h+=`<tr><td>${t}</td><td>${tema}</td></tr>`;
 });
 h+="</table>"; c.innerHTML=h;
}

// ==== Programa ====
function collectProgramFromForm(){
 const date=document.getElementById("date")?.value||"";
 const lit=document.getElementById("liturgicalTitle")?.value||"";
 const extra=document.getElementById("extraTheme")?.value||"";
 const program={};
 PROGRAM_PARTS.forEach(p=>{
   const v=document.getElementById(p.id)?.value||"";
   program[p.id]=v;
 });
 return {date,title:lit,extraTheme:extra,program};
}
function updatePreview(){
 const c=document.getElementById("previewContainer"); if(!c)return;
 const r=collectProgramFromForm();
 let h=`<h3>${r.title}</h3><p>${r.date}</p><ul>`;
 PROGRAM_PARTS.forEach(p=>{
   const v=r.program[p.id]; if(v)h+=`<li><b>${p.label}:</b> ${v}</li>`;
 });
 h+="</ul>"; c.innerHTML=h;
}

// ==== Histórico simples ====
function loadHistory(){
 try{history=JSON.parse(localStorage.getItem("coroHist")||"[]");}catch(e){history=[];}
 return history;
}
function saveHistory(){localStorage.setItem("coroHist",JSON.stringify(history));}
function renderHistory(){
 const c=document.getElementById("historyContainer"); if(!c)return;
 loadHistory();
 let h="<ul>";
 history.forEach((r,i)=>{h+=`<li>${r.date} - ${r.title} <button data-i="${i}" class="load">Carregar</button></li>`;});
 h+="</ul>"; c.innerHTML=h;
}
function initHistory(){
 const c=document.getElementById("historyContainer"); if(!c)return;
 c.addEventListener("click",e=>{
   if(e.target.classList.contains("load")){
    const i=e.target.getAttribute("data-i");
    applyProgramToForm(history[i]);
   }
 });
 renderHistory();
}
function applyProgramToForm(r){
 if(!r)return;
 document.getElementById("date").value=r.date;
 document.getElementById("liturgicalTitle").value=r.title;
 document.getElementById("extraTheme").value=r.extraTheme;
 PROGRAM_PARTS.forEach(p=>{
  document.getElementById(p.id).value=r.program[p.id]||"";
 });
 updatePreview();
 updateLiturgicalFromDate();
}

// ==== Folheto ====
function buildLeafletHtml(){
 const r=collectProgramFromForm();
 let h=`<h1>${r.title}</h1><p>${r.date}</p><ul>`;
 PROGRAM_PARTS.forEach(p=>{
   const v=r.program[p.id]; if(v)h+=`<li>${p.label}: ${v}</li>`;
 });
 h+="</ul>"; return h;
}
function initLeaflet(){
 document.getElementById("assemblySheetBtn")?.addEventListener("click",()=>{
   const m=document.getElementById("leafletModalBackdrop");
   const c=document.getElementById("leafletViewContent");
   m.hidden=false; c.innerHTML=buildLeafletHtml();
 });
 document.getElementById("leafletViewClose")?.addEventListener("click",()=>{
   document.getElementById("leafletModalBackdrop").hidden=true;
 });
}

// ==== Init ====
document.addEventListener("DOMContentLoaded",()=>{
 updateLiturgicalFromDate();
 loadCsvFromGoogleSheets();
 initHistory();
 updatePreview();
 initLeaflet();
});
