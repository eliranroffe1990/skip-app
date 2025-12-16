
'use strict';
(function(){ var b=document.getElementById('_diag'); function show(m){ try{ b.style.display='block'; var p=document.createElement('div'); p.textContent=String(m); b.appendChild(p); console.error('[SKIPAPP]', m);}catch(e){ console.error('Diagnostics failed', e);} } window.addEventListener('error', function(e){ show(e.message||e.error||'Error'); }); window.addEventListener('unhandledrejection', function(e){ show('Promise: '+(e.reason&&e.reason.message||e.reason||'unhandledrejection')); }); window._diag_show=show; })();

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

function q(k){ try{ var pack=strings[App.state.lang]||strings.he; return pack[k]||k; }catch(e){ return k; } }
function formatDate(iso){ try{ var d=new Date(iso); if(isNaN(d)) return '—'; return d.toLocaleDateString(App.state.lang==='he'?'he-IL':'en-US'); }catch(e){ return '—'; } }
function csvQuote(v){ return '"'+String(v).replace(/"/g,'""')+'"'; }

function el(tag, attrs, children){ var node=document.createElement(tag); attrs=attrs||{}; for(var k in attrs){ if(k==='class') node.className=attrs[k]; else if(k==='text') node.textContent=String(attrs[k]); else if(k==='html') node.innerHTML=String(attrs[k]); else node.setAttribute(k, attrs[k]); } if(children){ if(typeof children==='string'){ node.textContent=children; } else if(Array.isArray(children)){ for(var i=0;i<children.length;i++){ if(children[i]) node.appendChild(children[i]); } } else { node.appendChild(children); } } return node; }

var App={ state:{screen:'entry',historyStack:[],user:null,lang:'he',data:[], theme:'light', chartMode:'line'},
  persist:function(){ try{ localStorage.setItem('skipapp_user', JSON.stringify(this.state.user||null)); localStorage.setItem('skipapp_data', JSON.stringify(this.state.data||[])); localStorage.setItem('skipapp_lang', this.state.lang); localStorage.setItem('skipapp_theme', this.state.theme); var url=new URL(location.href); url.searchParams.set('lang', this.state.lang); history.replaceState(null,'',url.toString()); }catch(e){ window._diag_show('persist failed: '+e);} },
  setLang:function(l){ this.state.lang=(l==='en'?'en':'he'); document.documentElement.setAttribute('lang', this.state.lang==='he'?'he':'en'); document.documentElement.setAttribute('dir', this.state.lang==='he'?'rtl':'ltr'); var sel=document.getElementById('lang_header'); if(sel) sel.value=this.state.lang; this.persist(); this.render(); },
  toggleTheme:function(){ this.state.theme=(this.state.theme==='dark')?'light':'dark'; document.body.setAttribute('data-theme', this.state.theme); this.persist(); },
  push:function(s){ this.state.historyStack.push(this.state.screen); this.state.screen=s; this.render(); },
  goBack:function(){ if(this.state.historyStack.length){ this.state.screen=this.state.historyStack.pop(); this.render(); } else { this.goHome(); } },
  goHome:function(){ this.state.screen='home'; this.render(); },
  next:function(){ var order=['entry','home','addSkip','history','insights','investments','summary']; var i=order.indexOf(this.state.screen); this.state.screen = order[Math.min(i+1,order.length-1)]||'home'; this.render(); },
  saveUser:function(u){ this.state.user=u; this.persist(); },
  saveData:function(){ this.persist(); },
  exportCSV:function(){ var rows=this.state.data.slice().reverse(); var header=this.state.lang==='he'?['תאריך','סכום','קטגוריה','תיאור']:['Date','Amount','Category','Description']; var lines=[header.join(',')]; for(var i=0;i<rows.length;i++){ var r=rows[i]; lines.push([formatDate(r.date),(r.amount||0),csvQuote(r.category||''),csvQuote(r.description||'')].join(',')); } var blob=new Blob(['﻿'+lines.join('
')],{type:'text/csv;charset=utf-8;'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='skipapp_history.csv'; a.click(); URL.revokeObjectURL(a.href); },
  exportJSON:function(){ var blob=new Blob([JSON.stringify(this.state.data,null,2)],{type:'application/json'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='skipapp_history.json'; a.click(); URL.revokeObjectURL(a.href); },
  exportPDF:function(period){ try{ var now=new Date(); var lang=this.state.lang; var dir=(lang==='he'?'rtl':'ltr'); var title=(lang==='he'?'סיכום חיסכון':'Savings Summary'); var data=this.state.data.slice(); function fmt(d){ return new Date(d); } var filtered=data; if(period==='month'){ var m=now.getMonth(), y=now.getFullYear(); filtered=data.filter(function(x){ var dx=fmt(x.date); return dx.getMonth()==m && dx.getFullYear()==y; }); } else if(period==='quarter'){ var q=Math.floor(now.getMonth()/3), yq=now.getFullYear(); filtered=data.filter(function(x){ var dx=fmt(x.date); return Math.floor(dx.getMonth()/3)==q && dx.getFullYear()==yq; }); } var total=0; for(var i=0;i<filtered.length;i++){ total+=(Number(filtered[i].amount)||0); } var count=filtered.length; var avg=count? total/count : 0; var html='<!DOCTYPE html><html lang="'+lang+'" dir="'+dir+'"><head><meta charset='utf-8'><title>'+title+'</title><style>body{font-family:Heebo,system-ui;margin:24px;color:#0f172a} h1{margin:0 0 8px} .muted{color:#64748B} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:'+(dir==='rtl'?'right':'left')+'} .k{display:flex;gap:8px;margin-top:8px} .chip{border:1px solid #e2e8f0;border-radius:999px;padding:6px 10px}</style></head><body>';
    html+='<h1>'+title+'</h1>'; html+='<p class='muted'>'+(period==='month'?(lang==='he'?'חודש נוכחי':'Current Month'):(lang==='he'?'רבעון נוכחי':'Current Quarter'))+'</p>'; html+='<div class='k'>'+'<span class='chip'>'+(lang==='he'?'מספר דילוגים':'Skips')+': '+count+'</span>'+'<span class='chip'>'+(lang==='he'?'סך הכל':'Total')+': ₪'+total.toFixed(2)+'</span>'+'<span class='chip'>'+(lang==='he'?'ממוצע':'Average')+': ₪'+avg.toFixed(2)+'</span>'+'</div>'; html+='<table><thead><tr><th>'+(lang==='he'?'תאריך':'Date')+'</th><th>'+(lang==='he'?'סכום (₪)':'Amount (₪)')+'</th><th>'+(lang==='he'?'קטגוריה':'Category')+'</th><th>'+(lang==='he'?'תיאור':'Description')+'</th></tr></thead><tbody>';
    for(var j=0;j<filtered.length;j++){ var r=filtered[j]; html+='<tr><td>'+formatDate(r.date)+'</td><td>'+((Number(r.amount)||0).toFixed(2))+'</td><td>'+(r.category||'-')+'</td><td>'+(r.description||'-')+'</td></tr>'; }
    html+='</tbody></table></body></html>';
    var blob=new Blob([html],{type:'text/html'}); var url=URL.createObjectURL(blob); var w=window.open(url,'_blank'); if(!w){ alert(lang==='he'?'פתח חלונות מוקפץ':'Enable pop-ups'); } if(w){ w.onload=function(){ try{ w.focus(); w.print(); }catch(e){} }; } setTimeout(function(){ URL.revokeObjectURL(url); },30000); }catch(e){ window._diag_show('exportPDF failed: '+e); } },
  monthSum:function(){ var now=new Date(), m=now.getMonth(), y=now.getFullYear(), sum=0; for(var i=0;i<this.state.data.length;i++){ var x=this.state.data[i], dx=new Date(x.date); if(dx.getMonth()==m && dx.getFullYear()==y){ sum+=(Number(x.amount)||0); } } return sum; },
  gQuery:function(q){ var enc=encodeURIComponent(q); var hl=this.state.lang==='he'?'he':'en'; return 'https://www.google.com/search?q='+enc+'&hl='+hl; },

  render:function(){ var root=document.getElementById('app'); while(root.firstChild){ root.removeChild(root.firstChild); } var total=0; for(var i=0;i<this.state.data.length;i++){ total+=(this.state.data[i].amount||0); }
    var section=el('section',{'class':'card'});
    function row(){ return el('div',{'class':'row'}); }
    if(this.state.screen==='entry'){
      var brand=el('div',{'class':'brandWrap'});
      brand.appendChild(el('h2',{'class':'brandName','text':'SKIPAPP · '+q('entry_title')}));
      brand.appendChild(el('img',{'src':'images/play_logo.png','alt':'PLAY','class':'brandLogo'}));
      section.appendChild(brand);
      section.appendChild(el('img',{'src':'images/hero.jpg','alt':'SKIPAPP'},null));
      section.appendChild(el('p',{'class':'hint','text':q('entry_intro_1')}));
      section.appendChild(el('p',{'class':'hint','text':q('entry_intro_2')}));
      section.appendChild(el('p',{'class':'hint','text':q('entry_intro_3')}));
      var r1=row(); r1.appendChild(el('label',{'class':'hint','text':q('language')})); var sel=el('select',{'id':'lang','style':'max-width:240px'}); sel.appendChild(el('option',{'value':'he','text':strings[this.state.lang].lang_he})); sel.appendChild(el('option',{'value':'en','text':strings[this.state.lang].lang_en})); sel.value=this.state.lang; r1.appendChild(sel); section.appendChild(r1);
      var r2=row(); var bHome=el('button',{'class':'btn','id':'btn_go_home','text':q('go_home')}); var bReg=el('button',{'class':'btnSecondary','id':'btn_go_register','text':q('go_register')}); r2.appendChild(bHome); r2.appendChild(bReg); section.appendChild(r2);
      var r3=el('div',{'style':'margin-top:12px'}); r3.appendChild(el('button',{'class':'btn','id':'btn_next','text':q('save_next')})); section.appendChild(r3);
    }
    else if(this.state.screen==='register'){
      var u=this.state.user||{firstName:'',age:'',goal:0,purpose:''}; var opts=(strings[this.state.lang].purpose_opts||['השקעות','קניית נכס','חיסכון חכם','אחר']);
      section.appendChild(el('h2',{'text':q('register')}));
      section.appendChild(el('label',{'class':'hint','text':q('name')})); section.appendChild(el('input',{'id':'fn','type':'text','value':u.firstName||''}));
      section.appendChild(el('label',{'class':'hint','text':q('age'),'style':'margin-top:8px'})); section.appendChild(el('input',{'id':'age','type':'number','min':'10','max':'99','value':u.age||''}));
      section.appendChild(el('label',{'class':'hint','text':q('goal'),'style':'margin-top:8px'})); section.appendChild(el('input',{'id':'goal','type':'number','min':'0','value':u.goal||'','placeholder':'1000'}));
      section.appendChild(el('label',{'class':'hint','text':q('purpose'),'style':'margin-top:8px'})); var selp=el('select',{'id':'purpose'}); for(var ii=0;ii<opts.length;ii++){ selp.appendChild(el('option',{'text':opts[ii]})); } section.appendChild(selp);
      var r=row(); r.appendChild(el('button',{'class':'btn','id':'btn_save_user','text':q('save')})); r.appendChild(el('button',{'class':'btn','id':'btn_next2','text':q('save_next')})); section.appendChild(r);
    }
    else if(this.state.screen==='home'){
      var name=(this.state.user&&this.state.user.firstName)?this.state.user.firstName:''; var month=this.monthSum(); var avg=this.state.data.length?(total/this.state.data.length):0;
      var brand=el('div',{'class':'brandWrap'}); brand.appendChild(el('h2',{'class':'brandName','text':'SKIPAPP'+(name?(' · '+q('welcome_home')+' '+name):'')})); brand.appendChild(el('img',{'src':'images/play_logo.png','alt':'PLAY','class':'brandLogo'})); section.appendChild(brand);
      section.appendChild(el('img',{'src':'images/hero.jpg','alt':'SKIPAPP'}));
      section.appendChild(el('h3',{'text':q('dashboard'),'style':'margin-top:8px'}));
      var kpis=el('div',{'class':'kpis'}); kpis.appendChild(el('div',{'class':'kpi'},[el('h3',{'text':q('skips_count')}), el('p',{'text':String(this.state.data.length)})])); kpis.appendChild(el('div',{'class':'kpi'},[el('h3',{'text':q('avg_skip')}), el('p',{'text':'₪'+avg.toFixed(2)})])); kpis.appendChild(el('div',{'class':'kpi'},[el('h3',{'text':q('month_total')}), el('p',{'text':'₪'+month.toFixed(2)})])); section.appendChild(kpis);
      var r=row(); r.appendChild(el('button',{'class':'btnSecondary','id':'btn_pdf_month','text':q('export_pdf')+' · '+(this.state.lang==='he'?'חודש':'Month')})); r.appendChild(el('button',{'class':'btnSecondary','id':'btn_pdf_quarter','text':q('export_pdf')+' · '+(this.state.lang==='he'?'רבעון':'Quarter')})); section.appendChild(r);
      var list=el('div',{'class':'list','style':'margin-top:12px'}); var items=['add_skip','history','insights','investments','settings','charts']; for(var s=0;s<items.length;s++){ var a=el('a',{'class':'tile','href':'javascript:void(0)','data-nav':items[s],'text':q(items[s])}); list.appendChild(a);} section.appendChild(list);
      section.appendChild(el('p',{'class':'hint','text':q('total')+total.toFixed(2),'style':'margin-top:8px'}));
      var r3=el('div',{'style':'margin-top:12px'}); r3.appendChild(el('button',{'class':'btn','id':'btn_next3','text':q('save_next')})); section.appendChild(r3);
    }
    else if(this.state.screen==='addSkip'){
      section.appendChild(el('h2',{'text':q('add_skip')}));
      section.appendChild(el('label',{'class':'hint','text':q('amount')})); section.appendChild(el('input',{'id':'amt','type':'number','min':'1'}));
      section.appendChild(el('label',{'class':'hint','text':q('description'),'style':'margin-top:8px'})); section.appendChild(el('input',{'id':'desc','type':'text'}));
      section.appendChild(el('label',{'class':'hint','text':q('category'),'style':'margin-top:8px'})); var selc=el('select',{'id':'cat'}); var cats=['אוכל ושתייה','אופנה','בילויים','טכנולוגיה','יופי וטיפוח','תחבורה','מנויים','קניות אימפולסיביות','חברתי','אחר']; for(var ci=0;ci<cats.length;ci++){ selc.appendChild(el('option',{'text':cats[ci]})); } section.appendChild(selc);
      section.appendChild(el('p',{'class':'hint','text':(this.state.lang==='he'?'הנתונים נשמרים אוטומטית ומצטברים לכל כניסה.':'Data is saved automatically and accumulates across sessions.'),'style':'margin-top:10px'}));
      var r=row(); r.appendChild(el('button',{'class':'btn','id':'btn_save_skip','text':q('save')})); r.appendChild(el('button',{'class':'btn','id':'btn_next4','text':q('save_next')})); section.appendChild(r);
    }
    else if(this.state.screen==='history'){
      section.appendChild(el('h2',{'text':q('history')}));
      var stat=el('div',{'class':'stat'}); stat.appendChild(el('span',{'class':'chip','text':(this.state.lang==='he'?'סך הכל':'Total')+': ₪'+total.toFixed(2)})); stat.appendChild(el('button',{'class':'btn','id':'btn_csv','text':'CSV'})); stat.appendChild(el('button',{'class':'btn','id':'btn_json','text':'JSON','style':'background:linear-gradient(90deg,#4F46E5,#06B6D4)'})); section.appendChild(stat);
      var tbl=el('table'); var thead=el('thead'); var tr=el('tr'); var hdr=this.state.lang==='he'?['תאריך','סכום (₪)','קטגוריה','תיאור']:['Date','Amount (₪)','Category','Description']; for(var h=0;h<hdr.length;h++){ tr.appendChild(el('th',{'text':hdr[h]})); } thead.appendChild(tr); tbl.appendChild(thead); var tbody=el('tbody'); var rows=this.state.data.slice().reverse(); if(rows.length){ for(var r=0;r<rows.length;r++){ var s=rows[r]; var rr=el('tr'); rr.appendChild(el('td',{'text':formatDate(s.date)})); rr.appendChild(el('td',{'text':(s.amount||0).toFixed(2)})); rr.appendChild(el('td',{'text':(s.category||'-')})); rr.appendChild(el('td',{'text':(s.description||'-')})); tbody.appendChild(rr);} } else { var rr2=el('tr'); var td=el('td',{'text':(this.state.lang==='he'?'אין רישומים עדיין':'No records yet')}); td.setAttribute('colspan','4'); td.setAttribute('class','hint'); rr2.appendChild(td); tbody.appendChild(rr2);} tbl.appendChild(tbody); var wrap=el('div',{'style':'margin-top:10px'}); wrap.appendChild(tbl); section.appendChild(wrap);
      var r2=el('div',{'style':'margin-top:12px'}); r2.appendChild(el('button',{'class':'btn','id':'btn_next5','text':q('save_next')})); section.appendChild(r2);
    }
    else if(this.state.screen==='insights'){
      section.appendChild(el('h2',{'text':q('insights')}));
      var totalSaved=total; section.appendChild(el('p',{'class':'hint','text':q('total')+totalSaved.toFixed(2)})); var msg= totalSaved>100 ? (this.state.lang==='he'?'כבר ניתן להתחיל לחסוך ולהשקיע.':'You can start saving and investing.') : (this.state.lang==='he'?'המשיכו בדילוגים קטנים כדי להגיע ליעד ולהתחיל להשקיע.':'Keep small skips to reach your goal and start investing.'); section.appendChild(el('p',{'class':'hint','text':msg})); var canvas=el('canvas',{'id':'chart','style':'width:100%;height:320px'}); section.appendChild(canvas);
      var r=row(); r.appendChild(el('button',{'class':'btnSecondary','id':'btn_line','text':q('chart_mode_line')})); r.appendChild(el('button',{'class':'btnSecondary','id':'btn_bar','text':q('chart_mode_bar')})); section.appendChild(r);
      var r2=row(); r2.appendChild(el('button',{'class':'btn','id':'btn_to_invest','text':q('continue')})); r2.appendChild(el('button',{'class':'btn','id':'btn_next6','text':q('save_next')})); section.appendChild(r2);
    }
    else if(this.state.screen==='investments'){
      section.appendChild(el('h2',{'text':q('investments')}));
      var queries=(this.state.lang==='he'?['המושג ריבית דריבית','למה כדאי להשקיע מגיל צעיר','מה הם אפיקי ההשקעה הטובים ביותר','פירוש המושג מניות','פירוש המושג אג"ח']:['compound interest concept','why invest from a young age','best investment avenues','definition of stock','definition of bonds']); var grid=el('div',{'class':'grid','style':'margin-top:8px'}); for(var qi=0;qi<queries.length;qi++){ var a=el('a',{'class':'tile','href':App.gQuery(queries[qi]),'target':'_blank','rel':'noopener noreferrer','text':queries[qi]}); grid.appendChild(a);} section.appendChild(grid);
      var r=row(); r.appendChild(el('button',{'class':'btn','id':'btn_to_summary','text':q('continue')})); r.appendChild(el('button',{'class':'btn','id':'btn_next7','text':q('save_next')})); section.appendChild(r);
    }
    else if(this.state.screen==='summary'){
      section.appendChild(el('h2',{'text':(this.state.lang==='he'?'סיכום':'Summary')})); var count=this.state.data.length; section.appendChild(el('p',{'class':'hint','text':(this.state.lang==='he'?'מספר דילוגים':'Skips')+': '+count})); section.appendChild(el('p',{'class':'hint','text':q('total')+total.toFixed(2)})); var r=row(); r.appendChild(el('button',{'class':'btn','id':'btn_home_from_sum','text':q('home')})); r.appendChild(el('button',{'class':'btn','id':'btn_next8','text':q('save_next')})); section.appendChild(r);
    }
    root.appendChild(section);

    // Listeners
    var app=this;
    var lh=document.getElementById('lang_header'); if(lh) lh.addEventListener('change', function(e){ app.setLang(e.target.value); });
    var btn;
    btn=document.getElementById('btn_back'); if(btn) btn.addEventListener('click', function(){ app.goBack(); });
    btn=document.getElementById('btn_home'); if(btn) btn.addEventListener('click', function(){ app.goHome(); });
    btn=document.getElementById('btn_theme'); if(btn) btn.addEventListener('click', function(){ app.toggleTheme(); });

    btn=document.getElementById('btn_go_home'); if(btn) btn.addEventListener('click', function(){ app.goHome(); });
    btn=document.getElementById('btn_go_register'); if(btn) btn.addEventListener('click', function(){ app.push('register'); });
    btn=document.getElementById('btn_next'); if(btn) btn.addEventListener('click', function(){ app.next(); });
    var sel=document.getElementById('lang'); if(sel) sel.addEventListener('change', function(e){ app.setLang(e.target.value); });

    btn=document.getElementById('btn_save_user'); if(btn) btn.addEventListener('click', function(){ try{ var user={ firstName:document.getElementById('fn').value.trim(), age:parseInt(document.getElementById('age').value||0), goal:parseFloat(document.getElementById('goal').value||0), purpose:document.getElementById('purpose').value, registeredAt:new Date().toISOString() }; if(!user.firstName||!user.age||isNaN(user.goal)){ alert(app.state.lang==='he'?'אנא מלא/י את כל השדות':'Please fill all fields'); return;} app.saveUser(user); app.goHome(); }catch(e){ window._diag_show('saveUser failed: '+e);} });
    btn=document.getElementById('btn_next2'); if(btn) btn.addEventListener('click', function(){ app.next(); });

    btn=document.getElementById('btn_pdf_month'); if(btn) btn.addEventListener('click', function(){ app.exportPDF('month'); });
    btn=document.getElementById('btn_pdf_quarter'); if(btn) btn.addEventListener('click', function(){ app.exportPDF('quarter'); });

    var tiles=document.querySelectorAll('[data-nav]'); for(var t=0;t<tiles.length;t++){ tiles[t].addEventListener('click', function(){ app.push(this.getAttribute('data-nav')); }); }

    btn=document.getElementById('btn_save_skip'); if(btn) btn.addEventListener('click', function(){ try{ var item={ amount:parseFloat(document.getElementById('amt').value||0), description:document.getElementById('desc').value.trim(), category:document.getElementById('cat').value, date:new Date().toISOString() }; if(!item.amount||!item.description){ alert(app.state.lang==='he'?'נא להזין סכום ותיאור':'Please enter amount and description'); return;} app.addSkip(item); }catch(e){ window._diag_show('addSkip failed: '+e);} });
    btn=document.getElementById('btn_next3'); if(btn) btn.addEventListener('click', function(){ app.next(); });
    btn=document.getElementById('btn_next4'); if(btn) btn.addEventListener('click', function(){ app.next(); });

    btn=document.getElementById('btn_csv'); if(btn) btn.addEventListener('click', function(){ app.exportCSV(); });
    btn=document.getElementById('btn_json'); if(btn) btn.addEventListener('click', function(){ app.exportJSON(); });
    btn=document.getElementById('btn_next5'); if(btn) btn.addEventListener('click', function(){ app.next(); });

    btn=document.getElementById('btn_line'); if(btn) btn.addEventListener('click', function(){ app.state.chartMode='line'; app.renderChart(); });
    btn=document.getElementById('btn_bar'); if(btn) btn.addEventListener('click', function(){ app.state.chartMode='bar'; app.renderChart(); });
    btn=document.getElementById('btn_to_invest'); if(btn) btn.addEventListener('click', function(){ app.push('investments'); });
    btn=document.getElementById('btn_next6'); if(btn) btn.addEventListener('click', function(){ app.next(); });

    btn=document.getElementById('btn_to_summary'); if(btn) btn.addEventListener('click', function(){ app.push('summary'); });
    btn=document.getElementById('btn_next7'); if(btn) btn.addEventListener('click', function(){ app.next(); });

    btn=document.getElementById('btn_home_from_sum'); if(btn) btn.addEventListener('click', function(){ app.goHome(); });
    btn=document.getElementById('btn_next8'); if(btn) btn.addEventListener('click', function(){ app.next(); });

    if(this.state.screen==='insights'){ this.renderChart(); }
  },

  renderChart:function(){ var el=document.getElementById('chart'); if(!el) return; var ctx=el.getContext('2d'), w=el.width=el.clientWidth, h=el.height=320; ctx.clearRect(0,0,w,h); ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--cardbg'); ctx.fillRect(0,0,w,h); var data=this.state.data.slice().sort(function(a,b){ return new Date(a.date)-new Date(b.date); }); var amounts=[], cum=[], s=0; for(var i=0;i<data.length;i++){ var v=Number(data[i].amount)||0; amounts.push(v); s+=v; cum.push(s); } var series=this.state.chartMode==='line'?cum:amounts; var max=10; for(var k=0;k<series.length;k++){ if(series[k]>max) max=series[k]; } var left=40,right=10,top=10,bottom=30,gw=w-left-right,gh=h-top-bottom; ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(left,top); ctx.lineTo(left,h-bottom); ctx.lineTo(w-right,h-bottom); ctx.stroke(); ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--text'); ctx.font='12px Heebo, sans-serif'; ctx.fillText((this.state.lang==='he'?'סכום (₪)':'Amount (₪)'),6,16); if(series.length===0){ ctx.fillText(this.state.lang==='he'?'אין נתונים':'No data', left+6, top+40); return; } var step=series.length>1?gw/(series.length-1):gw; if(this.state.chartMode==='line'){ ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.beginPath(); for(var m=0;m<series.length;m++){ var x=left+m*step; var y=h-bottom-(series[m]/max)*gh; if(m===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke(); } else { var barW=Math.max(4, gw/series.length*0.6); ctx.fillStyle='#818cf8'; for(var n=0;n<series.length;n++){ var xb=left+n*step-barW/2; var yb=h-bottom-(series[n]/max)*gh; ctx.fillRect(xb,yb,barW,(series[n]/max)*gh); } }
  },

  addSkip:function(item){ this.state.data.push(item); this.saveData(); this.state.screen='history'; this.render(); },
  load:function(){ try{ var urlLang=new URL(location.href).searchParams.get('lang'); var storeLang=localStorage.getItem('skipapp_lang'); this.state.lang=(urlLang||storeLang||'he'); }catch(e){} document.documentElement.setAttribute('lang', this.state.lang==='he'?'he':'en'); document.documentElement.setAttribute('dir', this.state.lang==='he'?'rtl':'ltr'); var sel=document.getElementById('lang_header'); if(sel) sel.value=this.state.lang; try{ var th=localStorage.getItem('skipapp_theme')||'light'; this.state.theme=th; document.body.setAttribute('data-theme', th);}catch(e){} try{ var u=localStorage.getItem('skipapp_user'); this.state.user=u?JSON.parse(u):null; }catch(e){} try{ var d=localStorage.getItem('skipapp_data'); var arr=d?JSON.parse(d):[]; this.state.data=Array.isArray(arr)?arr:[]; }catch(e){} this.state.screen='entry'; this.render(); }
};

document.addEventListener('DOMContentLoaded', function(){ App.load(); });
window.addEventListener('load', function(){ if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(function(){}); } });
