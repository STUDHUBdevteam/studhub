/* ================= ТЕМА ================= */
function _prefersDark(){return matchMedia && matchMedia('(prefers-color-scheme: dark)').matches}
function _effective(mode){return mode==='system' ? (_prefersDark()?'dark':'light') : mode}
function applyTheme(mode){
  var eff=_effective(mode);
  document.documentElement.setAttribute('data-theme',eff);
  document.querySelectorAll('#themeSwitcher button').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-theme-value')===mode);
  });
}
function setTheme(mode){
  try{ localStorage.setItem('studhub_theme',mode); }catch(e){}
  applyTheme(mode);
}
function cycleTheme(){
  var cur = document.documentElement.getAttribute('data-theme')||'light';
  setTheme(cur==='dark' ? 'light' : 'dark');
}
if(matchMedia){
  var mq=matchMedia('(prefers-color-scheme: dark)');
  var handler=function(){
    var saved; try{ saved=localStorage.getItem('studhub_theme')||'light'; }catch(e){ saved='light'; }
    if(saved==='system') applyTheme('system');
  };
  if(mq.addEventListener) mq.addEventListener('change',handler);
  else if(mq.addListener) mq.addListener(handler);
}

/* ================= НАВИГАЦИЯ ================= */
function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('visible'));
  var sec=document.getElementById('sec-'+id);
  if(sec)sec.classList.add('visible');
  document.querySelectorAll('.nav-item[data-nav]').forEach(n=>n.classList.toggle('active', n.dataset.nav===id));
  window.scrollTo(0,0);
}

/* ================= ПРОЕКТЫ ================= */
function getProjects(){try{return JSON.parse(localStorage.getItem('studhub_projects')||'[]').map(p=>({...p,goal:Number(p.goal)||50000,raised:Number(p.raised)||0,deadline:p.deadline||new Date(Date.now()+86400000*30).toISOString().slice(0,10)}))}catch{return[]}}
function saveProjects(p){localStorage.setItem('studhub_projects',JSON.stringify(p))}
(function initDemoProjects(){
  var p=getProjects();
  if(p.length===0){
    p.push(
      {id:1,name:'StudHub',desc:'Один сайт для всех студенческих проектов. Первый прототип уже готов! Добавили библиотеки и свободные аудитории рядом с КИТиС.',status:'active',tags:['веб-разработка','дизайн','хакатон'],author:'Дмитрий С.',authorAvatar:'ДС',authorColor:'green',views:142,likes:42,comments:9,members:1,createdAt:Date.now()-86400000*3},
      {id:2,name:'Карта тихих мест',desc:'Собираем библиотеки, свободные аудитории и кофейни рядом с кампусом. Нужны дизайнер и фронтендер.',status:'active',tags:['учёба','мобильное','дизайн'],author:'Л. Галлахер',authorAvatar:'ЛГ',authorColor:'purple',views:89,likes:28,comments:6,members:3,createdAt:Date.now()-86400000*2},
      {id:3,name:'Бот для расписания',desc:'Telegram-бот, который показывает расписание пар, дедлайны и напоминает о зачётах. Интеграция с Google Calendar.',status:'active',tags:['бот','учёба'],author:'П. Глушнев',authorAvatar:'ПГ',authorColor:'blue',views:234,likes:67,comments:15,members:2,createdAt:Date.now()-86400000*5},
      {id:4,name:'Дизайн-система КИТиС',desc:'UI-kit и гайдлайны для всех студенческих проектов колледжа. Включает компоненты, иконки и цветовую палитру.',status:'done',tags:['дизайн','веб-разработка'],author:'Анна М.',authorAvatar:'АМ',authorColor:'orange',views:456,likes:89,comments:23,members:4,createdAt:Date.now()-86400000*10},
      {id:5,name:'Платформа для хакатонов',desc:'Сайт для организации хакатонов: регистрация команд, жюри, таймер, отправка решений.',status:'draft',tags:['хакатон','веб-разработка','мобильное'],author:'Дмитрий С.',authorAvatar:'ДС',authorColor:'green',views:23,likes:5,comments:2,members:1,createdAt:Date.now()-86400000},
      {id:6,name:'Кофе и код',desc:'Еженедельные встречи студентов-разработчиков в кофейне. Обсуждаем проекты, делимся опытом, играем в настолки.',status:'active',tags:['учёба','дизайн'],author:'К. Дейко',authorAvatar:'КД',authorColor:'purple',views:178,likes:56,comments:31,members:12,createdAt:Date.now()-86400000*7}
    );
    saveProjects(p);
  }
})();

let selectedTags=[];
function toggleTag(btn,tag){
  if(selectedTags.includes(tag)){selectedTags=selectedTags.filter(t=>t!==tag);btn.classList.remove('selected')}
  else{selectedTags.push(tag);btn.classList.add('selected')}
}
function openCreateProjectModal(){
  ensureFundingFields();
  selectedTags=[];
  document.querySelectorAll('#tagSelector .tag-select-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('projectName').value='';
  document.getElementById('projectDesc').value='';
  document.getElementById('projectStatus').value='active';
  document.getElementById('createProjectModal').style.display='flex';
  setTimeout(()=>document.getElementById('projectName').focus(),100);
}
function closeCreateProjectModal(){document.getElementById('createProjectModal').style.display='none'}
function ensureFundingFields(){
 const form=document.querySelector('#createProjectModal .modal-body')||document.querySelector('#createProjectModal form')||document.getElementById('createProjectModal');
 if(!form||document.getElementById('projectGoal'))return;
 const wrap=document.createElement('div');wrap.className='funding-form-fields';wrap.innerHTML='<label>Цель сбора, ₽<input id="projectGoal" type="number" min="1" step="100" value="50000" required></label><label>Срок сбора<input id="projectDeadline" type="date" required></label>';
 const status=document.getElementById('projectStatus');if(status&&status.parentElement)status.parentElement.before(wrap);else form.appendChild(wrap);
 const deadline=document.getElementById('projectDeadline');if(deadline)deadline.value=new Date(Date.now()+86400000*30).toISOString().slice(0,10);
}
function getTimeAgo(ts){const d=Date.now()-ts,m=Math.floor(d/60000),h=Math.floor(d/3600000),dy=Math.floor(d/86400000);if(m<60)return m+' мин назад';if(h<24)return h+' ч назад';if(dy<7)return dy+' дн назад';return new Date(ts).toLocaleDateString('ru-RU')}

function formatMoney(value){return new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(Number(value)||0)}
function formatDeadline(value){if(!value)return 'не указан';const d=new Date(value+'T12:00:00');return isNaN(d)?'не указан':d.toLocaleDateString('ru-RU')}
function projectCardHTML(project){
  const sl={active:'Активный',draft:'Черновик',done:'Завершён'};
  const sc={active:'status-active',draft:'status-draft',done:'status-done'};
  return `<div class="project-card" onclick="openProjectDetail(${project.id})">
    <span class="project-card-status ${sc[project.status]}">${sl[project.status]}</span>
    <div class="project-card-header">
      <div class="project-card-avatar ${project.authorColor}">${project.authorAvatar}</div>
      <div class="project-card-info"><div class="project-card-title">${project.name}</div><div class="project-card-author">${project.author} · ${getTimeAgo(project.createdAt)}</div></div>
    </div>
    <div class="project-card-desc">${project.desc}</div>
    ${project.tags.length?`<div class="project-card-tags">${project.tags.slice(0,3).map(t=>`<span class="project-tag">${t}</span>`).join('')}${project.tags.length>3?`<span class="project-tag">+${project.tags.length-3}</span>`:''}</div>`:''}
    <div class="funding-block"><div class="funding-numbers"><strong>${formatMoney(project.raised||0)}</strong><span>из ${formatMoney(project.goal||50000)}</span><b>${Math.min(100,Math.round((project.raised||0)/(project.goal||50000)*100))}%</b></div><div class="funding-track"><span style="width:${Math.min(100,Math.round((project.raised||0)/(project.goal||50000)*100))}%"></span></div><div class="funding-deadline">⏳ Срок: ${formatDeadline(project.deadline)}</div></div>
    <div class="project-card-stats">
      <div class="project-card-stat"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>${project.views}</div>
      <div class="project-card-stat"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>${project.likes}</div>
      <div class="project-card-stat"><svg viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>${project.comments}</div>
      <div class="project-card-stat"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>${project.members}</div>
    </div>
  </div>`;
}

function renderProjects(filter='all'){
  let projects=getProjects();
  if(filter==='active')projects=projects.filter(p=>p.status==='active');
  else if(filter==='draft')projects=projects.filter(p=>p.status==='draft');
  else if(filter==='done')projects=projects.filter(p=>p.status==='done');
  projects.sort((a,b)=>b.createdAt-a.createdAt);
  const html = projects.length ? projects.map(projectCardHTML).join('') :
    `<div class="empty-projects"><svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg><h3>Проектов пока нет</h3><p>Создайте первый проект!</p></div>`;
  ['projectsContainer','projectsContainer2'].forEach(id=>{const c=document.getElementById(id);if(c)c.innerHTML=html});
  const all=getProjects();
  const counts={total:all.length,active:all.filter(p=>p.status==='active').length,views:all.reduce((s,p)=>s+p.views,0),likes:all.reduce((s,p)=>s+p.likes,0)};
  [['statTotal','statTotal2'],['statActive','statActive2'],['statViews','statViews2'],['statLikes','statLikes2']].forEach(([a,b])=>{
    const key=a.replace('stat','').toLowerCase();
    const el1=document.getElementById(a),el2=document.getElementById(b);
    if(el1)el1.textContent=counts[key];
    if(el2)el2.textContent=counts[key];
  });
  const npc=document.getElementById('navProjectsCount');if(npc)npc.textContent=all.length;
  renderMyProjects();
  const ppc=document.getElementById('profileProjectsCount');if(ppc)ppc.textContent=all.length;
  const ptc=document.getElementById('profileProjTabCount');if(ptc)ptc.textContent=all.length;
}
function filterByTab(filter,btn){
  const row=btn.closest('.tabs-row');
  row.querySelectorAll('.tab-btn').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderProjects(filter);
}

function isMyProject(p){
  try{
    if(typeof getPostAuthor==='function'){
      const me=(getPostAuthor().name||'').trim();
      if(me && p.author===me)return true;
    }
  }catch(e){}
  return p.author==='Дмитрий С.' || p.isMine===true;
}
let myProjectsFilter='all';
function renderMyProjects(){
  const c=document.getElementById('myProjectsContainer');
  if(!c)return;
  let mine=getProjects().filter(isMyProject);
  if(myProjectsFilter==='active')mine=mine.filter(p=>p.status==='active');
  else if(myProjectsFilter==='draft')mine=mine.filter(p=>p.status==='draft');
  else if(myProjectsFilter==='done')mine=mine.filter(p=>p.status==='done');
  mine.sort((a,b)=>b.createdAt-a.createdAt);
  c.innerHTML = mine.length ? mine.map(projectCardHTML).join('') :
    `<div class="empty-projects"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg><h3>Ваших проектов пока нет</h3><p>Создайте первый проект — он появится здесь!</p></div>`;
  const mac=document.getElementById('navMyProjectsCount');
  if(mac)mac.textContent=getProjects().filter(isMyProject).length;
  // «Мои активы» = личные проекты пользователя + прикреплённые к ним файлы
  const mc=document.getElementById('myAssetsProjectsContainer');
  if(mc){
    const allMine=getProjects().filter(isMyProject).sort((a,b)=>b.createdAt-a.createdAt);
    mc.innerHTML = allMine.length ? allMine.map(projectCardHTML).join('') :
      `<div class="empty-projects"><svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg><h3>У тебя пока нет своих проектов</h3><p>Создай проект во вкладке «Проекты» или нажми «Создать проект» — он станет твоим активом на StudHub.</p></div>`;
  }
}
function filterMyProjectsByTab(filter,btn){
  myProjectsFilter=filter;
  const row=btn.closest('.tabs-row');
  row.querySelectorAll('.tab-btn').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderMyProjects();
}
function openProjectDetail(id){
  const projects=getProjects();const project=projects.find(p=>p.id===id);if(!project)return;
  const sl={active:'Активный',draft:'Черновик',done:'Завершён'};
  const sc={active:'status-active',draft:'status-draft',done:'status-done'};
  document.getElementById('projectDetailBody').innerHTML=`
    <div class="project-detail-header">
      <div class="project-detail-avatar project-card-avatar ${project.authorColor}">${project.authorAvatar}</div>
      <div style="flex:1"><div class="project-detail-title">${project.name}</div><div class="project-detail-meta">${project.author} · ${getTimeAgo(project.createdAt)}</div></div>
      <span class="project-card-status ${sc[project.status]}">${sl[project.status]}</span>
    </div>
    <div class="project-detail-stats">
      <div class="project-detail-stat"><div class="project-detail-stat-num">${project.views}</div><div class="project-detail-stat-label">Просмотров</div></div>
      <div class="project-detail-stat"><div class="project-detail-stat-num">${project.likes}</div><div class="project-detail-stat-label">Лайков</div></div>
      <div class="project-detail-stat"><div class="project-detail-stat-num">${project.comments}</div><div class="project-detail-stat-label">Комментариев</div></div>
      <div class="project-detail-stat"><div class="project-detail-stat-num">${project.members}</div><div class="project-detail-stat-label">Участников</div></div>
    </div>
    <div style="font-size:14px;color:var(--text-2);line-height:1.7;margin-bottom:16px">${project.desc}</div>
    ${project.tags.length?`<div class="project-card-tags" style="margin-bottom:16px">${project.tags.map(t=>`<span class="project-tag">${t}</span>`).join('')}</div>`:''}
    <div class="funding-detail"><h3>Поддержать проект</h3><div class="funding-numbers"><strong>${formatMoney(project.raised||0)}</strong><span>из ${formatMoney(project.goal||50000)}</span><b>${Math.min(100,Math.round((project.raised||0)/(project.goal||50000)*100))}%</b></div><div class="funding-track"><span style="width:${Math.min(100,Math.round((project.raised||0)/(project.goal||50000)*100))}%"></span></div><p>Дедлайн: ${formatDeadline(project.deadline)}</p><div class="donation-row"><input id="donationAmount" type="number" min="1" step="1" value="500" aria-label="Сумма поддержки"><button class="primary" onclick="donateToProject(${project.id})">♡ Поддержать</button><button onclick="openWallet()">Кошелёк</button></div></div>
    <div class="project-detail-actions">
      <button class="primary" onclick="likeProject(${project.id})">❤ Лайк</button>
      <button onclick="alert('Ссылка скопирована!')">📤 Поделиться</button>
      <button onclick="closeProjectDetail();openEditProject(${project.id})">✏ Редактировать</button>
    </div>`;
  document.getElementById('editProjectBtn').onclick=()=>{closeProjectDetail();openEditProject(project.id)};
  document.getElementById('projectDetailModal').style.display='flex';
  project.views++;saveProjects(projects);renderProjects();
}
function closeProjectDetail(){document.getElementById('projectDetailModal').style.display='none'}
function openEditProject(id){
  const project=getProjects().find(p=>p.id===id);if(!project)return;
  document.getElementById('editProjectId').value=project.id;
  document.getElementById('editProjectName').value=project.name;
  document.getElementById('editProjectDesc').value=project.desc;
  document.getElementById('editProjectStatus').value=project.status;
  document.getElementById('editProjectModal').style.display='flex';
}
function closeEditProjectModal(){document.getElementById('editProjectModal').style.display='none'}
function likeProject(id){const projects=getProjects();const p=projects.find(x=>x.id===id);if(p){p.likes++;saveProjects(projects);openProjectDetail(id)}}
function submitProject(){
  const name=document.getElementById('projectName').value.trim();
  const desc=document.getElementById('projectDesc').value.trim();
  const status=document.getElementById('projectStatus').value;
  ensureFundingFields();const goal=Math.max(1,Number(document.getElementById('projectGoal')?.value)||50000);const deadline=document.getElementById('projectDeadline')?.value||new Date(Date.now()+86400000*30).toISOString().slice(0,10);
  if(!name){alert('Введите название проекта');return}
  if(!desc){alert('Введите описание проекта');return}
  const user=typeof getUserProfile==='function'?getUserProfile():{name:'Дмитрий С.',avatar:'ДС',color:'green'};
  const projects=getProjects();
  projects.unshift({id:Date.now(),name,desc,status,tags:[...selectedTags],author:user.name,authorAvatar:user.avatar||'ДС',authorColor:user.color||'green',views:0,likes:0,comments:0,members:1,createdAt:Date.now(),goal,raised:0,deadline});
  saveProjects(projects);closeCreateProjectModal();renderProjects();
}
function saveEditedProject(){
  const id=parseInt(document.getElementById('editProjectId').value);
  const name=document.getElementById('editProjectName').value.trim();
  const desc=document.getElementById('editProjectDesc').value.trim();
  const status=document.getElementById('editProjectStatus').value;
  if(!name||!desc){alert('Заполните все поля');return}
  const projects=getProjects();const p=projects.find(x=>x.id===id);
  if(p){p.name=name;p.desc=desc;p.status=status;saveProjects(projects)}
  closeEditProjectModal();renderProjects();
}
function deleteCurrentProject(){
  const id=parseInt(document.getElementById('editProjectId').value);
  if(!confirm('Удалить этот проект?'))return;
  saveProjects(getProjects().filter(p=>p.id!==id));
  closeEditProjectModal();renderProjects();
}

/* ================= ДЕМО-КОШЕЛЁК ================= */
function walletBalance(){try{return Number(localStorage.getItem('studhub_wallet_balance')||10000)}catch(e){return 10000}}
function setWalletBalance(value){localStorage.setItem('studhub_wallet_balance',String(value))}
function walletHistory(){try{return JSON.parse(localStorage.getItem('studhub_wallet_history')||'[]')}catch(e){return []}}
function saveWalletHistory(items){localStorage.setItem('studhub_wallet_history',JSON.stringify(items))}
function openWallet(){
 let modal=document.getElementById('walletModal');
 if(!modal){modal=document.createElement('div');modal.id='walletModal';modal.className='modal-overlay';modal.innerHTML='<div class="modal wallet-modal"><div class="modal-header"><h2>Мой кошелёк</h2><button class="modal-close" onclick="closeWallet()">×</button></div><div class="wallet-content"></div></div>';document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)closeWallet()})}
 renderWallet();modal.style.display='flex';
}
function closeWallet(){const m=document.getElementById('walletModal');if(m)m.style.display='none'}
function escapeWalletText(value){return String(value??'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function renderWallet(){
 const root=document.querySelector('#walletModal .wallet-content');if(!root)return;
 const history=walletHistory();
 root.innerHTML='<section class="wallet-balance"><span>Демо-баланс</span><strong>'+formatMoney(walletBalance())+'</strong><small>Учебный режим · реальные платежи не выполняются</small></section><div class="wallet-actions"><button type="button" class="wallet-action-primary" onclick="document.getElementById(\'walletTopup\').focus()">＋ Пополнить баланс</button><span class="wallet-action-note">История операций ниже</span></div><form class="wallet-add-form" onsubmit="event.preventDefault();addWalletFunds()"><label for="walletTopup">Сумма пополнения, ₽<input id="walletTopup" type="number" min="1" max="1000000" step="1" value="1000" required></label><button type="submit">Пополнить</button></form><div class="wallet-history-heading"><h3>История операций</h3><span>'+history.length+' операций</span></div><div class="wallet-history">'+(history.length?history.slice().reverse().map(x=>'<div class="wallet-history-item"><span class="wallet-operation-icon '+(x.amount<0?'outgoing':'incoming')+'">'+(x.amount<0?'↘':'↗')+'</span><span class="wallet-operation-description">'+escapeWalletText(x.label)+'<small>'+new Date(x.date).toLocaleString('ru-RU')+'</small></span><strong class="'+(x.amount<0?'negative':'positive')+'">'+(x.amount>0?'+':'')+formatMoney(x.amount)+'</strong></div>').join(''):'<div class="wallet-empty"><span>↗</span><b>Пока нет операций</b><small>Пополните демо-баланс или поддержите проект — операции появятся здесь.</small></div>')+'</div><p class="wallet-disclaimer">Демо-кошелёк нужен только для тестирования интерфейса. Деньги не переводятся.</p>';
}
function addWalletFunds(){const input=document.getElementById('walletTopup');const amount=Math.floor(Number(input&&input.value));if(!Number.isFinite(amount)||amount<1||amount>1000000){alert('Введите сумму от 1 до 1 000 000 ₽');return}setWalletBalance(walletBalance()+amount);const h=walletHistory();h.push({label:'Демо-пополнение',amount,date:new Date().toISOString()});saveWalletHistory(h);renderWallet()}
function donateToProject(id){const input=document.getElementById('donationAmount');const amount=Math.floor(Number(input&&input.value));if(!Number.isFinite(amount)||amount<1){alert('Введите корректную сумму поддержки');return}if(amount>walletBalance()){alert('Недостаточно средств в демо-кошельке. Откройте кошелёк и пополните баланс.');openWallet();return}const projects=getProjects();const p=projects.find(x=>x.id===id);if(!p)return;setWalletBalance(walletBalance()-amount);p.raised=(Number(p.raised)||0)+amount;saveProjects(projects);const h=walletHistory();h.push({label:'Поддержка: '+p.name,amount:-amount,date:new Date().toISOString()});saveWalletHistory(h);openProjectDetail(id);renderProjects();}

/* ================= СООБЩЕСТВА ================= */
const communities=[
  {id:1,name:'КИТиС',members:'1 284 участника',desc:'Колледж информационных технологий и строительства. Место для своих.',color:'var(--accent-soft)',textColor:'var(--accent-soft-text)',letter:'К',online:86},
  {id:2,name:'Жизнь в общаге',members:'342 участника',desc:'Всё о соседях, бытовухе и выживании в студенческом общежитии.',color:'var(--purple-soft)',textColor:'var(--purple-text)',letter:'О',online:23},
  {id:3,name:'Кодим вместе',members:'186 участников',desc:'От идеи до релиза. Делимся кодом, ревьюим, помогаем.',color:'var(--accent-soft)',textColor:'var(--accent-soft-text)',letter:'#',online:12},
  {id:4,name:'Дизайн-среда',members:'642 участника',desc:'UI/UX, графика, типографика. Для тех, кто любит красиво.',color:'var(--purple-soft)',textColor:'var(--purple-text)',letter:'Д',online:45},
  {id:5,name:'Стажировки и карьера',members:'1,8 тыс. участников',desc:'Вакансии, стажировки, советы по трудоустройству.',color:'var(--accent-soft)',textColor:'var(--accent-soft-text)',letter:'С',online:124},
  {id:6,name:'БФУ им. Канта',members:'2,4 тыс. участников',desc:'Сообщество студентов БФУ им. Иммануила Канта.',color:'var(--blue-soft)',textColor:'var(--blue-text)',letter:'Б',online:156},
  {id:7,name:'Хакатоны Калининград',members:'523 участника',desc:'Анонсы хакатонов, поиск команд, результаты.',color:'var(--orange-soft)',textColor:'var(--orange-text)',letter:'Х',online:34},
  {id:8,name:'Кофе и код',members:'298 участников',desc:'Еженедельные встречи разработчиков в кофейне.',color:'var(--accent-soft)',textColor:'var(--accent-soft-text)',letter:'К',online:18}
];
function renderCommunities(filter='all'){
  let list=communities;
  if(filter==='my')list=communities.slice(0,3);
  else if(filter==='popular')list=[...communities].sort((a,b)=>parseInt(b.members.replace(/\D/g,''))-parseInt(a.members.replace(/\D/g,'')));
  else if(filter==='new')list=[...communities].reverse();
  document.getElementById('communitiesContainer').innerHTML=list.map(c=>`
    <div class="community-card">
      <div class="community-card-header">
        <div class="community-card-avatar" style="background:${c.color};color:${c.textColor}">${c.letter}</div>
        <div style="flex:1"><div class="community-card-name">${c.name}</div><div class="community-card-members">${c.members} · ${c.online} онлайн</div></div>
      </div>
      <div class="community-card-desc">${c.desc}</div>
      <div class="community-card-footer">
        <div class="community-card-stat">👥 ${c.members}</div>
        <button class="btn-join-small" onclick="event.stopPropagation();this.textContent=this.textContent==='Вступить'?'✓ Участник':'Вступить'">Вступить</button>
      </div>
    </div>`).join('');
}
function filterCommunitiesByType(type,btn){
  btn.closest('.tabs-row').querySelectorAll('.tab-btn').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');renderCommunities(type);
}

/* ================= АКТИВЫ: ЗАГРУЗКА С УСТРОЙСТВА (IndexedDB) ================= */
const ASSET_DB_NAME = 'studhub_assets_db';
const ASSET_STORE = 'files';
const STORAGE_LIMIT = 100 * 1024 * 1024;

let assetDB = null;
let currentAssetFilter = 'all';
let pendingUploadFiles = [];

function openAssetDB() {
  return new Promise((resolve, reject) => {
    if (assetDB) return resolve(assetDB);
    if (!window.indexedDB) { reject(new Error('IndexedDB недоступен')); return; }
    const request = indexedDB.open(ASSET_DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(ASSET_STORE)) {
        db.createObjectStore(ASSET_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => { assetDB = event.target.result; resolve(assetDB); };
    request.onerror = () => reject(request.error);
  });
}

function createAssetId() {
  return 'asset_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' ГБ';
}

function getFileExtension(name) {
  const parts = String(name || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function getAssetIcon(type, name) {
  const ext = getFileExtension(name);
  if ((type || '').startsWith('image/')) return '🖼';
  if (['zip','rar','7z','tar','gz'].includes(ext)) return '📦';
  if (['pdf'].includes(ext)) return '📕';
  if (['doc','docx','txt','md','rtf','odt'].includes(ext)) return '';
  if (['xls','xlsx','csv'].includes(ext)) return '📊';
  if (['ppt','pptx'].includes(ext)) return '📽';
  if (['mp4','mov','avi','mkv','webm'].includes(ext)) return '🎬';
  if (['mp3','wav','ogg','m4a'].includes(ext)) return '🎵';
  if (['js','ts','html','css','json','py','java','cpp','c','cs','php','rb','go','rs'].includes(ext)) return '💻';
  return '';
}

function getAssetCategory(type, name) {
  const ext = getFileExtension(name);
  if ((type || '').startsWith('image/')) return 'img';
  if (['zip','rar','7z','tar','gz'].includes(ext)) return 'archive';
  return 'doc';
}

async function getAllAssets() {
  const db = await openAssetDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_STORE, 'readonly');
    const store = tx.objectStore(ASSET_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function getAssetById(id) {
  const db = await openAssetDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_STORE, 'readonly');
    const store = tx.objectStore(ASSET_STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function putAsset(record) {
  const db = await openAssetDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_STORE, 'readwrite');
    const store = tx.objectStore(ASSET_STORE);
    const request = store.put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

async function deleteAssetRecord(id) {
  const db = await openAssetDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_STORE, 'readwrite');
    const store = tx.objectStore(ASSET_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

async function updateStorageWidget(list) {
  const used = list.reduce((s, a) => s + (a.size || 0), 0);
  const pct = Math.min(100, (used / STORAGE_LIMIT) * 100);
  const usedEl = document.getElementById('storageUsed');
  const freeEl = document.getElementById('storageFree');
  const fillEl = document.getElementById('storageFill');
  const countEl = document.getElementById('navAssetsCount');
  if (usedEl) usedEl.textContent = formatSize(used) + ' / ' + formatSize(STORAGE_LIMIT);
  if (freeEl) freeEl.textContent = 'Доступно: ' + formatSize(Math.max(0, STORAGE_LIMIT - used));
  if (fillEl) fillEl.style.width = pct + '%';
  if (countEl) countEl.textContent = list.length;
}

async function renderAssets(filter = currentAssetFilter) {
  currentAssetFilter = filter;
  const container = document.getElementById('assetsContainer');
  if (!container) return;
  try {
    let list = await getAllAssets();
    await updateStorageWidget(list);
    if (filter !== 'all') {
      list = list.filter(asset => getAssetCategory(asset.type, asset.name) === filter);
    }
    list.sort((a, b) => b.createdAt - a.createdAt);
    if (!list.length) {
      container.innerHTML = `
        <div class="empty-projects">
          <svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>
          <h3>Файлов пока нет</h3>
          <p>Нажми «Загрузить файл» и добавь документы, изображения или архивы с устройства.</p>
        </div>`;
      return;
    }
    container.innerHTML = list.map(asset => {
      const category = getAssetCategory(asset.type, asset.name);
      const icon = getAssetIcon(asset.type, asset.name);
      const date = new Date(asset.createdAt).toLocaleDateString('ru-RU');
      const safeName = escapeHtml(asset.name);
      return `
        <div class="asset-item" data-name="${escapeHtml(asset.name.toLowerCase())}">
          <div class="asset-icon ${category}">${icon}</div>
          <div class="asset-info">
            <div class="asset-name">${safeName}</div>
            <div class="asset-meta">${date} · ${formatSize(asset.size)}</div>
          </div>
          <div class="asset-size">${formatSize(asset.size)}</div>
          <div class="asset-actions">
            <button class="asset-action-btn" title="Скачать" onclick="event.stopPropagation(); downloadAsset('${asset.id}')">
              <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            </button>
            <button class="asset-action-btn" title="Поделиться" onclick="event.stopPropagation(); shareAsset('${asset.id}')">
              <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
            </button>
            <button class="asset-action-btn" title="Удалить" onclick="event.stopPropagation(); deleteAsset('${asset.id}')">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');
  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="empty-projects"><h3>Хранилище недоступно</h3><p>Браузер заблокировал локальное хранилище или файл слишком большой.</p></div>`;
  }
}

function filterAssetsByType(type, btn) {
  const row = btn.closest('.tabs-row');
  if (row) {
    row.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  renderAssets(type);
}

async function downloadAsset(id) {
  try {
    const asset = await getAssetById(id);
    if (!asset) return;
    const url = URL.createObjectURL(asset.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error(error);
    alert('Не удалось скачать файл.');
  }
}

async function shareAsset(id) {
  try {
    const asset = await getAssetById(id);
    if (!asset) return;
    if (navigator.share) {
      await navigator.share({ title: asset.name, text: `Файл из StudHub: ${asset.name}` });
    } else {
      await navigator.clipboard.writeText(asset.name);
      alert('Название файла скопировано в буфер обмена.');
    }
  } catch (error) {
    console.error(error);
    alert('Не удалось поделиться файлом.');
  }
}

async function deleteAsset(id) {
  try {
    const asset = await getAssetById(id);
    if (!asset) return;
    if (!confirm(`Удалить файл «${asset.name}»?`)) return;
    await deleteAssetRecord(id);
    await renderAssets(currentAssetFilter);
  } catch (error) {
    console.error(error);
    alert('Не удалось удалить файл.');
  }
}

function openUploadModal() {
  pendingUploadFiles = [];
  renderUploadQueue();
  const modal = document.getElementById('uploadModal');
  if (modal) modal.style.display = 'flex';
}

function closeUploadModal() {
  pendingUploadFiles = [];
  renderUploadQueue();
  const input = document.getElementById('fileInput');
  if (input) input.value = '';
  const modal = document.getElementById('uploadModal');
  if (modal) modal.style.display = 'none';
}

function addFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;
  files.forEach(file => {
    if (file.size > STORAGE_LIMIT) {
      alert(`Файл «${file.name}» больше 100 МБ. Браузер может не сохранить его локально.`);
    }
    pendingUploadFiles.push(file);
  });
  renderUploadQueue();
}

function removePendingFile(index) {
  pendingUploadFiles.splice(index, 1);
  renderUploadQueue();
}

function renderUploadQueue() {
  const queue = document.getElementById('uploadQueue');
  if (!queue) return;
  if (!pendingUploadFiles.length) { queue.innerHTML = ''; return; }
  queue.innerHTML = pendingUploadFiles.map((file, index) => {
    const icon = getAssetIcon(file.type, file.name);
    const name = escapeHtml(file.name);
    const size = formatSize(file.size);
    return `
      <div class="upload-file">
        <div class="upload-file-icon">${icon}</div>
        <div class="upload-file-name">${name}</div>
        <div class="upload-file-size">${size}</div>
        <button type="button" class="upload-remove" onclick="removePendingFile(${index})">✕</button>
      </div>`;
  }).join('');
}

async function uploadPendingFiles() {
  if (!pendingUploadFiles.length) {
    alert('Сначала выбери файлы для загрузки.');
    return;
  }
  const button = document.getElementById('uploadSubmitBtn');
  if (button) { button.disabled = true; button.textContent = 'Загружаем...'; }
  try {
    for (const file of pendingUploadFiles) {
      await putAsset({
        id: createAssetId(),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        createdAt: Date.now(),
        blob: file
      });
    }
    pendingUploadFiles = [];
    renderUploadQueue();
    closeUploadModal();
    await renderAssets(currentAssetFilter);
    alert('Файлы успешно загружены.');
  } catch (error) {
    console.error(error);
    alert('Не удалось сохранить файлы. Проверь, что браузер разрешает локальное хранилище.');
  } finally {
    if (button) { button.disabled = false; button.textContent = 'Загрузить'; }
  }
}

function setupUploadDropzone() {
  const dropzone = document.getElementById('uploadDropzone');
  const input = document.getElementById('fileInput');
  const modal = document.getElementById('uploadModal');
  if (!dropzone || !input) return;
  dropzone.addEventListener('click', () => input.click());
  input.addEventListener('change', (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  });
  ['dragenter','dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault(); event.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave','drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault(); event.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', (event) => { addFiles(event.dataTransfer.files); });
  if (modal) {
    modal.addEventListener('click', (event) => { if (event.target === modal) closeUploadModal(); });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.style.display === 'flex') closeUploadModal();
  });
}

/* ================= ПОДПИСКИ ================= */
const subscriptions=[
  {id:1,name:'КИТиС',count:'1 284 участника',color:'var(--accent-soft)',textColor:'var(--accent-soft-text)',letter:'К',type:'community',desc:'Колледж информационных технологий и строительства'},
  {id:2,name:'Жизнь в общаге',count:'342 участника',color:'var(--purple-soft)',textColor:'var(--purple-text)',letter:'О',type:'community',desc:'Всё о студенческой жизни в общежитии'},
  {id:3,name:'Кодим вместе',count:'186 участников',color:'var(--accent-soft)',textColor:'var(--accent-soft-text)',letter:'#',type:'community',desc:'От идеи до релиза'},
  {id:4,name:'Дизайн-среда',count:'642 участника',color:'var(--purple-soft)',textColor:'var(--purple-text)',letter:'Д',type:'community',desc:'UI/UX, графика, типографика'},
  {id:5,name:'Стажировки и карьера',count:'1,8 тыс. участников',color:'var(--accent-soft)',textColor:'var(--accent-soft-text)',letter:'С',type:'community',desc:'Вакансии и возможности'},
  {id:6,name:'БФУ им. Канта',count:'2,4 тыс. участников',color:'var(--blue-soft)',textColor:'var(--blue-text)',letter:'Б',type:'community',desc:'Сообщество студентов БФУ'},
  {id:7,name:'П. Глушнев',count:'Студент · КИТиС',color:'var(--purple-soft)',textColor:'var(--purple-text)',letter:'ПГ',type:'people',desc:'Разработчик, активист'},
  {id:8,name:'Л. Галлахер',count:'Студент · БФУ',color:'var(--blue-soft)',textColor:'var(--blue-text)',letter:'ЛГ',type:'people',desc:'Дизайнер, фронтендер'}
];
function subscriptionHTML(s){
  return `<div class="subscription-item">
    <div class="subscription-avatar" style="background:${s.color};color:${s.textColor}">${s.letter}</div>
    <div class="subscription-info"><div class="subscription-name">${s.name}</div><div class="subscription-count">${s.count} · ${s.desc}</div></div>
    <span class="subscription-badge">Вы участник</span>
  </div>`;
}
function renderSubscriptions(filter='all'){
  let list=filter==='all'?subscriptions:subscriptions.filter(s=>s.type===filter);
  const full=list.map(s=>`
    <div class="subscription-item">
      <div class="subscription-avatar" style="background:${s.color};color:${s.textColor}">${s.letter}</div>
      <div class="subscription-info"><div class="subscription-name">${s.name}</div><div class="subscription-count">${s.count} · ${s.desc}</div></div>
      <div style="display:flex;gap:6px">
        <button class="btn-small" onclick="alert('Переход в: ${s.name}')">Открыть</button>
        <button class="btn-small btn-danger" onclick="if(confirm('Отписаться от ${s.name}?'))this.closest('.subscription-item').remove()">Отписаться</button>
      </div>
    </div>`).join('');
  const c1=document.getElementById('subscriptionsContainer');if(c1)c1.innerHTML=full;
  const c2=document.getElementById('subscriptionsContainerHome');if(c2)c2.innerHTML=list.map(subscriptionHTML).join('');
}
function filterSubsByType(type,btn){
  btn.closest('.tabs-row').querySelectorAll('.tab-btn').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');renderSubscriptions(type);
}

function showDevelopmentNotice(sectionName){
 const old=document.getElementById('studhub-dev-toast');if(old)old.remove();
 const toast=document.createElement('div');toast.id='studhub-dev-toast';
 toast.style.cssText='position:fixed;right:24px;bottom:24px;z-index:10050;max-width:360px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:16px;padding:16px 18px;box-shadow:var(--shadow-lg);font-family:inherit;animation:fadeIn .2s ease';
 toast.innerHTML='<div style="display:flex;gap:12px;align-items:flex-start"><span style="font-size:22px">🛠️</span><div><strong style="display:block;font-size:14px;margin-bottom:5px">Этот раздел сайта еще в разработке</strong><span style="font-size:12px;line-height:1.5;color:var(--text-2)"></span></div><button aria-label="Закрыть" style="border:0;background:transparent;color:var(--text-3);font-size:20px;cursor:pointer;margin-left:8px">×</button></div>';
 const detail=toast.querySelector('span[style*="line-height"]');if(detail)detail.textContent=sectionName||'Мы готовим этот раздел и добавим его в одном из следующих обновлений.';
 toast.querySelector('button').onclick=()=>toast.remove();document.body.appendChild(toast);setTimeout(()=>{if(toast.isConnected)toast.remove()},6000);
}

/* ================= ПРОЧЕЕ ================= */
function toggleCommunityJoin(){
  const btn=document.getElementById('communityJoinBtn');
  if(btn.classList.contains('joined')){btn.classList.remove('joined');btn.textContent='Вступить'}
  else{btn.classList.add('joined');btn.textContent='✓ Вы участник'}
}

function globalFilter(){
  const input=document.getElementById('globalSearch');
  if(!input)return;
  const q=input.value.trim().toLocaleLowerCase('ru');
  document.querySelectorAll('.project-card,.community-card,.asset-item,.subscription-item,.post-card').forEach(el=>{
    el.style.display=!q||el.textContent.toLocaleLowerCase('ru').includes(q)?'':'none';
  });
}
function openGlobalSearch(){
  const input=document.getElementById('globalSearch');
  const q=input?input.value.trim():'';
  const inPages=/\/pages\//.test(location.pathname);
  location.href=(inPages?'search.html':'pages/search.html')+(q?'?q='+encodeURIComponent(q):'');
}
const studHubSearchPages=[
 {title:'Главная',type:'Раздел',url:'../index.html',text:'лента студенты колледж КИТиС новости цитата дня'},
 {title:'Проекты',type:'Раздел',url:'projects.html',text:'проекты все сообщество создание команды разработка дизайн хакатон'},
 {title:'Сообщества',type:'Раздел',url:'communities.html',text:'сообщества КИТиС общага кодим вместе студенты общение'},
 {title:'Мои проекты',type:'Раздел',url:'assets.html',text:'мои проекты участие авторство файлы документы загрузка материалы'},
 {title:'Подписки',type:'Раздел',url:'subscriptions.html',text:'подписки карьера стажировки'},
 {title:'Мой профиль',type:'Раздел',url:'profile.html',text:'профиль имя аккаунт студент'},
 {title:'Настройки',type:'Раздел',url:'settings.html',text:'настройки тема безопасность уведомления'},
 {title:'Библиотека и материалы',type:'В разработке',url:'development.html?section=library',text:'библиотека материалы учебники конспекты документы'},
 {title:'Карьера и стажировки',type:'В разработке',url:'development.html?section=career',text:'карьера стажировки вакансии работа резюме'},
 {title:'Помощь и поддержка',type:'В разработке',url:'development.html?section=help',text:'помощь поддержка вопросы обратная связь'}
];
function renderGlobalSearchResults(){
 const input=document.getElementById('searchPageInput');
 const container=document.getElementById('searchResults');
 const meta=document.getElementById('searchResultMeta');
 if(!input||!container||!meta)return;
 const q=input.value.trim().toLocaleLowerCase('ru');
 let entries=studHubSearchPages.slice();
 try{JSON.parse(localStorage.getItem('studhub_projects')||'[]').forEach(project=>entries.push({title:project.name,type:'Проект',url:'projects.html',text:(project.desc||'')+' '+(project.tags||[]).join(' ')}));}catch(e){}
 const matches=q?entries.filter(item=>(item.title+' '+item.text+' '+item.type).toLocaleLowerCase('ru').includes(q)):[];
 meta.textContent=q?`Найдено результатов: ${matches.length}`:'Введите запрос, чтобы начать поиск';
 container.innerHTML=!q?'':matches.length?matches.map(item=>`<a class="search-result" href="${item.url}"><span class="search-result-type">${item.type}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></a>`).join(''):'<div class="search-no-results">🔎 Ничего не найдено. Попробуй изменить запрос.</div>';
}


/* ================= РЕДАКТИРОВАНИЕ ПРОФИЛЯ ================= */
(function () {
  const USER_KEY = 'studhub_profile_user';
  const DEFAULT_USER = {
    name: 'Дмитрий С.',
    email: 'demo@studhub.ru',
    campus: 'kitis',
    password: 'demo1234',
    bio: 'Пишу код, собираю команду и превращаю идеи в проекты.'
  };

  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return Object.assign({}, DEFAULT_USER, JSON.parse(raw));
    } catch (e) {}
    saveUser(DEFAULT_USER);
    return Object.assign({}, DEFAULT_USER);
  }
  function saveUser(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)); }

  window.getUserProfile = function () {
    const u = getUser();
    return { name: u.name, avatar: getInitials(u.name), color: 'green' };
  };

  function campusLabel(c) { return { kitis: 'КИТиС — Калининград', bfu: 'БФУ им. Канта', other: 'Другое' }[c] || c; }
  function campusShort(c) { return { kitis: 'КИТиС', bfu: 'БФУ им. Канта', other: 'Другое' }[c] || 'КИТиС'; }
  function getInitials(name) {
    if (!name) return 'УД';
    const p = name.trim().split(/\s+/);
    return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase();
  }
  function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function showErr(msg) { const el = document.getElementById('profileEditError'); if (el) { el.textContent = msg; el.style.display = 'block'; } }
  function clearErr() { const el = document.getElementById('profileEditError'); if (el) { el.textContent = ''; el.style.display = 'none'; } }

  function updateSettingByTitle(title, value) {
    const scope = document.getElementById('sec-settings');
    if (!scope) return;
    scope.querySelectorAll('.settings-item').forEach(item => {
      const t = item.querySelector('.settings-item-title');
      if (t && t.textContent.trim() === title) {
        const d = item.querySelector('.settings-item-desc');
        if (d) d.textContent = value;
      }
    });
  }

  function applyUserData() {
    const user = getUser();
    const initials = getInitials(user.name);
    document.querySelectorAll(
      '.header .user-name, #sec-profile .profile-name, .sidebar-right .profile-sidebar-name, #sec-profile .post-community'
    ).forEach(el => el.textContent = user.name);
    document.querySelectorAll(
      '.header .user-avatar, #sec-profile .profile-avatar-large, .sidebar-right .profile-sidebar-avatar, #sec-profile .post-avatar'
    ).forEach(el => el.textContent = initials);
    const selfChat = document.querySelector('.sidebar-right .chat-contact');
    if (selfChat) {
      const av = selfChat.querySelector('.chat-contact-avatar');
      const nm = selfChat.querySelector('.chat-contact-name');
      if (av) av.textContent = initials;
      if (nm) nm.textContent = user.name;
    }
    const sub = document.querySelector('#sec-profile .profile-subtitle');
    if (sub) {
      const city = user.campus === 'other' ? '' : ' · Калининград';
      sub.textContent = campusShort(user.campus) + ' · 1 курс' + city;
    }
    updateSettingByTitle('Имя', user.name);
    updateSettingByTitle('Email', user.email);
    updateSettingByTitle('Кампус', campusLabel(user.campus));
  }

  window.openProfileEditModal = function (focusPassword) {
    const user = getUser();
    const nameEl = document.getElementById('editProfileName');
    const emailEl = document.getElementById('editProfileEmail');
    const campusEl = document.getElementById('editProfileCampus');
    const curEl = document.getElementById('editCurrentPassword');
    const newEl = document.getElementById('editNewPassword');
    const confEl = document.getElementById('editNewPasswordConfirm');
    if (!nameEl || !emailEl || !campusEl) return;
    nameEl.value = user.name;
    emailEl.value = user.email;
    campusEl.value = user.campus;
    if (curEl) curEl.value = '';
    if (newEl) newEl.value = '';
    if (confEl) confEl.value = '';
    clearErr();
    document.getElementById('profileEditModal').style.display = 'flex';
    setTimeout(() => {
      if (focusPassword && curEl) curEl.focus();
      else nameEl.focus();
    }, 80);
  };

  window.closeProfileEditModal = function () {
    const m = document.getElementById('profileEditModal');
    if (m) m.style.display = 'none';
    ['editCurrentPassword', 'editNewPassword', 'editNewPasswordConfirm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    clearErr();
  };

  window.saveProfileChanges = function (event) {
    if (event) event.preventDefault();
    clearErr();
    const user = getUser();
    const name = document.getElementById('editProfileName').value.trim();
    const email = document.getElementById('editProfileEmail').value.trim().toLowerCase();
    const campus = document.getElementById('editProfileCampus').value;
    const cur = document.getElementById('editCurrentPassword').value;
    const nw = document.getElementById('editNewPassword').value;
    const cf = document.getElementById('editNewPasswordConfirm').value;
    if (name.length < 2) return showErr('Имя должно содержать минимум 2 символа.');
    if (!isValidEmail(email)) return showErr('Введите корректный email.');
    const wantsPass = Boolean(cur || nw || cf);
    if (wantsPass) {
      if (!cur) return showErr('Введите текущий пароль, чтобы сменить пароль.');
      if (cur !== user.password) return showErr('Текущий пароль неверен.');
      if (nw.length < 8) return showErr('Новый пароль должен содержать минимум 8 символов.');
      if (nw !== cf) return showErr('Новые пароли не совпадают.');
      user.password = nw;
    }
    user.name = name;
    user.email = email;
    user.campus = campus;
    saveUser(user);
    applyUserData();
    closeProfileEditModal();
    alert(wantsPass ? 'Профиль и пароль обновлены!' : 'Профиль обновлён!');
  };

  window.exportData = function () {
    const user = getUser();
    const projects = typeof getProjects === 'function' ? getProjects() : [];
    const data = {
      user: { name: user.name, email: user.email, campus: user.campus, bio: user.bio },
      projects,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studhub_profile_export.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('Данные экспортированы!');
  };

  function init() {
    applyUserData();
    const m = document.getElementById('profileEditModal');
    if (m) m.addEventListener('click', e => { if (e.target === m) closeProfileEditModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && m && m.style.display === 'flex') closeProfileEditModal();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ================= ПОСТЫ С ФАЙЛАМИ ================= */
(function () {
  const POSTS_KEY = 'studhub_posts';
  const POST_DB_NAME = 'studhub_post_files';
  const POST_FILE_STORE = 'attachments';
  const MAX_POST_FILE_SIZE = 100 * 1024 * 1024;

  let postDB = null;
  let pendingPostFiles = [];
  let previewUrls = [];

  function getPosts() {
    try { return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]'); } catch (e) { return []; }
  }
  function savePosts(posts) { localStorage.setItem(POSTS_KEY, JSON.stringify(posts)); }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' ГБ';
  }

  function getFileExtension(name) {
    const parts = String(name || '').split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function getFileIcon(name, type) {
    const ext = getFileExtension(name);
    if ((type || '').startsWith('image/')) return '🖼';
    if (['zip','rar','7z','tar','gz'].includes(ext)) return '📦';
    if (['pdf'].includes(ext)) return '📕';
    if (['doc','docx','txt','md','rtf','odt'].includes(ext)) return '📄';
    if (['xls','xlsx','csv'].includes(ext)) return '📊';
    if (['ppt','pptx'].includes(ext)) return '📽';
    if (['mp4','mov','avi','mkv','webm'].includes(ext)) return '🎬';
    if (['mp3','wav','ogg','m4a'].includes(ext)) return '🎵';
    if (['js','ts','html','css','json','py','java','cpp','c','cs','php','rb','go','rs'].includes(ext)) return '💻';
    return '';
  }

  function getPostAuthor() {
    try {
      if (typeof window.getUserProfile === 'function') {
        const profile = window.getUserProfile();
        if (profile && profile.name) {
          return { name: profile.name, avatar: profile.avatar || getInitials(profile.name) };
        }
      }
      const raw = localStorage.getItem('studhub_profile_user');
      if (raw) {
        const user = JSON.parse(raw);
        return { name: user.name || 'Дмитрий С.', avatar: getInitials(user.name || 'Дмитрий С.') };
      }
    } catch (e) {}
    return { name: 'Дмитрий С.', avatar: 'ДС' };
  }

  function openPostDB() {
    return new Promise((resolve, reject) => {
      if (postDB) return resolve(postDB);
      if (!window.indexedDB) { reject(new Error('IndexedDB недоступен')); return; }
      const request = indexedDB.open(POST_DB_NAME, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(POST_FILE_STORE)) {
          db.createObjectStore(POST_FILE_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = (event) => { postDB = event.target.result; resolve(postDB); };
      request.onerror = () => reject(request.error);
    });
  }

  async function putPostFile(file) {
    const db = await openPostDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(POST_FILE_STORE, 'readwrite');
      const store = tx.objectStore(POST_FILE_STORE);
      const record = {
        id: uid('file'),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        createdAt: Date.now(),
        blob: file
      };
      const request = store.put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  }

  async function getPostFile(id) {
    const db = await openPostDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(POST_FILE_STORE, 'readonly');
      const store = tx.objectStore(POST_FILE_STORE);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function deletePostFile(id) {
    const db = await openPostDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(POST_FILE_STORE, 'readwrite');
      const store = tx.objectStore(POST_FILE_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  function revokePreviewUrls() {
    previewUrls.forEach((url) => { try { URL.revokeObjectURL(url); } catch (e) {} });
    previewUrls = [];
  }

  async function loadPostImagePreviews() {
    const images = document.querySelectorAll('img.post-image-preview[data-attachment-id]');
    for (const img of images) {
      const attachmentId = img.getAttribute('data-attachment-id');
      if (!attachmentId) continue;
      try {
        const fileRecord = await getPostFile(attachmentId);
        if (!fileRecord || !fileRecord.blob) continue;
        const url = URL.createObjectURL(fileRecord.blob);
        previewUrls.push(url);
        img.src = url;
      } catch (error) { console.error('Не удалось загрузить превью:', error); }
    }
  }

  function renderPostQueue() {
    const queue = document.getElementById('postQueue');
    if (!queue) return;
    if (!pendingPostFiles.length) { queue.innerHTML = ''; return; }
    queue.innerHTML = pendingPostFiles.map((file, index) => {
      const icon = getFileIcon(file.name, file.type);
      const name = esc(file.name);
      const size = formatBytes(file.size);
      return `
        <div class="upload-file">
          <div class="upload-file-icon">${icon}</div>
          <div class="upload-file-name">${name}</div>
          <div class="upload-file-size">${size}</div>
          <button type="button" class="upload-remove" onclick="removePendingPostFile(${index})">✕</button>
        </div>`;
    }).join('');
  }

  window.addPostFiles = function (fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    files.forEach((file) => {
      if (file.size > MAX_POST_FILE_SIZE) {
        alert(`Файл «${file.name}» больше 100 МБ. Для демо-версии лучше брать файлы поменьше.`);
        return;
      }
      pendingPostFiles.push(file);
    });
    renderPostQueue();
  };

  window.removePendingPostFile = function (index) {
    pendingPostFiles.splice(index, 1);
    renderPostQueue();
  };

  window.openCreatePostModal = function () {
    pendingPostFiles = [];
    renderPostQueue();
    const title = document.getElementById('postTitle');
    const text = document.getElementById('postText');
    const tags = document.getElementById('postTags');
    const input = document.getElementById('postFileInput');
    if (title) title.value = '';
    if (text) text.value = '';
    if (tags) tags.value = '';
    if (input) input.value = '';
    const modal = document.getElementById('createPostModal');
    if (modal) modal.style.display = 'flex';
    setTimeout(() => { if (title) title.focus(); }, 80);
  };

  window.closeCreatePostModal = function () {
    pendingPostFiles = [];
    renderPostQueue();
    const input = document.getElementById('postFileInput');
    if (input) input.value = '';
    const modal = document.getElementById('createPostModal');
    if (modal) modal.style.display = 'none';
  };

  window.submitPost = async function (event) {
    if (event) event.preventDefault();
    const titleEl = document.getElementById('postTitle');
    const textEl = document.getElementById('postText');
    const tagsEl = document.getElementById('postTags');
    const button = document.getElementById('publishPostBtn');
    const title = titleEl ? titleEl.value.trim() : '';
    const text = textEl ? textEl.value.trim() : '';
    const tagsRaw = tagsEl ? tagsEl.value.trim() : '';
    if (!title) { alert('Добавь заголовок поста.'); if (titleEl) titleEl.focus(); return; }
    if (!text && pendingPostFiles.length === 0) { alert('Добавь текст или прикрепи хотя бы один файл.'); if (textEl) textEl.focus(); return; }
    const tags = tagsRaw.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 6);
    if (button) { button.disabled = true; button.textContent = 'Публикуем...'; }
    try {
      const attachments = [];
      for (const file of pendingPostFiles) {
        const savedFile = await putPostFile(file);
        attachments.push({ id: savedFile.id, name: savedFile.name, size: savedFile.size, type: savedFile.type });
      }
      const author = getPostAuthor();
      const posts = getPosts();
      posts.unshift({
        id: uid('post'),
        title, text, tags, attachments,
        authorName: author.name,
        authorAvatar: author.avatar,
        createdAt: Date.now()
      });
      savePosts(posts);
      closeCreatePostModal();
      await window.renderPosts();
    } catch (error) {
      console.error(error);
      alert('Не удалось опубликовать пост. Проверь, что браузер разрешает локальное хранилище.');
    } finally {
      if (button) { button.disabled = false; button.textContent = 'Опубликовать пост'; }
    }
  };

  window.downloadPostAttachment = async function (attachmentId) {
    try {
      const fileRecord = await getPostFile(attachmentId);
      if (!fileRecord || !fileRecord.blob) { alert('Файл не найден в локальном хранилище.'); return; }
      const url = URL.createObjectURL(fileRecord.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileRecord.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { console.error(error); alert('Не удалось скачать файл.'); }
  };

  window.deletePost = async function (postId) {
    const posts = getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    if (!confirm(`Удалить пост «${post.title}»? Вложения тоже удалятся.`)) return;
    try {
      for (const attachment of post.attachments || []) { await deletePostFile(attachment.id); }
      savePosts(posts.filter((p) => p.id !== postId));
      await window.renderPosts();
    } catch (error) { console.error(error); alert('Не удалось удалить пост.'); }
  };

  window.renderPosts = async function () {
    const container = document.getElementById('profileTabContent');
    if (!container) return;
    revokePreviewUrls();
    const posts = getPosts().sort((a, b) => b.createdAt - a.createdAt);
    const toolbar = `
      <div class="posts-toolbar">
        <div class="posts-toolbar-left">
          <h2>Мои публикации</h2>
          <p>Делай посты с текстом, тегами и файлами — как небольшие релизы своих идей.</p>
        </div>
        <button class="btn-create" type="button" onclick="openCreatePostModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Создать пост
        </button>
      </div>`;
    if (!posts.length) {
      container.innerHTML = `
        ${toolbar}
        <div class="empty-projects">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          <h3>Постов пока нет</h3>
          <p>Создай первый пост: опиши идею, добавь теги и прикрепи файлы.</p>
          <div class="post-empty-actions">
            <button class="btn-auth" type="button" onclick="openCreatePostModal()">Создать первый пост</button>
          </div>
        </div>`;
      return;
    }
    container.innerHTML = toolbar + posts.map((post) => {
      const tagsHTML = post.tags && post.tags.length
        ? `<div class="project-card-tags" style="margin-bottom:10px">${post.tags.map((tag) => `<span class="project-tag">${esc(tag)}</span>`).join('')}</div>`
        : '';
      const attachmentsHTML = post.attachments && post.attachments.length
        ? `<div class="post-attachments">
            ${post.attachments.map((attachment) => {
              const icon = getFileIcon(attachment.name, attachment.type);
              const isImage = String(attachment.type || '').startsWith('image/');
              return `
                <div class="post-attachment">
                  <div class="post-attachment-icon">${icon}</div>
                  <div class="post-attachment-name">${esc(attachment.name)}</div>
                  <div class="post-attachment-size">${formatBytes(attachment.size)}</div>
                  <div class="post-attachment-actions">
                    <button class="asset-action-btn" title="Скачать" onclick="event.stopPropagation(); downloadPostAttachment('${attachment.id}')">
                      <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    </button>
                  </div>
                </div>
                ${isImage ? `<img class="post-image-preview" data-attachment-id="${attachment.id}" alt="${esc(attachment.name)}">` : ''}`;
            }).join('')}
          </div>`
        : '';
      return `
        <article class="post-card" data-post-id="${post.id}">
          <button class="post-delete-btn" type="button" title="Удалить пост" onclick="deletePost('${post.id}')">✕</button>
          <div class="post-author-row">
            <div class="post-avatar">${esc(post.authorAvatar || 'ДС')}</div>
            <div>
              <div class="post-community">${esc(post.authorName || 'Дмитрий С.')}</div>
              <div class="post-info">${getTimeAgo(post.createdAt)}</div>
            </div>
          </div>
          ${tagsHTML}
          <div class="post-title-text">${esc(post.title)}</div>
          ${post.text ? `<div class="post-text">${esc(post.text)}</div>` : ''}
          ${attachmentsHTML}
        </article>`;
    }).join('');
    await loadPostImagePreviews();
  };

  function setupPostDropzone() {
    const dropzone = document.getElementById('postDropzone');
    const input = document.getElementById('postFileInput');
    const modal = document.getElementById('createPostModal');
    if (!dropzone || !input) return;
    dropzone.addEventListener('click', () => input.click());
    input.addEventListener('change', (event) => {
      window.addPostFiles(event.target.files);
      event.target.value = '';
    });
    ['dragenter','dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        event.preventDefault(); event.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });
    ['dragleave','drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        event.preventDefault(); event.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });
    dropzone.addEventListener('drop', (event) => { window.addPostFiles(event.dataTransfer.files); });
    if (modal) {
      modal.addEventListener('click', (event) => { if (event.target === modal) window.closeCreatePostModal(); });
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal && modal.style.display === 'flex') window.closeCreatePostModal();
    });
  }

  window.switchProfileTab = function (btn, tab) {
    document.querySelectorAll('.profile-tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    const content = document.getElementById('profileTabContent');
    if (!content) return;
    if (tab === 'pub') { window.renderPosts(); return; }
    if (tab === 'proj') {
      revokePreviewUrls();
      const myProjects = typeof window.getProjects === 'function'
        ? window.getProjects().filter((p) => p.author === getPostAuthor().name || p.author === 'Дмитрий С.')
        : [];
      content.innerHTML = `
        <div class="posts-toolbar">
          <div class="posts-toolbar-left">
            <h2>Мои проекты</h2>
            <p>Проекты, которые ты создал или в которых участвуешь.</p>
          </div>
          <button class="btn-create" type="button" onclick="openCreateProjectModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Создать проект
          </button>
        </div>
        ${myProjects.length
          ? `<div class="projects-grid">${myProjects.map((project) => {
              if (typeof window.projectCardHTML === 'function') return window.projectCardHTML(project);
              return '';
            }).join('')}</div>`
          : `<div class="empty-projects"><h3>Проектов пока нет</h3><p>Создай первый проект!</p></div>`}
      `;
      return;
    }
    if (tab === 'saved') {
      revokePreviewUrls();
      content.innerHTML = `
        <div class="posts-toolbar">
          <div class="posts-toolbar-left">
            <h2>Сохранённое</h2>
            <p>Здесь появятся сохранённые посты, проекты и файлы.</p>
          </div>
        </div>
        <div class="empty-projects">
          <h3>Пока пусто</h3>
          <p>Сохраняй интересные материалы, и они будут доступны здесь.</p>
        </div>`;
    }
  };

  function initPostsFeature() {
    setupPostDropzone();
    window.renderPosts();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPostsFeature);
  else initPostsFeature();
})();

/* ================= МОДАЛКА ПРАВИЛ ================= */
window.openRulesModal = function () {
  const modal = document.getElementById('rulesModal');
  if (modal) {
    modal.style.display = 'flex';
    const body = modal.querySelector('.modal-body');
    if (body) body.scrollTop = 0;
  }
};

window.closeRulesModal = function () {
  const modal = document.getElementById('rulesModal');
  if (modal) modal.style.display = 'none';
};

window.acceptRules = function () {
  try { localStorage.setItem('studhub_rules_accepted', new Date().toISOString()); } catch (e) {}
  closeRulesModal();
  alert('Спасибо! Приятного общения в StudHub 🤝');
};

// Закрытие модалки правил по клику на затемнение и Esc
(function(){
  const rulesModal = document.getElementById('rulesModal');
  if (!rulesModal) return;
  rulesModal.addEventListener('click', (e) => { if (e.target === rulesModal) closeRulesModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rulesModal.style.display === 'flex') closeRulesModal();
  });
})();

/* ================= DROPDOWNS + INIT ================= */
/* ================= ПОМОЩЬ: FAQ, ГАЙДЫ, ТИКЕТЫ ================= */
const HELP_FAQ=[
  {q:'Как поддержать проект деньгами?',a:'Открой страницу проекта, нажми яркую фисташковую кнопку «Поддержать», выбери сумму и оплати через защищённый шлюз. Даже 100 ₽ помогают проекту подняться в рекомендациях.'},
  {q:'Я не автор, но хочу помочь идее. Что делать?',a:'Не обязательно быть разработчиком: можно поддержать рублём, стать тестировщиком, дизайнером или просто распространять ссылку на проект среди одногруппников.'},
  {q:'Что за «Маркетплейс незавершённых проектов»?',a:'Это раздел, где студенты продают или передают заброшенный код, дизайн или исследование тому, кто готов его доделать. Такие проекты отлично подходят как база для диплома или портфолио.'},
  {q:'Как связаться с автором проекта?',a:'Используй обсуждения на странице проекта или встроенный мессенджер StudHub — так все договорённости сохраняются в истории проекта и остаются безопасными.'},
  {q:'Куда деваются мои файлы из «Мои активы»?',a:'Ничего не теряется: во вкладке «Мои активы» собраны именно твои проекты и прикреплённые к ним материалы (документы, макеты, архивы).'},
  {q:'Проект не набирает поддержку. С чего начать?',a:'Первую волну (≈30% от цели) обычно приводят друзья и подписчики автора — скинь ссылку в свои чаты. И добавь визуал: проекты с картинками собирают на 70% больше поддержки.'}
];
function renderHelpFaq(){
  const c=document.getElementById('faqList');
  if(!c)return;
  c.innerHTML=HELP_FAQ.map((f,i)=>
    `<div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">${f.q}<span class="faq-arrow">▾</span></button><div class="faq-a"${i===0?' style="display:block"':''}><p>${f.a}</p></div></div>`
  ).join('');
}
function toggleFaq(btn){
  const a=btn.nextElementSibling;
  const open=a.style.display==='block';
  btn.closest('.faq-list').querySelectorAll('.faq-a').forEach(x=>x.style.display='none');
  btn.closest('.faq-list').querySelectorAll('.faq-q').forEach(x=>x.classList.remove('open'));
  if(!open){a.style.display='block';btn.classList.add('open');}
}
function renderHelpGuides(){
  renderHelpFaq();
  renderMyProjects();
}
function openHelpTicketModal(){
  let m=document.getElementById('helpTicketModal');
  if(!m){
    m=document.createElement('div');
    m.id='helpTicketModal';m.className='modal-overlay';m.style.display='none';
    m.innerHTML='<div class="modal" style="max-width:520px">'+
      '<div class="modal-header"><h3>🛠 Сообщить о проблеме</h3><button class="modal-close" onclick="closeHelpTicketModal()">✕</button></div>'+
      '<div class="modal-body">'+
      '<div class="form-group"><label class="form-label">Что случилось? *</label><input type="text" class="form-input" id="ticketSubject" placeholder="Например: не открывается страница проекта"></div>'+
      '<div class="form-group"><label class="form-label">Опиши подробнее</label><textarea class="form-input" id="ticketText" rows="4" placeholder="Шаги, которые привели к проблеме, браузер, скриншот (можно описать словами)…"></textarea></div>'+
      '<div class="form-group"><label class="form-label">Email для ответа (необязательно)</label><input type="email" class="form-input" id="ticketEmail" placeholder="you@studhub.ru"></div>'+
      '</div>'+
      '<div class="modal-footer"><button class="btn-auth secondary" onclick="closeHelpTicketModal()">Отмена</button><button class="btn-auth" onclick="submitHelpTicket()">Отправить</button></div>'+
      '</div>';
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeHelpTicketModal()});
  }
  m.style.display='flex';
}
function closeHelpTicketModal(){const m=document.getElementById('helpTicketModal');if(m)m.style.display='none'}
function submitHelpTicket(){
  const subject=(document.getElementById('ticketSubject').value||'').trim();
  if(!subject){alert('Кратко опиши, что случилось');return}
  try{
    const tickets=JSON.parse(localStorage.getItem('studhub_help_tickets')||'[]');
    tickets.unshift({id:Date.now(),subject,text:(document.getElementById('ticketText').value||'').trim(),email:(document.getElementById('ticketEmail').value||'').trim(),createdAt:new Date().toISOString()});
    localStorage.setItem('studhub_help_tickets',JSON.stringify(tickets));
  }catch(e){}
  closeHelpTicketModal();
  alert('Спасибо! Тикет отправлен — команда StudHub ответит в течение дня 🧡');
}

document.addEventListener('DOMContentLoaded',()=>{
  const w=document.getElementById('communityWindows');
  if(w)w.innerHTML=Array(32).fill('<div class="window"></div>').join('');

  const userProfile=document.getElementById('userProfile');
  const profileDropdown=document.getElementById('profileDropdown');
  const notifIcon=document.getElementById('notifIcon');
  const notifDropdown=document.getElementById('notifDropdown');

  if(userProfile&&profileDropdown){
    userProfile.addEventListener('click',e=>{e.stopPropagation();if(notifDropdown)notifDropdown.classList.remove('show');profileDropdown.classList.toggle('show')});
  }
  if(notifIcon&&notifDropdown){
    notifIcon.addEventListener('click',e=>{e.stopPropagation();if(profileDropdown)profileDropdown.classList.remove('show');notifDropdown.classList.toggle('show');const badge=document.getElementById('notifBadge');if(badge)badge.style.display='none'});
  }
  document.addEventListener('click',e=>{
    if(userProfile&&!userProfile.contains(e.target)&&profileDropdown)profileDropdown.classList.remove('show');
    if(notifIcon&&!notifIcon.contains(e.target)&&notifDropdown)notifDropdown.classList.remove('show');
  });
  document.querySelectorAll('.modal-overlay').forEach(m=>{
    m.addEventListener('click',e=>{if(e.target===m)m.style.display='none'});
  });

  if(!document.getElementById('walletQuickButton')){const header=document.querySelector('.header-right');if(header){const wb=document.createElement('button');wb.id='walletQuickButton';wb.className='wallet-quick-button';wb.type='button';wb.textContent='₽ Кошелёк';wb.onclick=openWallet;header.insertBefore(wb,header.firstChild)}}
  let saved;try{saved=localStorage.getItem('studhub_theme')||'light'}catch(e){saved='light'}
  applyTheme(saved);

  if(document.getElementById('projectsContainer')||document.getElementById('projectsContainer2'))renderProjects('all');
  if(document.getElementById('communitiesContainer'))renderCommunities('all');
  if(document.getElementById('subscriptionsContainer')||document.getElementById('subscriptionsContainerHome'))renderSubscriptions('all');
  if(document.getElementById('assetUploadInput')||document.getElementById('assetsContainer'))setupUploadDropzone();
  if(document.getElementById('assetsContainer'))renderAssets('all');
  renderHelpGuides();
  // Старые ссылки вида index.html#myprojects / #help → на нужные страницы
  (function(){
    const h=(location.hash||'').replace('#','');
    if(h==='myprojects'){ location.replace('pages/assets.html'); }
    else if(h==='help'){ location.replace('pages/help.html'); }
  })();

  const searchPageInput=document.getElementById('searchPageInput');
  if(searchPageInput){const params=new URLSearchParams(location.search);searchPageInput.value=params.get('q')||'';if(searchPageInput.value)renderGlobalSearchResults();}
  if(document.getElementById('scheduleGrid')){const dayButtons=document.querySelectorAll('.schedule-day');if(dayButtons.length)selectScheduleDay(dayButtons[0]);initLiveSchedule();}
  if(document.getElementById('devTitle')){const section=new URLSearchParams(location.search).get('section');const names={library:'Библиотека и материалы',career:'Карьера и стажировки',help:'Помощь и поддержка'};if(names[section])document.getElementById('devTitle').textContent=names[section]+' — этот раздел сайта еще в разработке';}

  // Приветственный тост с правилами (показывается один раз)
  try {
    if (!localStorage.getItem('studhub_rules_accepted')) {
      setTimeout(function () {
        const hint = document.createElement('div');
        hint.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;background:var(--surface);border:1px solid var(--accent);border-radius:14px;padding:14px 18px;box-shadow:var(--shadow-lg);max-width:320px;font-family:inherit;animation:fadeIn .3s ease';
        hint.innerHTML = '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">📜 Правила StudHub</div>' +
          '<div style="font-size:13px;color:var(--text-2);line-height:1.5;margin-bottom:10px">Ознакомься с правилами сообщества, прежде чем начать общение.</div>' +
          '<div style="display:flex;gap:8px">' +
          '<button onclick="openRulesModal()" style="flex:1;background:var(--accent);color:#fff;border:none;padding:8px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Открыть правила</button>' +
          '<button onclick="this.parentElement.parentElement.remove()" style="background:var(--surface-3);color:var(--text-2);border:none;padding:8px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Позже</button>' +
          '</div>';
        document.body.appendChild(hint);
        setTimeout(function () { if (hint.parentElement) hint.remove(); }, 15000);
      }, 1500);
    }
  } catch (e) {}
});


/* ================= ПУБЛИЧНЫЕ ПРОФИЛИ ================= */
(function () {
  const PUBLIC_PROFILES = {
    'Дмитрий С.': { id:'dimidrol', name:'Дмитрий С.', handle:'@dimidrol', avatar:'ДС', campus:'КИТиС · 1 курс · Калининград', bio:'Пишу код, собираю команду и превращаю идеи в проекты.', role:'Студент · КИТиС', projects:5, posts:24, followers:128, following:86, color:'green' },
    'П. Глушнев': { id:'glushnev', name:'Павел Глушнев', handle:'@glushnev', avatar:'ПГ', campus:'КИТиС · 2 курс · Калининград', bio:'Разрабатываю ботов и инструменты, которые экономят время студентам. Сейчас работаю над ботом расписания.', role:'Разработчик · КИТиС', projects:3, posts:18, followers:74, following:53, color:'blue' },
    'Л. Галлахер': { id:'gallagher', name:'Лиам Галлахер', handle:'@liamg', avatar:'ЛГ', campus:'БФУ им. Канта · Калининград', bio:'Дизайнер и фронтендер. Люблю аккуратные интерфейсы, доступность и хорошие шрифты.', role:'Дизайнер · БФУ', projects:4, posts:16, followers:92, following:61, color:'purple' },
    'Анна М.': { id:'anna-m', name:'Анна М.', handle:'@anna.design', avatar:'АМ', campus:'КИТиС · 3 курс · Калининград', bio:'UI/UX-дизайн, дизайн-системы и визуальная упаковка идей. Открыта к командным проектам.', role:'Дизайнер · КИТиС', projects:6, posts:31, followers:156, following:104, color:'orange' },
    'К. Дейко': { id:'deiko', name:'Кирилл Дейко', handle:'@deiko', avatar:'КД', campus:'КИТиС · Калининград', bio:'Организую встречи «Кофе и код», помогаю новичкам войти в разработку.', role:'Студент · КИТиС', projects:2, posts:12, followers:49, following:38, color:'purple' }
  };
  function currentProfileUrl(id) {
    const inPages = /\/pages\//.test(location.pathname);
    return (inPages ? 'profile.html' : 'pages/profile.html') + '?user=' + encodeURIComponent(id);
  }
  function profileForName(name) {
    const clean = String(name || '').trim();
    return PUBLIC_PROFILES[clean] || Object.values(PUBLIC_PROFILES).find(profile => profile.name.toLocaleLowerCase('ru') === clean.toLocaleLowerCase('ru')) || null;
  }
  function makeClickable(el, profile) {
    if (!el || !profile || el.dataset.profileBound === '1') return;
    el.dataset.profileBound = '1';
    el.classList.add('studhub-profile-link');
    el.setAttribute('role', 'link');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Открыть профиль: ' + profile.name);
    el.addEventListener('click', function (event) {
      event.preventDefault(); event.stopPropagation();
      location.href = currentProfileUrl(profile.id);
    });
    el.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); location.href = currentProfileUrl(profile.id); }
    });
  }
  function bindProfileLinks() {
    document.querySelectorAll('.project-card-author').forEach(el => {
      const name = el.textContent.split('·')[0].trim();
      makeClickable(el, profileForName(name));
    });
    document.querySelectorAll('.post-community, .chat-contact-name, .subscription-name').forEach(el => makeClickable(el, profileForName(el.textContent.trim())));
    document.querySelectorAll('.post-avatar').forEach(el => {
      const row = el.closest('.post-author-row');
      const name = row && row.querySelector('.post-community');
      if (name) makeClickable(el, profileForName(name.textContent.trim()));
    });
    document.querySelectorAll('.chat-contact').forEach(el => {
      const name = el.querySelector('.chat-contact-name');
      if (name) makeClickable(el, profileForName(name.textContent.trim()));
    });
  }
  function renderPublicProfile() {
    if (!document.getElementById('sec-profile')) return;
    const params = new URLSearchParams(location.search);
    const requested = params.get('user');
    if (!requested) return;
    const profile = Object.values(PUBLIC_PROFILES).find(item => item.id === requested);
    if (!profile) return;
    const root = document.getElementById('sec-profile');
    const title = root.querySelector('.profile-header-title'); if (title) title.textContent = 'Профиль пользователя';
    root.querySelectorAll('.profile-name').forEach(el => el.textContent = profile.name);
    root.querySelectorAll('.profile-avatar-large').forEach(el => el.textContent = profile.avatar);
    root.querySelectorAll('.profile-subtitle').forEach(el => el.textContent = profile.campus);
    root.querySelectorAll('.profile-bio').forEach(el => el.textContent = profile.bio);
    root.querySelectorAll('.profile-joined').forEach(el => el.textContent = profile.handle + ' · Публичный профиль StudHub');
    const edit = root.querySelector('.btn-edit-profile'); if (edit) edit.style.display = 'none';
    const coverEdit = root.querySelector('.cover-edit-btn'); if (coverEdit) coverEdit.style.display = 'none';
    const stats = root.querySelector('.profile-stats');
    if (stats) {
      const nums = stats.querySelectorAll('.stat-num');
      if (nums[0]) nums[0].textContent = profile.posts;
      if (nums[1]) nums[1].textContent = profile.projects;
      if (nums[2]) nums[2].textContent = profile.followers;
      if (nums[3]) nums[3].textContent = profile.following;
      const reviews = stats.querySelector('.stat-reviews'); if (reviews) reviews.style.display = 'none';
    }
    const tabs = root.querySelector('.profile-tabs'); if (tabs) tabs.style.display = 'none';
    const content = document.getElementById('profileTabContent');
    if (content) content.innerHTML = `
      <div class="public-profile-feed">
        <div class="posts-toolbar"><div class="posts-toolbar-left"><h2>Публичная страница</h2><p>Профиль-демо. Подписки, личные сообщения и серверное хранение пока не подключены.</p></div></div>
        <article class="post-card"><div class="post-author-row"><div class="post-avatar">${profile.avatar}</div><div><div class="post-community">${profile.name}</div><div class="post-info">Недавно · Профиль</div></div></div><div class="post-title-text">Привет, это ${profile.name}!</div><div class="post-text">${profile.bio}</div></article>
        <div class="projects-grid">${(typeof getProjects === 'function' ? getProjects().filter(project => project.author === profile.name || project.author === Object.keys(PUBLIC_PROFILES).find(key => PUBLIC_PROFILES[key].id === profile.id)) : []).map(project => typeof projectCardHTML === 'function' ? projectCardHTML(project) : '').join('')}</div>
        <a class="btn-small public-profile-back" href="${/\/pages\//.test(location.pathname) ? '../index.html' : 'index.html'}">← Вернуться на главную</a>
      </div>`;
    document.title = profile.name + ' — StudHub';
  }
  document.addEventListener('DOMContentLoaded', function () {
    bindProfileLinks();
    renderPublicProfile();
    document.addEventListener('click', function (event) {
      if (event.target.closest('.project-card-author, .post-community, .chat-contact-name, .subscription-name, .post-avatar')) return;
      // Rendered cards can be added after initial load, so bind new profile labels lazily.
      bindProfileLinks();
    });
  });
})();
/* ===== УПРАВЛЕНИЕ АККАУНТАМИ ===== */
const AccountsManager = {
  STORAGE_KEY: 'studhub-accounts',
  CURRENT_KEY: 'studhub-current-account',

  // Получить все аккаунты
  getAll() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Сохранить все аккаунты
  saveAll(accounts) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
  },

  // Получить текущий аккаунт
  getCurrent() {
    const data = localStorage.getItem(this.CURRENT_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Установить текущий аккаунт
  setCurrent(account) {
    localStorage.setItem(this.CURRENT_KEY, JSON.stringify(account));
  },

  // Добавить аккаунт
  add(account) {
    const accounts = this.getAll();
    // Проверяем, нет ли уже такого
    const exists = accounts.find(a => a.email === account.email);
    if (!exists) {
      accounts.push(account);
      this.saveAll(accounts);
    }
  },

  // Удалить аккаунт
  remove(email) {
    let accounts = this.getAll();
    accounts = accounts.filter(a => a.email !== email);
    this.saveAll(accounts);
  },

  // Переключиться на аккаунт
  switchTo(email) {
    const accounts = this.getAll();
    const account = accounts.find(a => a.email === email);
    if (account) {
      this.setCurrent(account);
      return true;
    }
    return false;
  }
};