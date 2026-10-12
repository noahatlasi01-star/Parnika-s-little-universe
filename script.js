(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const overlay = $('#overlay'), sheetTitle = $('#sheetTitle'), sheetVisual = $('#sheetVisual'), sheetEyebrow = $('#sheetEyebrow'), sheetContent = $('#sheetContent'), sheetActions = $('#sheetActions');
  let audioCtx = null, musicOn = false, melodyTimer = null, toastTimer = null, lastFocus = null;
  const notes = [261.63,329.63,392,329.63,293.66,349.23,440,392,261.63,329.63,392,523.25,440,392];
  let noteIndex = 0;
  function startMusic(){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { toast('مرورگرت از موسیقی خودکار پشتیبانی نمی‌کنه؛ اشکالی نداره ♡'); return; }
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (musicOn) return;
    musicOn = true; $('#sound').classList.add('active'); $('#sound').innerHTML = '♫ <span>موسیقی روشن</span>';
    const playNote = () => {
      if (!musicOn || !audioCtx) return;
      const now = audioCtx.currentTime, osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = notes[noteIndex++ % notes.length];
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.035, now+.08); gain.gain.exponentialRampToValueAtTime(.0001, now+1.2);
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now+1.25);
      if (noteIndex % 4 === 0) { const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type='sine'; o.frequency.value=notes[(noteIndex+2)%notes.length]/2; g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.012,now+.12);g.gain.exponentialRampToValueAtTime(.0001,now+1.6);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+1.7); }
    };
    playNote(); melodyTimer = setInterval(playNote, 720);
  }
  function stopMusic(){ musicOn=false; clearInterval(melodyTimer); $('#sound').classList.remove('active'); $('#sound').innerHTML='♫ <span>موسیقی</span>'; }
  function toast(message){ const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600); }
  function openSheet(type){
    lastFocus=document.activeElement; overlay.hidden=false; document.body.style.overflow='hidden'; sheetActions.innerHTML=''; sheetContent.innerHTML=''; sheetVisual.innerHTML='';
    const button=(text,fn,cls='primary')=>{const b=document.createElement('button');b.type='button';b.className='button '+(cls==='primary'?'primary':'ghost');b.textContent=text;b.addEventListener('click',fn);sheetActions.append(b);return b;};
    if(type==='flower'){
      sheetEyebrow.textContent='یه شکوفه‌ی کوچیک، برای تو';sheetTitle.textContent='گل آبیِ تو';sheetVisual.innerHTML=`<div class="flower-stage"><div class="stem"></div><div class="leaf"></div><div class="leaf right"></div><div id="dreamFlower" class="dream-flower">${Array.from({length:8},()=>'<span class="petal"></span>').join('')}<span class="flower-center"></span></div><div class="petal-glint"><i>✦</i><i>✧</i><i>·</i><i>✦</i></div></div>`;
      sheetContent.textContent='برای شکفتن این گل عجله‌ای نیست؛ درست مثل چیزهای قشنگ زندگی، با یه لمس آروم شروع می‌شه.';
      button('بذار شکوفه کنه ✿',()=>{const f=$('#dreamFlower');if(f.classList.contains('bloomed')){f.classList.remove('bloomed');toast('گل دوباره به حالت غنچه برگشت ♡');}else{f.classList.add('bloomed');sheetContent.textContent='کاش هر روز یه دلیل کوچیک برای لبخند زدن پیدا کنی. این گل هم فقط برای یادآوری همینه: تو لایق قشنگی‌هایی.';toast('یه شکوفه‌ی آبی برای تو ♡');}},'primary');
    } else if(type==='letter'){
      sheetEyebrow.textContent='چند کلمه از ته دل';sheetTitle.textContent='یه نامه‌ی کوچیک';sheetVisual.textContent='♡';
      sheetContent.textContent='می‌خواستم یه چیزی بهت بدم که شبیه خودت، خاص و به‌یادموندنی باشه؛ پس این گوشه‌ی کوچیک از جهان رو ساختم. امیدوارم روزهای پیش روت پر از آرامش باشن، آدم‌های مهربون سر راهت قرار بگیرن و برای چیزهایی که دوست داری، فرصت و شجاعت داشته باشی. تولدت مبارک، ستاره‌ی قشنگم. ممنون که توی این دنیا هستی. ♡';
      button('این حرف رو نگه می‌دارم ♡',()=>{toast('این نامه همیشه همین‌جا منتظرته.');closeSheet();});
    } else if(type==='stars'){
      sheetEyebrow.textContent='هر ستاره یه حرف کوچیک داره';sheetTitle.textContent='آسمون مخصوص تو';sheetVisual.textContent='✧';sheetContent.textContent='روی هر ستاره بزن؛ شاید یه یادآوری کوچیک منتظرت باشه.';
      const area=document.createElement('div');area.className='star-tap-area';[['✦','تو مهمی، حتی روزهایی که یادت می‌ره.'],['✧','امیدوارم امروز یه اتفاق کوچیک خوشحالت کنه.'],['⋆','همیشه برای آرزوهای قشنگت جا هست.'],['♡','دنیا با مهربونی تو روشن‌تره.']].forEach(([symbol,msg])=>{const b=document.createElement('button');b.type='button';b.textContent=symbol;b.setAttribute('aria-label','باز کردن پیام ستاره');b.addEventListener('click',()=>{sheetContent.textContent=msg;});area.append(b);});sheetActions.append(area);
    } else if(type==='wish'){
      sheetEyebrow.textContent='لحظه‌ای فقط برای خودت';sheetTitle.textContent='آرزوت رو به ماه بسپار';sheetVisual.textContent='☾';sheetContent.textContent='یه آرزو رو توی دلت نگه دار. لازم نیست به کسی بگیش. وقتی آماده‌ای، دکمه رو بزن.';
      button('سپردمش به آسمون ✧',()=>{sheetContent.textContent='امیدوارم آرزوت، هر چی که هست، یه روز قشنگ‌تر از چیزی که تصور کردی برآورده بشه. ♡';toast('آرزوت رو به ستاره‌ها سپردیم');});
    } else if(type==='secret'){
      sheetEyebrow.textContent='این یکی رو برای آخر نگه داشته بودم';sheetTitle.textContent='تولدت مبارک، قشنگم';sheetVisual.textContent='✦';sheetContent.textContent='امیدوارم سال جدید زندگیت پر از لحظه‌هایی باشه که از ته دل می‌خندی، چیزهای تازه کشف می‌کنی و بیشتر از قبل به خودت افتخار می‌کنی. این جهان کوچیک فقط یه هدیه‌ست؛ آرزو می‌کنم جهان واقعی‌ات هم پر از آبی‌های روشن و اتفاق‌های دوست‌داشتنی باشه. ♡';
      button('یه بغلِ مجازی از دور ♡',()=>{toast('امیدوارم لبخند زده باشی ♡');closeSheet();});
    }
    requestAnimationFrame(()=>$('#close').focus());
  }
  function closeSheet(){overlay.hidden=true;document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  function makeStars(){const box=$('#stars');for(let i=0;i<34;i++){const s=document.createElement('i');s.className='background-star';s.textContent=i%5===0?'✦':'·';s.style.left=(Math.random()*100)+'%';s.style.top=(Math.random()*100)+'%';s.style.animationDelay=(Math.random()*5)+'s';box.append(s);}}
  $('#enter').addEventListener('click',()=>{$('#welcome').classList.add('hide');startMusic();});
  $('#sound').addEventListener('click',()=>musicOn?stopMusic():startMusic());
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>openSheet(b.dataset.open)));
  $('#navFlower').addEventListener('click',()=>openSheet('flower'));$('#navLetter').addEventListener('click',()=>openSheet('letter'));$('#secret').addEventListener('click',()=>openSheet('secret'));
  $('#close').addEventListener('click',closeSheet);overlay.addEventListener('click',e=>{if(e.target===overlay)closeSheet();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closeSheet();});
  makeStars();
})();
