
'use strict';
(function(){ var b=document.getElementById('_diag'); function show(m){ try{ b.style.display='block'; var p=document.createElement('div'); p.textContent=m; b.appendChild(p); console.error('[SKIPAPP]', m);}catch(e){ console.error('Diagnostics failed', e);} } window.addEventListener('error', function(e){ show(e.message||e.error||'Error'); }); window.addEventListener('unhandledrejection', function(e){ show('Promise: '+(e.reason&&e.reason.message||e.reason||'unhandledrejection')); }); window._diag_show=show; })();

var strings={ he:{
  continue:'המשך', save_next:'שמור והמשך', home:'בית', back:'חזרה', add_skip:'הוסף דילוג', history:'היסטוריה', insights:'תובנות', investments:'אפיקי השקעה', settings:'הגדרות', charts:'גרפים',
  amount:'סכום (₪)', description:'תיאור', category:'קטגוריה', save:'שמור', reset_all:'איפוס והרשמה מחדש',
  welcome_home:'ברוך שובך', register:'הרשמה', name:'שם', age:'גיל', goal:'יעד חיסכון חודשי (₪)', purpose:'מטרת חיסכון', language:'שפה',
  choose_lang:'בחר/י שפה', lang_he:'עברית', lang_en:'English', theme:'מצב כהה',
  entry_title:'ברוך הבא ל־SKIPAPP', entry_intro_1:'SKIPAPP – אפליקציה שעוקבת ומדלגת אחרי הוצאות לא הכרחיות.', entry_intro_2:'מעקב אחרי הדילוגים וצבירת סכומים שנחסכו לאורך זמן.', entry_intro_3:'הכוונה לאפיקי השקעה חכמים בשפה פשוטה.',
  start:'התחל', go_home:'עבור למסך הבית', go_register:'עבור להרשמה', total:'שווי חיסכון מלא: ₪', terms_title:'תנאי שימוש', terms_text:'האפליקציה נועדה לשימוש חינוכי ולמידה על חסכון כסף.', chart_mode_line:'קו', chart_mode_bar:'עמודות', dashboard:'דאשבורד חכם', skips_count:'מספר דילוגים', avg_skip:'דילוג ממוצע', month_total:'חיסכון חודשי', export_pdf:'ייצוא PDF', purpose_opts:['השקעות','קניית נכס','חיסכון חכם','אחר']
}, en:{
  continue:'Continue', save_next:'Save & Continue', home:'Home', back:'Back', add_skip:'Add Skip', history:'History', insights:'Insights', investments:'Investments', settings:'Settings', charts:'Charts',
  amount:'Amount (₪)', description:'Description', category:'Category', save:'Save', reset_all:'Reset & Re-register',
  welcome_home:'Welcome back', register:'Register', name:'First name', age:'Age', goal:'Monthly saving goal (₪)', purpose:'Saving purpose', language:'Language',
  choose_lang:'Choose language', lang_he:'Hebrew', lang_en:'English', theme:'Dark Mode',
  entry_title:'Welcome to SKIPAPP', entry_intro_1:'SKIPAPP tracks and skips non-essential expenses.', entry_intro_2:'Keep a running log of your skips and see your savings grow.', entry_intro_3:'Guidance to smart investment avenues, in simple language.',
  start:'Start', go_home:'Go to Home', go_register:'Go to Register', total:'Total saved: ₪', terms_title:'Terms of Use', terms_text:'This app is intended for educational use to learn about money saving.', chart_mode_line:'Line', chart_mode_bar:'Bar', dashboard:'Smart Dashboard', skips_count:'Skips', avg_skip:'Average Skip', month_total:'Monthly Savings', export_pdf:'Export PDF', purpose_opts:['Investments','Buy property','Smart saving','Other']
}};

function formatDate(iso){ try{var d=new Date(iso); if(isNaN(d)) return '—'; return d.toLocaleDateString(App.state.lang==='he'?'he-IL':'en-US');}catch(e){ return '—'; }}
function csvQuote(v){ return '"'+String(v).replace(/"/g,'""')+'"'; }

var App={ state:{screen:'entry',historyStack:[],user:null,lang:'he',data:[], theme:'light', chartMode:'line'},
  t:function(k){ try{ return (strings[this.state.lang]||strings.he)[k]||k; } catch(e){ window._diag_show('t() failed: '+e); return k; } },
  persist:function(){ try{ localStorage.setItem('skipapp_user', JSON.stringify(this.state.user||null)); localStorage.setItem('skipapp_data', JSON.stringify(this.state.data||[])); localStorage.setItem('skipapp_lang', this.state.lang); localStorage.setItem('skipapp_theme', this.state.theme); var url=new URL(location.href); url.searchParams.set('lang', this.state.lang); history.replaceState(null,'',url.toString()); } catch(e){ window._diag_show('persist failed: '+e);} },
  setLang:function(l){ this.state.lang = (l==='en'?'en':'he'); document.documentElement.setAttribute('lang', this.state.lang==='he'?'he':'en'); document.documentElement.setAttribute('dir', this.state.lang==='he'?'rtl':'ltr'); var sel=document.getElementById('lang_header'); if(sel){ sel.value=this.state.lang; } this.persist(); this.render(); },
  toggleTheme:function(){ this.state.theme = (this.state.theme==='dark')?'light':'dark'; document.body.setAttribute('data-theme', this.state.theme); this.persist(); },
  push:function(s){ this.state.historyStack.push(this.state.screen); this.state.screen=s; this.render(); },
  goBack:function(){ if(this.state.historyStack.length){ this.state.screen=this.state.historyStack.pop(); this.render(); } else { this.goHome(); } },
  goHome:function(){ this.state.screen='home'; this.render(); },
  next:function(){ var order=['entry','home','addSkip','history','insights','investments','summary']; var i=order.indexOf(this.state.screen); this.state.screen = order[Math.min(i+1,order.length-1)]||'home'; this.render(); },
  saveUser:function(u){ this.state.user=u; this.persist(); },
  saveData:function(){ this.persist(); },
  exportCSV:function(){ var rows=this.state.data.slice().reverse(); var header=this.state.lang==='he'?['תאריך','סכום','קטגוריה','תיאור']:['Date','Amount','Category','Description']; var lines=[header.join(',')]; for(var i=0;i<rows.length;i++){ var r=rows[i]; lines.push([formatDate(r.date),(r.amount||0),csvQuote(r.category||''),csvQuote(r.description||'')].join(',')); } var blob=new Blob(['﻿'+lines.join('
')],{type:'text/csv;charset=utf-8;'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='skipapp_history.csv'; a.click(); URL.revokeObjectURL(a.href); },
  exportJSON:function(){ var blob=new Blob([JSON.stringify(this.state.data,null,2)],{type:'application/json'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='skipapp_history.json'; a.click(); URL.revokeObjectURL(a.href); },
  exportPDF:function(period){ try{ var now=new Date(); var lang=this.state.lang; var dir = lang==='he'?'rtl':'ltr'; var title= lang==='he'?'סיכום חיסכון':'Savings Summary'; var data=this.state.data.slice(); function fmt(d){ return new Date(d); } var filtered=data; if(period==='month'){ var m= now.getMonth(); var y= now.getFullYear(); filtered = data.filter(function(x){ var dx=fmt(x.date); return dx.getMonth()==m && dx.getFullYear()==y; }); } else if(period==='quarter'){ var q=Math.floor(now.getMonth()/3); var yq=now.getFullYear(); filtered=data.filter(function(x){ var dx=fmt(x.date); return Math.floor(dx.getMonth()/3)==q && dx.getFullYear()==yq; }); } var total=0; for(var i=0;i<filtered.length;i++){ total+= (Number(filtered[i].amount)||0); } var count=filtered.length; var avg=count? total/count : 0; var html='<!DOCTYPE html><html lang="'+lang+'" dir="'+dir+'"><head><meta charset='utf-8'><title>'+title+'</title><style>body{font-family:Heebo,system-ui;margin:24px;color:#0f172a} h1{margin:0 0 8px} .muted{color:#64748B} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:'+ (dir=='rtl'?'right':'left') +'} .k{display:flex;gap:8px;margin-top:8px} .chip{border:1px solid #e2e8f0;border-radius:999px;padding:6px 10px}</style></head><body>';
    html+='<h1>'+title+'</h1>'; html+='<p class='muted'>'+(period==='month'?(lang==='he'?'חודש נוכחי':'Current Month'):(lang==='he'?'רבעון נוכחי':'Current Quarter'))+'</p>'; html+='<div class='k'>'+'<span class='chip'>'+(lang==='he'?'מספר דילוגים':'Skips')+': '+count+'</span>'+'<span class='chip'>'+(lang==='he'?'סך הכל':'Total')+': ₪'+total.toFixed(2)+'</span>'+'<span class='chip'>'+(lang==='he'?'ממוצע':'Average')+': ₪'+avg.toFixed(2)+'</span>'+'</div>'; html+='<table><thead><tr><th>'+(lang==='he'?'תאריך':'Date')+'</th><th>'+(lang==='he'?'סכום (₪)':'Amount (₪)')+'</th><th>'+(lang==='he'?'קטגוריה':'Category')+'</th><th>'+(lang==='he'?'תיאור':'Description')+'</th></tr></thead><tbody>';
    for(var j=0;j<filtered.length;j'){ var r=filtered[j]; html+='<tr><td>'+formatDate(r.date)+'</td><td>'+((Number(r.amount)||0).toFixed(2))+'</td><td>'+(r.category||'-')+'</td><td>'+(r.description||'-')+'</td></tr>'; }
    html+='</tbody></table></body></html>';
    var blob=new Blob([html],{type:'text/html'}); var url=URL.createObjectURL(blob); var w=window.open(url,'_blank'); if(!w){ alert(lang==='he'?'פתח חלונות מוקפץ':'Enable pop-ups'); } if(w){ w.onload = function(){ try{ w.focus(); w.print(); }catch(e){} }; }
    setTimeout(function(){ URL.revokeObjectURL(url); }, 30000); } catch(e){ window._diag_show('exportPDF failed: '+e); } },
  monthSum:function(){ var now=new Date(); var m=now.getMonth(); var y=now.getFullYear(); var sum=0; for(var i=0;i<this.state.data.length;i++){ var x=this.state.data[i]; var dx=new Date(x.date); if(dx.getMonth()==m && dx.getFullYear()==y){ sum += (Number(x.amount)||0); } } return sum; },
  gQuery:function(q){ var enc = encodeURIComponent(q); var hl = this.state.lang==='he'?'he':'en'; return 'https://www.google.com/search?q='+enc+'&hl='+hl; },
  renderChart:function(){ var el=document.getElementById('chart'); if(!el) return; var ctx=el.getContext('2d'); var w=el.width=el.clientWidth; var h=el.height=320; ctx.clearRect(0,0,w,h); ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--cardbg'); ctx.fillRect(0,0,w,h); var data=this.state.data.slice().sort(function(a,b){return new Date(a.date)-new Date(b.date);}); var amounts=[]; for(var i=0;i<data.length;i++){ amounts.push(Number(data[i].amount)||0); } var cum=[]; var s=0; for(var j=0;j<amounts.length;j++){ s+=amounts[j]; cum.push(s); } var series=this.state.chartMode==='line'?cum:amounts; var max=10; for(var k=0;k<series.length;k++){ if(series[k]>max) max=series[k]; } var left=40,right=10,top=10,bottom=30,gw=w-left-right,gh=h-top-bottom; ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(left,top); ctx.lineTo(left,h-bottom); ctx.lineTo(w-right,h-bottom); ctx.stroke(); ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--text'); ctx.font='12px Heebo, sans-serif'; ctx.fillText((this.state.lang==='he'?'סכום (₪)':'Amount (₪)'),6,16); if(series.length===0){ ctx.fillText(this.state.lang==='he'?'אין נתונים':'No data', left+6, top+40); return;} var step=series.length>1?gw/(series.length-1):gw; if(this.state.chartMode==='line'){ ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); for(var m=0;m<series.length;m++){ var x=left+m*step; var y=h-bottom-(series[m]/max)*gh; if(m===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke(); } else { var barW=Math.max(4, gw/series.length*0.6); ctx.fillStyle='#818cf8'; for(var n=0;n<series.length;n++){ var xb=left+n*step-barW/2; var yb=h-bottom-(series[n]/max)*gh; ctx.fillRect(xb,yb,barW,(series[n]/max)*gh); } }
  },
  render:function(){ var el=document.getElementById('app'); var parts=[]; var t=this.t.bind(this); var total=0; for(var i=0;i<this.state.data.length;i++){ total+= (this.state.data[i].amount||0); } function push(s){ parts.push(s); }
    try{
    if(this.state.screen==='entry'){
      push('<section class="card" style="text-align:center">');
      push('<div class="brandWrap"><h2 class="brandName">SKIPAPP · '+t('entry_title')+'</h2><img src="images/play_logo.png" alt="PLAY" class="brandLogo"/></div>');
      push('<img src="images/hero.jpg" alt="SKIPAPP" style="width:100%;border-radius:12px;margin-top:8px"/>');
      push('<p class="hint" style="margin-top:10px">'+t('entry_intro_1')+'</p>');
      push('<p class="hint">'+t('entry_intro_2')+'</p>');
      push('<p class="hint">'+t('entry_intro_3')+'</p>');
      push('<div class="row" style="margin-top:12px"><label class="hint">'+t('language')+'</label><select id="lang" onchange="App.setLang(this.value)" style="max-width:240px"><option value="he"'+(this.state.lang==='he'?' selected':'')+'>'+strings[this.state.lang].lang_he+'</option><option value="en"'+(this.state.lang==='en'?' selected':'')+'>'+strings[this.state.lang].lang_en+'</option></select></div>');
      push('<div class="row" style="margin-top:12px;justify-content:center"><button class="btn" onclick="App.goHome()">'+t('go_home')+'</button><button class="btnSecondary" onclick="App.push(\'register\')">'+t('go_register')+'</button></div>');
      push('<div style="margin-top:12px"><button class="btn" onclick="App.next()">'+t('save_next')+'</button></div>');
      push('</section>');
    }
    else if(this.state.screen==='register'){
      var u=this.state.user||{firstName:'',age:'',goal:0,purpose:''}; var opts=(strings[this.state.lang].purpose_opts||['השקעות','קניית נכס','חיסכון חכם','אחר']);
      push('<section class="card">');
      push('<h2>'+t('register')+'</h2>');
      push('<label class="hint">'+t('name')+'</label><input id="fn" type="text" value="'+(u.firstName||'')+'"/>');
      push('<label class="hint" style="margin-top:8px">'+t('age')+'</label><input id="age" type="number" min="10" max="99" value="'+(u.age||'')+'"/>');
      push('<label class="hint" style="margin-top:8px">'+t('goal')+'</label><input id="goal" type="number" min="0" value="'+(u.goal||'')+'" placeholder="1000"/>');
      push('<label class="hint" style="margin-top:8px">'+t('purpose')+'</label><select id="purpose">'+opts.map(function(o){return '<option>'+o+'</option>';}).join('')+'</select>');
      push('<div class="row" style="margin-top:12px"><button class="btn" onclick="(function(){ var user={ firstName:document.getElementById(\'fn\').value.trim(), age:parseInt(document.getElementById(\'age\').value||0), goal:parseFloat(document.getElementById(\'goal\').value||0), purpose:document.getElementById(\'purpose\').value, registeredAt:new Date().toISOString() }; if(!user.firstName||!user.age||isNaN(user.goal)){ alert(App.state.lang===\'he\'?\'אנא מלא/י את כל השדות\':\'Please fill all fields\'); return;} App.saveUser(user); App.goHome(); })()">'+t('save')+'</button><button class="btn" onclick="App.next()">'+t('save_next')+'</button></div>');
      push('</section>');
    }
    else if(this.state.screen==='home'){
      var name=(this.state.user&&this.state.user.firstName)?this.state.user.firstName:''; var month=this.monthSum(); var avg=this.state.data.length?(total/this.state.data.length):0;
      push('<section class="card" style="text-align:center">');
      push('<div class="brandWrap"><h2 class="brandName">SKIPAPP'+(name?(' · '+t('welcome_home')+' '+name):'')+'</h2><img src="images/play_logo.png" alt="PLAY" class="brandLogo"/></div>');
      push('<img src="images/hero.jpg" alt="SKIPAPP" style="width:100%;border-radius:12px;margin-top:8px"/>');
      push('<h3 style="margin-top:8px">'+t('dashboard')+'</h3>');
      push('<div class="kpis">');
      push('<div class="kpi"><h3>'+t('skips_count')+'</h3><p>'+this.state.data.length+'</p></div>');
      push('<div class="kpi"><h3>'+t('avg_skip')+'</h3><p>₪'+avg.toFixed(2)+'</p></div>');
      push('<div class="kpi"><h3>'+t('month_total')+'</h3><p>₪'+month.toFixed(2)+'</p></div>');
      push('</div>');
      push('<div class="row" style="margin-top:8px;justify-content:center"><button class="btnSecondary" onclick="App.exportPDF(\'month\')">'+t('export_pdf')+' · '+(this.state.lang==='he'?'חודש':'Month')+'</button><button class="btnSecondary" onclick="App.exportPDF(\'quarter\')">'+t('export_pdf')+' · '+(this.state.lang==='he'?'רבעון':'Quarter')+'</button></div>');
      push('<div class="list" style="margin-top:12px">'+['add_skip','history','insights','investments','settings','charts'].map(function(s){return '<a class="tile" href="javascript:void(0)" onclick="App.push(\''+s+'\')">'+t(s)+'</a>';}).join('')+'</div>');
      push('<p class="hint" style="margin-top:8px">'+t('total')+total.toFixed(2)+'</p>');
      push('<div style="margin-top:12px"><button class="btn" onclick="App.next()">'+t('save_next')+'</button></div>');
      push('</section>');
    }
    else if(this.state.screen==='addSkip'){
      push('<section class="card">');
      push('<h2>'+t('add_skip')+'</h2>');
      push('<label class="hint">'+t('amount')+'</label><input id="amt" type="number" min="1"/>');
      push('<label class="hint" style="margin-top:8px">'+t('description')+'</label><input id="desc" type="text"/>');
      push('<label class="hint" style="margin-top:8px">'+t('category')+'</label><select id="cat">'+['אוכל ושתייה','אופנה','בילויים','טכנולוגיה','יופי וטיפוח','תחבורה','מנויים','קניות אימפולסיביות','חברתי','אחר'].map(function(o){return '<option>'+o+'</option>';}).join('')+'</select>');
      push('<p class="hint" style="margin-top:10px">'+(this.state.lang==='he'?'הנתונים נשמרים אוטומטית ומצטברים לכל כניסה.':'Data is saved automatically and accumulates across sessions.')+'</p>');
      push('<div class="row" style="margin-top:12px"><button class="btn" onclick="(function(){ var item={ amount:parseFloat(document.getElementById(\'amt\').value||0), description:document.getElementById(\'desc\').value.trim(), category:document.getElementById(\'cat\').value, date:new Date().toISOString() }; if(!item.amount||!item.description){ alert(App.state.lang===\'he\'?\'נא להזין סכום ותיאור\':\'Please enter amount and description\'); return;} App.addSkip(item); })()">'+t('save')+'</button><button class="btn" onclick="App.next()">'+t('save_next')+'</button></div>');
      push('</section>');
    }
    else if(this.state.screen==='history'){
      var rows=this.state.data.slice().reverse();
      var hdr=this.state.lang==='he'?['תאריך','סכום (₪)','קטגוריה','תיאור']:['Date','Amount (₪)','Category','Description'];
      push('<section class="card">');
      push('<h2>'+t('history')+'</h2>');
      push('<div class="stat"><span class="chip">'+(this.state.lang==='he'?'סך הכל':'Total')+': ₪'+total.toFixed(2)+'</span><button class="btn" onclick="App.exportCSV()">CSV</button><button class="btn" style="background:linear-gradient(90deg,#4F46E5,#06B6D4);" onclick="App.exportJSON()">JSON</button></div>');
      push('<div style="margin-top:10px"><table><thead><tr style="background:#fff6f2">');
      for(var h=0; h<hdr.length; h++){
        push('<th style="text-align:'+(App.state.lang==='he'?'right':'left')+';padding:8px;border-bottom:1px solid var(--border)">'+hdr[h]+'</th>');
      }
      push('</tr></thead><tbody>');
      if(rows.length){
        for(var r=0; r<rows.length; r++){
          var s=rows[r];
          push('<tr><td style="padding:8px;border-bottom:1px solid #eee">'+formatDate(s.date)+'</td><td style="padding:8px;border-bottom:1px solid #eee">'+(s.amount||0).toFixed(2)+'</td><td style="padding:8px;border-bottom:1px solid #eee">'+(s.category||'-')+'</td><td style="padding:8px;border-bottom:1px solid #eee">'+(s.description||'-')+'</td></tr>');
        }
      } else {
        push('<tr><td colspan="4" class="hint" style="padding:8px">'+(App.state.lang==='he'?'אין רישומים עדיין':'No records yet')+'</td></tr>');
      }
      push('</tbody></table></div>');
      push('<div style="margin-top:12px"><button class="btn" onclick="App.next()">'+t('save_next')+'</button></div>');
      push('</section>');
    }
    else if(this.state.screen==='insights'){
      var totalSaved=total; var msg= totalSaved>100 ? (this.state.lang==='he'?'כבר ניתן להתחיל לחסוך ולהשקיע.':'You can start saving and investing.') : (this.state.lang==='he'?'המשיכו בדילוגים קטנים כדי להגיע ליעד ולהתחיל להשקיע.':'Keep small skips to reach your goal and start investing.');
      push('<section class="card">');
      push('<h2>'+t('insights')+'</h2>');
      push('<p class="hint">'+t('total')+totalSaved.toFixed(2)+'</p>');
      push('<p class="hint">'+msg+'</p>');
      push('<canvas id="chart" style="width:100%;height:320px"></canvas>');
      push('<div class="row" style="margin-top:8px"><button class="btnSecondary" onclick="(App.state.chartMode=\'line\',App.renderChart())">'+t('chart_mode_line')+'</button><button class="btnSecondary" onclick="(App.state.chartMode=\'bar\',App.renderChart())">'+t('chart_mode_bar')+'</button></div>');
      push('<div class="row" style="margin-top:12px"><button class="btn" onclick="App.push(\'investments\')">'+t('continue')+'</button><button class="btn" onclick="App.next()">'+t('save_next')+'</button></div>');
      push('</section>');
    }
    else if(this.state.screen==='investments'){
      var q_he=['המושג ריבית דריבית','למה כדאי להשקיע מגיל צעיר','מה הם אפיקי ההשקעה הטובים ביותר','פירוש המושג מניות','פירוש המושג אג"ח']; var q_en=['compound interest concept','why invest from a young age','best investment avenues','definition of stock','definition of bonds']; var queries=this.state.lang==='he'?q_he:q_en;
      push('<section class="card">');
      push('<h2>'+t('investments')+'</h2>');
      push('<div class="grid" style="margin-top:8px">'+queries.map(function(q){return '<a class="tile" href="'+App.gQuery(q)+'" target="_blank" rel="noopener noreferrer">'+q+'</a>';}).join('')+'</div>');
      push('<div class="row" style="margin-top:12px"><button class="btn" onclick="App.push(\'summary\')">'+t('continue')+'</button><button class="btn" onclick="App.next()">'+t('save_next')+'</button></div>');
      push('</section>');
    }
    else if(this.state.screen==='summary'){
      var count=this.state.data.length; var totalSaved=total; push('<section class="card" style="text-align:center">'); push('<h2>'+(this.state.lang==='he'?'סיכום':'Summary')+'</h2>'); push('<p class="hint">'+(this.state.lang==='he'?'מספר דילוגים':'Skips')+': '+count+'</p>'); push('<p class="hint">'+t('total')+totalSaved.toFixed(2)+'</p>'); push('<div class="row" style="margin-top:12px;justify-content:center"><button class="btn" onclick="App.goHome()">'+t('home')+'</button><button class="btn" onclick="App.next()">'+t('save_next')+'</button></div>'); push('</section>');
    }
    el.innerHTML = parts.join('');
    if(this.state.screen==='insights'){ this.renderChart(); }
    }catch(err){ window._diag_show('render failed: '+(err.message||err)); }
  },
  addSkip:function(item){ this.state.data.push(item); this.saveData(); this.state.screen='history'; this.render(); },
  load:function(){ try{ var urlLang=new URL(location.href).searchParams.get('lang'); var storeLang=localStorage.getItem('skipapp_lang'); this.state.lang = (urlLang||storeLang||'he'); }catch(e){}
    document.documentElement.setAttribute('lang', this.state.lang==='he'?'he':'en'); document.documentElement.setAttribute('dir', this.state.lang==='he'?'rtl':'ltr'); var sel=document.getElementById('lang_header'); if(sel){ sel.value=this.state.lang; }
    try{ var th=localStorage.getItem('skipapp_theme')||'light'; this.state.theme=th; document.body.setAttribute('data-theme', th);}catch(e){}
    try{ var u=localStorage.getItem('skipapp_user'); this.state.user = u ? JSON.parse(u) : null; }catch(e){}
    try{ var d=localStorage.getItem('skipapp_data'); var arr = d ? JSON.parse(d) : []; this.state.data = Array.isArray(arr) ? arr : []; }catch(e){}
    this.state.screen='entry'; this.render();
  }
};

document.addEventListener('DOMContentLoaded', function(){ App.load(); });
window.addEventListener('load', function(){ if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(function(){}); } });
