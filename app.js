const PRAYERS=[{id:"fajr",name:"Fajr",time:"Dawn"},{id:"dhuhr",name:"Dhuhr",time:"Noon"},{id:"asr",name:"Asr",time:"Afternoon"},{id:"maghrib",name:"Maghrib",time:"Sunset"},{id:"isha",name:"Isha",time:"Night"}];
const HABITS=[
{id:"wake",name:"Wake up on time",desc:"Meet your wake-up target"},
{id:"sleep",name:"Sleep on time",desc:"Start winding down for your sleep target"},
{id:"daySleep",name:"No daytime sleep",desc:"Keep naps out of the routine"},
{id:"sun",name:"Morning sunlight",desc:"10–15 minutes outdoors"},
{id:"exercise",name:"Exercise / walk",desc:"At least 20 minutes"},
{id:"study",name:"Focused study",desc:"University or career study"},
{id:"english",name:"English speaking",desc:"20 minutes of speaking practice"},
{id:"phone",name:"No phone in bed",desc:"Keep the phone away at night"},
{id:"porn",name:"No porn",desc:"Avoid sexual content and triggers"},
{id:"masturbation",name:"No masturbation",desc:"Practice control, without shame"},
{id:"water",name:"Water goal",desc:"Reach your daily water target"}];
const TOTAL=PRAYERS.length+HABITS.length;
let state=loadJSON("resetTracker",{}),settings=loadJSON("resetSettings",{wake:"07:30",sleep:"23:30",water:8});
let selected=new Date();selected.setHours(12,0,0,0);
function loadJSON(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
function saveJSON(k,v){localStorage.setItem(k,JSON.stringify(v))}
function key(d){return new Date(d).toISOString().slice(0,10)}
function getDay(k){if(!state[k])state[k]={prayers:[],habits:[],note:""};return state[k]}
function doneCount(d){return d.prayers.length+d.habits.length}
function pct(d){return Math.round(doneCount(d)/TOTAL*100)}
function fmtDate(d){return d.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"})}
function prayerSvg(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20h16M6 20v-7h12v7M8 13V9h8v4M10 9V5h4v4M7 5h10"/></svg>'}
function render(){
 const d=getDay(key(selected)),done=doneCount(d),p=pct(d);
 dateTitle.textContent=fmtDate(selected);dateSub.textContent=key(selected)===key(new Date())?"Today":selected.toLocaleDateString();
 percent.textContent=p;circleText.textContent=done+"/"+TOTAL;document.querySelector(".progress-circle").style.setProperty("--p",p+"%");
 motivation.textContent=p===100?"Excellent. You completed the day!":p>=75?"Strong day. Keep going.":p>0?"Keep stacking small wins.":"Start with one check.";
 prayerCount.textContent=d.prayers.length+"/5";habitCount.textContent=d.habits.length+"/"+HABITS.length;
 prayers.innerHTML=PRAYERS.map(x=>'<button class="prayer '+(d.prayers.includes(x.id)?"done":"")+'" data-prayer="'+x.id+'">'+prayerSvg()+"<b>"+x.name+"</b><small>"+x.time+"</small></button>").join("");
 habits.innerHTML=HABITS.map(x=>'<div class="habit '+(d.habits.includes(x.id)?"done":"")+'" data-habit="'+x.id+'"><span class="check">'+(d.habits.includes(x.id)?"✓":"")+'</span><div><div class="name">'+x.name+'</div><div class="sub">'+x.desc+"</div></div></div>").join("");
 note.value=d.note||"";bindToday();renderProgress();renderHistory();renderSettings();
}
function bindToday(){
 document.querySelectorAll("[data-prayer]").forEach(b=>b.onclick=()=>toggle("prayers",b.dataset.prayer));
 document.querySelectorAll("[data-habit]").forEach(b=>b.onclick=()=>toggle("habits",b.dataset.habit));
 note.oninput=()=>{getDay(key(selected)).note=note.value;saveJSON("resetTracker",state);saveStatus.textContent="Saved locally • "+new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})};
}
function toggle(type,id){const d=getDay(key(selected));d[type]=d[type].includes(id)?d[type].filter(x=>x!==id):d[type].concat(id);saveJSON("resetTracker",state);render()}
function dateList(n){let a=[];for(let i=n-1;i>=0;i--){let d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);a.push(d)}return a}
function renderProgress(){
 const days=dateList(7),scores=days.map(d=>pct(getDay(key(d)))),pr=days.map(d=>Math.round(getDay(key(d)).prayers.length/5*100));
 weekRange.textContent=days[0].toLocaleDateString(undefined,{month:"short",day:"numeric"})+"–"+days[6].toLocaleDateString(undefined,{month:"short",day:"numeric"});
 weekAverage.textContent=Math.round(scores.reduce((a,b)=>a+b,0)/7)+"%";weekPrayer.textContent=Math.round(pr.reduce((a,b)=>a+b,0)/7)+"%";weekBest.textContent=Math.max(...scores)+"%";
 weekChart.innerHTML=days.map((d,i)=>'<div class="bar-wrap"><span class="bar-value">'+scores[i]+'%</span><div class="bar" style="height:'+Math.max(scores[i],2)+'%"></div><span class="bar-label">'+d.toLocaleDateString(undefined,{weekday:"short"}).slice(0,2)+"</span></div>").join("");
 performance.innerHTML=HABITS.map(h=>{let v=Math.round(days.reduce((n,d)=>n+(getDay(key(d)).habits.includes(h.id)?1:0),0)/7*100);return '<div class="perf-row"><span class="perf-name">'+h.name+'</span><div class="perf-track"><div class="perf-fill" style="width:'+v+'%"></div></div><span class="perf-pct">'+v+"%</span></div>"}).join("");
}
function renderHistory(){
 const days=dateList(30),scores=days.map(d=>pct(getDay(key(d))));
 historySummary.textContent=scores.filter(x=>x>0).length+"/30 days started";
 calendar.innerHTML=days.map((d,i)=>'<button class="day '+(scores[i]>=100?"complete":scores[i]>0?"partial":"")+' '+(key(d)===key(new Date())?"today":"")+'" data-history="'+key(d)+'" title="'+key(d)+": "+scores[i]+'%">'+d.getDate()+"</button>").join("");
 historyDetails.innerHTML=days.slice().reverse().filter(d=>doneCount(getDay(key(d)))||getDay(key(d)).note).slice(0,10).map(d=>{let x=getDay(key(d));return '<div class="history-item card"><strong>'+fmtDate(d)+'</strong><span>'+pct(x)+"% • "+x.prayers.length+"/5 Salah</span></div>"}).join("")||'<div class="history-item card"><strong>No completed days yet</strong><span>Start today</span></div>';
 document.querySelectorAll("[data-history]").forEach(b=>b.onclick=()=>{let a=b.dataset.history.split("-").map(Number);selected=new Date(a[0],a[1]-1,a[2],12);activate("today");render()});
}
function renderSettings(){wakeTime.value=settings.wake;sleepTime.value=settings.sleep;waterTarget.value=settings.water;includedHabits.innerHTML=HABITS.map((h,i)=>'<div class="included-row">'+(i+1)+". "+h.name+"</div>").join("")}
function activate(page){document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.page===page));document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===page))}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{activate(t.dataset.page);render()});
prevDay.onclick=()=>{selected.setDate(selected.getDate()-1);render()};nextDay.onclick=()=>{selected.setDate(selected.getDate()+1);render()};
themeBtn.onclick=()=>{document.body.classList.toggle("dark");let dark=document.body.classList.contains("dark");saveJSON("resetTheme",dark);themeBtn.textContent=dark?"☀":"☾"};
if(loadJSON("resetTheme",false)){document.body.classList.add("dark");themeBtn.textContent="☀"}
saveSettings.onclick=()=>{settings={wake:wakeTime.value||"07:30",sleep:sleepTime.value||"23:30",water:Math.max(1,Math.min(20,Number(waterTarget.value)||8))};saveJSON("resetSettings",settings);saveStatus.textContent="Routine saved";render()};
resetData.onclick=()=>{if(confirm("Delete ALL locally saved data? This cannot be undone.")){localStorage.clear();location.reload()}};
render();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});