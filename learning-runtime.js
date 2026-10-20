/* Shared submission UI and English-only speech cleanup. No lesson content or endpoint lives here. */
(()=>{
 'use strict';
 const inFlight=new Set(),completed=new WeakMap();let pendingName=null,confirmationSerial=0;
 function speechText(raw){
  let text=String(raw??'').replace(/<[^>]*>/g,' ').replace(/\([^)]*\)/g,' ');
  for(let i=0;i<3;i++)text=text.replace(/^\s*(?:Câu\s*)?\d+[.):\-]\s*/i,'').replace(/^\s*[A-D][.):\-]\s*/i,'');
  text=text.replace(/\bblank\b/gi,' ').replace(/_+|…+|\.{3,}/g,' ').replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();
  // Decline mixed Vietnamese rather than pronounce a Vietnamese gloss with an English voice.
  if(/[ăâđêôơưĂÂĐÊÔƠƯ\u1ea0-\u1ef9]/.test(text))return '';
  return text;
 }
 function requestName(){
  if(pendingName)return Promise.resolve('');
  const dialog=document.getElementById('st-student-dialog'),form=dialog.querySelector('form'),input=dialog.querySelector('input'),error=dialog.querySelector('[role=alert]');
  const legacy=document.getElementById('student');input.value=legacy?.value||'';error.textContent='';dialog.returnValue='';
  return new Promise(resolve=>{
   pendingName=resolve;
   const close=()=>{const name=dialog.returnValue==='submit'?input.value.trim():'';if(name){if(legacy)legacy.value=name;confirmationSerial++;}pendingName=null;form.removeEventListener('submit',submit);resolve(name);};
   const submit=e=>{if(e.submitter?.value==='cancel')return;if(!input.value.trim()){e.preventDefault();error.textContent='Vui lòng nhập họ và tên.';input.focus();}};
   form.addEventListener('submit',submit);dialog.addEventListener('close',close,{once:true});dialog.showModal();input.focus();
  });
 }
 async function send(url,payload,{timeoutMs=12000}={}){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{return await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:controller.signal});}
  finally{clearTimeout(timer);}
 }
 function protect(names){
  for(const name of names){const original=window[name];if(typeof original!=='function')continue;
   window[name]=async function(...args){
    if(inFlight.has(name)||pendingName)return;
    const root=[...document.querySelectorAll('main > section')].find(el=>!el.classList.contains('hidden'));
    const fields=root?[...root.querySelectorAll('input:not([type=hidden]),textarea,select')].filter(el=>el.id!=='student'):[];
    const anchor=fields[0]||root;const signature=name+JSON.stringify(fields.map(el=>el.type==='radio'?(el.checked?el.value:''):el.value));
    if(anchor&&completed.get(anchor)?.has(signature))return;
    inFlight.add(name);const before=confirmationSerial;
    try{const value=await original.apply(this,args);if(anchor&&confirmationSerial>before){if(!completed.has(anchor))completed.set(anchor,new Set());completed.get(anchor).add(signature);}return value;}
    finally{inFlight.delete(name);}
   };
  }
 }
 window.STLearning={speechText,requestName,send,protect};
})();
