(()=>{'use strict';
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* Radno vreme: 0=nedelja..6=subota; [od,do] u minutima, null=zatvoreno */
const H=[null,[540,1080],[540,1080],[540,1080],[540,1080],[540,1080],[540,840]];
const DN=['Nedelja','Ponedeljak','Utorak','Sreda','Četvrtak','Petak','Subota'],order=[1,2,3,4,5,6,0];
const fmt=m=>String(m/60|0).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
function now(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Belgrade',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).map(x=>[x.type,x.value]));
return{d:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday),m:(+p.hour%24)*60+ +p.minute}}
function status(){const{d,m}=now(),h=H[d];let on=false,t='Danas ne radimo';
if(h){if(m>=h[0]&&m<h[1]){on=true;t='Otvoreno do '+fmt(h[1])}else if(m<h[0])t='Zatvoreno, otvaramo u '+fmt(h[0]);else t='Zatvoreno, vidimo se sutra'}
[['openDot','openTxt'],['openDot2','openTxt2']].forEach(([a,b])=>{$('#'+a).classList.toggle('on',on);$('#'+b).textContent=t});return d}
const today=status();setInterval(status,6e4);
$('#hrs').innerHTML=order.map(d=>`<tr${d===today?' class="today"':''}><td>${DN[d]}</td><td>${H[d]?fmt(H[d][0])+'–'+fmt(H[d][1]):'Zatvoreno'}</td></tr>`).join('');
$('#yr').textContent=new Date().getFullYear();
/* Galerija */
const N=8,g=$('#gal');
for(let i=1;i<=N;i++){const b=document.createElement('button');b.className='rv';b.style.setProperty('--i',i%4);b.setAttribute('aria-label','Uvećaj sliku '+i);
b.innerHTML=`<img src="assets/img/gallery${i}.webp" alt="Ljubimac posle šišanja u salonu Šiško Pet, slika ${i}" width="600" height="${i%3?750:600}" loading="lazy" decoding="async">`;g.append(b);b.onclick=()=>open(i-1)}
/* Rezervni okvir ako slika ne postoji */
document.addEventListener('error',e=>{const t=e.target;if(t.tagName==='IMG'&&!t.dataset.f&&!/logo|hero/.test(t.src)){t.dataset.f=1;t.removeAttribute('src');t.parentElement.classList.add('ph');t.style.cssText='aspect-ratio:4/5;width:100%;opacity:0'}},true);
/* Lightbox */
const lb=$('#lb'),li=$('img',lb);let cur=0,last;
function show(i){cur=(i+N)%N;li.src=`assets/img/gallery${cur+1}.webp`;li.alt='Slika '+(cur+1)+' od '+N}
function open(i){last=document.activeElement;show(i);lb.showModal();$('.lb-x').focus()}
$('.lb-x').onclick=()=>lb.close();$('.lb-p').onclick=()=>show(cur-1);$('.lb-n').onclick=()=>show(cur+1);
lb.addEventListener('close',()=>last&&last.focus());lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
lb.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
let sx;lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1))},{passive:true});
/* Meni */
const nav=$('#nav'),bg=$('.burger');
const setMenu=o=>{nav.classList.toggle('open',o);bg.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''};
bg.onclick=()=>setMenu(!nav.classList.contains('open'));
$$('a',nav).forEach(a=>a.onclick=()=>setMenu(false));
document.addEventListener('keydown',e=>{if(!nav.classList.contains('open'))return;
if(e.key==='Escape'){setMenu(false);bg.focus()}
if(e.key==='Tab'){const f=[bg,...$$('a',nav)],i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f.at(-1).focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}});
/* Sidra: skrol bez #hash-a u URL-u (uvek čistimo hash) */
const clean=()=>history.replaceState(null,'',location.pathname+location.search);
function goTo(id,smooth=true){const b=smooth&&!RM?'smooth':'auto';
if(!id||id==='top'){scrollTo({top:0,behavior:b});return}
const t=document.getElementById(id);if(!t)return;t.scrollIntoView({behavior:b,block:'start'});
if(!/^(A|BUTTON|INPUT)$/.test(t.tagName)){t.setAttribute('tabindex','-1');t.focus({preventScroll:true})}}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented)return;
const id=decodeURIComponent(a.getAttribute('href').slice(1));e.preventDefault();goTo(id);clean()});
if(location.hash){const id=decodeURIComponent(location.hash.slice(1));clean();addEventListener('load',()=>goTo(id,false),{once:true})}
addEventListener('hashchange',clean);
/* Spoljni linkovi uvek u novom prozoru / aplikaciji */
$$('a[href^="http"]').forEach(a=>{if(a.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}});
/* Reveal */
$$('.cards,.mini').forEach(c=>$$('.rv',c).forEach((el,i)=>el.style.setProperty('--i',i)));
$$('.hero .rv').forEach((el,i)=>el.style.setProperty('--i',i));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.rv').forEach(el=>io.observe(el));
/* Scrollspy */
const links=$$('a',nav),spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.hash==='#'+e.target.id))}),{rootMargin:'-45% 0px -50%'});
$$('main section[id]').forEach(s=>spy.observe(s));
/* Scroll: header, progres, parallax (rAF) */
const hd=$('.hdr'),pg=$('.progress'),hi=$('#heroImg');let tk=false;
function upd(){const y=scrollY,mx=document.documentElement.scrollHeight-innerHeight;hd.classList.toggle('sc',y>20);pg.style.transform=`scaleX(${mx>0?y/mx:0})`;
if(!RM&&y<900)hi.style.transform=`translateY(${-y*.04}px)`;tk=false}
addEventListener('scroll',()=>{if(!tk){tk=true;requestAnimationFrame(upd)}},{passive:true});upd();
})();
