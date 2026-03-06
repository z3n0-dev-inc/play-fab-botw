/* ═══════════════════════════════════════════════════════════
   dev.js — DEV PANEL v2 — FULLY WORKING
   Unlocked when player has dev_panel inventory item OR
   HasDevPanel=true in their PlayFab user data.
   ═══════════════════════════════════════════════════════════ */

const Dev = (() => {
  let isOpen = false, _openedAt = 0;
  let _speedMult = 1, _gravityOn = false, _rainbowOn = false, _rainbowTimer = null;
  let _bigHeadOn = false, _invertOn = false;
  let _matrixOn = false, _matrixCanvas = null, _matrixCtx = null, _matrixAnim = null;
  let _discoOn = false, _discoTimer = null;
  let _godModeOn = false;
  let _towerSpamInterval = null, _towerSpamActive = false;
  let _rrAudioCtx = null, _rrNotes = [];

  function _hasDevAccess() {
    return PF.inventory.some(i => i.itemId === 'dev_panel') || PF.playerData?.HasDevPanel === true;
  }

  function init() {
    document.getElementById('devTrigger') && (document.getElementById('devTrigger').onclick = toggle);
    document.getElementById('btnCloseDev') && (document.getElementById('btnCloseDev').onclick = close);
    document.addEventListener('pointerup', e => {
      if (!isOpen || Date.now() - _openedAt < 200) return;
      const panel = document.getElementById('devPanel'), trig = document.getElementById('devTrigger');
      if (panel && !panel.contains(e.target) && trig && !trig.contains(e.target)) close();
    });
    document.querySelectorAll('[data-dev]').forEach(btn => { btn.onclick = () => _handle(btn.dataset.dev, btn); });
    const sel = document.getElementById('devTowerSpamSelect');
    if (sel) sel.onclick = e => e.stopPropagation();
  }

  function show() { if (!_hasDevAccess()) return; document.getElementById('devTrigger')?.classList.remove('hidden'); }
  function hide() { document.getElementById('devTrigger')?.classList.add('hidden'); document.getElementById('devPanel')?.classList.add('hidden'); isOpen = false; }
  function toggle() { isOpen ? close() : open(); }

  function open() {
    if (!_hasDevAccess()) return;
    const panel = document.getElementById('devPanel'); if (!panel) return;
    panel.classList.remove('hidden','dev-closing'); panel.classList.add('dev-opening');
    isOpen = true; _openedAt = Date.now();
    document.getElementById('devTrigger')?.classList.add('open');
    _dots();
  }

  function close() {
    const panel = document.getElementById('devPanel');
    if (panel) { panel.classList.remove('dev-opening'); panel.classList.add('dev-closing'); setTimeout(()=>{ panel.classList.add('hidden'); panel.classList.remove('dev-closing'); },280); }
    isOpen = false; document.getElementById('devTrigger')?.classList.remove('open');
  }

  function _dots() {
    _dot('dot-speed', _speedMult !== 1); _dot('dot-rainbow', _rainbowOn); _dot('dot-bighead', _bigHeadOn);
    _dot('dot-invert', _invertOn); _dot('dot-matrix', _matrixOn); _dot('dot-disco', _discoOn);
    _dot('dot-gravity', _gravityOn); _dot('dot-godmode', _godModeOn); _dot('dot-tspam', _towerSpamActive);
  }
  function _dot(id, on) { const e = document.getElementById(id); if(e) e.className='dev-dot '+(on?'dev-dot-on':'dev-dot-off'); }

  function _log(msg, t='') {
    const log = document.getElementById('devLog'); if(!log) return;
    log.querySelector('.dev-placeholder')?.remove();
    const el = document.createElement('div'); el.className='op-log-entry '+t;
    el.textContent=`[${new Date().toLocaleTimeString()}] ${msg}`;
    log.insertBefore(el, log.firstChild);
    while(log.children.length>60) log.lastChild.remove();
  }

  function _need(label) {
    if(typeof Game==='undefined'||!Game.isRunning()){_log(`⚠ ${label}: No active game`,'err');return false;} return true;
  }

  function _boom() {
    const f=document.createElement('div'); f.style.cssText='position:fixed;inset:0;background:radial-gradient(circle,rgba(255,80,0,0.8),transparent 70%);z-index:9999;pointer-events:none;animation:devBoom 0.4s ease-out forwards';
    const s=document.createElement('style'); s.textContent='@keyframes devBoom{from{opacity:1;transform:scale(0.5)}to{opacity:0;transform:scale(3)}}';
    document.head.appendChild(s); document.body.appendChild(f); setTimeout(()=>{f.remove();s.remove();},450);
  }

  function _confetti() {
    const cols=['#e74c3c','#f5b215','#2ecc71','#3dd6f5','#9b59b6','#ff69b4','#00ffaa'];
    for(let i=0;i<100;i++) setTimeout(()=>{
      const el=document.createElement('div'), c=cols[Math.floor(Math.random()*cols.length)], sz=6+Math.random()*10;
      el.style.cssText=`position:fixed;left:${Math.random()*100}vw;top:-20px;width:${sz}px;height:${sz}px;background:${c};border-radius:${Math.random()>.5?'50%':'2px'};z-index:9999;pointer-events:none;animation:confettiFall ${1.5+Math.random()*2}s linear forwards;transform:rotate(${Math.random()*360}deg)`;
      document.body.appendChild(el); setTimeout(()=>el.remove(),3600);
    },i*35);
    if(!document.getElementById('_confKf')){const s=document.createElement('style');s.id='_confKf';s.textContent='@keyframes confettiFall{from{top:-20px;opacity:1}to{top:110vh;opacity:0;transform:rotate(720deg)}}';document.head.appendChild(s);}
  }

  function _startMatrix() {
    if(_matrixCanvas) return;
    _matrixCanvas=document.createElement('canvas'); _matrixCanvas.style.cssText='position:fixed;inset:0;z-index:9997;pointer-events:none;opacity:0.55';
    _matrixCanvas.width=window.innerWidth; _matrixCanvas.height=window.innerHeight;
    document.body.appendChild(_matrixCanvas); _matrixCtx=_matrixCanvas.getContext('2d');
    const cols=Math.floor(_matrixCanvas.width/16), drops=Array(cols).fill(1);
    const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオ0123456789☠💀🧟';
    _matrixAnim=setInterval(()=>{
      _matrixCtx.fillStyle='rgba(0,0,0,0.05)'; _matrixCtx.fillRect(0,0,_matrixCanvas.width,_matrixCanvas.height);
      _matrixCtx.fillStyle='#0f0'; _matrixCtx.font='14px monospace';
      drops.forEach((y,i)=>{ const ch=chars[Math.floor(Math.random()*chars.length)]; _matrixCtx.fillText(ch,i*16,y*16); if(y*16>_matrixCanvas.height&&Math.random()>.975)drops[i]=0; drops[i]++; });
    },50);
  }
  function _stopMatrix() { clearInterval(_matrixAnim); _matrixCanvas?.remove(); _matrixCanvas=null; _matrixCtx=null; _matrixAnim=null; }

  function _shakeCanvas(intensity) {
    const c=document.getElementById('gameCanvas'); if(!c) return;
    let n=0; const si=setInterval(()=>{ c.style.marginLeft=(Math.random()-.5)*intensity+'px'; c.style.marginTop=(Math.random()-.5)*intensity+'px'; if(++n>14){clearInterval(si);c.style.marginLeft='';c.style.marginTop='';} },40);
  }

  function _playRickroll() {
    try {
      _rrAudioCtx=new(window.AudioContext||window.webkitAudioContext)();
      // Never Gonna Give You Up simplified melody
      const notes=[[392,200],[392,200],[440,200],[392,400],[330,400],[294,600],[0,100],[392,200],[392,200],[440,200],[392,400],[349,400],[330,700],[0,100],[392,200],[392,200],[440,200],[392,400],[330,400],[294,200],[262,200],[330,400],[0,200],[294,300],[294,300],[330,400],[294,600]];
      let t=_rrAudioCtx.currentTime+0.1;
      notes.forEach(([f,d])=>{ const dur=d/1000; if(f>0){const o=_rrAudioCtx.createOscillator(),g=_rrAudioCtx.createGain(); o.connect(g); g.connect(_rrAudioCtx.destination); o.type='square'; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur*.9); o.start(t); o.stop(t+dur); _rrNotes.push(o);} t+=dur; });
    } catch(e){}
  }
  function _stopRickroll() { _rrNotes.forEach(n=>{try{n.stop();}catch(e){}}); _rrNotes=[]; if(_rrAudioCtx){try{_rrAudioCtx.close();}catch(e){} _rrAudioCtx=null;} }

  function _playBoom() {
    try {
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const buf=ctx.createBuffer(1,ctx.sampleRate*.3,ctx.sampleRate), data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length)*0.7;
      const src=ctx.createBufferSource(), gain=ctx.createGain(), filt=ctx.createBiquadFilter();
      filt.type='lowpass'; filt.frequency.value=300; src.buffer=buf;
      src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.8,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+.3);
      src.start();
    } catch(e){}
  }

  function _placeRandomTower(towerId) {
    if(!_need('Tower Spam')) return false;
    const def=(typeof getTowerDef!=='undefined')?getTowerDef(towerId):null;
    if(!def){_log(`Tower "${towerId}" not found`,'err');return false;}
    Game.ownerAddMoney && Game.ownerAddMoney(def.cost+500);
    Game.selectTowerToPlace && Game.selectTowerToPlace(towerId);
    const canvas=document.getElementById('gameCanvas'); if(!canvas) return false;
    const cols=20, rows=14, ts=canvas.width/cols;
    const rect=canvas.getBoundingClientRect();
    const scX=canvas.width/rect.width, scY=canvas.height/rect.height;
    for(let a=0;a<40;a++){
      const col=1+Math.floor(Math.random()*(cols-2)), row=1+Math.floor(Math.random()*(rows-2));
      const cx=rect.left+(col*ts+ts/2)/scX, cy=rect.top+(row*ts+ts/2)/scY;
      canvas.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,clientX:cx,clientY:cy}));
      canvas.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:cx,clientY:cy}));
      return true;
    }
    return false;
  }

  async function _handle(action, btn) {
    switch(action) {

      // ── ECONOMY ─────────────────────────────────────────
      case 'give9999': if(!_need('Money')) return; Game.ownerAddMoney(9999); _log('💰 +$9,999','ok'); UI.toast('💰 +$9,999!','gold'); break;
      case 'giveMillion': if(!_need('Money')) return; Game.ownerAddMoney(1000000); _log('🤑 +$1,000,000','ok'); UI.toast('🤑 +$1M!!','gold'); break;
      case 'giveInfinite': if(!_need('∞ Money')) return; Game.ownerAddMoney(999999999); _log('♾️ INFINITE MONEY','ok'); UI.toast('♾️ INFINITE $$$!','gold'); _boom(); break;
      case 'setMoney0': { if(!_need('Broke')) return; const cur=Game.money||0; if(cur>0) Game.ownerAddMoney(-cur); _log('💸 BROKE','ok'); UI.toast("💸 You're broke lol",'red'); break; }
      case 'stealCoins': { if(PF.isLoggedIn()&&PF.playerData.Coins>0){PF.playerData.Coins=Math.max(0,PF.playerData.Coins-500);await PF.savePlayerData();_log('💀 Stole 500 coins','ok');UI.toast('💀 -500 coins stolen','red');}else{_log('No coins to steal','err');} break; }

      // ── ENEMY CHAOS ─────────────────────────────────────
      case 'spawnHorde': {
        if(!_need('Horde')) return;
        const types=['red','blue','green','yellow','pink','black','white','purple','ceramic'];
        let n=0; const go=()=>{ if(n>=25){try{Game.ownerSpawnBoss('zomg');}catch(e){} _log('👹 25 enemies + ZOMG!','ok'); UI.toast('👹 HORDE!!!','red'); _shakeCanvas(20); _playBoom(); return;} try{Game.ownerSpawnBoss(types[n%types.length]);}catch(e){} n++; setTimeout(go,70); };
        go(); break;
      }
      case 'spawnZomg': { if(!_need('ZOMG')) return; try{Game.ownerSpawnBoss('zomg');_log('👑 Z.O.M.G SPAWNED','ok');UI.toast('👑 Z.O.M.G!','red');_shakeCanvas(18);}catch(e){_log('Spawn error: '+e.message,'err');} break; }
      case 'spawnBad': { if(!_need('BAD')) return; try{Game.ownerSpawnBoss('bad');_log('☠️ B.A.D 40k HP','ok');UI.toast('☠️ B.A.D!','red');_shakeCanvas(25);}catch(e){_log('Error: '+e.message,'err');} break; }
      case 'spawnPhantom': { if(!_need('PHANTOM')) return; try{Game.ownerSpawnBoss('phantom');_log('👻 PHANTOM 80k HP','ok');UI.toast('👻 PHANTOM!','red');_shakeCanvas(30);_boom();}catch(e){_log('Error: '+e.message,'err');} break; }
      case 'spawnMoab': { if(!_need('MOAB')) return; try{Game.ownerSpawnBoss('moab');_log('🔵 M.O.A.B','ok');UI.toast('🔵 M.O.A.B!','red');}catch(e){_log('Error: '+e.message,'err');} break; }
      case 'spawnAllBosses': {
        if(!_need('All Bosses')) return;
        ['moab','bfb','zomg','bad'].forEach((b,i)=>setTimeout(()=>{try{Game.ownerSpawnBoss(b);}catch(e){}},i*600));
        _log('☠️ ALL BOSSES SPAWNED','ok'); UI.toast('☠️ ALL BOSSES!!','red'); setTimeout(()=>_shakeCanvas(30),200); break;
      }
      case 'rainbowStorm': {
        if(!_need('Rainbow Storm')) return;
        const rt=['rainbow','ceramic','lead','purple']; let ri=0;
        const go=()=>{ if(ri>=20){_log('🌈 Rainbow storm done','ok');return;} try{Game.ownerSpawnBoss(rt[ri%rt.length]);}catch(e){} ri++; setTimeout(go,60); };
        go(); UI.toast('🌈 RAINBOW STORM!',''); break;
      }
      case 'nukeAll': { if(!_need('Nuke')) return; Game.ownerNukeEnemies&&Game.ownerNukeEnemies(); Game.ownerAddMoney(5000); _log('☢️ MEGA NUKE +$5k','ok'); UI.toast('☢️ NUKE!','gold'); _boom(); break; }
      case 'freezeForever': { if(!_need('Freeze')) return; Game.ownerFreezeAll&&Game.ownerFreezeAll(); _log('❄️ ALL FROZEN','ok'); UI.toast('❄️ FROZEN!',''); break; }
      case 'unfreeze': { if(!_need('Unfreeze')) return; Game.ownerSetSpeed?Game.ownerSetSpeed(1):Game.ownerSpeedHack&&Game.ownerSpeedHack(); _log('🔥 THAWED','ok'); UI.toast('🔥 Unfrozen!',''); break; }

      // ── TOWER SHENANIGANS ────────────────────────────────
      case 'maxAllTowers': { if(!_need('Max All')) return; Game.ownerMaxAllTowers&&Game.ownerMaxAllTowers(); _log('🗼 ALL TOWERS MAXED','ok'); UI.toast('🗼 MAX!','gold'); break; }
      case 'sellAllTowers': { if(!_need('Sell All')) return; typeof Game.ownerSellAllTowers==='function'?Game.ownerSellAllTowers():Game.ownerAddMoney(999); _log('💸 SOLD ALL','ok'); UI.toast('💸 Sold lol','red'); break; }
      case 'godMode': { if(!_need('God')) return; _godModeOn=Game.ownerGodMode&&Game.ownerGodMode(); _log(`🛡 GOD MODE: ${_godModeOn?'ON':'OFF'}`,'ok'); UI.toast(`🛡 God: ${_godModeOn?'ON ∞':'OFF'}`,'gold'); _dot('dot-godmode',_godModeOn); break; }
      case 'cloneArmy': { if(!_need('Clone')) return; Game.ownerAddMoney(50000); Game.ownerMaxAllTowers&&Game.ownerMaxAllTowers(); _log('🤖 CLONE ARMY $50k+maxed','ok'); UI.toast('🤖 CLONE ARMY!','gold'); break; }
      case 'skipToWave': { if(!_need('Skip')) return; const t=parseInt(document.getElementById('devWaveNum')?.value)||1; for(let i=0;i<t;i++) Game.ownerSkipWave&&Game.ownerSkipWave(); _log(`⏭ +${t} waves`,'ok'); UI.toast(`⏭ +${t} waves!`,'gold'); break; }
      case 'setLives': { if(!_need('Lives')) return; const l=parseInt(document.getElementById('devLivesNum')?.value)||999; Game.ownerSetLives&&Game.ownerSetLives(l); _log(`❤️ Lives=${l}`,'ok'); UI.toast(`❤️ ${l} lives`,'green'); break; }
      case 'setLives1': { if(!_need('1 Life')) return; Game.ownerSetLives&&Game.ownerSetLives(1); _log('💀 1 LIFE','ok'); UI.toast('💀 1 life left...','red'); break; }
      case 'hyperspeed': { if(!_need('Speed')) return; _speedMult=_speedMult===10?1:10; Game.ownerSetSpeed?Game.ownerSetSpeed(_speedMult):Game.ownerSpeedHack&&Game.ownerSpeedHack(); _log(`⚡ ${_speedMult===10?'10×':'1×'}`,'ok'); UI.toast(`⚡ ${_speedMult===10?'10× SPEED!':'Normal'}`,'gold'); _dot('dot-speed',_speedMult!==1); break; }
      case 'slowMo': { if(!_need('Slow')) return; _speedMult=_speedMult===0.1?1:0.1; Game.ownerSetSpeed?Game.ownerSetSpeed(_speedMult):Game.ownerSpeedHack&&Game.ownerSpeedHack(); _log(`🐌 ${_speedMult===0.1?'0.1×':'1×'}`,'ok'); UI.toast(_speedMult===0.1?'🐌 SLOOOW':'🐌 Normal',''); _dot('dot-speed',_speedMult!==1); break; }

      case 'towerSpamStart': {
        if(!_need('Spam')) return;
        const sel=document.getElementById('devTowerSpamSelect'), tid=sel?sel.value:'gunner';
        if(_towerSpamActive){
          clearInterval(_towerSpamInterval); _towerSpamInterval=null; _towerSpamActive=false;
          if(btn) btn.textContent='🗼 START SPAM';
          _log('🛑 Tower spam stopped',''); UI.toast('🛑 Spam stopped','');
        } else {
          _towerSpamActive=true; if(btn) btn.textContent='🛑 STOP SPAM';
          _log(`🗼 Spamming ${tid}`,'ok'); UI.toast(`🗼 Spamming ${tid}!`,'gold');
          _towerSpamInterval=setInterval(()=>{ if(!Game.isRunning()){clearInterval(_towerSpamInterval);_towerSpamActive=false;return;} _placeRandomTower(tid); },350);
        }
        _dot('dot-tspam',_towerSpamActive); break;
      }
      case 'placeTowerOnce': { if(!_need('Place')) return; const s2=document.getElementById('devTowerSpamSelect'),tid2=s2?s2.value:'gunner'; _placeRandomTower(tid2); _log(`🗼 Placed 1× ${tid2}`,'ok'); UI.toast(`🗼 ${tid2} placed!`,'gold'); break; }

      // ── VISUAL CHAOS ─────────────────────────────────────
      case 'rainbow': {
        _rainbowOn=!_rainbowOn;
        if(_rainbowOn){let h=0;_rainbowTimer=setInterval(()=>{document.documentElement.style.filter=`hue-rotate(${h}deg) saturate(2)`;h=(h+3)%360;},30);_log('🌈 RAINBOW ON','ok');UI.toast('🌈 RAINBOW!','');}
        else{clearInterval(_rainbowTimer);document.documentElement.style.filter='';_log('🌈 OFF','');UI.toast('🌈 Normal','');}
        _dot('dot-rainbow',_rainbowOn); break;
      }
      case 'bigHead': { _bigHeadOn=!_bigHeadOn; const c=document.getElementById('gameCanvas'); if(c)c.style.transform=_bigHeadOn?'scaleX(2) scaleY(0.5)':''; _log(`👁 STRETCHED ${_bigHeadOn?'ON':'OFF'}`,'ok'); UI.toast(_bigHeadOn?'👁 STRETCHED!':'👁 Normal',''); _dot('dot-bighead',_bigHeadOn); break; }
      case 'invert': { _invertOn=!_invertOn; document.documentElement.style.filter=_invertOn?'invert(1) hue-rotate(180deg)':''; _log(`🌀 INVERT ${_invertOn?'ON':'OFF'}`,'ok'); UI.toast(_invertOn?'🌀 INVERTED!':'🌀 Normal',''); _dot('dot-invert',_invertOn); break; }
      case 'earthquake': { let sc=0; const si=setInterval(()=>{document.body.style.transform=`translate(${(Math.random()-.5)*30}px,${(Math.random()-.5)*30}px)`;if(++sc>60){clearInterval(si);document.body.style.transform='';}},30); _log('🌍 EARTHQUAKE 3s','ok'); UI.toast('🌍 EARTHQUAKE!','red'); break; }
      case 'confetti': { _confetti(); _log('🎊 CONFETTI','ok'); UI.toast('🎊 CONFETTI!!!','gold'); break; }
      case 'matrix': { _matrixOn=!_matrixOn; _matrixOn?_startMatrix():_stopMatrix(); _log(`💻 MATRIX ${_matrixOn?'ON':'OFF'}`,'ok'); UI.toast(_matrixOn?'💻 MATRIX':' 💻 Reality',''); _dot('dot-matrix',_matrixOn); break; }
      case 'disco': {
        _discoOn=!_discoOn;
        if(_discoOn){let h=0;_discoTimer=setInterval(()=>{document.body.style.background=`hsl(${h},80%,8%)`;h=(h+15)%360;},120);_log('🪩 DISCO ON','ok');UI.toast('🪩 DISCO!','');}
        else{clearInterval(_discoTimer);document.body.style.background='';_log('🪩 OFF','');UI.toast('🪩 Lights off','');}
        _dot('dot-disco',_discoOn); break;
      }
      case 'zoom': { const zc=document.getElementById('gameCanvas'); const cur=parseFloat(zc?.style.transform?.replace('scale(','').replace(')',''))||1; const nxt=cur>=3?1:+(cur+.5).toFixed(1); if(zc)zc.style.transform=`scale(${nxt})`; _log(`🔍 ZOOM ${nxt}×`,'ok'); UI.toast(`🔍 ${nxt}×`,''); break; }
      case 'flip': { const fc=document.getElementById('gameCanvas'); if(fc){const f=fc.style.transform==='scaleX(-1)'; fc.style.transform=f?'':'scaleX(-1)'; _log(`🔄 FLIP ${!f?'ON':'OFF'}`,'ok'); UI.toast(!f?'🔄 MIRRORED!':'🔄 Normal','');} break; }
      case 'upsideDown': { const uc=document.getElementById('gameCanvas'); if(uc){const f=uc.style.transform==='scaleY(-1)'; uc.style.transform=f?'':'scaleY(-1)'; _log(`🙃 UPSIDE ${!f?'ON':'OFF'}`,'ok'); UI.toast(!f?'🙃 FLIPPED!':'🙃 Normal','');} break; }
      case 'flashbang': { const fl=document.createElement('div'); fl.style.cssText='position:fixed;inset:0;background:white;z-index:99999;pointer-events:none;transition:opacity 1.5s'; document.body.appendChild(fl); requestAnimationFrame(()=>{fl.style.opacity='0';setTimeout(()=>fl.remove(),1600);}); _log('💥 FLASHBANG','ok'); UI.toast('💥 FLASHBANG!',''); break; }
      case 'screenSmash': {
        const sm=document.createElement('div'); sm.style.cssText='position:fixed;inset:0;z-index:99998;pointer-events:none;background:rgba(0,0,0,0.15)';
        for(let i=0;i<14;i++){const ln=document.createElement('div');const ang=(i/14)*360,len=180+Math.random()*350; ln.style.cssText=`position:absolute;top:50%;left:50%;width:${len}px;height:${2+Math.random()*2}px;background:rgba(255,255,255,0.85);transform-origin:0 50%;transform:rotate(${ang}deg);box-shadow:0 0 5px rgba(255,255,255,.7)`; sm.appendChild(ln);} const imp=document.createElement('div'); imp.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50px;height:50px;border-radius:50%;background:radial-gradient(white,transparent)'; sm.appendChild(imp); document.body.appendChild(sm); _log('💥 CRACK SCREEN','ok'); UI.toast('💥 CRACKED!','red'); setTimeout(()=>{sm.style.transition='opacity .5s';sm.style.opacity='0';setTimeout(()=>sm.remove(),600);},3000); break;
      }
      case 'gravity': { _gravityOn=!_gravityOn; const gc=document.getElementById('gameCanvas'); if(gc){gc.style.transition='transform .3s';gc.style.transform=_gravityOn?'rotate(15deg)':'';}  _log(`🌍 TILT ${_gravityOn?'ON':'OFF'}`,'ok'); UI.toast(_gravityOn?'🌍 TILTED!':'🌍 Straight',''); _dot('dot-gravity',_gravityOn); break; }
      case 'antiGravity': { const agc=document.getElementById('gameCanvas'); if(agc){const f=agc.style.transform?.includes('scaleY(-1)'); agc.style.transform=f?'':'scaleY(-1)'; _log(`🚀 ANTIGRAV ${!f?'ON':'OFF'}`,'ok'); UI.toast(!f?'🚀 UPSIDE DOWN!':'🚀 Normal','');} break; }
      case 'neonMode': { const ex=document.getElementById('_devNeonStyle'); if(ex){ex.remove();_log('🌟 NEON OFF','');UI.toast('🌟 Neon OFF','');}else{const s=document.createElement('style');s.id='_devNeonStyle';s.textContent='#gameCanvas{filter:brightness(.4) contrast(2) saturate(4)!important}body{background:#000!important}';document.head.appendChild(s);_log('🌟 NEON ON','ok');UI.toast('🌟 NEON!','');} break; }
      case 'pixelate': { const pc=document.getElementById('gameCanvas'); if(pc){const on=pc.style.imageRendering==='pixelated'; pc.style.imageRendering=on?'':'pixelated'; pc.style.filter=on?'':'contrast(1.4) saturate(1.8)'; _log(`🕹 PIXEL ${on?'OFF':'ON'}`,'ok'); UI.toast(on?'🕹 Normal':'🕹 PIXEL ART!','');} break; }

      // ── TROLL COMMANDS ───────────────────────────────────
      case 'rickroll': {
        _stopRickroll(); _playRickroll();
        const ov=document.createElement('div'); ov.id='_devRickroll';
        ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;';
        ov.innerHTML=`<div style="font-size:90px;animation:rrSpin 1.5s linear infinite">🎵</div><div style="font-family:'Courier New',monospace;font-size:clamp(18px,4vw,32px);color:#e74c3c;font-weight:900;margin:24px 16px 10px;text-align:center;letter-spacing:5px;text-shadow:0 0 20px #e74c3c">NEVER GONNA GIVE YOU UP</div><div style="font-family:'Courier New',monospace;font-size:clamp(13px,2.5vw,18px);color:#f5b215;letter-spacing:3px;text-shadow:0 0 12px #f5b215">NEVER GONNA LET YOU DOWN</div><div style="margin-top:10px;font-family:'Courier New',monospace;font-size:clamp(11px,2vw,14px);color:#3dd6f5;letter-spacing:2px">NEVER GONNA RUN AROUND AND DESERT YOU</div><div style="position:absolute;bottom:24px;font-family:monospace;font-size:11px;color:rgba(255,255,255,.3)">🎵 click to close (you got rick rolled) 🎵</div><style>@keyframes rrSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style>`;
        ov.onclick=()=>{ov.remove();_stopRickroll();}; document.body.appendChild(ov); setTimeout(()=>{ov.remove();_stopRickroll();},16000); _log('🎵 RICKROLLED','ok'); break;
      }
      case 'fakeBan': {
        const bov=document.createElement('div'); bov.style.cssText='position:fixed;inset:0;background:#050505;z-index:99999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
        bov.innerHTML=`<div style="text-align:center;padding:40px;max-width:520px;"><div style="font-size:72px;margin-bottom:20px;filter:drop-shadow(0 0 20px #e74c3c)">🔨</div><div style="font-family:'Courier New',monospace;font-size:clamp(22px,4vw,36px);color:#e74c3c;font-weight:900;letter-spacing:4px;text-shadow:0 0 30px #e74c3c">YOU HAVE BEEN BANNED</div><div style="margin-top:18px;padding:16px;background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.3);border-radius:8px;font-family:monospace;font-size:13px;color:#ccc;line-height:1.8">Reason: <span style="color:#e74c3c">being too cracked at the game</span><br>Duration: <span style="color:#f5b215">∞ PERMANENT</span><br>Appeal: <span style="color:#666">lmaooo no</span></div><div style="margin-top:24px;font-family:monospace;font-size:11px;color:rgba(255,255,255,.2)">click to escape (jk you're fine)</div></div>`;
        bov.onclick=()=>bov.remove(); document.body.appendChild(bov); setTimeout(()=>bov.remove(),7000); _log('🔨 FAKE BAN','ok'); UI.toast('🔨 BANNED (jk)','red'); break;
      }
      case 'fakeGameOver': { if(!_need('Fake GO')) return; Game.ownerSetLives&&Game.ownerSetLives(0); _log('💀 FAKE GAME OVER','ok'); UI.toast('💀 game over lmao','red'); break; }
      case 'fakeVictory': { if(!_need('Fake Win')) return; for(let i=0;i<99;i++) Game.ownerSkipWave&&Game.ownerSkipWave(); _log('🏆 FAKE VICTORY','ok'); UI.toast("🏆 YOU WIN (you don't)",'gold'); break; }
      case 'fakeError': {
        const eov=document.createElement('div'); eov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
        eov.innerHTML=`<div style="background:#0f0f0f;border:1px solid #e74c3c;border-radius:10px;padding:36px;max-width:500px;font-family:'Courier New',monospace;"><div style="font-size:48px;text-align:center;margin-bottom:16px">💥</div><div style="font-size:20px;color:#e74c3c;font-weight:900;margin-bottom:12px;text-align:center">CRITICAL GAME ERROR</div><div style="font-size:11px;color:#555;line-height:1.7;margin-bottom:20px">TypeError: Cannot read properties of undefined (reading 'brain')<br>&nbsp;&nbsp;at Zombie.think (/game/enemies.js:420:69)<br>&nbsp;&nbsp;at Array.forEach (&lt;anonymous&gt;)<br>&nbsp;&nbsp;at GameLoop._tick (/game/game.js:1337:13)<br><br><span style="color:#888">Memory dump: /tmp/ztd_crash_${Date.now()}.dmp</span></div><div style="text-align:center;font-size:10px;color:#333">click to close — your save data is probably fine... probably</div></div>`;
        eov.onclick=()=>eov.remove(); document.body.appendChild(eov); setTimeout(()=>eov.remove(),8000); _log('💥 FAKE ERROR','ok'); break;
      }
      case 'fakeUpdate': {
        const uov=document.createElement('div'); uov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;';
        uov.innerHTML=`<div style="text-align:center;width:380px;font-family:'Courier New',monospace;"><div style="font-size:48px;margin-bottom:20px">🔄</div><div style="font-size:20px;color:#3dd6f5;font-weight:900;letter-spacing:3px;margin-bottom:8px">MANDATORY UPDATE</div><div style="font-size:12px;color:#666;margin-bottom:24px">ZTD v99.0.1 — Critical Patch</div><div style="height:8px;background:#111;border-radius:4px;overflow:hidden;border:1px solid #333;margin-bottom:12px"><div id="_updateBar" style="height:100%;width:0%;background:linear-gradient(90deg,#3dd6f5,#9b59b6);transition:width .3s;border-radius:4px"></div></div><div id="_updateStatus" style="font-size:11px;color:#555">Downloading patch...</div></div>`;
        document.body.appendChild(uov);
        let p=0; const msgs=['Downloading patch...','Installing files...','Reticulating splines...','Defragmenting zombies...','Polishing towers...','Overwriting your highscore...','Almost done (not really)...'];
        const tick=setInterval(()=>{ p+=Math.random()*8; if(p>=100){p=100;clearInterval(tick);setTimeout(()=>uov.remove(),1000);} const bar=document.getElementById('_updateBar'),stat=document.getElementById('_updateStatus'); if(bar)bar.style.width=p+'%'; if(stat)stat.textContent=msgs[Math.floor(p/(100/msgs.length))]||'Finalizing...'; },300);
        _log('🔄 FAKE UPDATE','ok'); break;
      }
      case 'jumpScare': {
        try{const ctx2=new(window.AudioContext||window.webkitAudioContext)();const buf2=ctx2.createBuffer(1,ctx2.sampleRate*.4,ctx2.sampleRate);const d2=buf2.getChannelData(0);for(let i=0;i<d2.length;i++)d2[i]=(Math.random()*2-1)*(1-i/d2.length)*.7;const src2=ctx2.createBufferSource(),g2=ctx2.createGain(),f2=ctx2.createBiquadFilter();f2.type='bandpass';f2.frequency.value=800;src2.buffer=buf2;src2.connect(f2);f2.connect(g2);g2.connect(ctx2.destination);g2.gain.setValueAtTime(.8,ctx2.currentTime);g2.gain.exponentialRampToValueAtTime(.001,ctx2.currentTime+.4);src2.start();}catch(e){}
        const js=document.createElement('div'); js.style.cssText='position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;cursor:pointer;';
        js.innerHTML=`<div style="font-size:min(35vw,35vh);animation:jsShake .1s infinite;filter:drop-shadow(0 0 40px red)">😱</div><style>@keyframes jsShake{0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(-8px,8px) rotate(-3deg)}75%{transform:translate(8px,-8px) rotate(3deg)}}</style>`;
        js.onclick=()=>js.remove(); document.body.appendChild(js); setTimeout(()=>js.remove(),2000); _log('😱 JUMP SCARE','ok'); break;
      }
      case 'spamToast': {
        const msgs=['🤡 imagine getting trolled','💀 you have been pranked','🎺 tuba sound effect','🙈 skill issue ngl','💅 not my problem bestie','🐛 feature not a bug','🗿 bro thought he was safe','🧠 galaxy brain moment fr','📞 1-800-git-gud','🚽 deleted from existence','👁️ i see you struggling','🎭 certified clown moment'];
        msgs.forEach((m,i)=>setTimeout(()=>UI.toast(m,i%3===0?'red':'gold'),i*350)); _log('🤡 TOAST SPAM 12×','ok'); break;
      }
      case 'teleportEnemies': { if(!_need('Teleport')) return; Game.ownerNukeEnemies&&Game.ownerNukeEnemies(); setTimeout(()=>{try{Game.ownerSpawnBoss('zomg');}catch(e){}},400); _log('✨ TELEPORT → ZOMG','ok'); UI.toast('✨ TELEPORTED!',''); break; }

      // ── RESET ────────────────────────────────────────────
      case 'resetAllEffects': {
        clearInterval(_rainbowTimer); _rainbowOn=false;
        clearInterval(_discoTimer); _discoOn=false;
        clearInterval(_towerSpamInterval); _towerSpamActive=false;
        _bigHeadOn=false; _invertOn=false; _gravityOn=false; _godModeOn=false;
        _stopMatrix(); _matrixOn=false; _speedMult=1; _stopRickroll();
        document.documentElement.style.filter=''; document.body.style.background=''; document.body.style.transform='';
        const rc=document.getElementById('gameCanvas'); if(rc){rc.style.transform='';rc.style.imageRendering='';rc.style.filter='';}
        document.getElementById('_devNeonStyle')?.remove(); document.getElementById('_devRickroll')?.remove();
        const spamBtn=document.querySelector('[data-dev="towerSpamStart"]'); if(spamBtn)spamBtn.textContent='🗼 START SPAM';
        _log('🔄 ALL EFFECTS RESET','ok'); UI.toast('🔄 Chaos cleared!','green'); _dots(); break;
      }
      case 'nukeAccount': {
        if(!confirm('💀 NUKE ACCOUNT: Reset coins=100, bestWave=0, kills=0?\nPERMANENT.')) return;
        if(PF.isLoggedIn()){PF.playerData.Coins=100;PF.playerData.BestWave=0;PF.playerData.TotalKills=0;await PF.savePlayerData();_log('💀 ACCOUNT NUKED','ok');UI.toast('💀 Stats wiped','red');}else{localStorage.setItem('ztd_coins','100');localStorage.setItem('ztd_bestWave','0');_log('💀 Local data nuked','ok');}
        break;
      }
    }
  }

  return { init, show, hide, toggle, open, close };
})();
