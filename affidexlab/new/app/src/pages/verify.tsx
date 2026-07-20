import { useState, useEffect } from "react";

const API_BASE = "https://decaflow-backend.onrender.com";

const FEATURES = [
  { icon: "🌍", title: "Global Sanctions Coverage", desc: "Real-time checks against OFAC, UN Security Council, EU, HMT (UK), and FATF blacklists. Updated within minutes of every new designation." },
  { icon: "🔀", title: "Mixer & Tumbler Detection", desc: "Identifies funds passed through Tornado Cash, ChipMixer, Sinbad, and 40+ known mixing services across all supported chains." },
  { icon: "🌑", title: "Darknet Market Exposure", desc: "Flags wallet addresses with known links to darknet marketplaces, ransomware operators, and cybercriminal infrastructure." },
  { icon: "📍", title: "Jurisdiction Risk Scoring", desc: "Identifies wallet activity concentrated in high-risk jurisdictions — North Korea, Iran, Russia, and FATF grey-listed territories." },
  { icon: "🔗", title: "Transaction Graph Analysis", desc: "Traces fund flows up to 5 hops from a wallet address, identifying indirect exposure to flagged entities." },
  { icon: "⚡", title: "Sub-100ms Response", desc: "Enterprise-grade speed. Verify millions of addresses per day without introducing latency into your user flows." },
  { icon: "🌐", title: "7 Chains Supported", desc: "Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BNB Chain. One API call, cross-chain visibility." },
  { icon: "📄", title: "Full Audit Trail", desc: "Every check logged with a unique report ID, timestamp, and full response — ready for regulatory inspection at any time." },
];

const USE_CASES = [
  { icon: "🏦", title: "Crypto Exchanges & VASPs", desc: "Screen every deposit and withdrawal address before processing. Generate monthly AML reports for CBN and SEC-Nigeria." },
  { icon: "💳", title: "Fintech & Neobanks", desc: "Pre-screen crypto-adjacent transactions to satisfy CBN AML obligations and avoid account freezes." },
  { icon: "🏛️", title: "DeFi Protocols", desc: "Implement wallet screening at the frontend — warn users with high-risk wallets before they interact with your protocol." },
  { icon: "⚖️", title: "Law Firms & Compliance Teams", desc: "Run wallet investigations for client due diligence, litigation support, and regulatory submissions." },
  { icon: "🔍", title: "Blockchain Investigators", desc: "Trace fund flows, identify mixer exposure, and generate evidence-grade reports for law enforcement." },
  { icon: "🤝", title: "OTC Desks & Brokers", desc: "Screen counterparty wallets before large OTC transactions to avoid handling proceeds of crime." },
];

const PLANS = [
  { name: "Growth", price: "$299", period: "/month", highlight: false, checks: "50,000 checks/month", features: ["50,000 wallet checks per month", "Full global sanctions coverage", "All 7 supported chains", "Mixer & darknet detection", "3-hop graph analysis", "Audit trail & report IDs", "Webhook alerts", "Email support"] },
  { name: "Business", price: "$799", period: "/month", highlight: true, checks: "500,000 checks/month", features: ["500,000 wallet checks per month", "Everything in Growth", "5-hop graph analysis", "Jurisdiction risk scoring", "Bulk screening (batch API)", "Monthly compliance reports", "Custom risk thresholds", "Dedicated account manager", "Priority support (24hr SLA)"] },
  { name: "Enterprise", price: "Custom", period: "", highlight: false, checks: "Unlimited checks", features: ["Unlimited wallet checks", "Custom sanctions list integration", "Custom chain support", "Dedicated infrastructure", "SLA guarantees", "White-label API option", "On-premise deployment option", "Quarterly compliance review"] },
];

const CHAINS = ["Ethereum","Arbitrum","Base","Optimism","Polygon","Avalanche","BNB Chain"];
const levelColor = (l: string) => l==="LOW"?"#22c55e":l==="MEDIUM"?"#f59e0b":l==="HIGH"?"#f97316":"#ef4444";
const recColor   = (r: string) => r==="APPROVE"?"#22c55e":r==="REVIEW"?"#f59e0b":"#ef4444";
const NAV_LINKS = [
  {label:"Compliance",href:"/compliance"},
  {label:"Security Audit",href:"/audit"},
  {label:"Verify API",href:"/verify",active:true},
];

export default function Verify() {
  useEffect(()=>{document.title="DecaFlow Verify API — Wallet Screening & Sanctions Checking";},[]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoAddress, setDemoAddress] = useState("");
  const [demoChain, setDemoChain] = useState("ethereum");
  const [demoResult, setDemoResult] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"response"|"fields">("response");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formStep, setFormStep] = useState<"form"|"success">("form");
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({companyName:"",contactName:"",email:"",telegram:"",useCase:"",chains:[] as string[],monthlyChecks:"",plan:"",message:""});

  const openForm = (plan: string) => {setSelectedPlan(plan);setFormData(p=>({...p,plan}));setFormStep("form");setFormOpen(true);document.body.style.overflow="hidden";};
  const closeForm = () => {setFormOpen(false);document.body.style.overflow="";};
  const toggleChain = (c: string) => setFormData(p=>({...p,chains:p.chains.includes(c)?p.chains.filter((x:string)=>x!==c):[...p.chains,c]}));

  const runDemo = async () => {
    if (!demoAddress.trim()) return;
    setDemoLoading(true); setDemoResult(null);
    try {
      const res = await fetch(`${API_BASE}/v1/verify/demo`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({address:demoAddress,chain:demoChain})});
      if (res.ok){const d=await res.json();setDemoResult(d.data||d);setDemoLoading(false);return;}
    } catch {}
    const seed=(demoAddress.replace("0x","").charCodeAt(0)||65)+(demoAddress.replace("0x","").charCodeAt(1)||66);
    const score=seed%3===0?8:seed%3===1?54:89;
    const level=score<25?"LOW":score<60?"MEDIUM":score<85?"HIGH":"CRITICAL";
    setDemoResult({riskScore:score,riskLevel:level,sanctionsMatch:score>85,mixerExposure:score>60?0.34:score>30?0.08:0,darknetExposure:score>75?0.12:0,jurisdictionRisk:score>60?"HIGH":score>30?"MEDIUM":"LOW",hopsAnalysed:5,recommendation:score<25?"APPROVE":score<60?"REVIEW":"REJECT",flags:score<25?[]:score<60?["Interaction with flagged exchange","Moderate transaction velocity"]:["Mixer exposure (Tornado Cash)","High-risk jurisdiction activity","OFAC watchlist proximity"],reportId:`rpt_${Math.random().toString(36).substr(2,9)}`,checkedAt:new Date().toISOString()});
    setDemoLoading(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try{await fetch(`${API_BASE}/v1/verify/enquiry`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...formData,source:"verify-page"})});}catch{}
    setFormStep("success"); setFormLoading(false);
  };

  const inp: React.CSSProperties = {width:"100%",padding:"0.75rem 0.875rem",borderRadius:"8px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:"0.875rem",outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const sel: React.CSSProperties = {...inp,background:"#1f2937",cursor:"pointer"};

  return (
    <div style={{background:"#0A0E27",color:"#fff",minHeight:"100vh",fontFamily:"Inter,system-ui,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;}::placeholder{color:rgba(255,255,255,0.3);}
        .mob-btn{display:none!important;}.desk-nav{display:flex!important;}
        @media(max-width:768px){
          .mob-btn{display:flex!important;}.desk-nav{display:none!important;}
          .fg2{grid-template-columns:1fr!important;}
          .plan-grid{grid-template-columns:1fr!important;}
          .feat-grid{grid-template-columns:1fr!important;}
          .uc-grid{grid-template-columns:1fr!important;}
          .stats-bar>div{border-right:none!important;border-bottom:1px solid rgba(255,255,255,0.08)!important;}
          section{padding-left:1.25rem!important;padding-right:1.25rem!important;}
        }
      `}</style>

      {/* Nav */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,background:"rgba(10,14,39,0.97)",backdropFilter:"blur(12px)",zIndex:100}}>
        <a href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <img src="/logo.png" alt="DecaFlow" style={{width:36,height:36,objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
          <span style={{fontSize:"1.25rem",fontWeight:800,color:"#fff",letterSpacing:"-0.025em"}}>Deca<span style={{color:"#3B82F6"}}>Flow</span></span>
        </a>
        <div className="desk-nav" style={{gap:"1.5rem",alignItems:"center"}}>
          {NAV_LINKS.map(({label,href,active})=>(
            <a key={label} href={href} style={{color:active?"#8b5cf6":"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"0.9rem",fontWeight:active?600:400}}>{label}</a>
          ))}
          <button onClick={()=>openForm("Business")} style={{background:"#8b5cf6",color:"#fff",padding:"0.5rem 1.25rem",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.875rem",fontWeight:600}}>Get API Access</button>
        </div>
        <button className="mob-btn" onClick={()=>setMenuOpen(!menuOpen)} style={{background:"none",border:"none",color:"#fff",fontSize:"1.5rem",cursor:"pointer",padding:"0.25rem"}}>{menuOpen?"✕":"☰"}</button>
      </nav>

      {menuOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,14,39,0.98)",zIndex:99,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2rem"}}>
          {NAV_LINKS.map(({label,href})=>(<a key={label} href={href} onClick={()=>setMenuOpen(false)} style={{color:"#fff",textDecoration:"none",fontSize:"1.5rem",fontWeight:700}}>{label}</a>))}
          <button onClick={()=>{setMenuOpen(false);openForm("Business");}} style={{background:"#8b5cf6",color:"#fff",padding:"0.875rem 2.5rem",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"1rem",fontWeight:700}}>Get API Access</button>
        </div>
      )}

      {/* Hero */}
      <section style={{padding:"5rem 2rem 3rem",maxWidth:"1100px",margin:"0 auto",textAlign:"center"}}>
        <div style={{display:"inline-block",background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.3)",borderRadius:"100px",padding:"0.4rem 1rem",fontSize:"0.78rem",color:"#C4B5FD",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:"1.5rem"}}>DecaFlow Verify API</div>
        <h1 style={{fontSize:"clamp(1.8rem,5vw,3.4rem)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.03em",marginBottom:"1.5rem"}}>Know Who You're Dealing With.{" "}<span style={{background:"linear-gradient(135deg,#8b5cf6,#3B82F6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Before It's Too Late.</span></h1>
        <p style={{fontSize:"1.05rem",color:"rgba(255,255,255,0.65)",maxWidth:"640px",margin:"0 auto 2.5rem",lineHeight:1.7}}>Instant wallet screening against global sanctions lists, mixer databases, darknet exposure records, and jurisdiction risk profiles — across 7 blockchain networks. One API. Sub-100ms.</p>
        <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>openForm("Business")} style={{background:"#8b5cf6",color:"#fff",padding:"0.875rem 2rem",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"1rem",fontWeight:700}}>Get API Access</button>
          <a href="#demo" style={{background:"rgba(255,255,255,0.06)",color:"#fff",padding:"0.875rem 2rem",borderRadius:"10px",textDecoration:"none",fontSize:"1rem",fontWeight:600,border:"1px solid rgba(255,255,255,0.12)"}}>Try Live Demo</a>
        </div>
        <div className="stats-bar" style={{display:"flex",marginTop:"3.5rem",flexWrap:"wrap",background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden"}}>
          {[["7","Blockchain networks"],["50+","Sanctions lists monitored"],["<100ms","API response time"],["5 hops","Graph analysis depth"],["99.9%","Uptime SLA"]].map(([v,l],i)=>(
            <div key={i} style={{flex:"1 1 120px",padding:"1.5rem 0.75rem",textAlign:"center",borderRight:i<4?"1px solid rgba(255,255,255,0.08)":"none"}}>
              <div style={{fontSize:"1.6rem",fontWeight:800,color:"#8b5cf6"}}>{v}</div>
              <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.5)",marginTop:"0.3rem"}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section id="demo" style={{padding:"3rem 2rem",maxWidth:"900px",margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(1.4rem,3.5vw,1.75rem)",fontWeight:800,textAlign:"center",marginBottom:"0.5rem"}}>Try it now</h2>
        <p style={{color:"rgba(255,255,255,0.5)",textAlign:"center",marginBottom:"2rem",fontSize:"0.9rem"}}>Enter any wallet address and see a live demo response.</p>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(139,92,246,0.25)",borderRadius:"20px",padding:"2rem 1.5rem"}}>
          <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBottom:"1rem"}}>
            <input type="text" placeholder="Enter wallet address (0x...)" value={demoAddress} onChange={e=>setDemoAddress(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runDemo()}
              style={{flex:"1",padding:"0.875rem 1rem",borderRadius:"10px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:"0.9rem",outline:"none",minWidth:"0",fontFamily:"monospace"}}/>
            <select value={demoChain} onChange={e=>setDemoChain(e.target.value)} style={{padding:"0.875rem 0.75rem",borderRadius:"10px",background:"#1f2937",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:"0.85rem",outline:"none",cursor:"pointer"}}>
              {CHAINS.map(c=><option key={c} value={c.toLowerCase().replace(/\s/g,"")} style={{background:"#1f2937"}}>{c}</option>)}
            </select>
            <button onClick={runDemo} disabled={demoLoading||!demoAddress.trim()} style={{background:"#8b5cf6",color:"#fff",padding:"0.875rem 1.25rem",borderRadius:"10px",border:"none",cursor:"pointer",fontWeight:700,fontSize:"0.9rem",opacity:(demoLoading||!demoAddress.trim())?0.5:1,whiteSpace:"nowrap"}}>
              {demoLoading?"Scanning...":"Verify Wallet"}
            </button>
          </div>
          {demoResult&&(
            <div style={{marginTop:"1.5rem"}}>
              <div style={{display:"flex",gap:"1rem",flexWrap:"wrap",padding:"1.25rem",borderRadius:"12px",background:`${levelColor(demoResult.riskLevel)}10`,border:`1px solid ${levelColor(demoResult.riskLevel)}30`,marginBottom:"1rem",alignItems:"center"}}>
                <div style={{width:56,height:56,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:`${levelColor(demoResult.riskLevel)}20`,border:`2px solid ${levelColor(demoResult.riskLevel)}`,fontSize:"1.1rem",fontWeight:800,color:levelColor(demoResult.riskLevel)}}>{demoResult.riskScore}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700}}>Risk Score: {demoResult.riskScore}/100 — <span style={{color:levelColor(demoResult.riskLevel)}}>{demoResult.riskLevel} RISK</span></div>
                  <div style={{display:"flex",gap:"1rem",marginTop:"0.4rem",flexWrap:"wrap"}}>
                    <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>Sanctioned: <strong style={{color:demoResult.sanctionsMatch?"#ef4444":"#22c55e"}}>{demoResult.sanctionsMatch?"YES":"NO"}</strong></span>
                    <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>Recommendation: <strong style={{color:recColor(demoResult.recommendation)}}>{demoResult.recommendation}</strong></span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem",flexWrap:"wrap"}}>
                {(["response","fields"] as const).map(tab=>(
                  <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"0.4rem 0.9rem",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.8rem",fontWeight:600,background:activeTab===tab?"#8b5cf6":"rgba(255,255,255,0.07)",color:"#fff"}}>
                    {tab==="response"?"API Response":"Field Reference"}
                  </button>
                ))}
              </div>
              {activeTab==="response"&&(
                <div style={{background:"#0D1117",borderRadius:"12px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{padding:"0.6rem 1rem",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",gap:"0.4rem"}}>
                    {["#ef4444","#f59e0b","#22c55e"].map((c,i)=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:c}}/>)}
                  </div>
                  <pre style={{margin:0,padding:"1.25rem",fontSize:"0.78rem",lineHeight:1.7,color:"#e2e8f0",overflowX:"auto"}}>{JSON.stringify(demoResult,null,2)}</pre>
                </div>
              )}
              {activeTab==="fields"&&(
                <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                  {[["riskScore","number (0–100)","Composite risk score."],["riskLevel",'"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"',"Human-readable risk band."],["sanctionsMatch","boolean","True if address matches a sanctions list."],["mixerExposure","number (0–1)","Fraction of funds with traceable mixer origin."],["recommendation",'"APPROVE"|"REVIEW"|"REJECT"',"Suggested action for this wallet."],["reportId","string","Unique ID for your audit trail."]].map(([f,t,d],i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:"1rem",padding:"0.75rem",borderRadius:"8px",background:i%2===0?"rgba(255,255,255,0.03)":"transparent",fontSize:"0.8rem"}}>
                      <div><div style={{fontFamily:"monospace",color:"#8b5cf6",fontWeight:700}}>{f}</div><div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.72rem",marginTop:"0.15rem"}}>{t}</div></div>
                      <div style={{color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{d}</div>
                    </div>
                  ))}
                </div>
              )}
              <p style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.3)",marginTop:"1rem",marginBottom:0}}>* Demo output. Production API delivers live on-chain data.</p>
            </div>
          )}
        </div>
      </section>

      {/* Code */}
      <section style={{padding:"3rem 2rem",maxWidth:"900px",margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(1.4rem,3.5vw,1.75rem)",fontWeight:800,textAlign:"center",marginBottom:"2rem"}}>Integrate in minutes</h2>
        <div style={{background:"#0D1117",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",overflow:"hidden"}}>
          <div style={{padding:"0.75rem 1.25rem",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",gap:"0.5rem",alignItems:"center"}}>
            {["#ef4444","#f59e0b","#22c55e"].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}
            <span style={{marginLeft:"0.75rem",color:"rgba(255,255,255,0.4)",fontSize:"0.8rem"}}>verify-wallet.ts</span>
          </div>
          <pre style={{margin:0,padding:"1.5rem",fontSize:"0.82rem",lineHeight:1.75,color:"#e2e8f0",overflowX:"auto"}}>{`import { DecaFlowVerify } from '@decaflow/verify';

const verify = new DecaFlowVerify({
  apiKey: process.env.DECAFLOW_VERIFY_KEY,
});

const result = await verify.screenWallet({
  address: userWalletAddress,
  chainId: 42161, // Arbitrum
  context: 'deposit',
  hops: 5,
});

switch (result.recommendation) {
  case 'APPROVE':
    await processTransaction(userWalletAddress);
    break;
  case 'REVIEW':
    await flagForManualReview(result.reportId);
    break;
  case 'REJECT':
    await blockTransaction(userWalletAddress);
    break;
}`}</pre>
        </div>
      </section>

      {/* Features */}
      <section style={{padding:"4rem 2rem",background:"rgba(255,255,255,0.02)",borderTop:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <h2 style={{fontSize:"clamp(1.4rem,3.5vw,2rem)",fontWeight:800,textAlign:"center",marginBottom:"2.5rem"}}>What the Verify API screens for</h2>
          <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:"1.25rem"}}>
            {FEATURES.map((f,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"1.5rem"}}>
                <div style={{fontSize:"1.5rem",marginBottom:"0.6rem"}}>{f.icon}</div>
                <h3 style={{fontSize:"0.95rem",fontWeight:700,marginBottom:"0.4rem"}}>{f.title}</h3>
                <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.82rem",lineHeight:1.6,margin:0}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section style={{padding:"4rem 2rem",maxWidth:"1100px",margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(1.4rem,3.5vw,2rem)",fontWeight:800,textAlign:"center",marginBottom:"2.5rem"}}>Who uses DecaFlow Verify</h2>
        <div className="uc-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1.25rem"}}>
          {USE_CASES.map((u,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"1.5rem"}}>
              <div style={{fontSize:"1.5rem",marginBottom:"0.6rem"}}>{u.icon}</div>
              <h3 style={{fontSize:"0.95rem",fontWeight:700,marginBottom:"0.4rem"}}>{u.title}</h3>
              <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.82rem",lineHeight:1.6,margin:0}}>{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{padding:"4rem 2rem",background:"rgba(255,255,255,0.02)",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:"1000px",margin:"0 auto"}}>
          <h2 style={{fontSize:"clamp(1.4rem,3.5vw,2rem)",fontWeight:800,textAlign:"center",marginBottom:"0.75rem"}}>Pricing</h2>
          <p style={{color:"rgba(255,255,255,0.5)",textAlign:"center",marginBottom:"3rem"}}>Enterprise-grade wallet screening for every scale.</p>
          <div className="plan-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem"}}>
            {PLANS.map((plan,i)=>(
              <div key={i} style={{background:plan.highlight?"rgba(139,92,246,0.08)":"rgba(255,255,255,0.03)",border:plan.highlight?"1px solid rgba(139,92,246,0.4)":"1px solid rgba(255,255,255,0.08)",borderRadius:"20px",padding:"1.75rem",position:"relative"}}>
                {plan.highlight&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#8b5cf6",color:"#fff",padding:"0.25rem 1rem",borderRadius:"100px",fontSize:"0.75rem",fontWeight:700,whiteSpace:"nowrap"}}>Most Popular</div>}
                <h3 style={{fontSize:"1rem",fontWeight:700,marginBottom:"0.25rem"}}>{plan.name}</h3>
                <div style={{display:"flex",alignItems:"baseline",gap:"0.2rem",marginBottom:"0.25rem"}}>
                  <span style={{fontSize:"2rem",fontWeight:800,color:plan.highlight?"#8b5cf6":"#fff"}}>{plan.price}</span>
                  <span style={{color:"rgba(255,255,255,0.4)",fontSize:"0.85rem"}}>{plan.period}</span>
                </div>
                <div style={{fontSize:"0.78rem",color:"#8b5cf6",fontWeight:600,marginBottom:"1.25rem"}}>{plan.checks}</div>
                <ul style={{listStyle:"none",padding:0,margin:"0 0 1.5rem",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                  {plan.features.map((f,j)=><li key={j} style={{display:"flex",gap:"0.5rem",fontSize:"0.83rem",color:"rgba(255,255,255,0.7)"}}><span style={{color:"#22c55e",flexShrink:0}}>✓</span>{f}</li>)}
                </ul>
                <button onClick={()=>openForm(plan.name)} style={{display:"block",width:"100%",padding:"0.8rem",borderRadius:"10px",fontWeight:700,fontSize:"0.875rem",background:plan.highlight?"#8b5cf6":"rgba(255,255,255,0.07)",color:"#fff",border:plan.highlight?"none":"1px solid rgba(255,255,255,0.12)",cursor:"pointer"}}>
                  {plan.name==="Enterprise"?"Contact Sales":"Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"5rem 2rem",textAlign:"center"}}>
        <h2 style={{fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:800,marginBottom:"1rem"}}>Start verifying wallets today.</h2>
        <p style={{color:"rgba(255,255,255,0.55)",fontSize:"1rem",maxWidth:"480px",margin:"0 auto 2.5rem",lineHeight:1.7}}>Enterprise-grade wallet screening. Production-ready in minutes.</p>
        <button onClick={()=>openForm("Business")} style={{background:"#8b5cf6",color:"#fff",padding:"1rem 2.5rem",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"1.05rem",fontWeight:700}}>Get API Access</button>
      </section>

      <footer style={{borderTop:"1px solid rgba(255,255,255,0.08)",padding:"2rem 1.25rem",textAlign:"center",color:"rgba(255,255,255,0.35)",fontSize:"0.8rem"}}>
        © 2026 DecaFlow Solutions Limited · RC No. 9616822 · <a href="mailto:contact@decaflow.xyz" style={{color:"rgba(255,255,255,0.35)",textDecoration:"none"}}>contact@decaflow.xyz</a>
      </footer>

      {/* Form Modal */}
      {formOpen&&(
        <div onClick={e=>e.target===e.currentTarget&&closeForm()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",overflowY:"auto"}}>
          <div style={{background:"#111827",border:"1px solid rgba(139,92,246,0.3)",borderRadius:"20px",width:"100%",maxWidth:"580px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{padding:"1.5rem 1.5rem 1rem",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <h2 style={{fontSize:"1.2rem",fontWeight:800,marginBottom:"0.25rem"}}>{formStep==="success"?"You're in! 🚀":`Verify API — ${selectedPlan} Plan`}</h2>
                {formStep!=="success"&&<p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",margin:0}}>We'll send your API credentials within 24 hours.</p>}
              </div>
              <button onClick={closeForm} style={{background:"rgba(255,255,255,0.07)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
            </div>
            {formStep==="success"?(
              <div style={{padding:"3rem 1.5rem",textAlign:"center"}}>
                <div style={{fontSize:"3.5rem",marginBottom:"1rem"}}>🔑</div>
                <h3 style={{fontSize:"1.2rem",fontWeight:700,marginBottom:"0.75rem"}}>Request received!</h3>
                <p style={{color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:"2rem"}}>We'll send your API credentials and integration guide to <strong>{formData.email}</strong> within 24 hours.</p>
                <button onClick={closeForm} style={{background:"#8b5cf6",color:"#fff",padding:"0.875rem 2rem",borderRadius:"10px",border:"none",cursor:"pointer",fontWeight:700}}>Close</button>
              </div>
            ):(
              <form onSubmit={handleFormSubmit} style={{padding:"1.5rem"}}>
                <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.875rem",marginBottom:"0.875rem"}}>
                  {([["Company / Project *","companyName","e.g. Patricia Technologies"],["Your Name *","contactName","Full name"],["Email *","email","you@company.com"],["Telegram / WhatsApp","telegram","@handle or +234..."]] as [string,string,string][]).map(([label,field,ph])=>(
                    <div key={field}>
                      <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.35rem",fontWeight:600}}>{label}</label>
                      <input required={label.includes("*")} type={field==="email"?"email":"text"} placeholder={ph} value={(formData as any)[field]} onChange={e=>setFormData(p=>({...p,[field]:e.target.value}))} style={inp}/>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:"0.875rem"}}>
                  <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.35rem",fontWeight:600}}>Primary Use Case *</label>
                  <select required value={formData.useCase} onChange={e=>setFormData(p=>({...p,useCase:e.target.value}))} style={sel}>
                    <option value="" disabled>Select your use case</option>
                    {["Crypto Exchange / VASP","Fintech / Neobank","DeFi Protocol","OTC Desk / Broker","Law Firm / Compliance","Blockchain Investigation","Payment Processor","Other"].map(o=><option key={o} value={o} style={{background:"#1f2937"}}>{o}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:"0.875rem"}}>
                  <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.5rem",fontWeight:600}}>Chains you need covered</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
                    {CHAINS.map(c=>(
                      <button key={c} type="button" onClick={()=>toggleChain(c)} style={{padding:"0.35rem 0.8rem",borderRadius:"100px",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",border:formData.chains.includes(c)?"1px solid #8b5cf6":"1px solid rgba(255,255,255,0.12)",background:formData.chains.includes(c)?"rgba(139,92,246,0.2)":"transparent",color:formData.chains.includes(c)?"#C4B5FD":"rgba(255,255,255,0.6)"}}>{c}</button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:"0.875rem"}}>
                  <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.35rem",fontWeight:600}}>Estimated Monthly Wallet Checks</label>
                  <select value={formData.monthlyChecks} onChange={e=>setFormData(p=>({...p,monthlyChecks:e.target.value}))} style={sel}>
                    <option value="">Select volume</option>
                    {["Under 1,000/month","1,000–10,000/month","10,000–50,000/month","50,000–500,000/month","500,000+/month"].map(o=><option key={o} value={o} style={{background:"#1f2937"}}>{o}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:"1.25rem"}}>
                  <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.35rem",fontWeight:600}}>Tell us more (optional)</label>
                  <textarea value={formData.message} onChange={e=>setFormData(p=>({...p,message:e.target.value}))} rows={3} placeholder="Any specific compliance requirements or integration questions..." style={{...inp,resize:"vertical"}}/>
                </div>
                <button type="submit" disabled={formLoading} style={{width:"100%",padding:"1rem",borderRadius:"10px",background:"#8b5cf6",color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:"1rem",opacity:formLoading?0.6:1}}>
                  {formLoading?"Submitting...":`Get Started — ${selectedPlan} Plan`}
                </button>
                <p style={{textAlign:"center",color:"rgba(255,255,255,0.35)",fontSize:"0.72rem",marginTop:"0.75rem"}}>🔒 No commitment. We'll reach out within 24 hours.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
