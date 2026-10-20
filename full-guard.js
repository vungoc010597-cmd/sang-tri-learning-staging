/* Only included in full-site staging. No production endpoint or credential. */
(()=>{'use strict';
 const submissions=[],blocked=[];
 function capture(kind,url,body){let payload;try{payload=typeof body==='string'?JSON.parse(body):String(body??'')}catch{payload=String(body??'')}
  const item={kind,url:String(url),payload};submissions.push(item);render();return item;
 }
 function render(){const el=document.getElementById('st-full-payload');if(el)el.textContent=JSON.stringify(submissions.at(-1)||{},null,2);}
 function lock(obj,key,value){Object.defineProperty(obj,key,{value,writable:false,configurable:false});}
 lock(window,'fetch',async(url,options={})=>{capture('fetch',url,options.body);return {type:'staging-mock',ok:true,status:200,json:async()=>({mock:true,saved:false}),text:async()=>'{"mock":true,"saved":false}'};});
 lock(navigator,'sendBeacon',(url,body)=>{capture('beacon',url,body);return false});
 class MockXHR extends EventTarget{
  constructor(){super();this.readyState=0;this.status=0;this.responseText='';this.response='';this.upload=new EventTarget();}
  open(method,url){this.method=method;this.url=url;this.readyState=1;}setRequestHeader(){}getAllResponseHeaders(){return '';}getResponseHeader(){return null;}
  send(body){capture('xhr',this.url,body);this.readyState=4;this.status=200;this.responseText='{"mock":true,"saved":false}';this.response=this.responseType==='json'?{mock:true,saved:false}:this.responseText;queueMicrotask(()=>{for(const type of ['readystatechange','load','loadend']){const e=new Event(type);this['on'+type]?.(e);this.dispatchEvent(e);}});}
  abort(){this.onabort?.(new Event('abort'));}
 }
 lock(window,'XMLHttpRequest',MockXHR);
 for(const name of ['WebSocket','EventSource','Worker','SharedWorker','RTCPeerConnection'])if(name in window)lock(window,name,class{constructor(){throw Error('STAGING: network disabled')}});
 lock(window,'open',()=>{blocked.push('window.open');return null});
 const stopForm=function(){blocked.push('form');return undefined;};
 lock(HTMLFormElement.prototype,'submit',stopForm);
 // Keep method=dialog forms intact; they collect a test name locally.
 document.addEventListener('submit',e=>{if(e.target.method!=='dialog'){e.preventDefault();blocked.push('form-event')}},true);
 document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(a&&/^https?:/i.test(a.getAttribute('href'))){e.preventDefault();blocked.push('external-link');alert('BẢN THỬ: liên kết ngoài được tắt; không gửi dữ liệu.')}},true);
 lock(window,'STStaging',{withheldPronunciation6:true,fullSite:true,get submissions(){return JSON.parse(JSON.stringify(submissions))},get blocked(){return blocked.slice()}});
 // Correct inherited success wording without modifying lesson/question content.
 function mark(node){if(['SCRIPT','STYLE','PRE'].includes(node.nodeName)||node.parentElement?.closest('script,style,pre'))return;if(node.nodeType===3&&/Đã gửi|đã gửi/.test(node.nodeValue)&&/Sheet|hệ thống giáo viên|kết quả|điểm/.test(node.nodeValue))node.nodeValue='BẢN THỬ: đã ghi nhận giả lập trên trình duyệt, KHÔNG gửi Google Sheets.';for(const c of node.childNodes||[])mark(c);}
 document.addEventListener('DOMContentLoaded',()=>{render();mark(document.body);new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')mark(r.target);for(const n of r.addedNodes)mark(n)}}).observe(document.body,{subtree:true,childList:true,characterData:true});});
})();
