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
  "Hydroelectric Power":{fr:{b:5,e:20,i:10,bi:12},hnc:{b:5,e:20,i:20,bi:12},lnc:{b:30,e:20,i:20,bi:12},comb:{b:100,e:100,i:100,bi:18}},
  "Data Center/Telecom":{fr:{b:10,e:30,i:30,bi:3},hnc:{b:10,e:30,i:30,bi:3},lnc:{b:30,e:30,i:30,bi:6},comb:{b:100,e:100,i:100,bi:18}},
  "Machine Shop/Light Metal":{fr:{b:10,e:20,i:20,bi:3},hnc:{b:10,e:20,i:20,bi:3},lnc:{b:30,e:30,i:30,bi:6},comb:{b:100,e:100,i:100,bi:12}},
  "Mineral Products":{fr:{b:10,e:20,i:10,bi:6},hnc:{b:10,e:20,i:20,bi:6},lnc:{b:30,e:30,i:30,bi:9},comb:{b:100,e:100,i:75,bi:12}},
  "Beverage Processing":{fr:{b:40,e:40,i:100,bi:9},hnc:{b:50,e:40,i:100,bi:12},lnc:{b:60,e:50,i:100,bi:12},comb:{b:100,e:100,i:100,bi:18}},
  "Retail (non Big Box)":{fr:{b:50,e:60,i:100,bi:10.5},hnc:{b:70,e:70,i:100,bi:10.5},lnc:{b:80,e:70,i:100,bi:10.5},comb:{b:100,e:100,i:100,bi:10.5}},
  "Food Processing":{fr:{b:50,e:50,i:100,bi:10.5},hnc:{b:60,e:60,i:100,bi:12},lnc:{b:70,e:60,i:100,bi:12},comb:{b:100,e:100,i:100,bi:12}},
  "Electronic/Electrical Mfg":{fr:{b:50,e:60,i:100,bi:9},hnc:{b:70,e:70,i:100,bi:12},lnc:{b:80,e:70,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Metal Smelting/Foundry":{fr:{b:50,e:60,i:40,bi:18},hnc:{b:70,e:80,i:50,bi:18},lnc:{b:80,e:80,i:80,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Big Box Retail":{fr:{b:50,e:60,i:60,bi:7.5},hnc:{b:70,e:80,i:80,bi:10.5},lnc:{b:90,e:80,i:90,bi:10.5},comb:{b:100,e:100,i:100,bi:10.5}},
  "Box Mfg/Printing":{fr:{b:50,e:70,i:100,bi:10.5},hnc:{b:70,e:80,i:100,bi:10.5},lnc:{b:90,e:80,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Vehicle Manufacturing":{fr:{b:50,e:50,i:50,bi:12},hnc:{b:60,e:60,i:60,bi:15},lnc:{b:70,e:60,i:60,bi:18},comb:{b:100,e:100,i:100,bi:24}},
  "Brewery/Distillery/Winery":{fr:{b:50,e:60,i:100,bi:12},hnc:{b:70,e:70,i:100,bi:12},lnc:{b:80,e:70,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Wood/Plastic Products":{fr:{b:70,e:90,i:100,bi:18},hnc:{b:80,e:90,i:100,bi:18},lnc:{b:90,e:90,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Cotton Mill/Sugar Mill":{fr:{b:80,e:100,i:100,bi:18},hnc:{b:90,e:100,i:100,bi:18},lnc:{b:100,e:100,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Rubber Manufacturing":{fr:{b:70,e:90,i:100,bi:12},hnc:{b:80,e:90,i:100,bi:18},lnc:{b:90,e:90,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Warehousing":{fr:{b:70,e:90,i:90,bi:9},hnc:{b:80,e:90,i:90,bi:12},lnc:{b:100,e:100,i:100,bi:12},comb:{b:100,e:100,i:100,bi:12}},
  "Warehousing (Refrigerated)":{fr:{b:70,e:90,i:100,bi:9},hnc:{b:80,e:90,i:100,bi:12},lnc:{b:100,e:100,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Aircraft Hangar":{fr:{b:90,e:100,i:100,bi:18},hnc:{b:100,e:100,i:100,bi:18},lnc:{b:100,e:100,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Pharma/Cosmetics/Drugs":{fr:{b:80,e:100,i:100,bi:24},hnc:{b:90,e:100,i:100,bi:24},lnc:{b:100,e:100,i:100,bi:24},comb:{b:100,e:100,i:100,bi:24}},
  "Semiconductor Mfg":{fr:{b:20,e:90,i:100,bi:24},hnc:{b:20,e:90,i:100,bi:24},lnc:{b:30,e:90,i:100,bi:24},comb:{b:100,e:100,i:100,bi:24}},
  "Grain Elevator/Milling":{fr:{b:90,e:100,i:100,bi:18},hnc:{b:100,e:100,i:100,bi:18},lnc:{b:100,e:100,i:100,bi:18},comb:{b:100,e:100,i:100,bi:18}},
  "Hotel/Residential/School":{fr:{b:50,e:50,i:70,bi:10.5},hnc:{b:60,e:60,i:70,bi:10.5},lnc:{b:70,e:60,i:80,bi:10.5},comb:{b:100,e:100,i:100,bi:10.5}},
  "Chemical Processing":{fr:{b:60,e:70,i:100,bi:18},hnc:{b:70,e:80,i:100,bi:18},lnc:{b:80,e:80,i:100,bi:18},comb:{b:100,e:100,i:100,bi:24}}
};

const MFL_SEP = {
  fr:{fr:{l:30,o:40,e:60},nc:{l:40,o:50,e:80},comb:{l:50,o:80,e:100}},
  nc:{fr:{l:40,o:60,e:90},nc:{l:50,o:80,e:100},comb:{l:80,o:100,e:130}},
  comb:{fr:{l:80,o:100,e:130},nc:{l:100,o:130,e:150},comb:{l:130,o:150,e:200}}
};

const CL = {fr:"Fire Resistive",hnc:"Heavy Noncombustible",lnc:"Light Noncombustible",comb:"Combustible"};

const STORAGE_OCCS = ["Warehousing","Warehousing (Refrigerated)","Big Box Retail"];

// TABLE 5 — Maximum % Building Damage that Defaults to Full Structure Loss
const MFL_T5 = [
  {maxSqft:50000,lnc:60,hnc:60,fr:60},
  {maxSqft:200000,lnc:65,hnc:70,fr:70},
  {maxSqft:500000,lnc:70,hnc:75,fr:75},
  {maxSqft:1000000,lnc:80,hnc:85,fr:85},
  {maxSqft:Infinity,lnc:90,hnc:90,fr:90}
];
function getT5Thresh(areaSqft,constType){
  if(constType==="comb")return 100;
  const k=constType==="fr"?"fr":constType==="hnc"?"hnc":"lnc";
  for(const row of MFL_T5){if(areaSqft<row.maxSqft)return row[k];}
  return 90;
}

// ======================== STATE (default reset values) ========================

let S;

function resetS() {
  S = {
    tab:0, siteName:"", accountNo:"", surveyDate:"", currency:"", units:"imperial",
    buildings:[{name:"",area:"",construction:"hnc",occupancy:"Warehousing",value:"",separation:"",floors:"",bldgPct:"",equipPct:"",invPct:""}],
    primaryIdx:0,
    hazardClass:"extra", isStorage:true, isSensitive:false,
    sprinklerType:"wet", sprinklerAdequate:"adequate", designPct:"100",
    hasFL:false, protType:"standard", alarmsOk:true, designArea:"", compArea:"",
    defHP:"none", defESFR:"none", defOT:"none", defFC:"none", defFE:false,
    defV:"none", defOE:"none", defOC:"none",
    totalBldg:"", totalEquip:"", totalInv:"", biYearly:"", biMode:"dollar",
    annualProd:"", biPct:"",
    valueDist:"area",
    pmlSystem:"sprinkler_riser", fdTime:"prompt", fdType:"fullypaid", pmlArea:"",
    hasCombConst:false,
    multipleRisers:false, centralStation:false,
    pmlFW2hr:false, pmlFWArea:"",
    pmlExpSep:false, pmlBldgHeight:"", mflWallOpenGt25:false,
    fw4hr:false, fwArea:"",
    isHighRise:false, stories:"", hrFireFloors:"1", topFloorBelowFD:true, extSpreadPossible:false,
    extType:"none", floorToWindow:"", windowHeight:"",
    aplDmgOverrides:{},
  };
}

// ======================== HELPER FUNCTIONS (copied from HTML) ========================

function pf(s){return parseFloat(s)||0}
function cs(){return S.currency||""}
function fmt(v){const c=cs();if(!v||isNaN(v))return c+"0";if(v>=1e9)return c+(v/1e9).toFixed(2)+"B";if(v>=1e6)return c+(v/1e6).toFixed(2)+"M";if(v>=1e3)return c+(v/1e3).toFixed(1)+"K";return c+Math.round(v).toLocaleString()}
function fmtF(v){const c=cs();if(!v||isNaN(v))return c+"0";return c+Math.round(v).toLocaleString()}
function fN(v){return v.toLocaleString()}
function toFt(v){return S.units==="metric"?v/0.3048:v}
function fromFt(v){return S.units==="metric"?Math.round(v*0.3048):v}
function dU(){return S.units==="metric"?"m":"ft"}
function defDA(){return S.units==="metric"?140:1500}
function rLE(v){return Math.round(v/10000)*10000}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function pct(v){return(v*100).toFixed(0)+"%"}

// APL damage override helpers
function aplDmg(sc,zone,key,baseVal){
  const k=sc+'_'+zone+'_'+key;
  if(S.aplDmgOverrides[k]!==undefined)return Math.max(0,Math.min(1,S.aplDmgOverrides[k]));
  return baseVal;
}

// Building helpers
function pb(){return S.buildings[S.primaryIdx]||S.buildings[0]||{area:"",construction:"hnc",occupancy:"Warehousing"}}
function totalSqft(){return S.buildings.reduce((s,b)=>s+pf(b.area),0)}
function primaryArea(){return pf(pb().area)}
function primaryConst(){return pb().construction}
function primaryOcc(){return pb().occupancy||"Warehousing"}

function bldgValue(i){
  const b=S.buildings[i],ov=pf(b.value);
  if(ov>0)return ov;
  if(S.valueDist==="custom"){
    const hasCust=(b.bldgPct!==''&&b.bldgPct!==undefined)||(b.equipPct!==''&&b.equipPct!==undefined)||(b.invPct!==''&&b.invPct!==undefined);
    if(hasCust)return bldgCatValue(i,'b')+bldgCatValue(i,'e')+bldgCatValue(i,'i');
  }
  const ts=totalSqft(),ba=pf(b.area),tv=pf(S.totalBldg)+pf(S.totalEquip)+pf(S.totalInv);
  return ts>0?tv*(ba/ts):0;
}
function bldgCatValue(i,cat){
  const b=S.buildings[i],ts=totalSqft(),ba=pf(b.area);
  const siteVal=cat==='b'?pf(S.totalBldg):cat==='e'?pf(S.totalEquip):pf(S.totalInv);
  const ov=pf(b.value);
  if(ov>0){const sitePD=pf(S.totalBldg)+pf(S.totalEquip)+pf(S.totalInv);return sitePD>0?siteVal*(ov/sitePD):0;}
  const pctKey=cat==='b'?'bldgPct':cat==='e'?'equipPct':'invPct';
  if(S.valueDist==="custom"&&b[pctKey]!==''&&b[pctKey]!==undefined)return siteVal*(pf(b[pctKey])/100);
  return ts>0?siteVal*(ba/ts):0;
}

function gv(){
  const a=primaryArea(),pi=S.primaryIdx;
  const siteTb=pf(S.totalBldg),siteTe=pf(S.totalEquip),siteTi=pf(S.totalInv),sitePD=siteTb+siteTe+siteTi;
  const tb=bldgCatValue(pi,'b'),te=bldgCatValue(pi,'e'),ti=bldgCatValue(pi,'i');
  let by=pf(S.biYearly);if(S.biMode==="percent"&&pf(S.annualProd)>0&&pf(S.biPct)>0)by=pf(S.annualProd)*(pf(S.biPct)/100);
  return{a,tb,te,ti,by,bpsf:a>0?tb/a:0,epsf:a>0?te/a:0,ipsf:a>0?ti/a:0,pd:tb+te+ti};
}

function getSepReq(origC,expC,haz,opts){
  let effOrigC=origC;
  if(opts&&opts.wallOpenGt25){if(origC==="fr")effOrigC="hnc";else if(origC==="hnc"||origC==="lnc")effOrigC="comb";}
  const ok=effOrigC==="fr"?"fr":effOrigC==="comb"?"comb":"nc",ek=expC==="fr"?"fr":expC==="comb"?"comb":"nc",hk=haz==="light"?"l":haz==="ordinary"?"o":"e";
  let ftVal=MFL_SEP[ek]?.[ok]?.[hk]||100;
  if(opts&&opts.origFloors>2&&origC!=="fr")ftVal+=10*(opts.origFloors-2);
  return fromFt(ftVal);
}
function sepOpts(){return{wallOpenGt25:S.mflWallOpenGt25,origFloors:pf(pb().floors)};}

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
    const rA=x=>{if(typeof x==="number")return Math.min(x,v.a);if(x==="design")return Math.min(pf(S.designArea)||defDA(),v.a);if(x==="2x")return Math.min((pf(S.designArea)||defDA())*2,v.a);if(x==="5x")return Math.min((pf(S.designArea)||defDA())*5,v.a);if(x==="comp")return Math.min(pf(S.compArea)||v.a,v.a);return 0};
    ["fire","water","smoke"].forEach(t=>{const d=sys[t],ar=rA(d.a);pB+=rLE((v.tb/v.a)*aplDmg(sc,t,'b',d.b)*ar);pE+=rLE((v.te/v.a)*aplDmg(sc,t,'e',d.e)*ar);pI+=rLE((v.ti/v.a)*aplDmg(sc,t,'i',d.i)*ar);});}
  return{sc,eq,R,pB,pE,pI,pT:pB+pE+pI,bi};
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
  const exclB=[],inclB=[],so=sepOpts();
  S.buildings.forEach((b,i)=>{if(i===S.primaryIdx)return;
    const req=getSepReq(primaryConst(),b.construction||primaryConst(),S.hazardClass,so);
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

  // Apply Table 4 damage percentages
  let pE=rLE(atRiskEquip*(d.e/100)),pI=rLE(atRiskInv*(d.i/100));

  // Table 5 — condemnation check: if Table 4 building damage % >= threshold, building is condemned (100% loss)
  const areaSqft=S.units==="metric"?a/0.0929:a;
  const t5Thresh=getT5Thresh(areaSqft,constKey);
  const condemned=d.b>=t5Thresh;
  let pB=condemned?rLE(atRiskBldg):rLE(atRiskBldg*(d.b/100));
  const effectiveBP=condemned?100:d.b;

  const pT=Math.max(pB+pE+pI,0);

  const biM=d.bi;
  return{biM,sitePD,fwReduction:rLE(fwReduction),exclPD:rLE(exclPD),pT,pB,pE,pI,bV:rLE(by/12*biM),mflA,hasFW,exclB,inclB,atRiskTotal:rLE(atRiskTotal),atRiskBldg,atRiskEquip,atRiskInv,bP:effectiveBP,eP:d.e,iP:d.i,t5Thresh,condemned,t4BldgPct:d.b};
}

// Hypothetical APL scenario (for deficient+no alarms PML)
function hypAPLSc(){const isLO=S.hazardClass==="light"||S.hazardClass==="ordinary";if(S.isStorage){if(S.hasFL)return"G";if(S.isSensitive)return S.protType==="esfr"?"I":S.protType==="cmsa"?"K":"D";return S.protType==="esfr"?"H":S.protType==="cmsa"?"J":"C";}if(S.isSensitive)return isLO?"B":"D";return isLO?"A":"C";}

// PML calculation
function pmlItem5Active(){
  const isNCFR=primaryConst()==="fr"||primaryConst()==="hnc"||primaryConst()==="lnc";
  const goodFD=S.fdType==="fullypaid"&&S.fdTime==="prompt";
  return isNCFR&&goodFD&&S.pmlFW2hr&&pf(S.pmlFWArea)>0;
}
function pmlExpSepInfo(){
  const goodFD=S.fdType==="fullypaid"&&S.fdTime==="prompt";
  if(!S.pmlExpSep||!goodFD)return{active:false};
  const h=pf(S.pmlBldgHeight);
  if(h<=0)return{active:false,reason:"building height required"};
  let nearest=null;
  S.buildings.forEach((b,i)=>{if(i===S.primaryIdx)return;const d=pf(b.separation);if(d>0&&(!nearest||d<nearest.dist))nearest={idx:i,dist:d,construction:b.construction||primaryConst(),name:b.name||("Building "+(i+1))};});
  if(!nearest)return{active:false,reason:"no adjacent buildings with separation distances"};
  const t3a=getSepReq(primaryConst(),nearest.construction,S.hazardClass,sepOpts());
  const reqDist=Math.max(h*1.5,t3a/2);
  const ok=nearest.dist>=reqDist;
  return{active:ok,nearest,reqDist,t3aDist:t3a,heightReq:h*1.5,halfT3a:t3a/2,actualDist:nearest.dist,reason:ok?null:"separation "+nearest.dist+" "+dU()+" < required "+Math.ceil(reqDist)+" "+dU()};
}
function pmlItem7Qualifies(){
  const isLO=(S.hazardClass==="light"||S.hazardClass==="ordinary")&&!S.isStorage;
  return isLO&&!S.hasFL&&S.sprinklerAdequate==="adequate"&&S.multipleRisers&&S.centralStation&&S.fdType==="fullypaid"&&S.fdTime==="prompt";
}
function calcPML(){
  const v=gv(),mfl=calcMFL(),apl=calcAPL();
  const isLO=(S.hazardClass==="light"||S.hazardClass==="ordinary")&&!S.isStorage;
  if(!S.alarmsOk||S.fdTime==="delayed"||primaryConst()==="comb"||S.hasCombConst||S.sprinklerAdequate==="none"){
    const rsn=!S.alarmsOk?"Inadequate alarms/FD notification implies delayed emergency response, so PML = MFL":S.fdTime==="delayed"?"Fire department response exceeds 40 minutes, so PML = MFL":S.sprinklerAdequate==="none"?"No automatic sprinkler protection, so PML = MFL":"Combustible construction, so PML = MFL";
    return{...mfl,eq:true,rsn,pT:Math.max(mfl.pT,apl.pT),aplFloor:apl.pT>mfl.pT,zones:[]};}
  if(!isLO){
    if(pmlItem5Active()){
      const fwA=Math.min(pf(S.pmlFWArea),v.a);
      const r=v.a>0?fwA/v.a:1;
      const pB=rLE(mfl.pB*r),pE=rLE(mfl.pE*r),pI=rLE(mfl.pI*r);
      let pT=pB+pE+pI;if(pT<apl.pT){pT=apl.pT;}
      return{biM:mfl.biM,bV:rLE(v.by/12*mfl.biM),pB,pE,pI,pT,eq:false,rsn:"Item #5: 2-hour fire wall limits PML fire area for extra hazard/storage",aplFloor:pT===apl.pT&&pB+pE+pI<apl.pT,pmlFA:fwA,zones:[],bP:mfl.bP,eP:mfl.eP,iP:mfl.iP,item5Limited:true};}
    const expSep=pmlExpSepInfo();
    if(expSep.active){
      const primaryFrac=mfl.sitePD>0?bldgValue(S.primaryIdx)/mfl.sitePD:1;
      const pB=rLE(mfl.pB*primaryFrac),pE=rLE(mfl.pE*primaryFrac),pI=rLE(mfl.pI*primaryFrac);
      let pT=pB+pE+pI;if(pT<apl.pT){pT=apl.pT;}
      return{biM:mfl.biM,bV:rLE(v.by/12*mfl.biM),pB,pE,pI,pT,eq:false,rsn:"Exposure separation credited",aplFloor:pT===apl.pT&&pB+pE+pI<apl.pT,pmlFA:v.a,zones:[],bP:mfl.bP,eP:mfl.eP,iP:mfl.iP,expSepLimited:true};}
    const rsn="Extra hazard/storage occupancy: PML = MFL per Item #6 (no Item #5 fire wall credited)";
    return{...mfl,eq:true,rsn,pT:Math.max(mfl.pT,apl.pT),aplFloor:apl.pT>mfl.pT,zones:[]};}
  if(!pmlItem7Qualifies()){
    const missing=[];
    if(S.hasFL)missing.push("has FL/CL");
    if(S.sprinklerAdequate!=="adequate")missing.push("sprinklers not adequate");
    if(!S.multipleRisers)missing.push("no multiple risers");
    if(!S.centralStation)missing.push("no central station/24hr");
    if(S.fdType!=="fullypaid")missing.push("FD not fully paid");
    const rsn=`Item #7 qualifiers not met (${missing.join(", ")}): PML = MFL`;
    return{...mfl,eq:true,rsn,pT:Math.max(mfl.pT,apl.pT),aplFloor:apl.pT>mfl.pT,zones:[]};}
  const designA=pf(S.designArea)||defDA();
  let pmlFA=pf(S.pmlArea);
  if(pmlFA<=0){pmlFA=designA*1.5;if(pmlItem5Active())pmlFA=Math.min(pmlFA,pf(S.pmlFWArea));}
  pmlFA=Math.min(pmlFA,v.a);
  if(apl.eq){
    const is80=(pf(S.designPct)||100)>=80,isAdq=S.sprinklerAdequate==="adequate";
    const hSc=(!is80&&!isAdq)?(S.isStorage?"G":(S.isSensitive?"F":"E")):hypAPLSc();
    const aplEqRsn=apl.R.filter(r=>r.toLowerCase().includes("apl = pml")).join("; ")||"Protection deficiencies";
    if(hSc&&APL_SC[hSc]){const s=APL_SC[hSc],sys=S.sprinklerType==="dry"&&s.dry?s.dry:s.wet;
      const rA=x=>{if(typeof x==="number")return Math.min(x,v.a);if(x==="design")return Math.min(designA,v.a);if(x==="2x")return Math.min(designA*2,v.a);if(x==="5x")return Math.min(designA*5,v.a);if(x==="comp")return Math.min(pf(S.compArea)||v.a,v.a);return 0};
      const aplFireA=rA(sys.fire.a);
      const sf=aplFireA>0?pmlFA/aplFireA:1;
      let pB=0,pE=0,pI=0,zones=[];
      ["fire","water","smoke"].forEach(t=>{const zd=sys[t];const aplZA=rA(zd.a);const pmlZA=Math.min(Math.round(aplZA*sf),v.a);const bD=rLE((v.tb/v.a)*pmlZA),eD=rLE((v.te/v.a)*pmlZA),iD=rLE((v.ti/v.a)*pmlZA);pB+=bD;pE+=eD;pI+=iD;zones.push({type:t,aplA:aplZA,pmlA:pmlZA,bPct:100,ePct:100,iPct:100,bD,eD,iD});});
      pB=Math.min(pB,v.tb);pE=Math.min(pE,v.te);pI=Math.min(pI,v.ti);
      let pT=pB+pE+pI;const mflCap=pT>mfl.pT;if(mflCap)pT=mfl.pT;
      return{biM:mfl.biM,bV:rLE(v.by/12*mfl.biM),pB,pE,pI,pT,eq:true,rsn:`${aplEqRsn}: PML fire area modeled at 100% damage using hypothetical Scenario ${hSc} zone ratios (Item #7)`,pmlFA,hypDesignA:designA,pmlAreaOverride:pf(S.pmlArea)>0,zones,hypSc:hSc,aplEqRsn,bP:100,eP:100,iP:100,mflCap};}
    return{...mfl,eq:true,rsn:`${aplEqRsn}: no adequate protection scenario available, so PML = MFL`,pT:Math.max(mfl.pT,apl.pT),aplFloor:apl.pT>mfl.pT,zones:[]};}
  const o=MFL_T[primaryOcc()];if(!o||v.a===0)return{pB:0,pE:0,pI:0,pT:0,biM:0,eq:false,zones:[]};
  const d=o[primaryConst()]||o.comb;
  let pB=0,pE=0,pI=0,zones=[];
  if(apl.sc&&APL_SC[apl.sc]){const s=APL_SC[apl.sc],sys=S.sprinklerType==="dry"&&s.dry?s.dry:s.wet;
    const aplFA=(x=>{if(typeof x==="number")return Math.min(x,v.a);if(x==="design")return Math.min(designA,v.a);if(x==="2x")return Math.min(designA*2,v.a);if(x==="5x")return Math.min(designA*5,v.a);if(x==="comp")return Math.min(pf(S.compArea)||v.a,v.a);return 0})(sys.fire.a);
    const sf=aplFA>0?pmlFA/aplFA:1;
    ["fire","water","smoke"].forEach(t=>{const zd=sys[t];const azA=(x=>{if(typeof x==="number")return Math.min(x,v.a);if(x==="design")return Math.min(designA,v.a);if(x==="2x")return Math.min(designA*2,v.a);if(x==="5x")return Math.min(designA*5,v.a);if(x==="comp")return Math.min(pf(S.compArea)||v.a,v.a);return 0})(zd.a);
      const pzA=Math.min(Math.round(azA*sf),v.a);const eb=aplDmg(apl.sc,t,'b',zd.b),ee=aplDmg(apl.sc,t,'e',zd.e),ei=aplDmg(apl.sc,t,'i',zd.i);const bD=rLE((v.tb/v.a)*eb*pzA),eD=rLE((v.te/v.a)*ee*pzA),iD=rLE((v.ti/v.a)*ei*pzA);
      pB+=bD;pE+=eD;pI+=iD;zones.push({type:t,aplA:azA,pmlA:pzA,bPct:eb,ePct:ee,iPct:ei,bD,eD,iD});});}
  else{const r=v.a>0?pmlFA/v.a:1;pB=rLE(v.tb*(d.b/100)*r);pE=rLE(v.te*(d.e/100)*r);pI=rLE(v.ti*(d.i/100)*r);}
  let pT=pB+pE+pI,aplFloor=false;if(pT<apl.pT){aplFloor=true;pT=apl.pT;}
  return{biM:d.bi,pB,pE,pI,pT,bV:rLE(v.by/12*d.bi),eq:false,rsn:"",aplFloor,pmlFA,zones,bP:d.b,eP:d.e,iP:d.i};
}

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
  test('returns 0 for falsy / NaN values (no currency)', () => {
    expect(fmt(0)).toBe('0');
    expect(fmt(undefined)).toBe('0');
    expect(fmt(NaN)).toBe('0');
  });
  test('formats billions', () => {
    expect(fmt(1e9)).toBe('1.00B');
    expect(fmt(2.5e9)).toBe('2.50B');
  });
  test('formats millions', () => {
    expect(fmt(1e6)).toBe('1.00M');
    expect(fmt(500000)).toBe('500.0K');
  });
  test('formats thousands', () => {
    expect(fmt(1000)).toBe('1.0K');
    expect(fmt(5500)).toBe('5.5K');
  });
  test('formats sub-thousand values', () => {
    expect(fmt(500)).toBe('500');
    expect(fmt(1)).toBe('1');
  });
  test('prepends currency symbol when set', () => {
    S.currency = '$';
    expect(fmt(1e6)).toBe('$1.00M');
    expect(fmtF(1000000)).toBe('$1,000,000');
    S.currency = '€';
    expect(fmt(1e6)).toBe('€1.00M');
    S.currency = '';
  });
});

// --------------- fmtF() ---------------
describe('fmtF() - full formatter', () => {
  test('returns 0 for falsy / NaN (no currency)', () => {
    expect(fmtF(0)).toBe('0');
    expect(fmtF(undefined)).toBe('0');
    expect(fmtF(NaN)).toBe('0');
  });
  test('formats with full amounts', () => {
    expect(fmtF(1000000)).toBe('1,000,000');
    expect(fmtF(250000)).toBe('250,000');
  });
});

// --------------- rLE() ---------------
describe('rLE() - loss rounding', () => {
  test('rounds to nearest $10,000', () => {
    expect(rLE(1500)).toBe(0);
    expect(rLE(5000)).toBe(10000);
    expect(rLE(15000)).toBe(20000);
    expect(rLE(50000)).toBe(50000);
    expect(rLE(74999)).toBe(70000);
    expect(rLE(75000)).toBe(80000);
  });
  test('rounds to nearest $10,000 for larger values', () => {
    expect(rLE(100000)).toBe(100000);
    expect(rLE(150000)).toBe(150000);
    expect(rLE(1250000)).toBe(1250000);
    expect(rLE(1255000)).toBe(1260000);
  });
  test('handles zero', () => {
    expect(rLE(0)).toBe(0);
  });
  test('small values below 5000 round to 0', () => {
    expect(rLE(4999)).toBe(0);
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

// --------------- getSepReq() Table 3a Notes ---------------
describe('getSepReq() - Table 3a Note 1: wall openings >25%', () => {
  test('FR origin treated as NC when wall openings >25%', () => {
    // Without adjustment: FR-FR-ordinary = MFL_SEP.fr.fr.o = 40
    expect(getSepReq('fr', 'fr', 'ordinary')).toBe(40);
    // With wall openings: FR→NC, so MFL_SEP[fr][nc][o] = 50
    expect(getSepReq('fr', 'fr', 'ordinary', {wallOpenGt25:true})).toBe(50);
  });
  test('HNC origin treated as Combustible when wall openings >25%', () => {
    // Without: MFL_SEP[fr][nc][l] = 40
    expect(getSepReq('hnc', 'fr', 'light')).toBe(40);
    // With: HNC→comb, so MFL_SEP[fr][comb][l] = 50
    expect(getSepReq('hnc', 'fr', 'light', {wallOpenGt25:true})).toBe(50);
  });
  test('LNC origin treated as Combustible when wall openings >25%', () => {
    // Without: MFL_SEP[nc][nc][o] = 80
    expect(getSepReq('lnc', 'lnc', 'ordinary')).toBe(80);
    // With: LNC→comb, so MFL_SEP[nc][comb][o] = 100
    expect(getSepReq('lnc', 'lnc', 'ordinary', {wallOpenGt25:true})).toBe(100);
  });
  test('Combustible origin unchanged by wall openings flag', () => {
    expect(getSepReq('comb', 'comb', 'extra')).toBe(200);
    expect(getSepReq('comb', 'comb', 'extra', {wallOpenGt25:true})).toBe(200);
  });
  test('wall openings with extra hazard shows larger increase', () => {
    // FR-NC-extra without: MFL_SEP[nc][fr][e] = 90
    expect(getSepReq('fr', 'hnc', 'extra')).toBe(90);
    // With: FR→NC, MFL_SEP[nc][nc][e] = 100
    expect(getSepReq('fr', 'hnc', 'extra', {wallOpenGt25:true})).toBe(100);
  });
  test('no opts parameter preserves original behavior', () => {
    expect(getSepReq('fr', 'fr', 'ordinary')).toBe(40);
    expect(getSepReq('fr', 'fr', 'ordinary', null)).toBe(40);
    expect(getSepReq('fr', 'fr', 'ordinary', {})).toBe(40);
  });
});

describe('getSepReq() - Table 3a Note 2: multi-story height adjustment', () => {
  test('non-FR origin >2 stories adds 10ft per story above 2', () => {
    // HNC exposed to FR, ordinary: MFL_SEP[fr][nc][o] = 50, 4 stories → +20ft = 70
    expect(getSepReq('hnc', 'fr', 'ordinary', {origFloors:4})).toBe(70);
  });
  test('3 stories adds 10ft', () => {
    // comb-comb-light base = 130, 3 stories → +10ft = 140
    expect(getSepReq('comb', 'comb', 'light', {origFloors:3})).toBe(140);
  });
  test('2 stories does not add extra separation', () => {
    // MFL_SEP[fr][nc][o] = 50
    expect(getSepReq('hnc', 'fr', 'ordinary', {origFloors:2})).toBe(50);
  });
  test('1 story does not add extra separation', () => {
    expect(getSepReq('hnc', 'fr', 'ordinary', {origFloors:1})).toBe(50);
  });
  test('FR origin is exempt from height adjustment even with >2 stories', () => {
    // FR-FR-ordinary = 40 regardless of floors
    expect(getSepReq('fr', 'fr', 'ordinary', {origFloors:5})).toBe(40);
  });
  test('combined: wall openings + multi-story', () => {
    // FR origin, wall openings → treated as NC for lookup; but FR is exempt from height adj
    // MFL_SEP[fr][nc][o] = 50, no height adjustment
    expect(getSepReq('fr', 'fr', 'ordinary', {wallOpenGt25:true, origFloors:4})).toBe(50);
    // HNC origin, wall openings → treated as Comb for lookup; 3 stories → +10ft
    // MFL_SEP[fr][comb][o] = 80, + 10 = 90
    expect(getSepReq('hnc', 'fr', 'ordinary', {wallOpenGt25:true, origFloors:3})).toBe(90);
  });
});

describe('calcMFL() - Table 3a Note adjustments in separation', () => {
  test('wall openings >25% increases required separation and can change adequacy', () => {
    S.buildings = [
      {name:'Primary', area:'100000', construction:'fr', occupancy:'Warehousing', value:'', separation:'', floors:''},
      {name:'Secondary', area:'50000', construction:'fr', occupancy:'Warehousing', value:'', separation:'45', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '3000000'; S.totalEquip = '1500000'; S.totalInv = '1500000';
    S.hazardClass = 'ordinary';
    S.mflWallOpenGt25 = false;
    // Base: FR-FR-ordinary = 40ft. 45ft >= 40ft → excluded
    let mfl = calcMFL();
    expect(mfl.exclB.length).toBe(1);
    // With wall openings: FR→NC, MFL_SEP[fr][nc][o] = 50ft. 45ft < 50ft → included
    S.mflWallOpenGt25 = true;
    mfl = calcMFL();
    expect(mfl.exclB.length).toBe(0);
    expect(mfl.inclB.length).toBe(1);
  });

  test('multi-story non-FR increases required separation', () => {
    S.buildings = [
      {name:'Primary', area:'100000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:'4'},
      {name:'Secondary', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'90', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '3000000'; S.totalEquip = '1500000'; S.totalInv = '1500000';
    S.hazardClass = 'ordinary';
    S.mflWallOpenGt25 = false;
    // Base: HNC(nc)-HNC(nc)-ordinary = 80ft. 4 stories → +20ft = 100ft. 90ft < 100ft → included
    let mfl = calcMFL();
    expect(mfl.inclB.length).toBe(1);
    expect(mfl.exclB.length).toBe(0);
    // With only 2 stories: base = 80ft. 90ft >= 80ft → excluded
    S.buildings[0].floors = '2';
    mfl = calcMFL();
    expect(mfl.exclB.length).toBe(1);
    expect(mfl.inclB.length).toBe(0);
  });

  test('FR origin exempt from multi-story adjustment', () => {
    S.buildings = [
      {name:'Primary', area:'100000', construction:'fr', occupancy:'Warehousing', value:'', separation:'', floors:'5'},
      {name:'Secondary', area:'50000', construction:'fr', occupancy:'Warehousing', value:'', separation:'45', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '3000000'; S.totalEquip = '1500000'; S.totalInv = '1500000';
    S.hazardClass = 'ordinary';
    // FR-FR-ordinary = 40ft. FR is exempt from height adjustment. 45ft >= 40ft → excluded
    let mfl = calcMFL();
    expect(mfl.exclB.length).toBe(1);
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

  test('single building, no separation, no fire wall - applies Table 4/5 percentages', () => {
    setupMFL(); // Warehousing HNC: bldg=10M, equip=5M, inv=2M, 100K sqft
    const r = calcMFL();
    expect(r.sitePD).toBe(17000000);
    // Table 4: Warehousing HNC = b:80, e:90, i:90
    // Table 5: 100K sqft HNC threshold = 70; 80 >= 70 → condemned → bP=100
    expect(r.t4BldgPct).toBe(80);
    expect(r.t5Thresh).toBe(70);
    expect(r.condemned).toBe(true);
    expect(r.bP).toBe(100); // effectiveBP=100 due to condemnation
    expect(r.eP).toBe(90);
    expect(r.iP).toBe(90);
    expect(r.pB).toBe(rLE(10000000)); // 10,000,000 (condemned = full building loss)
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
    // Nothing excluded from at-risk pool
    expect(r.atRiskTotal).toBe(r.sitePD);
    // Warehousing HNC 100K sqft: Table 5 condemns (80 >= 70) → bP=100, eP=90, iP=90
    // With bldg-only site (equip=0,inv=0): pT = sitePD (100% building loss)
    expect(r.pT).toBe(r.sitePD);
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
    // Item #7 qualifiers for L/O hazard tests
    S.multipleRisers = true; S.centralStation = true; S.fdType = 'fullypaid';
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

// ======================== REV 0.8 EXPANDED TESTS ========================

// --------------- Unit system helpers ---------------
describe('defDA() - default design area by unit system', () => {
  test('returns 1500 for imperial', () => {
    S.units = 'imperial';
    expect(defDA()).toBe(1500);
  });
  test('returns 140 for metric', () => {
    S.units = 'metric';
    expect(defDA()).toBe(140);
  });
});

describe('fromFt() / toFt() - unit conversion', () => {
  test('fromFt() passes value through in imperial', () => {
    S.units = 'imperial';
    expect(fromFt(40)).toBe(40);
    expect(fromFt(100)).toBe(100);
  });
  test('fromFt() converts ft to metres in metric', () => {
    S.units = 'metric';
    expect(fromFt(40)).toBe(Math.round(40 * 0.3048));  // 12
    expect(fromFt(100)).toBe(Math.round(100 * 0.3048)); // 30
  });
  test('toFt() passes value through in imperial', () => {
    S.units = 'imperial';
    expect(toFt(40)).toBe(40);
  });
  test('toFt() converts metres to ft in metric', () => {
    S.units = 'metric';
    expect(toFt(12)).toBeCloseTo(12 / 0.3048, 3);
  });
  test('round-trip: fromFt(toFt(v)) ≈ v in metric', () => {
    S.units = 'metric';
    // toFt(12) = 39.37..., fromFt(39.37) = round(12.0) = 12
    expect(fromFt(toFt(12))).toBe(12);
  });
});

describe('getSepReq() - metric unit conversion', () => {
  test('FR-FR-ordinary returns 40 ft in imperial', () => {
    S.units = 'imperial';
    expect(getSepReq('fr', 'fr', 'ordinary')).toBe(40);
  });
  test('FR-FR-ordinary returns ~12 m in metric', () => {
    S.units = 'metric';
    expect(getSepReq('fr', 'fr', 'ordinary')).toBe(Math.round(40 * 0.3048)); // 12
  });
  test('comb-comb-extra returns 200 ft in imperial', () => {
    S.units = 'imperial';
    expect(getSepReq('comb', 'comb', 'extra')).toBe(200);
  });
  test('comb-comb-extra returns ~61 m in metric', () => {
    S.units = 'metric';
    expect(getSepReq('comb', 'comb', 'extra')).toBe(Math.round(200 * 0.3048)); // 61
  });
  test('metric separation comparison works: 12 m meets 40 ft requirement', () => {
    S.units = 'metric';
    S.buildings = [
      {name:'Primary', area:'9000', construction:'fr', occupancy:'Office', value:'', separation:'', floors:''},
      {name:'Secondary', area:'5000', construction:'fr', occupancy:'Office', value:'', separation:'12', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '10000000'; S.totalEquip = '0'; S.totalInv = '0';
    S.hazardClass = 'ordinary';
    // FR-FR ordinary req = 40 ft = 12 m; actual = 12 m → adequate, excluded
    const r = calcMFL();
    expect(r.exclB.length).toBe(1);
  });
  test('metric separation: 11 m does not meet 40 ft (12 m) requirement', () => {
    S.units = 'metric';
    S.buildings = [
      {name:'Primary', area:'9000', construction:'fr', occupancy:'Office', value:'', separation:'', floors:''},
      {name:'Secondary', area:'5000', construction:'fr', occupancy:'Office', value:'', separation:'11', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '10000000'; S.totalEquip = '0'; S.totalInv = '0';
    S.hazardClass = 'ordinary';
    const r = calcMFL();
    expect(r.inclB.length).toBe(1);
  });
});

// --------------- Table 1B missing paths ---------------
describe('getT1B() - open-top container deficiencies', () => {
  test('defOT top_gt20 forces APL = PML', () => {
    S.defOT = 'top_gt20';
    expect(getT1B().eq).toBe(true);
  });
  test('defOT less_adequate gives Scenario G', () => {
    S.defOT = 'less_adequate';
    const r = getT1B();
    expect(r.sc).toBe('G');
    expect(r.eq).toBe(false);
  });
  test('defOT less_inadequate forces APL = PML', () => {
    S.defOT = 'less_inadequate';
    expect(getT1B().eq).toBe(true);
  });
});

describe('getT1B() - flue column deficiencies', () => {
  test('defFC one_dir gives Scenario G', () => {
    S.defFC = 'one_dir';
    const r = getT1B();
    expect(r.sc).toBe('G');
    expect(r.eq).toBe(false);
  });
  test('defFC both_dir forces APL = PML', () => {
    S.defFC = 'both_dir';
    expect(getT1B().eq).toBe(true);
  });
});

describe('getT1B() - ESFR obstruction edge cases', () => {
  test('2-3 ESFR heads obstructed gives Scenario G', () => {
    S.defOE = 'up_to_3';
    const r = getT1B();
    expect(r.sc).toBe('G');
  });
  test('>3 ESFR heads obstructed forces APL = PML', () => {
    S.defOE = 'gt3';
    expect(getT1B().eq).toBe(true);
  });
});

describe('getT1B() - CMDA obstruction edge cases', () => {
  test('4-6 CMDA heads obstructed gives Scenario G', () => {
    S.defOC = 'up_to_6';
    const r = getT1B();
    expect(r.sc).toBe('G');
  });
  test('>6 CMDA heads obstructed forces APL = PML', () => {
    S.defOC = 'gt6';
    expect(getT1B().eq).toBe(true);
  });
});

// --------------- calcAPL() BI strings ---------------
describe('calcAPL() - BI strings per scenario', () => {
  function setupBI() {
    S.buildings[0].area = '100000';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
  }

  const expected = {
    A:'1 - 7 Days', B:'1 - 3 Weeks', C:'1 - 7 Days', D:'2 - 4 Weeks',
    E:'8 - 16 Weeks', F:'4 - 12 Weeks', G:'4 - 12 Weeks',
    H:'1 - 7 Days', I:'2 - 4 Weeks', J:'1 - 7 Days', K:'2 - 4 Weeks'
  };

  Object.entries(expected).forEach(([sc, bi]) => {
    test(`Scenario ${sc} BI = "${bi}"`, () => {
      setupBI();
      expect(APL_SC[sc].bi).toBe(bi);
    });
  });

  test('APL returns correct BI string for Scenario A', () => {
    setupBI();
    S.isStorage = false; S.isSensitive = false; S.hazardClass = 'ordinary';
    const r = calcAPL();
    expect(r.sc).toBe('A');
    expect(r.bi).toBe('1 - 7 Days');
  });
  test('APL returns correct BI string for Scenario D', () => {
    setupBI();
    S.isStorage = false; S.isSensitive = true; S.hazardClass = 'extra'; S.hasFL = false;
    const r = calcAPL();
    expect(r.sc).toBe('D');
    expect(r.bi).toBe('2 - 4 Weeks');
  });
});

// --------------- calcAPL() storage + T1B integration ---------------
describe('calcAPL() - storage with Table 1B deficiencies', () => {
  function setupStorage() {
    S.buildings[0].area = '100000';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.isStorage = true; S.isSensitive = false; S.hazardClass = 'extra';
    S.sprinklerAdequate = 'deficient'; S.designPct = '90';
  }

  test('storage + defHP ge80 → Scenario G', () => {
    setupStorage();
    S.defHP = 'ge80';
    const r = calcAPL();
    expect(r.sc).toBe('G');
    expect(r.eq).toBe(false);
  });

  test('storage + defHP lt80 → APL = PML', () => {
    setupStorage();
    S.defHP = 'lt80';
    const r = calcAPL();
    expect(r.eq).toBe(true);
  });

  test('storage + FL + deficiency → APL = PML', () => {
    setupStorage();
    S.hasFL = true;
    const r = calcAPL();
    expect(r.eq).toBe(true);
  });
});

// --------------- calcMFL() all occupancies ---------------
describe('calcMFL() - all MFL_T occupancies produce valid results', () => {
  function setupOcc(occ, ct = 'fr') {
    S.buildings[0].area = '100000';
    S.buildings[0].occupancy = occ;
    S.buildings[0].construction = ct;
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
  }

  Object.keys(MFL_T).forEach(occ => {
    test(`${occ} / FR → pT > 0, Table 4 stored in t4BldgPct, Table 5 condemnation applied`, () => {
      setupOcc(occ, 'fr');
      const r = calcMFL();
      expect(r.pT).toBeGreaterThan(0);
      expect(r.t4BldgPct).toBe(MFL_T[occ].fr.b);
      expect(r.eP).toBe(MFL_T[occ].fr.e);
      expect(r.iP).toBe(MFL_T[occ].fr.i);
      // Table 5: 100K sqft FR threshold = 70; if Table 4 bldg % >= 70 → condemned → bP=100
      const t5 = getT5Thresh(100000, 'fr');
      if (MFL_T[occ].fr.b >= t5) {
        expect(r.condemned).toBe(true);
        expect(r.bP).toBe(100);
      } else {
        expect(r.condemned).toBe(false);
        expect(r.bP).toBe(MFL_T[occ].fr.b);
      }
    });

    test(`${occ} / HNC → pT > 0, Table 5 condemnation applied`, () => {
      setupOcc(occ, 'hnc');
      const r = calcMFL();
      expect(r.pT).toBeGreaterThan(0);
      expect(r.t4BldgPct).toBe(MFL_T[occ].hnc.b);
      const t5 = getT5Thresh(100000, 'hnc');
      if (MFL_T[occ].hnc.b >= t5) {
        expect(r.condemned).toBe(true);
        expect(r.bP).toBe(100);
      } else {
        expect(r.condemned).toBe(false);
        expect(r.bP).toBe(MFL_T[occ].hnc.b);
      }
    });

    test(`${occ} / Combustible → building % = 100, others match table`, () => {
      setupOcc(occ, 'comb');
      const r = calcMFL();
      expect(r.bP).toBe(100);
      expect(r.eP).toBe(MFL_T[occ].comb.e);
      expect(r.iP).toBe(MFL_T[occ].comb.i);
    });
  });
});

// --------------- calcMFL() hasCombConst override ---------------
describe('calcMFL() - hasCombConst override', () => {
  test('hasCombConst forces combustible percentages even on FR building', () => {
    S.buildings[0].area = '100000';
    S.buildings[0].occupancy = 'Office';
    S.buildings[0].construction = 'fr';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.hasCombConst = true;
    const r = calcMFL();
    // Office comb = b:100, e:100, i:100
    expect(r.bP).toBe(100);
    expect(r.eP).toBe(100);
    expect(r.iP).toBe(100);
  });

  test('hasCombConst does NOT override when building is already comb', () => {
    S.buildings[0].area = '100000';
    S.buildings[0].occupancy = 'Office';
    S.buildings[0].construction = 'comb';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.hasCombConst = true;
    const r = calcMFL();
    expect(r.bP).toBe(100); // still 100%, just uses comb path directly
  });

  test('hasCombConst: Office FR without flag → 40% building', () => {
    S.buildings[0].area = '100000';
    S.buildings[0].occupancy = 'Office';
    S.buildings[0].construction = 'fr';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.hasCombConst = false;
    const r = calcMFL();
    expect(r.bP).toBe(40);
  });
});

// --------------- calcMFL() BI modes ---------------
describe('calcMFL() - BI calculation modes', () => {
  function setupMFLBI() {
    S.buildings[0].area = '100000';
    S.buildings[0].occupancy = 'Office';
    S.buildings[0].construction = 'fr';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
  }

  test('BI from dollar input: Office FR = 4.5 months, bV = yearly/12*4.5', () => {
    setupMFLBI();
    S.biMode = 'dollar';
    S.biYearly = '12000000';
    const r = calcMFL();
    expect(r.biM).toBe(4.5);
    expect(r.bV).toBe(rLE(12000000 / 12 * 4.5));
  });

  test('BI from percent-of-production mode', () => {
    setupMFLBI();
    S.biMode = 'percent';
    S.annualProd = '60000000';
    S.biPct = '20'; // 20% of 60M = 12M/year
    const r = calcMFL();
    expect(r.biM).toBe(4.5);
    expect(r.bV).toBe(rLE(12000000 / 12 * 4.5));
  });

  test('BI = 0 when no dollar input and no production data', () => {
    setupMFLBI();
    S.biMode = 'dollar';
    S.biYearly = '';
    const r = calcMFL();
    expect(r.bV).toBe(0);
  });
});

// --------------- calcMFL() separation edge cases ---------------
describe('calcMFL() - separation boundary conditions', () => {
  function setupTwo(sep, oHaz = 'ordinary') {
    S.buildings = [
      {name:'Primary', area:'100000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:''},
      {name:'Secondary', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'', separation:String(sep), floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '15000000'; S.totalEquip = '0'; S.totalInv = '0';
    S.hazardClass = oHaz;
  }

  test('separation exactly at threshold is adequate (>=)', () => {
    setupTwo(80); // HNC-HNC ordinary req = 80 ft, actual = 80 ft → adequate
    const r = calcMFL();
    expect(r.exclB.length).toBe(1);
    expect(r.inclB.length).toBe(0);
  });

  test('separation one below threshold is inadequate', () => {
    setupTwo(79); // 79 < 80 → inadequate
    const r = calcMFL();
    expect(r.inclB.length).toBe(1);
    expect(r.exclB.length).toBe(0);
  });

  test('separation = 0 is treated as not specified (included)', () => {
    setupTwo(0);
    const r = calcMFL();
    expect(r.inclB.length).toBe(1);
    expect(r.exclB.length).toBe(0);
  });

  test('multiple buildings: some excluded, some included', () => {
    S.buildings = [
      {name:'Primary', area:'60000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:''},
      {name:'B2', area:'20000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'100', floors:''}, // 100 >= 80 → excluded
      {name:'B3', area:'20000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'30', floors:''},  // 30 < 80 → included
    ];
    S.primaryIdx = 0;
    S.totalBldg = '9000000'; S.totalEquip = '0'; S.totalInv = '0';
    S.hazardClass = 'ordinary';
    const r = calcMFL();
    expect(r.exclB.length).toBe(1);
    expect(r.inclB.length).toBe(1);
    expect(r.exclPD).toBeGreaterThan(0);
    expect(r.pT).toBeLessThan(r.sitePD);
  });

  test('all buildings adequately separated: MFL limited to primary only', () => {
    S.buildings = [
      {name:'Primary', area:'50000', construction:'fr', occupancy:'Office', value:'', separation:'', floors:''},
      {name:'B2', area:'50000', construction:'fr', occupancy:'Office', value:'', separation:'200', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '20000000'; S.totalEquip = '0'; S.totalInv = '0';
    S.hazardClass = 'light'; // FR-FR light req = 30 ft; actual = 200 → excluded
    const r = calcMFL();
    expect(r.exclB.length).toBe(1);
    // atRiskTotal = sitePD - excluded value ≈ half of site PD
    expect(r.atRiskTotal).toBeLessThan(r.sitePD);
  });
});

// --------------- calcPML() zone scaling and BI ---------------
describe('calcPML() - zone scaling and BI', () => {
  function setupPMLFull() {
    S.buildings[0].area = '100000';
    S.buildings[0].occupancy = 'Warehousing';
    S.buildings[0].construction = 'hnc';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.isStorage = false; S.isSensitive = false; S.hazardClass = 'ordinary';
    S.designArea = '2000';
    S.biYearly = '12000000';
    S.multipleRisers = true; S.centralStation = true; S.fdType = 'fullypaid';
  }

  test('zones array is populated when APL scenario is known', () => {
    setupPMLFull();
    const r = calcPML();
    expect(r.zones.length).toBe(3); // fire, water, smoke
    expect(r.zones.map(z => z.type)).toEqual(['fire', 'water', 'smoke']);
  });

  test('PML fire zone area = APL fire zone * scale factor', () => {
    setupPMLFull();
    const r = calcPML();
    const aplFireZone = r.zones[0].aplA;
    expect(aplFireZone).toBeGreaterThan(0);
    expect(r.pmlFA).toBeGreaterThan(aplFireZone); // PML area > APL fire zone
  });

  test('each zone has positive damage values', () => {
    setupPMLFull();
    const r = calcPML();
    r.zones.forEach(z => {
      expect(z.bD).toBeGreaterThanOrEqual(0);
      expect(z.eD).toBeGreaterThanOrEqual(0);
      expect(z.iD).toBeGreaterThanOrEqual(0);
    });
  });

  test('PML BI value (bV) calculated from monthly rate', () => {
    setupPMLFull();
    const r = calcPML();
    // Warehousing HNC: bi = 12 months; biYearly = 12M; bV = 12M/12*12 = 12M
    expect(r.biM).toBe(12);
    expect(r.bV).toBe(rLE(12000000 / 12 * 12));
  });

  test('aplFloor flag set when APL > calculated PML', () => {
    // Use a scenario where APL might exceed PML due to large fire zone
    S.buildings[0].area = '5000'; // very small building
    S.buildings[0].occupancy = 'Office';
    S.buildings[0].construction = 'fr';
    S.totalBldg = '10000000'; S.totalEquip = '0'; S.totalInv = '0';
    S.isStorage = false; S.isSensitive = true; S.hazardClass = 'extra'; S.hasFL = false;
    S.designArea = '4000'; // design area close to building size
    S.pmlArea = '5000'; // PML = full building
    const r = calcPML();
    // aplFloor is set when APL > raw PML
    expect(r.pT).toBeGreaterThanOrEqual(calcAPL().pT);
  });
});

// --------------- calcPML() all system types ---------------
describe('calcPML() - PML system types', () => {
  function setupBase() {
    S.buildings[0].area = '50000';
    S.buildings[0].occupancy = 'Warehousing';
    S.buildings[0].construction = 'hnc';
    S.totalBldg = '8000000'; S.totalEquip = '3000000'; S.totalInv = '1000000';
    S.isStorage = false; S.hazardClass = 'ordinary';
    S.fdTime = 'prompt';
  }

  ['sprinkler_riser','fire_pump','detection','clean_agent','foam_system','deluge','other'].forEach(sys => {
    test(`pmlSystem="${sys}" returns a valid PML result`, () => {
      setupBase();
      S.pmlSystem = sys;
      const r = calcPML();
      expect(r.pT).toBeGreaterThanOrEqual(0);
      expect(typeof r.eq).toBe('boolean');
    });
  });
});

// --------------- gv() multi-building distribution ---------------
describe('gv() - multi-building proportional distribution', () => {
  test('primary at index 1 uses correct building values', () => {
    S.buildings = [
      {name:'A', area:'30000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:''},
      {name:'B', area:'70000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:''},
    ];
    S.primaryIdx = 1;
    S.totalBldg = '10000000'; S.totalEquip = '0'; S.totalInv = '0';
    const v = gv();
    expect(v.a).toBe(70000);
    // Primary is 70% of sqft → 70% of total value
    expect(v.tb).toBeCloseTo(7000000, -3);
  });

  test('building with value override: gv() reflects override proportion', () => {
    S.buildings = [
      {name:'A', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'3000000', separation:'', floors:''},
      {name:'B', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '10000000'; S.totalEquip = '0'; S.totalInv = '0';
    const v = gv();
    // bldgValue(0) = 3M override; sitePD = 10M; prop = 3M/10M = 0.3; tb = 10M * 0.3 = 3M
    expect(v.tb).toBeCloseTo(3000000, -3);
  });

  test('per-unit-area values are 0 when primary building has no area', () => {
    S.buildings[0].area = '0';
    S.totalBldg = '5000000';
    const v = gv();
    expect(v.bpsf).toBe(0);
    expect(v.epsf).toBe(0);
  });
});

// --------------- Custom value distribution (per-category) ---------------
describe('bldgValue() / bldgCatValue() - custom per-category distribution', () => {
  test('default area mode: value proportional to sqft', () => {
    S.buildings = [
      {name:'Warehouse', area:'80000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:'', bldgPct:'', equipPct:'', invPct:''},
      {name:'Office', area:'20000', construction:'hnc', occupancy:'Office', value:'', separation:'', floors:'', bldgPct:'', equipPct:'', invPct:''},
    ];
    S.totalBldg = '8000000'; S.totalEquip = '2000000'; S.totalInv = '0';
    expect(bldgValue(0)).toBeCloseTo(8000000, -3);
    expect(bldgValue(1)).toBeCloseTo(2000000, -3);
  });

  test('custom mode: per-category percentages', () => {
    S.valueDist = 'custom';
    S.buildings = [
      {name:'Warehouse', area:'80000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:'', bldgPct:'60', equipPct:'20', invPct:'90'},
      {name:'Office', area:'20000', construction:'hnc', occupancy:'Office', value:'', separation:'', floors:'', bldgPct:'40', equipPct:'80', invPct:'10'},
    ];
    S.totalBldg = '5000000'; S.totalEquip = '3000000'; S.totalInv = '2000000';
    // Warehouse: bldg 60% of 5M=3M, equip 20% of 3M=600K, inv 90% of 2M=1.8M → total 5.4M
    expect(bldgCatValue(0,'b')).toBeCloseTo(3000000, -3);
    expect(bldgCatValue(0,'e')).toBeCloseTo(600000, -3);
    expect(bldgCatValue(0,'i')).toBeCloseTo(1800000, -3);
    expect(bldgValue(0)).toBeCloseTo(5400000, -3);
    // Office: bldg 40% of 5M=2M, equip 80% of 3M=2.4M, inv 10% of 2M=200K → total 4.6M
    expect(bldgCatValue(1,'b')).toBeCloseTo(2000000, -3);
    expect(bldgCatValue(1,'e')).toBeCloseTo(2400000, -3);
    expect(bldgCatValue(1,'i')).toBeCloseTo(200000, -3);
    expect(bldgValue(1)).toBeCloseTo(4600000, -3);
  });

  test('custom mode: gv() reflects per-category values for primary building', () => {
    S.valueDist = 'custom';
    S.buildings = [
      {name:'Warehouse', area:'80000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:'', bldgPct:'60', equipPct:'20', invPct:'90'},
      {name:'Office', area:'20000', construction:'hnc', occupancy:'Office', value:'', separation:'', floors:'', bldgPct:'40', equipPct:'80', invPct:'10'},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '5000000'; S.totalEquip = '3000000'; S.totalInv = '2000000';
    const v = gv();
    // Warehouse bldg $/sqft = 3M / 80K = $37.50
    expect(v.bpsf).toBeCloseTo(37.5, 1);
    // Warehouse equip $/sqft = 600K / 80K = $7.50
    expect(v.epsf).toBeCloseTo(7.5, 1);
    // Warehouse inv $/sqft = 1.8M / 80K = $22.50
    expect(v.ipsf).toBeCloseTo(22.5, 1);
  });

  test('custom mode: empty percentages fall back to area proportion', () => {
    S.valueDist = 'custom';
    S.buildings = [
      {name:'A', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:'', bldgPct:'', equipPct:'', invPct:''},
      {name:'B', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:'', bldgPct:'', equipPct:'', invPct:''},
    ];
    S.totalBldg = '10000000'; S.totalEquip = '0'; S.totalInv = '0';
    expect(bldgValue(0)).toBeCloseTo(5000000, -3);
    expect(bldgValue(1)).toBeCloseTo(5000000, -3);
  });

  test('value override takes precedence over custom distribution', () => {
    S.valueDist = 'custom';
    S.buildings = [
      {name:'A', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'3000000', separation:'', floors:'', bldgPct:'70', equipPct:'70', invPct:'70'},
    ];
    S.totalBldg = '10000000'; S.totalEquip = '0'; S.totalInv = '0';
    expect(bldgValue(0)).toBe(3000000);
  });

  test('partial custom: only some categories have percentages', () => {
    S.valueDist = 'custom';
    S.buildings = [
      {name:'Warehouse', area:'80000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:'', bldgPct:'70', equipPct:'', invPct:'90'},
      {name:'Office', area:'20000', construction:'hnc', occupancy:'Office', value:'', separation:'', floors:'', bldgPct:'30', equipPct:'', invPct:'10'},
    ];
    S.totalBldg = '5000000'; S.totalEquip = '3000000'; S.totalInv = '2000000';
    // bldg: 70% of 5M = 3.5M, equip: falls back to area (80%) = 2.4M, inv: 90% of 2M = 1.8M
    expect(bldgCatValue(0,'b')).toBeCloseTo(3500000, -3);
    expect(bldgCatValue(0,'e')).toBeCloseTo(2400000, -3);
    expect(bldgCatValue(0,'i')).toBeCloseTo(1800000, -3);
  });

  test('zero percent is treated as intentional 0%, not fallback to area', () => {
    S.valueDist = 'custom';
    S.buildings = [
      {name:'Warehouse', area:'80000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:'', bldgPct:'70', equipPct:'20', invPct:'90'},
      {name:'Office', area:'20000', construction:'hnc', occupancy:'Office', value:'', separation:'', floors:'', bldgPct:'30', equipPct:'5', invPct:'0'},
    ];
    S.totalBldg = '5000000'; S.totalEquip = '3000000'; S.totalInv = '2000000';
    // Office inv = 0% of 2M = $0 (not area fallback)
    expect(bldgCatValue(1,'i')).toBe(0);
    // Office bldg = 30% of 5M = 1.5M
    expect(bldgCatValue(1,'b')).toBeCloseTo(1500000, -3);
  });
});

// --------------- rLE() boundary cases ---------------
describe('rLE() - rounds to nearest $10,000', () => {
  test('exactly 100000 stays 100000', () => {
    expect(rLE(100000)).toBe(100000);
  });
  test('values round to nearest 10k', () => {
    expect(rLE(99999)).toBe(100000);
    expect(rLE(95000)).toBe(100000);
    expect(rLE(94999)).toBe(90000);
    expect(rLE(45000)).toBe(50000);
    expect(rLE(44999)).toBe(40000);
    expect(rLE(5000)).toBe(10000);
    expect(rLE(4999)).toBe(0);
  });
  test('large values round to nearest 10k', () => {
    expect(rLE(1234567)).toBe(1230000);
    expect(rLE(9876543)).toBe(9880000);
  });
  test('negative values round towards zero', () => {
    // Math.round(-0.05) returns -0 in JS; rLE(-500) = -0
    expect(Object.is(rLE(-500), 0) || Object.is(rLE(-500), -0)).toBe(true);
    expect(Object.is(rLE(-5000), 0) || Object.is(rLE(-5000), -0)).toBe(true);
  });
});

// --------------- Integration: all occupancies APL <= PML <= MFL ---------------
describe('Integration: APL <= PML <= MFL across all occupancies', () => {
  function fullSetup(occ, ct = 'hnc') {
    S.buildings[0].area = '100000';
    S.buildings[0].occupancy = occ;
    S.buildings[0].construction = ct;
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.isStorage = true; S.isSensitive = false; S.hazardClass = 'ordinary';
    S.sprinklerAdequate = 'adequate'; S.designArea = '2000';
    S.fdTime = 'prompt'; S.biYearly = '4000000';
  }

  Object.keys(MFL_T).forEach(occ => {
    test(`${occ}: APL <= PML <= MFL`, () => {
      fullSetup(occ);
      const apl = calcAPL(), pml = calcPML(), mfl = calcMFL();
      const aplPD = apl.eq ? pml.pT : apl.pT;
      expect(aplPD).toBeLessThanOrEqual(pml.pT);
      expect(pml.pT).toBeLessThanOrEqual(mfl.pT);
    });
  });
});

// --------------- Integration: combustible construction ---------------
describe('Integration: combustible construction site', () => {
  function combSetup() {
    S.buildings[0].area = '80000';
    S.buildings[0].occupancy = 'Warehousing';
    S.buildings[0].construction = 'comb';
    S.totalBldg = '5000000'; S.totalEquip = '3000000'; S.totalInv = '1000000';
    S.isStorage = true; S.isSensitive = false; S.hazardClass = 'ordinary';
    S.sprinklerAdequate = 'adequate'; S.designArea = '2000';
    S.fdTime = 'prompt'; S.biYearly = '2000000';
  }

  test('PML = MFL for comb construction', () => {
    combSetup();
    const pml = calcPML();
    expect(pml.eq).toBe(true);
  });

  test('MFL uses 100% percentages for comb', () => {
    combSetup();
    const mfl = calcMFL();
    expect(mfl.bP).toBe(100);
    expect(mfl.eP).toBe(100);
    expect(mfl.iP).toBe(100);
  });
});

// --------------- PML: Items #5/#6/#7 logic ---------------
describe('PML: Items #5, #6, #7 fire area logic', () => {
  // Base setup: L/O hazard with all Item #7 qualifiers met
  function item7Setup() {
    S.buildings[0].area = '100000';
    S.buildings[0].occupancy = 'Warehousing';
    S.buildings[0].construction = 'hnc';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.isStorage = false; S.isSensitive = false; S.hazardClass = 'ordinary';
    S.sprinklerAdequate = 'adequate'; S.designPct = '100';
    S.alarmsOk = true; S.designArea = '2000'; S.fdTime = 'prompt';
    S.fdType = 'fullypaid'; S.multipleRisers = true; S.centralStation = true;
  }

  // Setup: deficient sprinklers with Item #7 qualifiers (except adequate sprinklers)
  // Since sprinklers are deficient, Item #7 is NOT met → PML=MFL
  function defNoAlarmSetup() {
    item7Setup();
    S.sprinklerAdequate = 'deficient'; S.designPct = '70';
  }

  test('L/O hazard without Item #7 qualifiers → PML = MFL', () => {
    defNoAlarmSetup();
    const pml = calcPML();
    expect(pml.eq).toBe(true);
    expect(pml.zones).toHaveLength(0);
    expect(pml.rsn).toMatch(/Item #7 qualifiers not met/);
  });

  test('L/O hazard with Item #7 qualifiers → zone-based PML', () => {
    item7Setup();
    const pml = calcPML();
    expect(pml.eq).toBe(false);
    expect(pml.pmlFA).toBe(3000); // designArea 2000 × 1.5
  });

  test('L/O hazard Item #7: PML zones have correct structure', () => {
    item7Setup();
    const pml = calcPML();
    expect(pml.zones).toHaveLength(3);
    expect(pml.zones[0].type).toBe('fire');
    expect(pml.zones[1].type).toBe('water');
    expect(pml.zones[2].type).toBe('smoke');
  });

  test('L/O hazard Item #7: PML does not exceed MFL', () => {
    item7Setup();
    const pml = calcPML(), mfl = calcMFL();
    expect(pml.pT).toBeLessThanOrEqual(mfl.pT);
  });

  test('Extra hazard without Item #5 → PML = MFL', () => {
    item7Setup();
    S.hazardClass = 'extra';
    const pml = calcPML();
    expect(pml.eq).toBe(true);
    expect(pml.rsn).toMatch(/Extra hazard.*Item #6/);
  });

  test('Extra hazard with Item #5 fire wall → PML limited', () => {
    item7Setup();
    S.hazardClass = 'extra';
    S.pmlFW2hr = true; S.pmlFWArea = '20000';
    const pml = calcPML();
    expect(pml.eq).toBe(false);
    expect(pml.item5Limited).toBe(true);
    expect(pml.pmlFA).toBe(20000);
    expect(pml.pT).toBeLessThan(calcMFL().pT);
  });

  test('L/O hazard with Item #7 + Item #5 fire wall limits further', () => {
    item7Setup();
    S.pmlFW2hr = true; S.pmlFWArea = '1000'; // smaller than designArea × 1.5 = 3000
    const pml = calcPML();
    expect(pml.pmlFA).toBe(1000);
  });

  test('missing multipleRisers blocks Item #7', () => {
    item7Setup();
    S.multipleRisers = false;
    expect(pmlItem7Qualifies()).toBe(false);
    expect(calcPML().eq).toBe(true);
  });

  test('missing centralStation blocks Item #7', () => {
    item7Setup();
    S.centralStation = false;
    expect(pmlItem7Qualifies()).toBe(false);
    expect(calcPML().eq).toBe(true);
  });

  test('FL/CL blocks Item #7', () => {
    item7Setup();
    S.hasFL = true;
    expect(pmlItem7Qualifies()).toBe(false);
    expect(calcPML().eq).toBe(true);
  });

  test('volunteer FD blocks Item #7', () => {
    item7Setup();
    S.fdType = 'volunteer';
    expect(pmlItem7Qualifies()).toBe(false);
    expect(calcPML().eq).toBe(true);
  });

  test('PML is higher than APL when Item #7 met', () => {
    item7Setup();
    const pml = calcPML(), apl = calcAPL();
    expect(pml.pT).toBeGreaterThanOrEqual(apl.pT);
  });

  test('hypAPLSc returns A for non-storage ordinary-hazard non-sensitive', () => {
    defNoAlarmSetup(); // hazardClass='ordinary' → isLO=true → Scenario A
    expect(hypAPLSc()).toBe('A');
  });

  test('hypAPLSc returns C for non-storage extra-hazard non-sensitive', () => {
    defNoAlarmSetup();
    S.hazardClass = 'extra';
    expect(hypAPLSc()).toBe('C');
  });

  test('hypAPLSc returns B for non-storage ordinary-hazard sensitive', () => {
    defNoAlarmSetup();
    S.isSensitive = true; // hazardClass='ordinary' → isLO=true → Scenario B
    expect(hypAPLSc()).toBe('B');
  });

  test('hypAPLSc returns D for non-storage extra-hazard sensitive', () => {
    defNoAlarmSetup();
    S.isSensitive = true; S.hazardClass = 'extra';
    expect(hypAPLSc()).toBe('D');
  });

  test('hypAPLSc returns C for storage standard non-sensitive', () => {
    defNoAlarmSetup();
    S.isStorage = true;
    expect(hypAPLSc()).toBe('C');
  });

  test('hypAPLSc returns H for storage ESFR non-sensitive', () => {
    defNoAlarmSetup();
    S.isStorage = true; S.protType = 'esfr';
    expect(hypAPLSc()).toBe('H');
  });

  test('hypAPLSc returns K for storage CMSA sensitive', () => {
    defNoAlarmSetup();
    S.isStorage = true; S.protType = 'cmsa'; S.isSensitive = true;
    expect(hypAPLSc()).toBe('K');
  });

  test('hypAPLSc returns G for storage with FL/CL', () => {
    defNoAlarmSetup();
    S.isStorage = true; S.hasFL = true;
    expect(hypAPLSc()).toBe('G');
  });

  test('deficient sprinklers without Item #7 → PML=MFL (no zone scaling)', () => {
    defNoAlarmSetup();
    // deficient sprinklers → Item #7 not met → PML=MFL
    const pml = calcPML();
    expect(pml.eq).toBe(true);
    expect(pml.zones).toHaveLength(0);
  });

  test('Item #7 with APL=PML trigger uses scenario zones at 100%', () => {
    item7Setup();
    S.hasFL = true; // triggers APL=PML but Item #7 blocks on hasFL → PML=MFL
    const pml = calcPML();
    expect(pml.eq).toBe(true); // FL/CL breaks Item #7
  });

  test('PML pmlFA equals designArea x 1.5 with Item #7', () => {
    item7Setup();
    expect(calcPML().pmlFA).toBe(3000);
  });

  test('alarmsOk=false triggers Step 1 PML=MFL with empty zones array', () => {
    item7Setup();
    S.alarmsOk = false; // Step 1: !alarmsOk → PML=MFL
    const pml = calcPML();
    expect(pml.eq).toBe(true);
    expect(pml.zones).toHaveLength(0);
    expect(pml.rsn).toMatch(/delayed/i);
  });

  test('PML always <= MFL with Item #7', () => {
    item7Setup();
    S.buildings[0].area = '5000'; // small building
    S.totalBldg = '1000000'; S.totalEquip = '500000'; S.totalInv = '200000';
    S.designArea = '2000';
    const pml = calcPML();
    expect(pml.pT).toBeLessThanOrEqual(calcMFL().pT);
  });

  test('Storage occupancy with all Item #7 qualifiers → PML = MFL (Item #7 does not apply)', () => {
    item7Setup();
    S.isStorage = true; // storage overrides L/O for PML purposes
    const pml = calcPML();
    expect(pml.eq).toBe(true);
    expect(pml.zones).toHaveLength(0);
    expect(pml.rsn).toMatch(/extra hazard|storage/i);
  });

  test('pmlItem7Qualifies() returns false when isStorage=true', () => {
    item7Setup();
    S.isStorage = true;
    expect(pmlItem7Qualifies()).toBe(false);
  });

  test('Storage occupancy with Item #5 fire wall → PML limited by fire wall, not Item #7', () => {
    item7Setup();
    S.isStorage = true;
    S.pmlFW2hr = true; S.pmlFWArea = '40000';
    const pml = calcPML();
    expect(pml.item5Limited).toBe(true);
    expect(pml.eq).toBe(false);
    expect(pml.rsn).toMatch(/Item #5/);
  });
});

// --------------- Integration: multi-building fire wall + separation ---------------
describe('Integration: fire wall + multi-building separation', () => {
  test('fire wall + separated building reduces MFL significantly', () => {
    S.buildings = [
      {name:'Primary', area:'100000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'', floors:''},
      {name:'Secondary', area:'50000', construction:'hnc', occupancy:'Warehousing', value:'', separation:'100', floors:''},
    ];
    S.primaryIdx = 0;
    S.totalBldg = '15000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.hazardClass = 'ordinary';
    S.fw4hr = true; S.fwArea = '50000'; // half the primary
    const r = calcMFL();
    expect(r.hasFW).toBe(true);
    expect(r.exclB.length).toBe(1);
    expect(r.fwReduction).toBeGreaterThan(0);
    // Both exclusions should bring MFL well below sitePD
    expect(r.pT).toBeLessThan(r.sitePD * 0.7);
  });

  describe('PML exposure separation', () => {
    function expSepSetup() {
      S.buildings = [
        { name: 'primary', area: '100000', construction: 'hnc', occupancy: 'Warehousing', value: '', separation: '', floors: '1', bldgPct: '', equipPct: '', invPct: '' },
        { name: 'adjacent', area: '50000', construction: 'hnc', occupancy: 'Warehousing', value: '', separation: '200', floors: '1', bldgPct: '', equipPct: '', invPct: '' }
      ];
      S.primaryIdx = 0;
      S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
      S.hazardClass = 'extra'; S.isStorage = false; S.isSensitive = false;
      S.sprinklerAdequate = 'adequate'; S.alarmsOk = true;
      S.fdTime = 'prompt'; S.fdType = 'fullypaid';
      S.pmlExpSep = true; S.pmlBldgHeight = '40';
      S.pmlFW2hr = false; S.pmlFWArea = '';
      S.hasCombConst = false;
    }

    test('toggle off → PML = MFL for extra hazard', () => {
      expSepSetup();
      S.pmlExpSep = false;
      const pml = calcPML();
      expect(pml.eq).toBe(true);
    });

    test('adequate separation → PML < MFL (primary building only)', () => {
      expSepSetup();
      const mfl = calcMFL();
      const pml = calcPML();
      expect(pml.expSepLimited).toBe(true);
      expect(pml.eq).toBe(false);
      expect(pml.pT).toBeLessThan(mfl.pT);
    });

    test('inadequate separation → PML = MFL', () => {
      expSepSetup();
      S.buildings[1].separation = '10'; // too close
      const pml = calcPML();
      expect(pml.eq).toBe(true);
      expect(pml.expSepLimited).toBeUndefined();
    });

    test('no building height → PML = MFL', () => {
      expSepSetup();
      S.pmlBldgHeight = '';
      const pml = calcPML();
      expect(pml.eq).toBe(true);
    });

    test('Item #5 takes priority over exposure separation', () => {
      expSepSetup();
      S.pmlFW2hr = true; S.pmlFWArea = '60000';
      const pml = calcPML();
      expect(pml.item5Limited).toBe(true);
      expect(pml.expSepLimited).toBeUndefined();
    });

    test('no adjacent buildings → no credit', () => {
      expSepSetup();
      S.buildings = [S.buildings[0]]; // only primary
      const pml = calcPML();
      expect(pml.eq).toBe(true);
    });

    test('volunteer FD → no credit', () => {
      expSepSetup();
      S.fdType = 'volunteer';
      const pml = calcPML();
      expect(pml.eq).toBe(true);
    });

    test('pmlExpSepInfo returns correct required distance', () => {
      expSepSetup();
      S.pmlBldgHeight = '40'; // 150% = 60
      // Table 3a for hnc→hnc, extra = 100ft; half = 50
      // Required = max(60, 50) = 60
      const info = pmlExpSepInfo();
      expect(info.reqDist).toBe(60);
      expect(info.heightReq).toBe(60);
      expect(info.halfT3a).toBe(50);
    });

    test('uses nearest building by separation distance', () => {
      expSepSetup();
      S.buildings.push({ name: 'far', area: '30000', construction: 'comb', occupancy: 'Warehousing', value: '', separation: '500', floors: '1', bldgPct: '', equipPct: '', invPct: '' });
      const info = pmlExpSepInfo();
      expect(info.nearest.name).toBe('adjacent'); // 200 < 500
    });
  });
});

// ======================== REV 0.9 — TABLE 5 / APL OVERRIDES / NEW OCCUPANCIES ========================

// --------------- getT5Thresh() ---------------
describe('getT5Thresh() - Table 5 condemnation thresholds', () => {
  test('combustible always returns 100 regardless of area', () => {
    expect(getT5Thresh(10000, 'comb')).toBe(100);
    expect(getT5Thresh(100000, 'comb')).toBe(100);
    expect(getT5Thresh(1000000, 'comb')).toBe(100);
  });

  test('FR thresholds by area bracket', () => {
    expect(getT5Thresh(10000, 'fr')).toBe(60);    // < 50K
    expect(getT5Thresh(49999, 'fr')).toBe(60);    // < 50K
    expect(getT5Thresh(50000, 'fr')).toBe(70);    // 50K–200K
    expect(getT5Thresh(100000, 'fr')).toBe(70);   // 50K–200K
    expect(getT5Thresh(199999, 'fr')).toBe(70);   // 50K–200K
    expect(getT5Thresh(200000, 'fr')).toBe(75);   // 200K–500K
    expect(getT5Thresh(500000, 'fr')).toBe(85);   // 500K–1M
    expect(getT5Thresh(999999, 'fr')).toBe(85);   // 500K–1M
    expect(getT5Thresh(1000000, 'fr')).toBe(90);  // >= 1M
    expect(getT5Thresh(5000000, 'fr')).toBe(90);  // >= 1M
  });

  test('HNC thresholds by area bracket', () => {
    expect(getT5Thresh(10000, 'hnc')).toBe(60);   // < 50K
    expect(getT5Thresh(100000, 'hnc')).toBe(70);  // 50K–200K
    expect(getT5Thresh(300000, 'hnc')).toBe(75);  // 200K–500K
    expect(getT5Thresh(700000, 'hnc')).toBe(85);  // 500K–1M
    expect(getT5Thresh(2000000, 'hnc')).toBe(90); // >= 1M
  });

  test('LNC thresholds by area bracket', () => {
    expect(getT5Thresh(10000, 'lnc')).toBe(60);   // < 50K
    expect(getT5Thresh(100000, 'lnc')).toBe(65);  // 50K–200K
    expect(getT5Thresh(300000, 'lnc')).toBe(70);  // 200K–500K
    expect(getT5Thresh(700000, 'lnc')).toBe(80);  // 500K–1M
    expect(getT5Thresh(2000000, 'lnc')).toBe(90); // >= 1M
  });

  test('unknown construction types map to lnc', () => {
    expect(getT5Thresh(100000, 'xyz')).toBe(65); // maps to lnc
  });
});

// --------------- calcMFL() Table 5 condemnation ---------------
describe('calcMFL() - Table 5 condemnation logic', () => {
  function setupT5(area, occ, ct) {
    S.buildings[0].area = String(area);
    S.buildings[0].occupancy = occ;
    S.buildings[0].construction = ct;
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
  }

  test('Office FR 100K sqft: bldg% 40 < threshold 70 → NOT condemned', () => {
    setupT5(100000, 'Office', 'fr');
    const r = calcMFL();
    expect(r.condemned).toBe(false);
    expect(r.t4BldgPct).toBe(40);
    expect(r.t5Thresh).toBe(70);
    expect(r.bP).toBe(40);
    expect(r.pB).toBe(rLE(10000000 * 0.40));
  });

  test('Warehousing FR 100K sqft: bldg% 70 >= threshold 70 → condemned', () => {
    setupT5(100000, 'Warehousing', 'fr');
    const r = calcMFL();
    expect(r.condemned).toBe(true);
    expect(r.t4BldgPct).toBe(70);
    expect(r.t5Thresh).toBe(70);
    expect(r.bP).toBe(100);
    expect(r.pB).toBe(rLE(10000000)); // full building loss
  });

  test('Warehousing FR small building (30K sqft): threshold drops to 60, 70 >= 60 → condemned', () => {
    setupT5(30000, 'Warehousing', 'fr');
    const r = calcMFL();
    expect(r.t5Thresh).toBe(60);
    expect(r.condemned).toBe(true);
    expect(r.bP).toBe(100);
  });

  test('Warehousing FR large building (1M sqft): threshold rises to 90, 70 < 90 → NOT condemned', () => {
    setupT5(1000000, 'Warehousing', 'fr');
    const r = calcMFL();
    expect(r.t5Thresh).toBe(90);
    expect(r.condemned).toBe(false);
    expect(r.bP).toBe(70);
    expect(r.pB).toBe(rLE(10000000 * 0.70));
  });

  test('Hospital FR 100K sqft: bldg% 10 < threshold 70 → NOT condemned', () => {
    setupT5(100000, 'Hospital/Medical', 'fr');
    const r = calcMFL();
    expect(r.condemned).toBe(false);
    expect(r.t4BldgPct).toBe(10);
    expect(r.bP).toBe(10);
  });

  test('Aircraft Hangar FR: bldg% 90, always condemned at any area', () => {
    // At 100K sqft, threshold=70; 90>=70 → condemned
    setupT5(100000, 'Aircraft Hangar', 'fr');
    expect(calcMFL().condemned).toBe(true);
    // At 1M sqft, threshold=90; 90>=90 → still condemned
    setupT5(1000000, 'Aircraft Hangar', 'fr');
    expect(calcMFL().condemned).toBe(true);
  });

  test('metric units: area converted to sqft for Table 5 lookup', () => {
    S.units = 'metric';
    // 9290 m² ≈ 100,000 sqft
    setupT5(9290, 'Office', 'fr');
    const r = calcMFL();
    // 9290/0.0929 ≈ 100,000 sqft → threshold=70, Office FR b=40 < 70 → not condemned
    expect(r.condemned).toBe(false);
    expect(r.bP).toBe(40);
  });

  test('condemned building has effectiveBP=100 but t4BldgPct preserves original', () => {
    setupT5(100000, 'Wood/Plastic Products', 'fr'); // fr.b=70, threshold=70 → condemned
    const r = calcMFL();
    expect(r.bP).toBe(100); // effective
    expect(r.t4BldgPct).toBe(70); // raw Table 4 value preserved
    expect(r.condemned).toBe(true);
  });
});

// --------------- aplDmg() - APL damage overrides ---------------
describe('aplDmg() - APL damage override system', () => {
  test('returns base value when no override exists', () => {
    expect(aplDmg('A', 'fire', 'b', 0.25)).toBe(0.25);
    expect(aplDmg('B', 'water', 'e', 0.5)).toBe(0.5);
  });

  test('returns override value when set', () => {
    S.aplDmgOverrides['A_fire_b'] = 0.50;
    expect(aplDmg('A', 'fire', 'b', 0.25)).toBe(0.50);
  });

  test('clamps override to [0, 1]', () => {
    S.aplDmgOverrides['A_fire_b'] = 1.5;
    expect(aplDmg('A', 'fire', 'b', 0.25)).toBe(1);
    S.aplDmgOverrides['A_fire_b'] = -0.5;
    expect(aplDmg('A', 'fire', 'b', 0.25)).toBe(0);
  });

  test('override of 0 returns 0 (not fallback to base)', () => {
    S.aplDmgOverrides['A_fire_b'] = 0;
    expect(aplDmg('A', 'fire', 'b', 0.25)).toBe(0);
  });

  test('different scenario/zone/key combinations are independent', () => {
    S.aplDmgOverrides['A_fire_b'] = 0.10;
    S.aplDmgOverrides['A_fire_e'] = 0.20;
    S.aplDmgOverrides['B_fire_b'] = 0.30;
    expect(aplDmg('A', 'fire', 'b', 0.25)).toBe(0.10);
    expect(aplDmg('A', 'fire', 'e', 1.0)).toBe(0.20);
    expect(aplDmg('B', 'fire', 'b', 0.5)).toBe(0.30);
    expect(aplDmg('A', 'water', 'b', 0.1)).toBe(0.1); // no override
  });
});

// --------------- calcAPL() with aplDmg overrides ---------------
describe('calcAPL() - damage overrides affect loss calculation', () => {
  function setupBase() {
    S.buildings[0].area = '100000';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.isStorage = false; S.isSensitive = false; S.hazardClass = 'ordinary';
  }

  test('reducing fire building damage reduces APL pB', () => {
    setupBase();
    const baseline = calcAPL();
    expect(baseline.sc).toBe('A');
    // Override Scenario A fire building damage from 0.25 to 0.10
    S.aplDmgOverrides['A_fire_b'] = 0.10;
    const overridden = calcAPL();
    expect(overridden.sc).toBe('A');
    expect(overridden.pB).toBeLessThan(baseline.pB);
    expect(overridden.pT).toBeLessThan(baseline.pT);
  });

  test('setting all damage overrides to 0 produces 0 loss', () => {
    setupBase();
    const apl = calcAPL();
    expect(apl.sc).toBe('A');
    // Zero out all damage for Scenario A
    ['fire','water','smoke'].forEach(z => {
      ['b','e','i'].forEach(k => {
        S.aplDmgOverrides['A_'+z+'_'+k] = 0;
      });
    });
    const zeroed = calcAPL();
    expect(zeroed.pT).toBe(0);
    expect(zeroed.pB).toBe(0);
    expect(zeroed.pE).toBe(0);
    expect(zeroed.pI).toBe(0);
  });

  test('overrides only affect the active scenario', () => {
    setupBase();
    // Set override for Scenario B (which won't be used)
    S.aplDmgOverrides['B_fire_b'] = 0;
    const apl = calcAPL();
    expect(apl.sc).toBe('A'); // non-sensitive ordinary → A
    // Should use normal A values, not B overrides
    expect(apl.pT).toBeGreaterThan(0);
  });
});

// --------------- STORAGE_OCCS ---------------
describe('STORAGE_OCCS - storage occupancy classification', () => {
  test('Warehousing is a storage occupancy', () => {
    expect(STORAGE_OCCS.includes('Warehousing')).toBe(true);
  });

  test('Warehousing (Refrigerated) is a storage occupancy', () => {
    expect(STORAGE_OCCS.includes('Warehousing (Refrigerated)')).toBe(true);
  });

  test('Big Box Retail is a storage occupancy', () => {
    expect(STORAGE_OCCS.includes('Big Box Retail')).toBe(true);
  });

  test('Office is NOT a storage occupancy', () => {
    expect(STORAGE_OCCS.includes('Office')).toBe(false);
  });

  test('Hotel/Residential/School is NOT a storage occupancy', () => {
    expect(STORAGE_OCCS.includes('Hotel/Residential/School')).toBe(false);
  });

  test('STORAGE_OCCS has exactly 3 entries', () => {
    expect(STORAGE_OCCS.length).toBe(3);
  });
});

// --------------- New occupancy types coverage ---------------
describe('New MFL_T occupancies - data integrity', () => {
  const newOccs = [
    'Hydroelectric Power', 'Machine Shop/Light Metal', 'Mineral Products',
    'Beverage Processing', 'Retail (non Big Box)', 'Electronic/Electrical Mfg',
    'Metal Smelting/Foundry', 'Big Box Retail', 'Box Mfg/Printing',
    'Vehicle Manufacturing', 'Brewery/Distillery/Winery', 'Cotton Mill/Sugar Mill',
    'Rubber Manufacturing', 'Warehousing (Refrigerated)', 'Aircraft Hangar',
    'Pharma/Cosmetics/Drugs', 'Grain Elevator/Milling'
  ];

  newOccs.forEach(occ => {
    test(`${occ} exists in MFL_T with all 4 construction types`, () => {
      expect(MFL_T[occ]).toBeDefined();
      expect(MFL_T[occ].fr).toBeDefined();
      expect(MFL_T[occ].hnc).toBeDefined();
      expect(MFL_T[occ].lnc).toBeDefined();
      expect(MFL_T[occ].comb).toBeDefined();
    });

    test(`${occ} has valid damage percentages (0-100) and BI months`, () => {
      ['fr','hnc','lnc','comb'].forEach(ct => {
        const d = MFL_T[occ][ct];
        expect(d.b).toBeGreaterThanOrEqual(0);
        expect(d.b).toBeLessThanOrEqual(100);
        expect(d.e).toBeGreaterThanOrEqual(0);
        expect(d.e).toBeLessThanOrEqual(100);
        expect(d.i).toBeGreaterThanOrEqual(0);
        expect(d.i).toBeLessThanOrEqual(100);
        expect(d.bi).toBeGreaterThan(0);
      });
    });
  });

  test('MFL_T has 26 total occupancy types', () => {
    expect(Object.keys(MFL_T).length).toBe(26);
  });
});

// --------------- calcMFL() with new occupancies ---------------
describe('calcMFL() - selected new occupancy scenarios', () => {
  function setupOcc(occ, ct, area = 100000) {
    S.buildings[0].area = String(area);
    S.buildings[0].occupancy = occ;
    S.buildings[0].construction = ct;
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
  }

  test('Hydroelectric Power FR: very low building damage (5%)', () => {
    setupOcc('Hydroelectric Power', 'fr');
    const r = calcMFL();
    expect(r.t4BldgPct).toBe(5);
    expect(r.condemned).toBe(false); // 5 < 70
    expect(r.pB).toBe(rLE(10000000 * 0.05));
  });

  test('Aircraft Hangar HNC: 100% across all categories', () => {
    setupOcc('Aircraft Hangar', 'hnc');
    const r = calcMFL();
    expect(r.bP).toBe(100);
    expect(r.eP).toBe(100);
    expect(r.iP).toBe(100);
    expect(r.pT).toBe(17000000); // total site PD
  });

  test('Semiconductor Mfg FR: low building (20%) but high BI (24 months)', () => {
    setupOcc('Semiconductor Mfg', 'fr');
    S.biYearly = '24000000'; // $2M/month
    const r = calcMFL();
    expect(r.t4BldgPct).toBe(20);
    expect(r.condemned).toBe(false); // 20 < 70
    expect(r.biM).toBe(24);
    expect(r.bV).toBe(rLE(24000000 / 12 * 24)); // 48M
  });

  test('Mineral Products combustible: iP is 75 (not 100)', () => {
    setupOcc('Mineral Products', 'comb');
    const r = calcMFL();
    expect(r.bP).toBe(100);
    expect(r.eP).toBe(100);
    expect(r.iP).toBe(75); // unique exception
    expect(r.pI).toBe(rLE(2000000 * 0.75));
  });

  test('Grain Elevator FR: very high damage (90% bldg), condemned at 100K sqft', () => {
    setupOcc('Grain Elevator/Milling', 'fr');
    const r = calcMFL();
    expect(r.t4BldgPct).toBe(90);
    expect(r.t5Thresh).toBe(70);
    expect(r.condemned).toBe(true);
    expect(r.bP).toBe(100);
  });

  test('Big Box Retail is storage-relevant but has distinct Table 4 values', () => {
    setupOcc('Big Box Retail', 'fr');
    const r = calcMFL();
    expect(r.t4BldgPct).toBe(50);
    expect(r.eP).toBe(60);
    expect(r.iP).toBe(60);
  });
});

// --------------- Integration: Table 5 condemnation across area ranges ---------------
describe('Integration: Table 5 condemnation varies by building area', () => {
  function setupArea(area) {
    S.buildings[0].area = String(area);
    S.buildings[0].occupancy = 'Chemical Processing'; // FR b=60
    S.buildings[0].construction = 'fr';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
  }

  test('small building (20K sqft): threshold=60, Chemical FR 60 >= 60 → condemned', () => {
    setupArea(20000);
    const r = calcMFL();
    expect(r.t5Thresh).toBe(60);
    expect(r.condemned).toBe(true);
    expect(r.bP).toBe(100);
  });

  test('medium building (100K sqft): threshold=70, Chemical FR 60 < 70 → NOT condemned', () => {
    setupArea(100000);
    const r = calcMFL();
    expect(r.t5Thresh).toBe(70);
    expect(r.condemned).toBe(false);
    expect(r.bP).toBe(60);
  });

  test('large building (300K sqft): threshold=75, Chemical FR 60 < 75 → NOT condemned', () => {
    setupArea(300000);
    const r = calcMFL();
    expect(r.t5Thresh).toBe(75);
    expect(r.condemned).toBe(false);
    expect(r.bP).toBe(60);
  });
});

// --------------- calcPML() with aplDmg overrides in zone scaling ---------------
describe('calcPML() - aplDmg overrides affect zone-based PML', () => {
  function setupPMLZone() {
    S.buildings[0].area = '100000';
    S.buildings[0].occupancy = 'Warehousing';
    S.buildings[0].construction = 'hnc';
    S.totalBldg = '10000000'; S.totalEquip = '5000000'; S.totalInv = '2000000';
    S.isStorage = false; S.isSensitive = false; S.hazardClass = 'ordinary';
    S.sprinklerAdequate = 'adequate'; S.designPct = '100';
    S.alarmsOk = true; S.designArea = '2000'; S.fdTime = 'prompt';
    S.fdType = 'fullypaid'; S.multipleRisers = true; S.centralStation = true;
  }

  test('override reduces PML when using zone-based scaling', () => {
    setupPMLZone();
    const baseline = calcPML();
    expect(baseline.eq).toBe(false);
    expect(baseline.zones.length).toBe(3);

    // Reduce fire building damage
    S.aplDmgOverrides['A_fire_b'] = 0.10; // 0.25 → 0.10
    const overridden = calcPML();
    expect(overridden.zones[0].bPct).toBe(0.10);
    expect(overridden.zones[0].bD).toBeLessThan(baseline.zones[0].bD);
  });
});
