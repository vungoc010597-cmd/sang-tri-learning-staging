/* Adds stable identities to supplied content without rewriting question text or keys. */
(()=>{
 function hash(text){let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
 function create(grade,unit,section,question){
  const id=`g${grade}-u${unit}-${section}-${hash(JSON.stringify([question.q,question.opts]))}`;
  const optionIds=question.opts.map((_,i)=>`${id}-o${i}`);
  return Object.freeze({...question,id,grade,unit,section,topic:`Unit ${unit}`,skill:'multiple-choice',difficulty:'not-assessed',audioText:question.q,optionIds:Object.freeze(optionIds),correctAnswerId:optionIds[question.answer],source:'User-provided midterm handoff, 2026-10-17; textbook cross-check NOT VERIFIED'});
 }
 window.STQuestionBank={create};
})();
