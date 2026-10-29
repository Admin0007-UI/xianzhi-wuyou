'use strict';
const screenPath='v2交付/screens/';
const groups={
  main:{name:'主界面',columns:5,pages:[['首页','01_home.jpg'],['逛逛','02_discover.jpg'],['发布','03_publish.jpg'],['消息','04_messages.jpg'],['我的','05_profile.jpg']]},
  pages:{name:'主要跳转页',columns:5,pages:[['搜索结果','showcase-assets/results-chair.jpg'],['筛选','showcase-assets/filters-chair.jpg'],['商品详情','showcase-assets/detail-chair.jpg'],['卖家主页','showcase-assets/seller-chair.jpg'],['聊天','showcase-assets/chat-chair.jpg'],['确认订单','showcase-assets/checkout-chair.jpg'],['订单详情','showcase-assets/order-chair.jpg'],['生活分享','40_post-room.jpg'],['发布预览','46_publish-preview.jpg'],['我的收藏','28_favorites.jpg']]},
  auth:{name:'登录注册',columns:5,pages:[['登录','09_login.jpg'],['注册','10_register.jpg'],['短信登录','11_login-sms.jpg'],['验证码','12_login-code.jpg'],['重设密码','13_reset.jpg']]},
  onboarding:{name:'新手引导',columns:3,pages:[['引导一','06_onboard1.jpg'],['引导二','07_onboard2.jpg'],['引导三','08_onboard3.jpg']]}
};
let selectedGroup=new URLSearchParams(location.search).get('group')||'main';if(!groups[selectedGroup])selectedGroup='main';
const gallery=document.getElementById('gallery'),viewer=document.getElementById('viewer'),viewerImage=document.getElementById('viewer-image'),viewerTitle=document.getElementById('viewer-title');
let selectedPage=0,lastTrigger=null;
function imagePath(path){return path.startsWith('showcase-assets/')?path:screenPath+path}
function renderGroup(name,updateUrl=false){selectedGroup=name;const g=groups[name];gallery.dataset.group=name;gallery.style.setProperty('--columns',g.columns);gallery.style.setProperty('--grid-max',(g.columns*260+(g.columns-1)*24)+'px');gallery.innerHTML='<div class="gallery-grid">'+g.pages.map(([title,src],i)=>`<section class="gallery-card"><h2>${title}</h2><button class="screen-open" type="button" data-page="${i}" aria-label="放大${title}"><img src="${imagePath(src)}" alt="${title}" loading="${i<5?'eager':'lazy'}" width="390" height="844"></button></section>`).join('')+'</div>';document.querySelectorAll('[data-group]').forEach(b=>{if(b.tagName==='BUTTON'){if(b.dataset.group===name)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}});document.title=g.name+' · 闲置无忧';if(updateUrl){history.pushState({group:name},'',location.pathname+(name==='main'?'':'?group='+name));window.scrollTo({top:0,behavior:'instant'})}}
function showPage(index){selectedPage=index;const pages=groups[selectedGroup].pages,[title,src]=pages[index];viewerImage.src=imagePath(src);viewerImage.alt=title;viewerTitle.textContent=title;document.getElementById('previous-page').disabled=index===0;document.getElementById('next-page').disabled=index===pages.length-1;document.querySelector('.viewer-stage').scrollTop=0;if(!viewer.open)viewer.showModal()}
document.querySelector('.group-nav').addEventListener('click',e=>{const b=e.target.closest('[data-group]');if(b)renderGroup(b.dataset.group,true)});
gallery.addEventListener('click',e=>{const button=e.target.closest('[data-page]');if(button){lastTrigger=button;showPage(+button.dataset.page)}});
document.getElementById('close-viewer').addEventListener('click',()=>viewer.close());
document.getElementById('previous-page').addEventListener('click',()=>{if(selectedPage>0)showPage(selectedPage-1)});
document.getElementById('next-page').addEventListener('click',()=>{if(selectedPage<groups[selectedGroup].pages.length-1)showPage(selectedPage+1)});
viewer.addEventListener('click',e=>{if(e.target===viewer){let r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close()}});
viewer.addEventListener('close',()=>lastTrigger?.focus({preventScroll:true}));
document.addEventListener('keydown',e=>{if(!viewer.open)return;if(e.key==='ArrowLeft'&&selectedPage>0){e.preventDefault();showPage(selectedPage-1)}if(e.key==='ArrowRight'&&selectedPage<groups[selectedGroup].pages.length-1){e.preventDefault();showPage(selectedPage+1)}});
window.addEventListener('popstate',()=>{let name=new URLSearchParams(location.search).get('group')||'main';if(viewer.open)viewer.close();renderGroup(groups[name]?name:'main')});
renderGroup(selectedGroup);
