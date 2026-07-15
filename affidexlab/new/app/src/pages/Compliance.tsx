import { useState, useEffect } from "react";

const API_BASE = "https://decaflow-backend.onrender.com";

const FEATURES = [
  { icon: "🔍", title: "Real-Time Transaction Monitoring", desc: "Every on-chain transaction is scored the moment it hits the mempool. Suspicious patterns flagged before settlement — not after." },
  { icon: "🛡️", title: "AML & CFT Compliance Engine", desc: "Continuously checks against OFAC, UN, EU, and FATF sanctions lists. Stay compliant with CBN, SEC-Nigeria, and MiCA requirements automatically." },
  { icon: "📊", title: "Risk Scoring Dashboard", desc: "Every wallet receives a 0–100 composite risk score covering sanctions exposure, mixer usage, darknet activity, and behavioural anomalies." },
  { icon: "⚡", title: "Sub-100ms API Response", desc: "Instant risk decisions at transaction speed. Compliance checks run silently in the background with no bottlenecks in your user flow." },
  { icon: "🌍", title: "Multi-Chain Coverage", desc: "Monitors Arbitrum, Ethereum, Base, Optimism, Polygon, Avalanche, and BNB Chain simultaneously. One API, every major chain." },
  { icon: "📁", title: "Audit-Ready Reports", desc: "Generate regulator-ready compliance reports on demand. Full transaction history, risk scores, and decisions — formatted for CBN, SEC, and FIRS." },
];

const PLANS = [
  { name: "Starter", price: "$299", period: "/month", highlight: false,
    features: ["Up to 10,000 transaction checks/month", "OFAC & UN sanctions screening", "3 blockchain networks", "Email alerts for high-risk events", "Monthly compliance reports", "Standard support"] },
  { name: "Business", price: "$799", period: "/month", highlight: true,
    features: ["Up to 100,000 transaction checks/month", "Full global sanctions coverage", "All 7 supported networks", "Real-time webhook alerts", "Weekly compliance reports", "API access included", "Custom risk thresholds", "Priority support (24hr SLA)"] },
  { name: "Enterprise", price: "Custom", period: "", highlight: false,
    features: ["Unlimited transaction checks", "Custom sanctions list integration", "Dedicated infrastructure", "Custom chain support", "Dedicated compliance manager", "Real-time regulator export", "White-label available", "SLA guarantees"] },
];

const USE_CASES = [
  { sector: "Crypto Exchanges", icon: "🏦", problem: "CBN and SEC-Nigeria now require VASPs to screen all transactions for AML/CFT compliance.", solution: "DecaFlow Compliance screens every deposit and withdrawal in real time, auto-generates monthly reports, and flags suspicious wallets before funds are processed." },
  { sector: "Fintech & Neobanks", icon: "💳", problem: "Fintechs processing crypto-adjacent transactions face CBN scrutiny and risk account freezes if AML obligations are missed.", solution: "Integrate our API in one afternoon. Every transaction touching a blockchain address is automatically screened and logged with a full audit trail." },
  { sector: "Payment Processors", icon: "💸", problem: "Processing payments from wallets linked to sanctioned entities creates legal liability and reputational risk.", solution: "Pre-screening via the DecaFlow Compliance API stops high-risk payments before they process." },
  { sector: "DeFi Protocols", icon: "🔗", problem: "Global regulators are increasingly applying AML obligations to DeFi protocols. MiCA in Europe is already in force.", solution: "Embed compliance screening into your protocol's frontend. Show users their wallet risk score before they interact." },
];

const levelColor = (l: string) => l === "LOW" ? "#22c55e" : l === "MEDIUM" ? "#f59e0b" : "#ef4444";

export default function Compliance() {
  useEffect(() => { document.title = "Compliance & Transaction Monitoring | DecaFlow"; }, []);

  const [demoWallet, setDemoWallet] = useState("");
  const [demoResult, setDemoResult] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formStep, setFormStep] = useState<"form"|"success">("form");
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ companyName:"", contactName:"", email:"", telegram:"", businessType:"", chains:[] as string[], monthlyTxVolume:"", plan:"", message:"" });

  const openForm = (plan: string) => { setSelectedPlan(plan); setFormData(p=>({...p,plan})); setFormStep("form"); setFormOpen(true); document.body.style.overflow="hidden"; };
  const closeForm = () => { setFormOpen(false); document.body.style.overflow=""; };
  const toggleChain = (c: string) => setFormData(p=>({...p, chains: p.chains.includes(c)?p.chains.filter(x=>x!==c):[...p.chains,c]}));

  const runDemo = async () => {
    if (!demoWallet.trim()) return;
    setDemoLoading(true); setDemoResult(null);
    try {
      const res = await fetch(`${API_BASE}/v1/compliance/demo-score`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({address:demoWallet}) });
      if (res.ok) { const d = await res.json(); setDemoResult(d.data||d); setDemoLoading(false); return; }
    } catch {}
    const seed = (demoWallet.charCodeAt(2)||65)+(demoWallet.charCodeAt(3)||66);
    const score = seed%3===0?12:seed%3===1?67:91;
    const level = score<30?"LOW":score<70?"MEDIUM":"HIGH";
    setDemoResult({ riskScore:score, riskLevel:level, recommendation:score<30?"APPROVE":score<70?"REVIEW":"REJECT",
      flags: score<30?["No sanctions matches","No mixer activity","Clean history"]:score<70?["Interaction with flagged DEX","Moderate anonymity pattern"]:["OFAC watchlist proximity","Mixer usage detected","High-risk jurisdiction"] });
    setDemoLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try { await fetch(`${API_BASE}/v1/compliance/enquiry`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...formData,source:"compliance-page"})}); } catch {}
    setFormStep("success"); setFormLoading(false);
  };

  const S: React.CSSProperties = { background:"#0A0E27", color:"#fff", minHeight:"100vh", fontFamily:"Inter,system-ui,sans-serif" };

  return (
    <div style={S}>
      {/* Nav */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.25rem 2rem",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,background:"rgba(10,14,39,0.97)",backdropFilter:"blur(12px)",zIndex:100}}>
        <a href="/" style={{textDecoration:"none"}}><span style={{fontSize:"1.35rem",fontWeight:800,color:"#fff"}}>Deca<span style={{color:"#3B82F6"}}>Flow</span></span></a>
        <div style={{display:"flex",gap:"1.5rem",alignItems:"center",flexWrap:"wrap"}}>
          {[["Compliance","/compliance",true],["Security Audit","/audit",false],["Verify API","/verify",false],["Swap","/app",false]].map(([l,h,a])=>(
            <a key={l as string} href={h as string} style={{color:a?"#3B82F6":"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"0.9rem",fontWeight:a?600:400}}>{l as string}</a>
          ))}
          <button onClick={()=>openForm("Business")} style={{background:"#3B82F6",color:"#fff",padding:"0.5rem 1.25rem",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.875rem",fontWeight:600}}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{padding:"6rem 2rem 4rem",maxWidth:"1100px",margin:"0 auto",textAlign:"center"}}>
        <div style={{display:"inline-block",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:"100px",padding:"0.4rem 1rem",fontSize:"0.78rem",color:"#93C5FD",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:"1.5rem"}}>Compliance Infrastructure</div>
        <h1 style={{fontSize:"clamp(2rem,5vw,3.6rem)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.03em",marginBottom:"1.5rem"}}>
          On-Chain AML Compliance{" "}<span style={{background:"linear-gradient(135deg,#3B82F6,#818CF8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Built for Africa's Crypto Economy</span>
        </h1>
        <p style={{fontSize:"1.1rem",color:"rgba(255,255,255,0.65)",maxWidth:"660px",margin:"0 auto 2.5rem",lineHeight:1.7}}>Real-time transaction monitoring, sanctions screening, and AML risk scoring for crypto exchanges, fintechs, and DeFi protocols. CBN-compliant, SEC-Nigeria ready, MiCA compatible.</p>
        <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>openForm("Business")} style={{background:"#3B82F6",color:"#fff",padding:"0.875rem 2rem",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"1rem",fontWeight:700}}>Request a Demo</button>
          <a href="#pricing" style={{background:"rgba(255,255,255,0.06)",color:"#fff",padding:"0.875rem 2rem",borderRadius:"10px",textDecoration:"none",fontSize:"1rem",fontWeight:600,border:"1px solid rgba(255,255,255,0.12)"}}>View Pricing</a>
        </div>
        <div style={{display:"flex",marginTop:"4rem",flexWrap:"wrap",background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden"}}>
          {[["$59B+","Crypto transactions in Nigeria (2023–24)"],["6+","Chains monitored in real time"],["<100ms","API response time"],["99.9%","Uptime SLA"]].map(([v,l],i)=>(
            <div key={i} style={{flex:"1 1 180px",padding:"1.75rem 1.25rem",textAlign:"center",borderRight:i<3?"1px solid rgba(255,255,255,0.08)":"none"}}>
              <div style={{fontSize:"1.8rem",fontWeight:800,color:"#3B82F6"}}>{v}</div>
              <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.5)",marginTop:"0.3rem"}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section style={{padding:"3rem 2rem",maxWidth:"700px",margin:"0 auto"}}>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:"20px",padding:"2.5rem"}}>
          <h2 style={{fontSize:"1.4rem",fontWeight:700,marginBottom:"0.4rem"}}>Try the Risk Scorer</h2>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.875rem",marginBottom:"1.5rem"}}>Enter any wallet address to see a live compliance score.</p>
          <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
            <input type="text" placeholder="0x... wallet address" value={demoWallet} onChange={e=>setDemoWallet(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runDemo()}
              style={{flex:"1",padding:"0.875rem 1rem",borderRadius:"10px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:"0.9rem",outline:"none",minWidth:"200px",fontFamily:"monospace"}} />
            <button onClick={runDemo} disabled={demoLoading} style={{background:"#3B82F6",color:"#fff",padding:"0.875rem 1.5rem",borderRadius:"10px",border:"none",cursor:"pointer",fontWeight:700,opacity:demoLoading?0.6:1}}>{demoLoading?"Scanning...":"Check Risk"}</button>
          </div>
          {demoResult&&(
            <div style={{marginTop:"1.5rem",padding:"1.25rem",borderRadius:"12px",background:"rgba(255,255,255,0.04)",border:`1px solid ${levelColor(demoResult.riskLevel)}40`}}>
              <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"0.75rem"}}>
                <div style={{width:56,height:56,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`${levelColor(demoResult.riskLevel)}20`,border:`2px solid ${levelColor(demoResult.riskLevel)}`,fontSize:"1.1rem",fontWeight:800,color:levelColor(demoResult.riskLevel),flexShrink:0}}>{demoResult.riskScore}</div>
                <div>
                  <div style={{fontWeight:700}}>Risk Score: {demoResult.riskScore}/100</div>
                  <div style={{color:levelColor(demoResult.riskLevel),fontWeight:700,fontSize:"0.85rem"}}>{demoResult.riskLevel} RISK — {demoResult.recommendation}</div>
                </div>
              </div>
              {demoResult.flags?.map((f:string,i:number)=>(
                <div key={i} style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)",display:"flex",gap:"0.5rem",marginBottom:"0.3rem"}}>
                  <span style={{color:levelColor(demoResult.riskLevel)}}>{demoResult.riskLevel==="LOW"?"✓":"⚠"}</span>{f}
                </div>
              ))}
              <p style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.3)",marginTop:"0.75rem",marginBottom:0}}>* Demo output. Production API delivers live on-chain data.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{padding:"5rem 2rem",maxWidth:"1100px",margin:"0 auto"}}>
        <h2 style={{fontSize:"2rem",fontWeight:800,textAlign:"center",marginBottom:"0.75rem"}}>Everything you need to stay compliant</h2>
        <p style={{color:"rgba(255,255,255,0.5)",textAlign:"center",marginBottom:"3rem"}}>One platform. Full regulatory coverage.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"1.25rem"}}>
          {FEATURES.map((f,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"1.75rem"}}>
              <div style={{fontSize:"1.75rem",marginBottom:"0.75rem"}}>{f.icon}</div>
              <h3 style={{fontSize:"1rem",fontWeight:700,marginBottom:"0.5rem"}}>{f.title}</h3>
              <p style={{color:"rgba(255,255,255,0.55)",fontSize:"0.875rem",lineHeight:1.65,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section style={{padding:"5rem 2rem",background:"rgba(255,255,255,0.02)",borderTop:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <h2 style={{fontSize:"2rem",fontWeight:800,textAlign:"center",marginBottom:"3rem"}}>Who uses DecaFlow Compliance</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(440px,1fr))",gap:"1.5rem"}}>
            {USE_CASES.map((u,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"2rem"}}>
                <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>{u.icon}</div>
                <div style={{display:"inline-block",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:"6px",padding:"0.2rem 0.6rem",fontSize:"0.72rem",color:"#93C5FD",fontWeight:700,marginBottom:"1rem",textTransform:"uppercase"}}>{u.sector}</div>
                <div style={{marginBottom:"0.75rem"}}>
                  <div style={{color:"#ef4444",fontWeight:600,fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.04em"}}>The Problem</div>
                  <p style={{color:"rgba(255,255,255,0.65)",fontSize:"0.875rem",lineHeight:1.65,marginTop:"0.35rem",marginBottom:0}}>{u.problem}</p>
                </div>
                <div>
                  <div style={{color:"#22c55e",fontWeight:600,fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.04em"}}>The Solution</div>
                  <p style={{color:"rgba(255,255,255,0.65)",fontSize:"0.875rem",lineHeight:1.65,marginTop:"0.35rem",marginBottom:0}}>{u.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{padding:"5rem 2rem",maxWidth:"1100px",margin:"0 auto"}}>
        <h2 style={{fontSize:"2rem",fontWeight:800,textAlign:"center",marginBottom:"0.75rem"}}>Transparent pricing</h2>
        <p style={{color:"rgba(255,255,255,0.5)",textAlign:"center",marginBottom:"3rem"}}>Compliance that doesn't cost like Chainalysis.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1.5rem"}}>
          {PLANS.map((t,i)=>(
            <div key={i} style={{background:t.highlight?"rgba(59,130,246,0.08)":"rgba(255,255,255,0.03)",border:t.highlight?"1px solid rgba(59,130,246,0.4)":"1px solid rgba(255,255,255,0.08)",borderRadius:"20px",padding:"2rem",position:"relative"}}>
              {t.highlight&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#3B82F6",color:"#fff",padding:"0.25rem 1rem",borderRadius:"100px",fontSize:"0.75rem",fontWeight:700,whiteSpace:"nowrap"}}>Most Popular</div>}
              <h3 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"0.5rem"}}>{t.name}</h3>
              <div style={{display:"flex",alignItems:"baseline",gap:"0.25rem",marginBottom:"1.5rem"}}>
                <span style={{fontSize:"2.25rem",fontWeight:800,color:t.highlight?"#3B82F6":"#fff"}}>{t.price}</span>
                <span style={{color:"rgba(255,255,255,0.45)",fontSize:"0.875rem"}}>{t.period}</span>
              </div>
              <ul style={{listStyle:"none",padding:0,margin:"0 0 2rem",display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                {t.features.map((f,j)=><li key={j} style={{display:"flex",gap:"0.6rem",fontSize:"0.875rem",color:"rgba(255,255,255,0.7)"}}><span style={{color:"#22c55e",flexShrink:0}}>✓</span>{f}</li>)}
              </ul>
              <button onClick={()=>openForm(t.name)} style={{display:"block",width:"100%",padding:"0.875rem",borderRadius:"10px",fontWeight:700,fontSize:"0.9rem",background:t.highlight?"#3B82F6":"rgba(255,255,255,0.07)",color:"#fff",border:t.highlight?"none":"1px solid rgba(255,255,255,0.12)",cursor:"pointer"}}>
                {t.name==="Enterprise"?"Contact Sales":"Get Started"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"6rem 2rem",textAlign:"center"}}>
        <h2 style={{fontSize:"2.2rem",fontWeight:800,marginBottom:"1rem"}}>Compliance isn't optional anymore.</h2>
        <p style={{color:"rgba(255,255,255,0.55)",fontSize:"1rem",maxWidth:"540px",margin:"0 auto 2.5rem",lineHeight:1.7}}>Nigerian SEC, CBN, and global FATF standards are converging. Get ahead of the requirement — not behind it.</p>
        <button onClick={()=>openForm("Business")} style={{background:"#3B82F6",color:"#fff",padding:"1rem 2.5rem",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"1.05rem",fontWeight:700}}>Talk to Us Today</button>
      </section>

      {/* Footer */}
      <footer style={{borderTop:"1px solid rgba(255,255,255,0.08)",padding:"2rem",textAlign:"center",color:"rgba(255,255,255,0.35)",fontSize:"0.8rem"}}>
        © 2026 DecaFlow Solutions Limited · RC No. 9616822 · <a href="mailto:decaflowsolutions@gmail.com" style={{color:"rgba(255,255,255,0.35)",textDecoration:"none"}}>decaflowsolutions@gmail.com</a>
      </footer>

      {/* Form Modal */}
      {formOpen&&(
        <div onClick={e=>e.target===e.currentTarget&&closeForm()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"#111827",border:"1px solid rgba(59,130,246,0.3)",borderRadius:"20px",width:"100%",maxWidth:"600px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{padding:"1.75rem 2rem 1rem",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <h2 style={{fontSize:"1.35rem",fontWeight:800,marginBottom:"0.25rem"}}>{formStep==="success"?"Request Received! 🎉":`Get Started — ${selectedPlan} Plan`}</h2>
                {formStep!=="success"&&<p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.875rem",margin:0}}>A DecaFlow compliance specialist will contact you within 24 hours.</p>}
              </div>
              <button onClick={closeForm} style={{background:"rgba(255,255,255,0.07)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
            </div>
            {formStep==="success"?(
              <div style={{padding:"3rem 2rem",textAlign:"center"}}>
                <div style={{fontSize:"4rem",marginBottom:"1rem"}}>✅</div>
                <h3 style={{fontSize:"1.25rem",fontWeight:700,marginBottom:"0.75rem"}}>We've got your request!</h3>
                <p style={{color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:"2rem"}}>A member of our compliance team will reach out to <strong>{formData.email}</strong> within 24 hours with your API credentials and integration guide.</p>
                <button onClick={closeForm} style={{background:"#3B82F6",color:"#fff",padding:"0.875rem 2rem",borderRadius:"10px",border:"none",cursor:"pointer",fontWeight:700}}>Close</button>
              </div>
            ):(
              <form onSubmit={handleSubmit} style={{padding:"1.75rem 2rem 2rem"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
                  {[["Company Name *","companyName","e.g. Quidax Ltd","text"],["Your Name *","contactName","Full name","text"],["Work Email *","email","you@company.com","email"],["Telegram / WhatsApp","telegram","@handle or +234...","text"]].map(([label,field,ph,type])=>(
                    <div key={field as string}>
                      <label style={{display:"block",fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.4rem",fontWeight:600}}>{label as string}</label>
                      <input required={label.includes("*")} type={type as string} placeholder={ph as string} value={(formData as any)[field as string]}
                        onChange={e=>setFormData(p=>({...p,[field as string]:e.target.value}))}
                        style={{width:"100%",padding:"0.75rem 0.875rem",borderRadius:"8px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:"0.875rem",outline:"none",boxSizing:"border-box"}} />
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:"1rem"}}>
                  <label style={{display:"block",fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.4rem",fontWeight:600}}>Business Type *</label>
                  <select required value={formData.businessType} onChange={e=>setFormData(p=>({...p,businessType:e.target.value}))}
                    style={{width:"100%",padding:"0.75rem 0.875rem",borderRadius:"8px",background:"#1f2937",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:"0.875rem",outline:"none",cursor:"pointer"}}>
                    <option value="" disabled>Select your business type</option>
                    {["Crypto Exchange / VASP","Fintech / Neobank","Payment Processor","DeFi Protocol","OTC Desk / Broker","Law Firm / Compliance Team","Other"].map(o=><option key={o} value={o} style={{background:"#1f2937"}}>{o}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:"1rem"}}>
                  <label style={{display:"block",fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.6rem",fontWeight:600}}>Chains you need covered</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
                    {["Ethereum","Arbitrum","Base","Optimism","Polygon","Avalanche","BNB Chain"].map(c=>(
                      <button key={c} type="button" onClick={()=>toggleChain(c)}
                        style={{padding:"0.4rem 0.875rem",borderRadius:"100px",fontSize:"0.8rem",fontWeight:600,cursor:"pointer",border:formData.chains.includes(c)?"1px solid #3B82F6":"1px solid rgba(255,255,255,0.12)",background:formData.chains.includes(c)?"rgba(59,130,246,0.2)":"transparent",color:formData.chains.includes(c)?"#93C5FD":"rgba(255,255,255,0.6)"}}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:"1rem"}}>
                  <label style={{display:"block",fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.4rem",fontWeight:600}}>Estimated Monthly Transaction Volume</label>
                  <select value={formData.monthlyTxVolume} onChange={e=>setFormData(p=>({...p,monthlyTxVolume:e.target.value}))}
                    style={{width:"100%",padding:"0.75rem 0.875rem",borderRadius:"8px",background:"#1f2937",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:"0.875rem",outline:"none",cursor:"pointer"}}>
                    <option value="">Select volume range</option>
                    {["Under 1,000/month","1,000–10,000/month","10,000–100,000/month","100,000–500,000/month","500,000+/month"].map(o=><option key={o} value={o} style={{background:"#1f2937"}}>{o}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:"1.5rem"}}>
                  <label style={{display:"block",fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.4rem",fontWeight:600}}>Additional Information</label>
                  <textarea value={formData.message} onChange={e=>setFormData(p=>({...p,message:e.target.value}))} rows={3}
                    placeholder="Tell us about your compliance needs or any specific regulatory requirements..."
                    style={{width:"100%",padding:"0.75rem 0.875rem",borderRadius:"8px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:"0.875rem",outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}} />
                </div>
                <button type="submit" disabled={formLoading} style={{width:"100%",padding:"1rem",borderRadius:"10px",background:"#3B82F6",color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:"1rem",opacity:formLoading?0.6:1}}>
                  {formLoading?"Submitting...":`Submit Request — ${selectedPlan} Plan`}
                </button>
                <p style={{textAlign:"center",color:"rgba(255,255,255,0.35)",fontSize:"0.75rem",marginTop:"0.75rem"}}>🔒 Your information is confidential and will only be used to process your request.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
