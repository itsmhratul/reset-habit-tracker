const PRAYERS=["Fajr","Dhuhr","Asr","Maghrib","Isha"];
const HABITS=[
 ["wake","Wake up on time","Follow your target time"],
 ["daySleep","No daytime sleep","Avoid sleeping during the day"],
 ["sun","Morning sunlight","10–15 minutes outdoors"],
 ["exercise","Exercise / walk","At least 20 minutes"],
 ["study","Study","Focused university study"],
 ["english","English practice","20 minutes speaking"],
 ["phone","No phone in bed","Keep the phone away at night"],
 ["porn","No porn","Break the trigger cycle"],
 ["mast","No masturbation","Focus on control, not perfection"],
 ["water","Water goal","Reach your daily target"]
];
let state=JSON.parse(localStorage.getItem("resetTracker")||"{}");
let selected=new Date(); selected.setHours(12,0,0,0);
const key=d=>{let x=new Date(d);return x.toISOString().slice(0,10)};
const todayKey=()=>key(selected);
function day(k){if(!state[k])state[k]={prayers:[],habits:[],note:""};return state[k]}
function save(){localStorage.setItem("resetTracker",JSON.stringify(state));render()}
function render(){
 const d=day(todayKey()), total=5+HABITS.length, done=d.prayers.length+d.habits.length, pct=Math.round(done/total*100);
 document.getElementById("dateTitle").textContent=selected.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
 document.getElementById("dateSub").textContent=todayKey()===key(new Date())?"Today":selected.toLocaleDateString();
 document.getElementById("percent").textContent=pct; document.getElementById("ringText").textContent=`${done}/${total}`;
 document.getElementById("ring").style?.setProperty("--p",pct+"%");
 document.getElementById("progress")?.style?.setProperty("--p",pct+"%");
 document.querySelector(".ring").style.setProperty("--p",pct+"%");
 document.getElementById("motivation").textContent=pct===100?"Excellent. You completed the day!":pct>=70?"Great work. Keep going.":pct>0?"Keep stacking small wins.":"Start with one check.";
 document.getElementById("prayerCount").textContent=`${d.prayers.length}/5`;
 document.getElementById("habitCount").textContent=`${d.habits.length}/${HABITS.length}`;
 document.getElementById("prayers").innerHTML=PRAYERS.map((p,i)=>`<button class="prayer ${d.prayers.includes(i)?'done':''}" data-p="${i}"><span class="emoji">🕌</span><b>${p}</b></button>`).join("");
 document.getElementById("habits").innerHTML=HABITS.map(([id,n,s])=>`<div class="habit ${d.habits.includes(id)?'done':''}" data-h="${id}"><span class="check">${d.habits.includes(id)?"✓":""}</span><div><div class="name">${n}</div><div class="sub">${s}</div></div></div>`).join("");
 document.getElementById("note").value=d.note||"";
 document.querySelectorAll(".prayer").forEach(b=>b.onclick=()=>{let i=+b.dataset.p;d.prayers=d.prayers.includes(i)?d.prayers.filter(x=>x!==i):[...d.prayers,i];save()});
 document.querySelectorAll(".habit").forEach(b=>b.onclick=()=>{let id=b.dataset.h;d.habits=d.habits.includes(id)?d.habits.filter(x=>x!==id):[...d.habits,id];save()});
 document.getElementById("note").oninput=e=>{d.note=e.target.value;localStorage.setItem("resetTracker",JSON.stringify(state))};
 renderHistory();
}
function renderHistory(){
 let keys=[];for(let i=29;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);keys.push(key(d))}
 let scores=keys.map(k=>{let d=state[k];return d?Math.round((d.prayers.length+d.habits.length)/(5+HABITS.length)*100):0});
 document.getElementById("calendar").innerHTML=keys.map((k,i)=>`<button class="day ${scores[i]>=100?"complete":scores[i]>0?"partial":""} ${k===key(new Date())?"today":""}" title="${k}: ${scores[i]}%">${new Date(k+"T12:00").getDate()}</button>`).join("");
 let streak=0;for(let i=0;i<1000;i++){let d=new Date();d.setDate(d.getDate()-i);let k=key(d),s=state[k];if(s&&(s.prayers.length+s.habits.length)>0)streak++;else break}
 let best=0,run=0;for(let i=0;i<1000;i++){let d=new Date();d.setDate(d.getDate()-i);let s=state[key(d)];if(s&&(s.prayers.length+s.habits.length)>0){run++;best=Math.max(best,run)}else run=0}
 document.getElementById("streak").textContent=streak;document.getElementById("best").textContent=best;
 document.getElementById("average").textContent=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+"%";
}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{document.querySelectorAll(".tab,.page").forEach(x=>x.classList.remove("active"));t.classList.add("active");document.getElementById(t.dataset.page).classList.add("active");if(t.dataset.page==="history")renderHistory()});
document.getElementById("prevDay").onclick=()=>{selected.setDate(selected.getDate()-1);render()};
document.getElementById("nextDay").onclick=()=>{selected.setDate(selected.getDate()+1);render()};
document.getElementById("theme").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("dark",document.body.classList.contains("dark"))};
if(localStorage.getItem("dark")==="true")document.body.classList.add("dark");
let settings=JSON.parse(localStorage.getItem("routineSettings")||'{"wake":"07:30","sleep":"23:30","water":8}');
document.getElementById("wake").value=settings.wake;document.getElementById("sleep").value=settings.sleep;document.getElementById("water").value=settings.water;
document.getElementById("saveSettings").onclick=()=>{settings={wake:wake.value,sleep:sleep.value,water:water.value};localStorage.setItem("routineSettings",JSON.stringify(settings));alert("Routine saved.")};
document.getElementById("resetData").onclick=()=>{if(confirm("Delete all habit data?")){state={};localStorage.removeItem("resetTracker");render()}};
render();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
