/**
 * Unit tests for FP 5020 Rev E — Loss Estimate Calculator
 * Tests all calculation and helper functions
 */

// ======================== DATA (copied from HTML) ========================

const APL_SC = {
  A:{l:"A",d:"Non-Sensitive, Light/Ordinary, Adequate",wet:{fire:{a:700,b:.25,e:1,i:1},water:{a:1500,b:.1,e:.25,i:.5},smoke:{a:10000,b:.075,e:.075,i:.15}},dry:{fire:{a:1000,b:.25,e:1,i:1},water:{a:2000,b:.1,e:.25,i:.5},smoke:{a:15000,b:.075,e:.075,i:.15}},bi:"1 - 7 Days"},
  B:{l:"B",d:"Sensitive, Light/Ordinary, Adequate",wet:{fire:{a:700,b:.5,e:1,i:1},water:{a:1500,b:.25,e:.5,i:1},smoke:{a:10000,b:.125,e:.175,i:1}},dry:{fire:{a:1000,b:.5,e:1,i:1},water:{a:2000,b:.25,e:.5,i:1},smoke:{a:15000,b:.125,e:.175,i:1}},bi:"1 - 3 Weeks"},
  C:{l:"C",d:"Non-Sensitive, Extra Hazard, Adequate (No FL/CL)",wet:{fire:{a:1200,b:.25,e:1,i:1},water:{a:2500,b:.25,e:.25,i:.5},smoke:{a:20000,b:.075,e:.075,i:.15}},dry:{fire:{a:1500,b:.25,e:1,i:1},water:{a:3500,b:.25,e:.25,i:.5},smoke:{a:30000,b:.075,e:.075,i:.15}},bi:"1 - 7 Days"},
  D:{l:"D",d:"Sensitive, Extra Hazard, Adequate (No FL/CL)",wet:{fire:{a:1200,b:.5,e:1,i:1},water:{a:2500,b:.4,e:.5,i:1},smoke:{a:20000,b:.125,e:.175,i:1}},dry:{fire:{a:1500,b:.5,e:1,i:1},water:{a:3500,b:.4,e:.5,i:1},smoke:{a:30000,b:.125,e:.175,i:1}},bi:"2 - 4 Weeks"},
  E:{l:"E",d:"Non-Sensitive, Extra Hazard w/ FL/CL",wet:{fire:{a:"design",b:.25,e:1,i:1},water:{a:"2x",b:.25,e:.25,i:.5},smoke:{a:"comp",b:.075,e:.075,i:.15}},dry:null,bi:"8 - 16 Weeks"},
  F:{l:"F",d:"Sensitive, Extra Hazard w/ FL/CL",wet:{fire:{a:"design",b:.5,e:1,i:1},water:{a:"2x",b:.25,e:.5,i:1},smoke:{a:"comp",b:.125,e:.175,i:1}},dry:null,bi:"4 - 12 Weeks"},
  G:{l:"G",d:"Design Area Fire (Deficiency / Storage)",wet:{fire:{a:"design",b:1,e:1,i:1},water:{a:"5x",b:.25,e:.25,i:.5},smoke:{a:"comp",b:.125,e:.125,i:.625}},dry:null,bi:"4 - 12 Weeks"},
  H:{l:"H",d:"Storage, Non-Sensitive, ESFR",wet:{fire:{a:500,b:.25,e:1,i:1},water:{a:2000,b:.25,e:.25,i:1},smoke:{a:10000,b:.075,e:.075,i:.15}},dry:null,bi:"1 - 7 Days"},
  I:{l:"I",d:"Storage, Sensitive, ESFR",wet:{fire:{a:500,b:.5,e:1,i:1},water:{a:2000,b:.4,e:.4,i:1},smoke:{a:10000,b:.125,e:.15,i:1}},dry:null,bi:"2 - 4 Weeks"},
  J:{l:"J",d:"Storage, Non-Sensitive, CMSA",wet:{fire:{a:700,b:.25,e:1,i:1},water:{a:2000,b:.25,e:.25,i:1},smoke:{a:10000,b:.075,e:.075,i:.15}},dry:{fire:{a:1500,b:.25,e:1,i:1},water:{a:4000,b:.25,e:.25,i:1},smoke:{a:25000,b:.075,e:.075,i:.15}},bi:"1 - 7 Days"},
  K:{l:"K",d:"Storage, Sensitive, CMSA",wet:{fire:{a:700,b:.5,e:1,i:1},water:{a:2000,b:.4,e:.4,i:1},smoke:{a:10000,b:.125,e:.15,i:1}},dry:{fire:{a:1500,b:.5,e:1,i:1},water:{a:4000,b:.4,e:.4,i:1},smoke:{a:25000,b:.125,e:.15,i:1}},bi:"2 - 4 Weeks"}
};

const MFL_T = {
  "Hospital/Medical":{fr:{b:10,e:60,i:100,bi:6},hnc:{b:30,e:80,i:100,bi:9},lnc:{b:30,e:80,i:100,bi:9},comb:{b:100,e:100,i:100,bi:18}},
  "Office":{fr:{b:40,e:40,i:50,bi:4.5},hnc:{b:50,e:40,i:50,bi:4.5},lnc:{b:60,e:50,i:60,bi:4.5},comb:{b:100,e:100,i:100,bi:7.5}},
  "Data Center/Telecom":{fr:{b:10,e:30,i:30,bi:3},hnc:{b:10,e:30,i:30,bi:3},lnc:{b:30,e:30,i:30,bi:6},comb:{b:100,e:100,i:100,bi:18}},
  "Warehousing":{fr:{b:70,e:90,i:90,bi:9},hnc:{b:80,e:90,i:90,bi:12},lnc:{b:100,e:100,i:100,bi:12},comb:{b:100,e:100,i:100,bi:12}},
  "Wood/Plastic Products":{fr:{b:70,e:90,i:100,bi:18},hnc:{b:80,e:90,i:100,bi:18},lnc:{b:90,e:90,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Chemical Processing":{fr:{b:60,e:70,i:100,bi:18},hnc:{b:70,e:80,i:100,bi:18},lnc:{b:80,e:80,i:100,bi:18},comb:{b:100,e:100,i:100,bi:24}},
  "Semiconductor Mfg":{fr:{b:20,e:90,i:100,bi:24},hnc:{b:20,e:90,i:100,bi:24},lnc:{b:30,e:90,i:100,bi:24},comb:{b:100,e:100,i:100,bi:24}},
  "Hotel/Residential/School":{fr:{b:50,e:50,i:70,bi:10.5},hnc:{b:60,e:60,i:70,bi:10.5},lnc:{b:70,e:60,i:80,bi:10.5},comb:{b:100,e:100,i:100,bi:10.5}},
  "Food Processing":{fr:{b:50,e:50,i:100,bi:10.5},hnc:{b:60,e:60,i:100,bi:12},lnc:{b:70,e:60,i:100,bi:12},comb:{b:100,e:100,i:100,bi:12}}
};

const MFL_SEP = {
  fr:{fr:{l:30,o:40,e:60},nc:{l:40,o:50,e:80},comb:{l:50,o:80,e:100}},
  nc:{fr:{l:40,o:60,e:90},nc:{l:50,o:80,e:100},comb:{l:80,o:100,e:130}},
  comb:{fr:{l:80,o:100,e:130},nc:{l:100,o:130,e:150},comb:{l:130,o:150,e:200}}
};

const CL = {fr:"Fire Resistive",hnc:"Heavy Noncombustible",lnc:"Light Noncombustible",comb:"Combustible"};

// ======================== STATE (default reset values) ========================

let S;

function resetS() {
  S = {
    tab:0, siteName:"", accountNo:"", surveyDate:"",
    buildings:[{name:"",area:"",construction:"hnc",occupancy:"Warehousing",value:"",separation:"",floors:""}],
    primaryIdx:0,
    hazardClass:"ordinary", isStorage:true, isSensitive:false,
    sprinklerType:"wet", sprinklerAdequate:"adequate", designPct:"100",
    hasFL:false, protType:"standard", alarmsOk:true, designArea:"", compArea:"",
    defHP:"none", defESFR:"none", defOT:"none", defFC:"none", defFE:false,
    defV:"none", defOE:"none", defOC:"none",
    totalBldg:"", totalEquip:"", totalInv:"", biYearly:"", biMode:"dollar",
    annualProd:"", biPct:"",
    pmlSystem:"sprinkler_riser", fdTime:"prompt", fdType:"fullypaid", pmlArea:"",
    hasCombConst:false,
    fw4hr:false, fwArea:"",
    isHighRise:false, stories:"", hrFireFloors:"1", topFloorBelowFD:true, extSpreadPossible:false,
    extType:"none", floorToWindow:"", windowHeight:"",
  };
}

// ======================== HELPER FUNCTIONS (copied from HTML) ========================

function pf(s){return parseFloat(s)||0}
function fmt(v){if(!v||isNaN(v))return"$0";if(v>=1e9)return"$"+(v/1e9).toFixed(2)+"B";if(v>=1e6)return"$"+(v/1e6).toFixed(2)+"M";if(v>=1e3)return"$"+(v/1e3).toFixed(1)+"K";return"$"+Math.round(v).toLocaleString()}
function fmtF(v){if(!v||isNaN(v))return"$0";return"$"+Math.round(v).toLocaleString()}
function fN(v){return v.toLocaleString()}
function rLE(v){if(v<100000)return Math.round(v/1000)*1000;return Math.round(v/100000)*100000}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function pct(v){return(v*100).toFixed(0)+"%"}

// Building helpers
function pb(){return S.buildings[S.primaryIdx]||S.buildings[0]||{area:"",construction:"hnc",occupancy:"Warehousing"}}
function totalSqft(){return S.buildings.reduce((s,b)=>s+pf(b.area),0)}
function primaryArea(){return pf(pb().area)}
function primaryConst(){return pb().construction}
function primaryOcc(){return pb().occupancy||"Warehousing"}

function bldgValue(i){
  const b=S.buildings[i],ov=pf(b.value);
  if(ov>0)return ov;
  const ts=totalSqft(),ba=pf(b.area),tv=pf(S.totalBldg)+pf(S.totalEquip)+pf(S.totalInv);
  return ts>0?tv*(ba/ts):0;
}

function gv(){
  const a=primaryArea();
  const siteTb=pf(S.totalBldg),siteTe=pf(S.totalEquip),siteTi=pf(S.totalInv),sitePD=siteTb+siteTe+siteTi;
  const prop=sitePD>0?bldgValue(S.primaryIdx)/sitePD:1;
  const tb=siteTb*prop,te=siteTe*prop,ti=siteTi*prop;
  let by=pf(S.biYearly);if(S.biMode==="percent"&&pf(S.annualProd)>0&&pf(S.biPct)>0)by=pf(S.annualProd)*(pf(S.biPct)/100);
  return{a,tb,te,ti,by,bpsf:a>0?tb/a:0,epsf:a>0?te/a:0,ipsf:a>0?ti/a:0,pd:tb+te+ti};
}

function getSepReq(origC,expC,haz){
  const ok=origC==="fr"?"fr":origC==="comb"?"comb":"nc",ek=expC==="fr"?"fr":expC==="comb"?"comb":"nc",hk=haz==="light"?"l":haz==="ordinary"?"o":"e";
  return MFL_SEP[ek]?.[ok]?.[hk]||100;
}

// Table 1B
function countBold(){let c=0;if(S.defHP!=="none")c++;if(S.defESFR!=="none")c++;if(S.defOT!=="none")c++;if(S.defFC!=="none")c++;if(S.defFE)c++;if(S.defV!=="none")c++;if(S.defOE!=="none")c++;if(S.defOC!=="none")c++;return c}

function getT1B(){
  const c=countBold();if(c===0)return{sc:null,eq:false,rsn:""};if(c>1)return{sc:null,eq:true,rsn:"Multiple bolded deficiency categories identified, so APL = PML per Table 1B"};
  if(S.defHP==="ge80")return{sc:"G",eq:false,rsn:"Design area/pressure is at least 80% of required, resulting in Scenario G per Table 1B"};
  if(S.defHP==="lt80")return{sc:null,eq:true,rsn:"Design area/pressure is less than 80% of required, so APL = PML per Table 1B"};
  if(S.defESFR==="clearance_ok")return{sc:S.isSensitive?"I":"H",eq:false,rsn:`K-14 ESFR clearance is acceptable, resulting in Scenario ${S.isSensitive?"I":"H"} per Table 1B`};
  if(S.defESFR==="clearance_bad")return{sc:null,eq:true,rsn:"ESFR clearance exceeds limits, so APL = PML per Table 1B"};
  if(S.defESFR==="over40ft")return{sc:null,eq:true,rsn:"Building height exceeds 40 ft, so APL = PML per Table 1B"};
  if(S.defOT==="top_gt20")return{sc:null,eq:true,rsn:"Open-top containers on top tier exceed 20% of rack footprint, so APL = PML per Table 1B"};
  if(S.defOT==="less_adequate")return{sc:"G",eq:false,rsn:"Container density below threshold with adequate water supply, resulting in Scenario G per Table 1B"};
  if(S.defOT==="less_inadequate")return{sc:null,eq:true,rsn:"Container density below threshold with inadequate water, so APL = PML per Table 1B"};
  if(S.defFC==="one_dir")return{sc:"G",eq:false,rsn:"Inadequate flue spaces in one direction (CMDA/CMSA), resulting in Scenario G per Table 1B"};
  if(S.defFC==="both_dir")return{sc:null,eq:true,rsn:"Inadequate flue spaces in both directions, so APL = PML per Table 1B"};
  if(S.defFE)return{sc:null,eq:true,rsn:"Inadequate flue spaces (ESFR), so APL = PML per Table 1B"};
  if(S.defV==="noncompliant")return{sc:null,eq:true,rsn:"Smoke/heat vents not per NFPA 13 and 204, so APL = PML per Table 1B"};
  if(S.defV==="compliant")return{sc:"G",eq:false,rsn:"Smoke/heat vents in compliance with NFPA 13 and 204, resulting in Scenario G per Table 1B"};
  if(S.defOE==="one")return{sc:S.isSensitive?"D":"C",eq:false,rsn:`1 ESFR head obstructed, resulting in Scenario ${S.isSensitive?"D":"C"} per Table 1B`};
  if(S.defOE==="up_to_3")return{sc:"G",eq:false,rsn:"2-3 ESFR heads obstructed, resulting in Scenario G per Table 1B"};
  if(S.defOE==="gt3")return{sc:null,eq:true,rsn:"More than 3 ESFR heads obstructed, so APL = PML per Table 1B"};
  if(S.defOC==="up_to_3")return{sc:S.isSensitive?"F":"E",eq:false,rsn:`1-3 CMDA heads obstructed, resulting in Scenario ${S.isSensitive?"F":"E"} per Table 1B`};
  if(S.defOC==="up_to_6")return{sc:"G",eq:false,rsn:"4-6 CMDA heads obstructed, resulting in Scenario G per Table 1B"};
  if(S.defOC==="gt6")return{sc:null,eq:true,rsn:"More than 6 CMDA heads obstructed, so APL = PML per Table 1B"};
  return{sc:null,eq:false,rsn:""};
}

// APL calculation
function calcAPL(){
  const v=gv(),pctV=pf(S.designPct),isAdq=S.sprinklerAdequate==="adequate",noSprk=S.sprinklerAdequate==="none",is80=pctV>=80,isLO=S.hazardClass==="light"||S.hazardClass==="ordinary";
  let sc=null,eq=false,R=[];const hasDef=countBold()>0;
  if(noSprk){eq=true;R.push("No sprinkler protection, so APL = PML");}
  else if(S.isStorage){R.push("Storage occupancy (Figure 1A)");if(isAdq&&!hasDef){R.push("Sprinkler system reliable and fully adequate");if(S.hasFL){sc="G";R.push("Significant FL/CL present, Scenario G");}else if(S.isSensitive){sc=S.protType==="esfr"?"I":S.protType==="cmsa"?"K":"D";R.push("Sensitive + "+S.protType.toUpperCase()+", Scenario "+sc);}else{sc=S.protType==="esfr"?"H":S.protType==="cmsa"?"J":"C";R.push("Non-sensitive + "+S.protType.toUpperCase()+", Scenario "+sc);}}else{R.push(isAdq?"Adequate but deficiencies identified":"Not fully adequate");if(S.hasFL){eq=true;R.push("FL/CL with deficient system, APL = PML");}else if(!is80&&!isAdq){eq=true;R.push("Less than 80% of design, APL = PML");}else if(!S.alarmsOk&&!isAdq){eq=true;R.push("Alarms/FD/PEO inadequate, APL = PML");}else if(hasDef){const t=getT1B();R.push(t.rsn);if(t.eq)eq=true;else if(t.sc)sc=t.sc;else sc="G";}else{sc="G";R.push("At least 80% design, Scenario G");}}}
  else{R.push("Non-storage (Figure "+(S.isSensitive?"1C":"1B")+")");if(isAdq&&!hasDef){R.push("Sprinkler system reliable and fully adequate");if(S.isSensitive){sc=isLO?"B":S.hasFL?"F":"D";}else{sc=isLO?"A":S.hasFL?"E":"C";}R.push("Scenario "+sc);}else{R.push(isAdq?"Adequate but deficiencies":"Not fully adequate");if(!is80&&!isAdq){eq=true;R.push("Less than 80% of design, APL = PML");}else if(S.hasFL){eq=true;R.push("FL/CL present, APL = PML");}else if(!S.alarmsOk&&!isAdq){eq=true;R.push("Alarms/FD/PEO inadequate, APL = PML");}else if(hasDef){const t=getT1B();R.push(t.rsn);if(t.eq)eq=true;else if(t.sc)sc=t.sc;else sc=S.isSensitive?"F":"E";}else{sc=S.isSensitive?"F":"E";R.push("Scenario "+sc);}}}
  let pB=0,pE=0,pI=0,bi="";
  if(sc&&APL_SC[sc]&&v.a>0){const s=APL_SC[sc],sys=S.sprinklerType==="dry"&&s.dry?s.dry:s.wet;bi=s.bi;
    const rA=x=>{if(typeof x==="number")return Math.min(x,v.a);if(x==="design")return Math.min(pf(S.designArea)||1500,v.a);if(x==="2x")return Math.min((pf(S.designArea)||1500)*2,v.a);if(x==="5x")return Math.min((pf(S.designArea)||1500)*5,v.a);if(x==="comp")return Math.min(pf(S.compArea)||v.a,v.a);return 0};
    ["fire","water","smoke"].forEach(t=>{const d=sys[t],ar=rA(d.a);pB+=(v.tb/v.a)*d.b*ar;pE+=(v.te/v.a)*d.e*ar;pI+=(v.ti/v.a)*d.i*ar;});}
  return{sc,eq,R,pB:rLE(pB),pE:rLE(pE),pI:rLE(pI),pT:rLE(pB+pE+pI),bi};
}

// MFL calculation
function calcMFL(){
  // MFL starts from total site values — use raw state totals, not gv() which is primary-building-only
  const a=primaryArea(),siteTb=pf(S.totalBldg),siteTe=pf(S.totalEquip),siteTi=pf(S.totalInv);
  let by=pf(S.biYearly);if(S.biMode==="percent"&&pf(S.annualProd)>0&&pf(S.biPct)>0)by=pf(S.annualProd)*(pf(S.biPct)/100);
  const o=MFL_T[primaryOcc()];if(!o||a===0)return{biM:0,pB:0,pE:0,pI:0,pT:0,bV:0,mflA:0,hasFW:false,exclB:[],inclB:[],exclPD:0,sitePD:0,atRiskTotal:0,atRiskBldg:0,atRiskEquip:0,atRiskInv:0,bP:100,eP:100,iP:100};
  // Use comb percentages if hasCombConst flag is set (combustible cladding)
  const constKey=(S.hasCombConst&&primaryConst()!=='comb')?'comb':primaryConst();
  const d=o[constKey]||o.comb;
  let hasFW=S.fw4hr&&pf(S.fwArea)>0;
  let mflA=a;if(hasFW)mflA=Math.min(pf(S.fwArea),a);
  const sitePD=siteTb+siteTe+siteTi;
  let fwReduction=0;
  if(hasFW){fwReduction=bldgValue(S.primaryIdx)*(1-mflA/a);}
  const exclB=[],inclB=[];
  S.buildings.forEach((b,i)=>{if(i===S.primaryIdx)return;
    const req=getSepReq(primaryConst(),b.construction||primaryConst(),S.hazardClass);
    const act=pf(b.separation);const bv=bldgValue(i);
    const info={idx:i,name:b.name||("Building "+(i+1)),area:pf(b.area),req,act,value:bv,construction:b.construction};
    if(act>=req&&act>0)exclB.push(info);else inclB.push(info);
  });
  let exclPD=0;exclB.forEach(b=>{exclPD+=b.value;});
  // Apply Table 4 (MFL_T) damage percentages to at-risk property
  const atRiskTotal=Math.max(sitePD-fwReduction-exclPD,0);
  const atRiskFrac=sitePD>0?atRiskTotal/sitePD:0;
  const atRiskBldg=rLE(siteTb*atRiskFrac);
  const atRiskEquip=rLE(siteTe*atRiskFrac);
  const atRiskInv=rLE(siteTi*atRiskFrac);
  const pB=rLE(siteTb*atRiskFrac*(d.b/100));
  const pE=rLE(siteTe*atRiskFrac*(d.e/100));
  const pI=rLE(siteTi*atRiskFrac*(d.i/100));
  const pT=Math.max(pB+pE+pI,0);
  const biM=d.bi;
  return{biM,sitePD,fwReduction:rLE(fwReduction),exclPD:rLE(exclPD),pT,pB,pE,pI,bV:rLE(by/12*biM),mflA,hasFW,exclB,inclB,atRiskTotal:rLE(atRiskTotal),atRiskBldg,atRiskEquip,atRiskInv,bP:d.b,eP:d.e,iP:d.i};
}

// PML calculation
function calcPML(){
  const v=gv(),mfl=calcMFL(),apl=calcAPL();
  if(S.fdTime==="delayed"||primaryConst()==="comb"||S.hasCombConst){
    const rsn=S.fdTime==="delayed"?"Fire department response exceeds 40 minutes, so PML = MFL":"Combustible construction, so PML = MFL";
    return{...mfl,eq:true,rsn,pT:Math.max(mfl.pT,apl.pT),aplFloor:apl.pT>mfl.pT,zones:[]};}
  const o=MFL_T[primaryOcc()];if(!o||v.a===0)return{pB:0,pE:0,pI:0,pT:0,biM:0,eq:false,zones:[]};
  const d=o[primaryConst()]||o.comb,designA=pf(S.designArea)||1500;
  let pmlFA=pf(S.pmlArea);if(pmlFA<=0)pmlFA=designA*1.5;pmlFA=Math.min(pmlFA,v.a);
  let pB=0,pE=0,pI=0,zones=[];
  if(apl.sc&&APL_SC[apl.sc]){const s=APL_SC[apl.sc],sys=S.sprinklerType==="dry"&&s.dry?s.dry:s.wet;
    const aplFA=(x=>{if(typeof x==="number")return Math.min(x,v.a);if(x==="design")return Math.min(designA,v.a);if(x==="2x")return Math.min(designA*2,v.a);if(x==="5x")return Math.min(designA*5,v.a);if(x==="comp")return Math.min(pf(S.compArea)||v.a,v.a);return 0})(sys.fire.a);
    const sf=aplFA>0?pmlFA/aplFA:1;
    ["fire","water","smoke"].forEach(t=>{const zd=sys[t];const azA=(x=>{if(typeof x==="number")return Math.min(x,v.a);if(x==="design")return Math.min(designA,v.a);if(x==="2x")return Math.min(designA*2,v.a);if(x==="5x")return Math.min(designA*5,v.a);if(x==="comp")return Math.min(pf(S.compArea)||v.a,v.a);return 0})(zd.a);
      const pzA=Math.min(Math.round(azA*sf),v.a);const bD=(v.tb/v.a)*zd.b*pzA,eD=(v.te/v.a)*zd.e*pzA,iD=(v.ti/v.a)*zd.i*pzA;
      pB+=bD;pE+=eD;pI+=iD;zones.push({type:t,aplA:azA,pmlA:pzA,bPct:zd.b,ePct:zd.e,iPct:zd.i,bD:rLE(bD),eD:rLE(eD),iD:rLE(iD)});});}
  else{const r=v.a>0?pmlFA/v.a:1;pB=v.tb*(d.b/100)*r;pE=v.te*(d.e/100)*r;pI=v.ti*(d.i/100)*r;}
  let pT=rLE(pB+pE+pI),aplFloor=false;if(pT<apl.pT){aplFloor=true;pT=apl.pT;}
  return{biM:d.bi,pB:rLE(pB),pE:rLE(pE),pI:rLE(pI),pT,bV:rLE(v.by/12*d.bi),eq:false,rsn:"",aplFloor,pmlFA,zones,bP:d.b,eP:d.e,iP:d.i};
}

// High rise helpers
function hrFF(){return pf(S.hrFireFloors)||1}
function hrSF(){const f=hrFF();return f===1?2:f===2?3:4}
function hrWF(){const f=hrFF();return f===1?2:f===2?5:6}

// ======================== TESTS ========================

beforeEach(() => resetS());

// --------------- pf() ---------------
describe('pf() - parseFloat helper', () => {
  test('parses valid number strings', () => {
    expect(pf('100')).toBe(100);
    expect(pf('3.14')).toBe(3.14);
    expect(pf('1000000')).toBe(1000000);
  });
  test('returns 0 for empty / falsy inputs', () => {
    expect(pf('')).toBe(0);
    expect(pf(undefined)).toBe(0);
    expect(pf(null)).toBe(0);
    expect(pf('abc')).toBe(0);
  });
  test('handles numeric input directly', () => {
    expect(pf(42)).toBe(42);
    expect(pf(0)).toBe(0);
  });
});

// --------------- fmt() ---------------
describe('fmt() - compact formatter', () => {
  test('returns $0 for falsy / NaN values', () => {
    expect(fmt(0)).toBe('$0');
    expect(fmt(undefined)).toBe('$0');
    expect(fmt(NaN)).toBe('$0');
  });
  test('formats billions', () => {
    expect(fmt(1e9)).toBe('$1.00B');
    expect(fmt(2.5e9)).toBe('$2.50B');
  });
  test('formats millions', () => {
    expect(fmt(1e6)).toBe('$1.00M');
    expect(fmt(500000)).toBe('$500.0K');
  });
  test('formats thousands', () => {
    expect(fmt(1000)).toBe('$1.0K');
    expect(fmt(5500)).toBe('$5.5K');
  });
  test('formats sub-thousand values', () => {
    expect(fmt(500)).toBe('$500');
    expect(fmt(1)).toBe('$1');
  });
});

// --------------- fmtF() ---------------
describe('fmtF() - full dollar formatter', () => {
  test('returns $0 for falsy / NaN', () => {
    expect(fmtF(0)).toBe('$0');
    expect(fmtF(undefined)).toBe('$0');
    expect(fmtF(NaN)).toBe('$0');
  });
  test('formats with full dollar amounts', () => {
    expect(fmtF(1000000)).toBe('$1,000,000');
    expect(fmtF(250000)).toBe('$250,000');
  });
});

// --------------- rLE() ---------------
describe('rLE() - loss rounding', () => {
  test('rounds to nearest $1,000 for values under $100,000', () => {
    expect(rLE(1500)).toBe(2000);
    expect(rLE(999)).toBe(1000);
    expect(rLE(50000)).toBe(50000);
    expect(rLE(74999)).toBe(75000);
  });
  test('rounds to nearest $100,000 for values >= $100,000', () => {
    expect(rLE(100000)).toBe(100000);
    expect(rLE(150000)).toBe(200000);
    expect(rLE(1250000)).toBe(1300000);
  });
  test('handles zero', () => {
    expect(rLE(0)).toBe(0);
  });
  test('small values below 500 round to 0', () => {
    expect(rLE(499)).toBe(0);
  });
});

// --------------- esc() ---------------
describe('esc() - HTML escape', () => {
  test('escapes HTML special characters', () => {
    expect(esc('<script>')).toBe('&lt;script&gt;');
    expect(esc('"hello"')).toBe('&quot;hello&quot;');
    expect(esc('a & b')).toBe('a &amp; b');
    expect(esc('<a href="x">test</a>')).toBe('&lt;a href=&quot;x&quot;&gt;test&lt;/a&gt;');
  });
  test('passes through clean strings', () => {
    expect(esc('Hello World')).toBe('Hello World');
    expect(esc('123')).toBe('123');
  });
  test('converts non-strings to string first', () => {
    expect(esc(42)).toBe('42');
    expect(esc(null)).toBe('null');
  });
});

// --------------- pct() ---------------
describe('pct() - percentage formatter', () => {
  test('formats decimals as percentage strings', () => {
    expect(pct(1)).toBe('100%');
    expect(pct(0.5)).toBe('50%');
    expect(pct(0.25)).toBe('25%');
    expect(pct(0.075)).toBe('8%');
  });
});

// --------------- Building helpers ---------------
describe('Building helpers', () => {
  test('totalSqft() sums all building areas', () => {
    S.buildings = [
      {name:'A', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'', separation:''},
      {name:'B', area:'25000', construction:'hnc', occupancy:'Warehousing', value:'', separation:''},
    ];
    expect(totalSqft()).toBe(75000);
  });

  test('totalSqft() returns 0 with no area entered', () => {
    S.buildings = [{name:'', area:'', construction:'hnc', occupancy:'Warehousing', value:'', separation:''}];
    expect(totalSqft()).toBe(0);
  });

  test('primaryArea() returns area of primary building', () => {
    S.buildings[0].area = '100000';
    expect(primaryArea()).toBe(100000);
  });

  test('primaryConst() returns construction of primary building', () => {
    S.buildings[0].construction = 'fr';
    expect(primaryConst()).toBe('fr');
  });

  test('primaryOcc() returns occupancy of primary building', () => {
    S.buildings[0].occupancy = 'Office';
    expect(primaryOcc()).toBe('Office');
  });

  test('primaryOcc() defaults to Warehousing when empty', () => {
    S.buildings[0].occupancy = '';
    expect(primaryOcc()).toBe('Warehousing');
  });

  test('bldgValue() returns override value when set', () => {
    S.buildings[0].area = '50000';
    S.buildings[0].value = '5000000';
    S.totalBldg = '10000000';
    expect(bldgValue(0)).toBe(5000000);
  });

  test('bldgValue() distributes proportionally by sqft when no override', () => {
    S.buildings = [
      {name:'A', area:'60000', construction:'hnc', occupancy:'Warehousing', value:'', separation:''},
      {name:'B', area:'40000', construction:'hnc', occupancy:'Warehousing', value:'', separation:''},
    ];
    S.totalBldg = '1000000';
    S.totalEquip = '0';
    S.totalInv = '0';
    expect(bldgValue(0)).toBeCloseTo(600000, -2);
    expect(bldgValue(1)).toBeCloseTo(400000, -2);
  });

  test('bldgValue() returns 0 when totalSqft is 0', () => {
    S.buildings[0].area = '';
    S.totalBldg = '1000000';
    expect(bldgValue(0)).toBe(0);
  });
});

// --------------- gv() ---------------
describe('gv() - get values', () => {
  test('returns correct per-sqft values', () => {
    S.buildings[0].area = '100000';
    S.totalBldg = '10000000';
    S.totalEquip = '5000000';
    S.totalInv = '2000000';
    const v = gv();
    expect(v.a).toBe(100000);
    expect(v.tb).toBe(10000000);
    expect(v.bpsf).toBeCloseTo(100);
    expect(v.epsf).toBeCloseTo(50);
    expect(v.ipsf).toBeCloseTo(20);
    expect(v.pd).toBe(17000000);
  });

  test('gv() bpsf/epsf/ipsf are 0 when no area', () => {
    S.buildings[0].area = '';
    S.totalBldg = '10000000';
    const v = gv();
    expect(v.bpsf).toBe(0);
    expect(v.epsf).toBe(0);
    expect(v.ipsf).toBe(0);
  });

  test('gv() calculates BI from dollar input', () => {
    S.biMode = 'dollar';
    S.biYearly = '6000000';
    const v = gv();
    expect(v.by).toBe(6000000);
  });

  test('gv() calculates BI from percent-of-production', () => {
    S.biMode = 'percent';
    S.annualProd = '50000000';
    S.biPct = '25';
    const v = gv();
    expect(v.by).toBe(12500000);
  });

  test('gv() falls back to dollar BI when percent inputs are zero', () => {
    // When biMode=percent but annualProd or biPct are 0, the condition
    // (biMode==="percent" && annualProd>0 && biPct>0) is false, so
    // gv() falls back to pf(S.biYearly).
    S.biMode = 'percent';
    S.annualProd = '0';
    S.biPct = '0';
    S.biYearly = '1000000';
    const v = gv();
    expect(v.by).toBe(1000000);
  });
});

// --------------- getSepReq() ---------------
describe('getSepReq() - separation requirement lookup', () => {
  test('FR origin, FR exposed, ordinary hazard', () => {
    expect(getSepReq('fr', 'fr', 'ordinary')).toBe(40);
  });
  test('HNC origin, combustible exposed, extra hazard', () => {
    // origC=hnc -> ok='nc'; expC=comb -> ek='comb'; haz=extra -> hk='e'
    // MFL_SEP.comb.nc.e = 150
    expect(getSepReq('hnc', 'comb', 'extra')).toBe(150);
  });
  test('Combustible origin, combustible exposed, light hazard', () => {
    expect(getSepReq('comb', 'comb', 'light')).toBe(130);
  });
  test('FR origin, FR exposed, light hazard', () => {
    expect(getSepReq('fr', 'fr', 'light')).toBe(30);
  });
  test('HNC and LNC both map to nc key', () => {
    expect(getSepReq('hnc', 'hnc', 'ordinary')).toBe(getSepReq('lnc', 'lnc', 'ordinary'));
  });
  test('returns 100 as default for unknown inputs', () => {
    expect(getSepReq('unknown', 'unknown', 'unknown')).toBe(100);
  });
});

// --------------- countBold() / getT1B() ---------------
describe('countBold() - deficiency counter', () => {
  test('returns 0 when no deficiencies', () => {
    expect(countBold()).toBe(0);
  });
  test('counts each deficiency type', () => {
    S.defHP = 'ge80';
    expect(countBold()).toBe(1);
    S.defESFR = 'clearance_ok';
    expect(countBold()).toBe(2);
    S.defFE = true;
    expect(countBold()).toBe(3);
  });
});

describe('getT1B() - Table 1B scenario logic', () => {
  test('returns empty result when no deficiencies', () => {
    const r = getT1B();
    expect(r.sc).toBeNull();
    expect(r.eq).toBe(false);
  });

  test('multiple deficiencies forces APL = PML', () => {
    S.defHP = 'ge80';
    S.defOT = 'less_adequate';
    const r = getT1B();
    expect(r.eq).toBe(true);
    expect(r.sc).toBeNull();
  });

  test('defHP ge80 gives Scenario G', () => {
    S.defHP = 'ge80';
    const r = getT1B();
    expect(r.sc).toBe('G');
    expect(r.eq).toBe(false);
  });

  test('defHP lt80 forces APL = PML', () => {
    S.defHP = 'lt80';
    const r = getT1B();
    expect(r.eq).toBe(true);
  });

  test('ESFR clearance ok gives Scenario H for non-sensitive', () => {
    S.defESFR = 'clearance_ok';
    S.isSensitive = false;
    const r = getT1B();
    expect(r.sc).toBe('H');
  });

  test('ESFR clearance ok gives Scenario I for sensitive', () => {
    S.defESFR = 'clearance_ok';
    S.isSensitive = true;
    const r = getT1B();
    expect(r.sc).toBe('I');
  });

  test('ESFR clearance bad forces APL = PML', () => {
    S.defESFR = 'clearance_bad';
    expect(getT1B().eq).toBe(true);
  });

  test('ESFR over40ft forces APL = PML', () => {
    S.defESFR = 'over40ft';
    expect(getT1B().eq).toBe(true);
  });

  test('1 ESFR obstruction gives Scenario C for non-sensitive', () => {
    S.defOE = 'one';
    S.isSensitive = false;
    expect(getT1B().sc).toBe('C');
  });

  test('1 ESFR obstruction gives Scenario D for sensitive', () => {
    S.defOE = 'one';
    S.isSensitive = true;
    expect(getT1B().sc).toBe('D');
  });

  test('1-3 CMDA obstructions give Scenario E for non-sensitive', () => {
    S.defOC = 'up_to_3';
    S.isSensitive = false;
    expect(getT1B().sc).toBe('E');
  });

  test('1-3 CMDA obstructions give Scenario F for sensitive', () => {
    S.defOC = 'up_to_3';
    S.isSensitive = true;
    expect(getT1B().sc).toBe('F');
  });

  test('>6 CMDA obstructions forces APL = PML', () => {
    S.defOC = 'gt6';
    expect(getT1B().eq).toBe(true);
  });

  test('ESFR flue space deficiency forces APL = PML', () => {
    S.defFE = true;
    expect(getT1B().eq).toBe(true);
  });

  test('smoke/heat vents compliant gives Scenario G', () => {
    S.defV = 'compliant';
    expect(getT1B().sc).toBe('G');
  });

  test('smoke/heat vents noncompliant forces APL = PML', () => {
    S.defV = 'noncompliant';
    expect(getT1B().eq).toBe(true);
  });
});

// --------------- calcAPL() ---------------
describe('calcAPL() - APL scenario selection', () => {
  function setupBase(area = 100000, bldg = 10000000, equip = 5000000, inv = 2000000) {
    S.buildings[0].area = String(area);
    S.totalBldg = String(bldg);
    S.totalEquip = String(equip);
    S.totalInv = String(inv);
  }

  test('no sprinkler -> APL = PML', () => {
    setupBase();
    S.sprinklerAdequate = 'none';
    const r = calcAPL();
    expect(r.eq).toBe(true);
    expect(r.sc).toBeNull();
  });

  test('storage, adequate, non-sensitive, standard -> Scenario C', () => {
    setupBase();
    S.isStorage = true;
    S.isSensitive = false;
    S.protType = 'standard';
    S.hazardClass = 'extra';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('C');
    expect(r.eq).toBe(false);
  });

  test('storage, adequate, sensitive, standard -> Scenario D', () => {
    setupBase();
    S.isStorage = true;
    S.isSensitive = true;
    S.protType = 'standard';
    S.hazardClass = 'extra';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('D');
  });

  test('storage, adequate, non-sensitive, ESFR -> Scenario H', () => {
    setupBase();
    S.isStorage = true;
    S.isSensitive = false;
    S.protType = 'esfr';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('H');
  });

  test('storage, adequate, sensitive, ESFR -> Scenario I', () => {
    setupBase();
    S.isStorage = true;
    S.isSensitive = true;
    S.protType = 'esfr';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('I');
  });

  test('storage, adequate, non-sensitive, CMSA -> Scenario J', () => {
    setupBase();
    S.isStorage = true;
    S.isSensitive = false;
    S.protType = 'cmsa';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('J');
  });

  test('storage, adequate, sensitive, CMSA -> Scenario K', () => {
    setupBase();
    S.isStorage = true;
    S.isSensitive = true;
    S.protType = 'cmsa';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('K');
  });

  test('storage, adequate, FL present -> Scenario G', () => {
    setupBase();
    S.isStorage = true;
    S.hasFL = true;
    const r = calcAPL();
    expect(r.sc).toBe('G');
  });

  test('non-storage, adequate, light hazard, non-sensitive -> Scenario A', () => {
    setupBase();
    S.isStorage = false;
    S.isSensitive = false;
    S.hazardClass = 'light';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('A');
  });

  test('non-storage, adequate, ordinary hazard, non-sensitive -> Scenario A', () => {
    setupBase();
    S.isStorage = false;
    S.isSensitive = false;
    S.hazardClass = 'ordinary';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('A');
  });

  test('non-storage, adequate, light hazard, sensitive -> Scenario B', () => {
    setupBase();
    S.isStorage = false;
    S.isSensitive = true;
    S.hazardClass = 'light';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('B');
  });

  test('non-storage, adequate, extra hazard, non-sensitive, no FL -> Scenario C', () => {
    setupBase();
    S.isStorage = false;
    S.isSensitive = false;
    S.hazardClass = 'extra';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('C');
  });

  test('non-storage, adequate, extra hazard, sensitive, no FL -> Scenario D', () => {
    setupBase();
    S.isStorage = false;
    S.isSensitive = true;
    S.hazardClass = 'extra';
    S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('D');
  });

  test('non-storage, adequate, extra hazard, non-sensitive, with FL -> Scenario E', () => {
    setupBase();
    S.isStorage = false;
    S.isSensitive = false;
    S.hazardClass = 'extra';
    S.hasFL = true;
    const r = calcAPL();
    expect(r.sc).toBe('E');
  });

  test('non-storage, adequate, extra hazard, sensitive, with FL -> Scenario F', () => {
    setupBase();
    S.isStorage = false;
    S.isSensitive = true;
    S.hazardClass = 'extra';
    S.hasFL = true;
    const r = calcAPL();
    expect(r.sc).toBe('F');
  });

  test('APL damage is greater than 0 for a valid scenario', () => {
    setupBase();
    S.isStorage = false;
    S.isSensitive = false;
    S.hazardClass = 'ordinary';
    const r = calcAPL();
    expect(r.sc).toBe('A');
    expect(r.pT).toBeGreaterThan(0);
  });

  test('APL damage is 0 when no area specified', () => {
    S.buildings[0].area = '';
    S.isStorage = false;
    S.hazardClass = 'ordinary';
    S.totalBldg = '10000000';
    const r = calcAPL();
    expect(r.pT).toBe(0);
  });

  test('deficient sprinkler below 80% -> APL = PML', () => {
    setupBase();
    S.isStorage = false;
    S.sprinklerAdequate = 'deficient';
    S.designPct = '70';
    S.alarmsOk = false;
    const r = calcAPL();
    expect(r.eq).toBe(true);
  });

  test('Scenario G uses design area for fire zone', () => {
    setupBase(200000, 10000000, 5000000, 2000000);
    S.isStorage = true;
    S.hasFL = true;
    S.designArea = '2000';
    const r = calcAPL();
    expect(r.sc).toBe('G');
    expect(r.pT).toBeGreaterThan(0);
  });

  test('dry pipe uses dry scenario parameters when available', () => {
    setupBase();
    S.isStorage = false;
    S.isSensitive = false;
    S.hazardClass = 'ordinary';
    S.sprinklerType = 'dry';
    const r = calcAPL();
    expect(r.sc).toBe('A');
    // Dry pipe Scenario A fire zone = 1000 sqft vs 700 for wet
    // Loss should be slightly larger due to larger dry zone
    const wetS = { ...S, sprinklerType: 'wet' };
    const orig = S;
    S = wetS;
    const rWet = calcAPL();
    S = orig;
    expect(r.pT).toBeGreaterThanOrEqual(rWet.pT);
  });
});

// --------------- calcMFL() ---------------
describe('calcMFL() - MFL calculation', () => {
  function setupMFL(area = 100000, bldg = 10000000, equip = 5000000, inv = 2000000) {
    S.buildings[0].area = String(area);
    S.buildings[0].occupancy = 'Warehousing';
    S.buildings[0].construction = 'hnc';
    S.totalBldg = String(bldg);
    S.totalEquip = String(equip);
    S.totalInv = String(inv);
  }

  test('returns zero result when no area', () => {
    S.totalBldg = '10000000';
    const r = calcMFL();
    expect(r.pT).toBe(0);
    expect(r.sitePD).toBe(0);
  });

  test('single building, no separation, no fire wall - applies Table 5 percentages', () => {
    setupMFL(); // Warehousing HNC: bldg=10M, equip=5M, inv=2M
    const r = calcMFL();
    expect(r.sitePD).toBe(17000000);
    // Table 5: Warehousing HNC = b:80, e:90, i:90 -> pT < sitePD
    expect(r.bP).toBe(80);
    expect(r.eP).toBe(90);
    expect(r.iP).toBe(90);
    expect(r.pB).toBe(rLE(10000000 * 0.80)); // 8,000,000
    expect(r.pE).toBe(rLE(5000000 * 0.90));  // 4,500,000
    expect(r.pI).toBe(rLE(2000000 * 0.90));  // 1,800,000
    expect(r.pT).toBe(r.pB + r.pE + r.pI);
    expect(r.pT).toBeLessThan(r.sitePD);
    expect(r.atRiskTotal).toBe(r.sitePD); // nothing excluded
    expect(r.hasFW).toBe(false);
    expect(r.exclB.length).toBe(0);
  });

  test('fire wall reduces MFL proportionally (single building)', () => {
    setupMFL(100000, 10000000, 5000000, 2000000);
    S.fw4hr = true;
    S.fwArea = '60000'; // 60% of building on fire side
    const r = calcMFL();
    // Fire wall excludes 40% of primary building value
    // bldgValue(0) = 17M (only building), exclusion = 17M * (1 - 60000/100000) = 17M * 0.4 = 6.8M
    expect(r.fwReduction).toBeGreaterThan(0);
    expect(r.pT).toBeLessThan(r.sitePD);
    expect(r.hasFW).toBe(true);
    expect(r.mflA).toBe(60000);
  });

  test('fire wall area > building area is capped to building area', () => {
    setupMFL(100000, 10000000, 0, 0);
    S.fw4hr = true;
    S.fwArea = '200000'; // larger than building
    const r = calcMFL();
    expect(r.mflA).toBe(100000); // capped
    expect(r.fwReduction).toBe(0); // entire building is on fire side
  });

  test('adjacent building with adequate separation is excluded from MFL', () => {
    S.buildings = [
      {name:'Primary', area:'100000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:''},
      {name:'Warehouse 2', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'100', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '15000000';
    S.totalEquip = '0';
    S.totalInv = '0';
    S.hazardClass = 'ordinary';
    // Required separation for HNC-HNC ordinary = MFL_SEP.nc.nc.o = 80 ft
    // Actual = 100 ft, so should be excluded
    const r = calcMFL();
    expect(r.exclB.length).toBe(1);
    expect(r.inclB.length).toBe(0);
    expect(r.pT).toBeLessThan(r.sitePD);
  });

  test('adjacent building with inadequate separation is included in MFL', () => {
    S.buildings = [
      {name:'Primary', area:'100000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:''},
      {name:'Warehouse 2', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'20', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '15000000';
    S.totalEquip = '0';
    S.totalInv = '0';
    S.hazardClass = 'ordinary';
    // Required = 80 ft, actual = 20 ft -> included
    const r = calcMFL();
    expect(r.inclB.length).toBe(1);
    expect(r.exclB.length).toBe(0);
    // Nothing excluded from at-risk pool, but Table 5 applies (HNC Warehousing b=80)
    expect(r.atRiskTotal).toBe(r.sitePD);
    expect(r.pT).toBeLessThan(r.sitePD); // Table 5 reduces from 100%
    expect(r.pT).toBeGreaterThan(0);
  });

  test('fire wall reduction uses primary building value, not total site value', () => {
    // Multi-building: primary = 100k sqft, secondary = 100k sqft, equal areas
    S.buildings = [
      {name:'Primary', area:'100000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:''},
      {name:'Secondary', area:'100000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'20', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '10000000';
    S.totalEquip = '0';
    S.totalInv = '0';
    S.fw4hr = true;
    S.fwArea = '50000'; // 50% of primary building on fire side
    S.hazardClass = 'ordinary';
    const r = calcMFL();
    // bldgValue(primary) = 10M * (100k / 200k) = 5M
    // fwReduction = 5M * (1 - 50000/100000) = 5M * 0.5 = 2.5M
    expect(r.fwReduction).toBeCloseTo(2500000, -5);
    // Total site PD = 10M, minus fire wall = 2.5M, secondary not excluded (sep=20 ft < req)
    // pT should be around 10M - 2.5M = 7.5M
    expect(r.pT).toBeGreaterThan(0);
    expect(r.pT).toBeLessThan(r.sitePD);
  });

  test('BI value is computed correctly from monthly rate', () => {
    setupMFL();
    S.biYearly = '12000000'; // $1M/month
    const r = calcMFL();
    // Warehousing HNC bi = 12 months
    expect(r.biM).toBe(12);
    expect(r.bV).toBe(rLE(12000000 / 12 * 12)); // = 12M
  });
});

// --------------- calcPML() ---------------
describe('calcPML() - PML calculation', () => {
  function setupPML(area = 100000, bldg = 10000000, equip = 5000000, inv = 2000000) {
    S.buildings[0].area = String(area);
    S.buildings[0].occupancy = 'Warehousing';
    S.buildings[0].construction = 'hnc';
    S.totalBldg = String(bldg);
    S.totalEquip = String(equip);
    S.totalInv = String(inv);
    S.designArea = '2000';
  }

  test('PML = MFL for combustible construction', () => {
    setupPML();
    S.buildings[0].construction = 'comb';
    S.sprinklerAdequate = 'adequate';
    S.isStorage = false;
    S.hazardClass = 'ordinary';
    const r = calcPML();
    expect(r.eq).toBe(true);
    expect(r.rsn).toMatch(/combustible/i);
  });

  test('PML = MFL for delayed FD response', () => {
    setupPML();
    S.fdTime = 'delayed';
    const r = calcPML();
    expect(r.eq).toBe(true);
    expect(r.rsn).toMatch(/40 minutes/i);
  });

  test('PML = MFL for combustible cladding flag', () => {
    setupPML();
    S.hasCombConst = true;
    const r = calcPML();
    expect(r.eq).toBe(true);
  });

  test('PML > 0 for normal scenario', () => {
    setupPML();
    S.isStorage = false;
    S.hazardClass = 'ordinary';
    S.isSensitive = false;
    const r = calcPML();
    expect(r.eq).toBe(false);
    expect(r.pT).toBeGreaterThan(0);
  });

  test('PML >= APL (APL floor enforced)', () => {
    setupPML();
    S.isStorage = false;
    S.hazardClass = 'ordinary';
    S.isSensitive = false;
    const apl = calcAPL();
    const r = calcPML();
    expect(r.pT).toBeGreaterThanOrEqual(apl.pT);
  });

  test('PML fire area defaults to 1.5x design area', () => {
    setupPML();
    S.isStorage = false;
    S.hazardClass = 'ordinary';
    S.pmlArea = ''; // use default
    const r = calcPML();
    expect(r.pmlFA).toBe(Math.min(2000 * 1.5, 100000));
  });

  test('PML fire area override is respected', () => {
    setupPML();
    S.isStorage = false;
    S.hazardClass = 'ordinary';
    S.pmlArea = '5000';
    const r = calcPML();
    expect(r.pmlFA).toBe(5000);
  });

  test('PML fire area is capped to building area', () => {
    setupPML(10000); // 10k sqft building
    S.isStorage = false;
    S.hazardClass = 'ordinary';
    S.pmlArea = '999999'; // absurdly large
    const r = calcPML();
    expect(r.pmlFA).toBe(10000);
  });

  test('returns zero result when no area', () => {
    S.buildings[0].area = '';
    S.totalBldg = '10000000';
    const r = calcPML();
    expect(r.pT).toBe(0);
  });
});

// --------------- High Rise helpers ---------------
describe('High Rise helpers (hrFF, hrSF, hrWF)', () => {
  test('1 fire floor from input -> 2 smoke floors above, 2 water floors below', () => {
    S.hrFireFloors = '1';
    expect(hrFF()).toBe(1);
    expect(hrSF()).toBe(2);
    expect(hrWF()).toBe(2);
  });

  test('2 fire floors from input -> 3 smoke floors above, 5 water floors below', () => {
    S.hrFireFloors = '2';
    expect(hrFF()).toBe(2);
    expect(hrSF()).toBe(3);
    expect(hrWF()).toBe(5);
  });

  test('3 fire floors from input -> 4 smoke floors above, 6 water floors below', () => {
    S.hrFireFloors = '3';
    expect(hrFF()).toBe(3);
    expect(hrSF()).toBe(4);
    expect(hrWF()).toBe(6);
  });

  test('defaults to 1 fire floor when hrFireFloors is empty', () => {
    S.hrFireFloors = '';
    expect(hrFF()).toBe(1);
    expect(hrSF()).toBe(2);
    expect(hrWF()).toBe(2);
  });
});

// --------------- Integration tests ---------------
describe('Integration: consistent APL <= PML <= MFL ordering', () => {
  function fullSetup() {
    S.buildings[0].area = '50000';
    S.buildings[0].construction = 'hnc';
    S.buildings[0].occupancy = 'Warehousing';
    S.totalBldg = '8000000';
    S.totalEquip = '3000000';
    S.totalInv = '1000000';
    S.isStorage = false;
    S.isSensitive = false;
    S.hazardClass = 'ordinary';
    S.sprinklerAdequate = 'adequate';
    S.designArea = '1500';
    S.biYearly = '4000000';
    S.fdTime = 'prompt';
  }

  test('APL <= MFL', () => {
    fullSetup();
    const apl = calcAPL();
    const mfl = calcMFL();
    expect(apl.pT).toBeLessThanOrEqual(mfl.pT);
  });

  test('PML <= MFL', () => {
    fullSetup();
    const pml = calcPML();
    const mfl = calcMFL();
    expect(pml.pT).toBeLessThanOrEqual(mfl.pT);
  });

  test('APL <= PML', () => {
    fullSetup();
    const apl = calcAPL();
    const pml = calcPML();
    expect(apl.pT).toBeLessThanOrEqual(pml.pT);
  });

  test('all three estimates are positive for populated inputs', () => {
    fullSetup();
    expect(calcAPL().pT).toBeGreaterThan(0);
    expect(calcPML().pT).toBeGreaterThan(0);
    expect(calcMFL().pT).toBeGreaterThan(0);
  });
});
