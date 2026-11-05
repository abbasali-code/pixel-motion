import { Client, Account, TablesDB, ID, Permission, Role, Query } from "https://sdk.appwrite.io/web/29.2.0/index.js";
import { mountEditor } from "./editor.js";

const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "pixel-motion";
const DATABASE_ID = "pixel-motion-db";
const TABLE_ID = "user-projects";
const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const account = new Account(client);
const tablesDB = new TablesDB(client);
const $ = selector => document.querySelector(selector);
const GUEST_KEY = "pm-projects:guest";

const translations = {
 fa:{
  workspace:"استودیوی ساخت لوگوموشن",welcomeTitle:"ایده‌ات رو به حرکت دربیار.",welcomeCopy:"یک فضای ساده برای ساخت موشن‌های خلاقانه؛ از اولین فریم تا خروجی نهایی.",
  newProject:"پروژه جدید",openProject:"بازکردن پروژه",yourWorkspace:"فضای کاری تو",recentProjects:"پروژه‌های اخیر",emptyTitle:"هنوز پروژه‌ای نداری",
  emptyCopy:"اولین پروژه‌ات رو بساز؛ اینجا نگهش می‌داریم تا هر وقت خواستی برگردی.",startFirst:"ساخت اولین پروژه ←",startCreating:"شروع طراحی",
  projectName:"نام پروژه",canvasSize:"اندازه بوم",duration:"مدت (ثانیه)",frameRate:"نرخ فریم (FPS)",cancel:"انصراف",createProject:"ساخت پروژه",
  footerNote:"ساخته‌شده برای ایده‌های متحرک.",home:"خانه",editorBaseTitle:"پروژه ساخته شد!",
  editorBaseCopy:"این نقطه شروع محیط ویرایش Pixel Motion است. قابلیت‌های تدوین و انیمیشن در مراحل بعدی توسعه اضافه می‌شوند.",
  backToProjects:"بازگشت به پروژه‌ها",email:"ایمیل",password:"رمز عبور",login:"ورود",signup:"ثبت‌نام",loginDescription:"وارد شو تا پروژه‌هات روی فضای ابری ذخیره بشن و روی دستگاه‌های دیگه هم در دسترس باشن.",
  signupDescription:"حساب بساز تا پروژه‌هات به‌صورت خصوصی در فضای ابری نگهداری بشن.",noAccount:"حساب نداری؟",hasAccount:"قبلاً حساب ساختی؟",
  signupAction:"ثبت‌نام کن",loginAction:"وارد شو",cloudSyncing:"در حال همگام‌سازی…",cloudSaved:"همه پروژه‌ها همگام شدند",
  cloudOffline:"ذخیره محلی؛ اتصال ابری برقرار نیست",cloudSignedOut:"مهمان · ذخیره روی این دستگاه",logout:"خروج",authFailed:"ورود یا ثبت‌نام انجام نشد.",
 },
 en:{
  workspace:"Logo motion studio",welcomeTitle:"Bring your ideas to life.",welcomeCopy:"A simple space for creative motion design — from the first frame to the final export.",
  newProject:"New project",openProject:"Open project",yourWorkspace:"YOUR WORKSPACE",recentProjects:"Recent projects",emptyTitle:"No projects yet",
  emptyCopy:"Create your first project. We’ll keep it here so you can pick up anytime.",startFirst:"Create your first project →",startCreating:"START CREATING",
  projectName:"Project name",canvasSize:"Canvas size",duration:"Duration (seconds)",frameRate:"Frame rate (FPS)",cancel:"Cancel",createProject:"Create project",
  footerNote:"Made for ideas in motion.",home:"Home",editorBaseTitle:"Project created!",
  editorBaseCopy:"This is the starting point of the Pixel Motion editor. Editing and animation tools will be added in later development stages.",
  backToProjects:"Back to projects",email:"Email",password:"Password",login:"Sign in",signup:"Create account",loginDescription:"Sign in to keep your projects in cloud storage and access them from your other devices.",
  signupDescription:"Create an account to keep your projects private in cloud storage.",noAccount:"New to Pixel Motion?",hasAccount:"Already have an account?",
  signupAction:"Create account",loginAction:"Sign in",cloudSyncing:"Syncing…",cloudSaved:"All projects are synced",
  cloudOffline:"Local save · cloud unavailable",cloudSignedOut:"Guest · saved on this device",logout:"Sign out",authFailed:"Could not sign in or create the account.",
 }
};

function safeRead(key){try{const value=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(value)?value:[]}catch{return []}}
const legacy = localStorage.getItem("pm-projects");
if(legacy && !localStorage.getItem(GUEST_KEY)) localStorage.setItem(GUEST_KEY,legacy);
localStorage.removeItem("pm-projects");

let editorApi=null;
let language=localStorage.getItem("pm-language")||"fa";
let currentUser=null;
let authMode="login";
let projects=safeRead(GUEST_KEY);
const t=key=>translations[language][key]||key;
const localKey=()=>currentUser?"pm-projects:user:"+currentUser.$id:GUEST_KEY;

function status(message,state){
 const el=$("#cloudStatus");el.textContent=message;el.dataset.state=state||"";
}
function persist(){
 localStorage.setItem(localKey(),JSON.stringify(projects));
 renderProjects();
}
function updateAccountButton(){
 const button=$("#accountButton");
 button.textContent=currentUser?(currentUser.email||"Account"):(language==="fa"?"ورود / ثبت‌نام":"Sign in");
 button.title=currentUser?t("logout"):"";
 button.dataset.signedIn=currentUser?"true":"false";
}
function updateAuthUI(){
 const signup=authMode==="signup";
 $("#authTitle").textContent=signup?t("signup"):t("login");
 $("#authDescription").textContent=signup?t("signupDescription"):t("loginDescription");
 $("#authNameField").hidden=!signup;
 $("#authPassword").autocomplete=signup?"new-password":"current-password";
 $("#authSubmit").textContent=signup?t("signup"):t("login");
 $("#authSwitchText").textContent=signup?t("hasAccount"):t("noAccount");
 $("#authSwitchButton").textContent=signup?t("loginAction"):t("signupAction");
 $("#authError").hidden=true;
}
function setLanguage(next){
 language=next;localStorage.setItem("pm-language",language);
 document.documentElement.lang=language;document.documentElement.dir=language==="fa"?"rtl":"ltr";
 document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=t(el.dataset.i18n)});
 $("#languageToggle").textContent=language==="fa"?"EN":"فا";
 $("#projectName").placeholder=language==="fa"?"لوگوموشن من":"My Logo Animation";
 updateAuthUI();updateAccountButton();
}
function renderProjects(){
 $("#projectCount").textContent=projects.length;
 $("#emptyState").hidden=projects.length>0;
 $("#projectGrid").replaceChildren();
 projects.forEach(project=>{
  const card=document.createElement("button");card.className="project-card";card.type="button";
  const title=document.createElement("strong");title.textContent=project.name||"Untitled Project";
  const meta=document.createElement("small");meta.textContent=(project.width||1080)+" × "+(project.height||1080)+" · "+(project.duration||10)+"s · "+(project.fps||30)+" FPS";
  card.append(title,meta);card.addEventListener("click",()=>openEditor(project));$("#projectGrid").append(card);
 });
}
function openAuthDialog(mode){
 authMode=mode||"login";$("#authForm").reset();updateAuthUI();$("#authDialog").showModal();$("#authEmail").focus();
}
function closeAuthDialog(){$("#authDialog").close()}
function openDialog(){$("#projectDialog").showModal();$("#projectName").focus()}
function closeDialog(){$("#projectDialog").close()}
function openEditor(project){$(".app-shell").hidden=true;const root=$("#editorShell");root.hidden=false;editorApi?.destroy();editorApi=mountEditor(root,project,{onBack:goHome,onChange:saveEditorProject})}
function goHome(){editorApi?.destroy();editorApi=null;$("#editorShell").hidden=true;$(".app-shell").hidden=false}
async function saveEditorProject(project){const index=projects.findIndex(item=>item.id===project.id);if(index<0)projects.unshift(project);else projects[index]=project;persist();const state=$("#pmSaveState");if(state)state.textContent="Saved locally";if(currentUser){try{await saveCloudProject(project);if(state)state.textContent="Cloud synced"}catch(error){console.warn("Cloud save failed",error);if(state)state.textContent="Saved locally · cloud offline"}}}

async function saveCloudProject(project){
 if(!currentUser)return;
 const payload={...project};delete payload._rowId;
 const data={owner_id:currentUser.$id,name:String(project.name||"Untitled Project").slice(0,128),project_data:JSON.stringify(payload)};
 const permissions=[
  Permission.read(Role.user(currentUser.$id)),
  Permission.update(Role.user(currentUser.$id)),
  Permission.delete(Role.user(currentUser.$id))
 ];
 if(project._rowId){
  await tablesDB.updateRow({databaseId:DATABASE_ID,tableId:TABLE_ID,rowId:project._rowId,data});
 }else{
  const row=await tablesDB.createRow({databaseId:DATABASE_ID,tableId:TABLE_ID,rowId:ID.unique(),data,permissions});
  project._rowId=row.$id;persist();
 }
}
async function syncCloudProjects(){
 if(!currentUser)return;
 status(t("cloudSyncing"),"syncing");
 try{
  const result=await tablesDB.listRows({
   databaseId:DATABASE_ID,tableId:TABLE_ID,
   queries:[Query.equal("owner_id",currentUser.$id),Query.limit(100)]
  });
  const remote=result.rows.map(row=>{
   try{return {...JSON.parse(row.project_data),_rowId:row.$id}}catch{return null}
  }).filter(Boolean);
  const merged=remote.slice();
  const remoteIds=new Set(remote.map(item=>item.id));
  const localOnly=projects.filter(item=>!remoteIds.has(item.id));
  merged.push(...localOnly);projects=merged;persist();
  for(const project of localOnly) await saveCloudProject(project);
  persist();localStorage.removeItem(GUEST_KEY);status(t("cloudSaved"),"online");
 }catch(error){
  console.error("Cloud sync failed:",error);status(t("cloudOffline"),"offline");
 }
}
async function restoreSession(){
 try{
  currentUser=await account.get();
  const accountCache=safeRead("pm-projects:user:"+currentUser.$id);
  const guestCache=safeRead(GUEST_KEY);
  projects=accountCache.slice();
  const ids=new Set(projects.map(item=>item.id));
  guestCache.forEach(item=>{if(!ids.has(item.id))projects.push(item)});
  persist();updateAccountButton();await syncCloudProjects();
 }catch{
  currentUser=null;projects=safeRead(GUEST_KEY);status(t("cloudSignedOut"),"guest");updateAccountButton();renderProjects();
 }
}
async function submitAuth(event){
 event.preventDefault();
 const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
 const button=$("#authSubmit");button.disabled=true;button.textContent=language==="fa"?"لطفاً صبر کن…":"Please wait…";
 $("#authError").hidden=true;
 try{
  if(authMode==="signup"){
   await account.create({userId:ID.unique(),email,password,name:$("#authName").value.trim()});
  }
  await account.createEmailPasswordSession({email,password});
  currentUser=await account.get();
  const accountCache=safeRead("pm-projects:user:"+currentUser.$id),guestCache=safeRead(GUEST_KEY);
  projects=accountCache.slice();const ids=new Set(projects.map(item=>item.id));
  guestCache.forEach(item=>{if(!ids.has(item.id))projects.push(item)});
  persist();closeAuthDialog();updateAccountButton();await syncCloudProjects();
 }catch(error){
  console.error("Authentication failed:",error);
  $("#authError").textContent=error?.message||t("authFailed");$("#authError").hidden=false;
 }finally{button.disabled=false;updateAuthUI()}
}
async function signOut(){
 try{await account.deleteSession({sessionId:"current"})}catch(error){console.warn(error)}
 currentUser=null;projects=safeRead(GUEST_KEY);persist();status(t("cloudSignedOut"),"guest");updateAccountButton();
}

$("#newProjectButton").addEventListener("click",openDialog);
$("#emptyCreateButton").addEventListener("click",openDialog);
$("#closeDialog").addEventListener("click",closeDialog);
$("#cancelDialog").addEventListener("click",closeDialog);
$("#languageToggle").addEventListener("click",()=>setLanguage(language==="fa"?"en":"fa"));
$("#backHomeButton").addEventListener("click",goHome);
$("#backHomeFromEditor").addEventListener("click",goHome);
$("#accountButton").addEventListener("click",()=>currentUser?signOut():openAuthDialog("login"));
$("#closeAuthDialog").addEventListener("click",closeAuthDialog);
$("#authSwitchButton").addEventListener("click",()=>{authMode=authMode==="login"?"signup":"login";updateAuthUI()});
$("#authForm").addEventListener("submit",submitAuth);

$("#projectForm").addEventListener("submit",async event=>{
 event.preventDefault();
 const preset=$('input[name="preset"]:checked').value;
 const sizes={square:[1080,1080],landscape:[1920,1080],portrait:[1080,1920]};
 const [width,height]=sizes[preset];
 const project={
  id:crypto.randomUUID?crypto.randomUUID():ID.unique(),
  name:$("#projectName").value.trim()||"Untitled Project",preset,width,height,
  duration:Math.max(1,Number($("#duration").value)||10),fps:Number($("#fps").value),
  createdAt:new Date().toISOString(),format:"PMF",version:"1.0",
  layers:[],assets:[],effects:[],keyframes:[],background:{type:"transparent",color:"#ffffff"}
 };
 projects.unshift(project);persist();closeDialog();openEditor(project);
 if(currentUser){
  status(t("cloudSyncing"),"syncing");
  try{await saveCloudProject(project);status(t("cloudSaved"),"online")}
  catch(error){console.error(error);status(t("cloudOffline"),"offline")}
 }
});

$("#openProjectButton").addEventListener("click",()=>$("#projectFileInput").click());
$("#projectFileInput").addEventListener("change",async event=>{
 const file=event.target.files[0];if(!file)return;
 try{
  const imported=JSON.parse(await file.text()),project=imported.project||imported;
  if(!project||typeof project!=="object"||(!project.format&&!project.name))throw new Error("Invalid project");
  if(!project.id)project.id=crypto.randomUUID?crypto.randomUUID():ID.unique();
  delete project._rowId;projects.unshift({...project,importedFrom:file.name});persist();openEditor(projects[0]);
  if(currentUser){
   try{await saveCloudProject(projects[0]);status(t("cloudSaved"),"online")}
   catch(error){console.error(error);status(t("cloudOffline"),"offline")}
  }
 }catch(error){console.error(error);alert(language==="fa"?"فایل پروژه معتبر نیست.":"This project file is not valid.")}
 event.target.value="";
});

setLanguage(language);status(t("cloudSignedOut"),"guest");renderProjects();restoreSession();
