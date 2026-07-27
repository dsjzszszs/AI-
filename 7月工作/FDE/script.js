function toggleMenu(){
  var n=document.getElementById('navLinks');
  if(n) n.classList.toggle('open');
}
// 移动端：点击导航链接后收起菜单
document.querySelectorAll('.nav-links a').forEach(function(a){
  a.addEventListener('click',function(){
    if(window.innerWidth<=880){var n=document.getElementById('navLinks');if(n)n.classList.remove('open');}
  });
});
// 滚动渐显：元素进入视口时淡入上浮（同组元素错峰出现）
(function(){
  var sel='section, .feat, .stage, .day, .work, .job, .soft .card, .teacher, .cta-band, .signup .form, .ladder, .stage-full';
  var els=document.querySelectorAll(sel);
  els.forEach(function(el){el.classList.add('reveal');});
  function show(el){el.classList.add('in');}
  if(!('IntersectionObserver' in window)){
    els.forEach(show);return;
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){show(e.target);io.unobserve(e.target);}
    });
  },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el){
    var p=el.parentElement,i=0;
    if(p){for(var k=0;k<p.children.length;k++){if(p.children[k]===el)break;if(p.children[k].classList.contains('reveal'))i++;}
      if(i>0)el.style.transitionDelay=Math.min(i*70,440)+'ms';}
    io.observe(el);
    // 首屏已在视口内的元素立即显示，避免加载时整段空白
    var r=el.getBoundingClientRect();
    if(r.top<window.innerHeight-40 && r.bottom>0)show(el);
  });
})();

// 灯箱：点击 .lb 图片放大查看，支持同组左右切换 / Esc 关闭
(function(){
  if(!document.getElementById('lb')){
    var lb=document.createElement('div');lb.id='lb';
    lb.innerHTML='<div id="lbCap"></div><button class="lb-btn" id="lbPrev" aria-label="上一张">‹</button><img id="lbImg" alt=""><button class="lb-btn" id="lbNext" aria-label="下一张">›</button><button id="lbClose" aria-label="关闭">×</button>';
    document.body.appendChild(lb);
  }
  var lb=document.getElementById('lb'),lbImg=document.getElementById('lbImg'),lbCap=document.getElementById('lbCap');
  var list=[],idx=0;
  function show(){var it=list[idx];if(!it)return;lbImg.src=it.getAttribute('src');lbCap.textContent=it.alt||'';lb.classList.add('open');document.body.style.overflow='hidden';}
  function close(){lb.classList.remove('open');document.body.style.overflow='';}
  function grp(img){var c=img.closest('.ppt-strip')||img.closest('.fde-carousel')||img.closest('.gal')||img.closest('.fig-grid');if(c){var a=Array.prototype.slice.call(c.querySelectorAll('img.lb'));if(a.length)return a;}return [img];}
  document.addEventListener('click',function(e){var img=e.target.closest('img.lb');if(!img)return;e.preventDefault();list=grp(img);idx=list.indexOf(img);if(idx<0)idx=0;show();});
  document.getElementById('lbClose').addEventListener('click',close);
  document.getElementById('lbPrev').addEventListener('click',function(e){e.stopPropagation();idx=(idx-1+list.length)%list.length;show();});
  document.getElementById('lbNext').addEventListener('click',function(e){e.stopPropagation();idx=(idx+1)%list.length;show();});
  lb.addEventListener('click',function(e){if(e.target===lb)close();});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft'){idx=(idx-1+list.length)%list.length;show();}if(e.key==='ArrowRight'){idx=(idx+1)%list.length;show();}});
})();

// ===== 居中放大轮播卡片组（复用工厂） =====
function createCenterCarousel(opts){
  var container=document.getElementById(opts.containerId);
  var track=document.getElementById(opts.trackId);
  var dotsContainer=document.getElementById(opts.dotsId);
  var navPrev=document.getElementById(opts.prevId);
  var navNext=document.getElementById(opts.nextId);
  if(!container||!track)return;
  var cards=track.querySelectorAll('.fde-card');
  if(!cards.length)return;

  var total=cards.length;
  var idx=0,isDragging=false,startX=0,prevTranslate=0,curTranslate=0,animID=0;
  var autoTimer=null,autoDelay=opts.autoDelay||3500;
  var gap=2;

  // 生成圆点
  for(var i=0;i<total;i++){
    var d=document.createElement('span');d.className='fde-dot'+(i===0?' active':'');
    d.setAttribute('data-i',i);dotsContainer.appendChild(d);
  }
  var dots=dotsContainer.querySelectorAll('.fde-dot');

  function cardW(){return cards[0].offsetWidth+gap;}
  function centerOff(){
    var cs=getComputedStyle(container);
    var pl=parseFloat(cs.paddingLeft)||0;
    return (container.offsetWidth-pl*2)/2-cards[0].offsetWidth/2;
  }

  function updateStates(){
    cards.forEach(function(c,di){
      c.classList.remove('is-center','is-near');
      var diff=Math.abs(di-idx);
      if(diff===0)c.classList.add('is-center');
      else if(diff===1)c.classList.add('is-near');
    });
  }

  function goTo(n,ani){
    if(n<0)n=0;if(n>=total)n=total-1;idx=n;
    if(ani!==false)track.style.transition='transform .5s cubic-bezier(.25,.46,.45,.94)';
    else track.style.transition='none';
    curTranslate=centerOff()-idx*cardW();
    track.style.transform='translateX('+curTranslate+'px)';
    updateStates();
    dots.forEach(function(d){d.classList.remove('active');});
    if(dots[idx])dots[idx].classList.add('active');
    navPrev.classList.toggle('disabled',idx<=0);
    navNext.classList.toggle('disabled',idx>=total-1);
  }

  function nextSlide(){var n=idx+1;if(n>=total)n=0;goTo(n);}
  function prevSlide(){if(idx>0)goTo(idx-1);}

  navPrev.addEventListener('click',function(){stopAuto();prevSlide();startAuto();});
  navNext.addEventListener('click',function(){stopAuto();nextSlide();startAuto();});

  dotsContainer.addEventListener('click',function(e){
    var dot=e.target.closest('.fde-dot');if(!dot)return;
    stopAuto();goTo(parseInt(dot.getAttribute('data-i')));startAuto();
  });

  function onDown(x){
    isDragging=true;startX=x;prevTranslate=curTranslate;
    track.classList.add('is-dragging');track.style.transition='none';
    stopAuto();animID=requestAnimationFrame(raf);
  }
  function onMove(x){if(!isDragging)return;curTranslate=prevTranslate+(x-startX);}
  function onUp(){
    if(!isDragging)return;isDragging=false;
    track.classList.remove('is-dragging');cancelAnimationFrame(animID);
    var moved=curTranslate-prevTranslate;
    if(Math.abs(moved)>40){if(moved<0)nextSlide();else prevSlide();}
    else goTo(idx);
    startAuto();
  }
  function raf(){track.style.transform='translateX('+curTranslate+'px)';if(isDragging)animID=requestAnimationFrame(raf);}

  track.addEventListener('touchstart',function(e){onDown(e.touches[0].clientX)},{passive:true});
  track.addEventListener('touchmove',function(e){onMove(e.touches[0].clientX)},{passive:true});
  track.addEventListener('touchend',onUp);
  track.addEventListener('mousedown',function(e){onDown(e.clientX)});
  track.addEventListener('mousemove',function(e){onMove(e.clientX)});
  track.addEventListener('mouseup',onUp);
  track.addEventListener('mouseleave',function(){if(isDragging){isDragging=false;track.classList.remove('is-dragging');cancelAnimationFrame(animID);goTo(idx);startAuto();}});

  function startAuto(){stopAuto();autoTimer=setInterval(nextSlide,autoDelay);}
  function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}
  container.addEventListener('mouseenter',stopAuto);
  container.addEventListener('mouseleave',startAuto);

  document.addEventListener('keydown',function(e){
    var lb=document.getElementById('lb');if(lb&&lb.classList.contains('open'))return;
    var r=container.getBoundingClientRect();
    if(r.bottom<0||r.top>window.innerHeight)return;
    if(e.key==='ArrowLeft'){e.preventDefault();stopAuto();prevSlide();startAuto();}
    if(e.key==='ArrowRight'){e.preventDefault();stopAuto();nextSlide();startAuto();}
  });

  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){goTo(idx,false)},100);});

  goTo(0,false);
  startAuto();
}

// 初始化两个轮播
createCenterCarousel({containerId:'fdeCarousel',trackId:'fdeTrack',dotsId:'fdeDots',prevId:'fdePrev',nextId:'fdeNext'});
createCenterCarousel({containerId:'aiCarousel',trackId:'aiTrack',dotsId:'aiDots',prevId:'aiPrev',nextId:'aiNext'});

// ===== 5 天课程 PPT 交互阅览器 =====
(function(){
  var data=[
    {count:38},{count:24},{count:30},{count:30},{count:35}
  ];
  var curDay=0,curSlide=0;
  var sidebar=document.getElementById('pptSidebar');
  var tabsMobile=document.getElementById('pptTabsMobile');
  var slideImg=document.getElementById('pptSlideImg');
  var pageInfo=document.getElementById('pptPageInfo');
  var slider=document.getElementById('pptSlider');
  var sliderMin=document.getElementById('pptSliderMin');
  var sliderMax=document.getElementById('pptSliderMax');
  var prevBtn=document.getElementById('pptPrev');
  var nextBtn=document.getElementById('pptNext');
  if(!sidebar||!slideImg)return;

  function pad(n){return n<10?'0'+n:''+n;}
  function getSrc(d,s){return 'assets/ppt/day'+(d+1)+'/slide_'+pad(s+1)+'.jpg';}

  function updateSlideUI(){
    var d=data[curDay];
    slideImg.style.opacity='0';
    setTimeout(function(){
      slideImg.src=getSrc(curDay,curSlide);
      slideImg.alt='Day '+(curDay+1)+' 第'+(curSlide+1)+'页';
      slideImg.style.opacity='1';
    },60);
    pageInfo.textContent=(curSlide+1)+' / '+d.count;
    slider.min=0;slider.max=d.count-1;slider.value=curSlide;
    sliderMin.textContent='1';sliderMax.textContent=d.count;
  }

  function updateDayUI(){
    sidebar.querySelectorAll('.ppt-tab').forEach(function(t,i){t.classList.toggle('active',i===curDay);});
    tabsMobile.querySelectorAll('.ppt-mtab').forEach(function(t,i){t.classList.toggle('active',i===curDay);});
  }

  function switchDay(day){
    if(day===curDay)return;
    curDay=day;curSlide=0;
    updateDayUI();updateSlideUI();
    // 移动端滚动 tab 到可见区域
    var mt=tabsMobile.querySelector('.ppt-mtab.active');
    if(mt)mt.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  }

  function prevSlide(){
    if(curSlide>0){curSlide--;}
    else if(curDay>0){curDay--;curSlide=data[curDay].count-1;updateDayUI();}
    else return;
    updateSlideUI();
  }

  function nextSlide(){
    if(curSlide<data[curDay].count-1){curSlide++;}
    else if(curDay<data.length-1){curDay++;curSlide=0;updateDayUI();}
    else return;
    updateSlideUI();
  }

  sidebar.addEventListener('click',function(e){
    var tab=e.target.closest('.ppt-tab');
    if(tab)switchDay(parseInt(tab.getAttribute('data-day')));
  });
  tabsMobile.addEventListener('click',function(e){
    var tab=e.target.closest('.ppt-mtab');
    if(tab)switchDay(parseInt(tab.getAttribute('data-day')));
  });
  prevBtn.addEventListener('click',prevSlide);
  nextBtn.addEventListener('click',nextSlide);
  slider.addEventListener('input',function(){
    curSlide=parseInt(slider.value);updateSlideUI();
  });

  // 键盘左右键（灯箱关闭时生效）
  document.addEventListener('keydown',function(e){
    var lb=document.getElementById('lb');
    if(lb&&lb.classList.contains('open'))return;
    var viewer=document.getElementById('pptViewer');
    if(!viewer)return;
    var r=viewer.getBoundingClientRect();
    if(r.bottom<0||r.top>window.innerHeight)return;
    if(e.key==='ArrowLeft'){e.preventDefault();prevSlide();}
    if(e.key==='ArrowRight'){e.preventDefault();nextSlide();}
  });

  // 触摸滑动
  (function(){
    var wrap=document.getElementById('pptSlideWrap');
    if(!wrap)return;
    var sx=0,sy=0;
    wrap.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
    wrap.addEventListener('touchend',function(e){
      var dx=e.changedTouches[0].clientX-sx;
      var dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>40){if(dx<0)nextSlide();else prevSlide();}
    });
  })();

  updateDayUI();updateSlideUI();
})();

