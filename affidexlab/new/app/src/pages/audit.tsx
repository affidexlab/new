import { useState, useEffect } from "react";

const API_BASE = "https://decaflow-backend.onrender.com";

const AUDIT_SCOPE = [
  { icon: "🔐", title: "Reentrancy Vulnerabilities", desc: "Detect cross-function, cross-contract, and read-only reentrancy patterns before they cost your users everything." },
  { icon: "🎯", title: "Access Control Flaws", desc: "Review all owner and admin functions, privilege escalation paths, and missing onlyOwner guards." },
  { icon: "💱", title: "Oracle Manipulation", desc: "Identify price oracle attack surfaces, flash loan manipulation vectors, and TWAP implementation issues." },
  { icon: "🌊", title: "Flash Loan Attack Vectors", desc: "Simulate flash loan-assisted attacks against your liquidity pools, lending markets, and governance systems." },
  { icon: "📉", title: "Integer Overflow & Underflow", desc: "Verify arithmetic safety across all token amount calculations, especially in low-decimal token pairs." },
  { icon: "🔄", title: "Front-Running & MEV Exposure", desc: "Identify MEV-exploitable functions — sandwich targets, arbitrage surfaces, and sandwichable liquidations." },
  { icon: "🗳️", title: "Governance Attack Surfaces", desc: "Audit proposal creation, voting logic, timelock bypass risks, and flash loan governance attacks." },
  { icon: "🔗", title: "Cross-Chain Logic Errors", desc: "Review bridge implementations, cross-chain message validation, and replay attack vectors on multi-chain deployments." },
  { icon: "💾", title: "Storage Layout Collisions", desc: "Check proxy upgrade patterns for storage slot conflicts, implementation variable shadowing, and initializer logic." },
  { icon: "⛽", title: "Gas Optimisation Review", desc: "Identify unnecessary SLOAD operations, inefficient loops, and calldata optimisations that reduce user costs." },
];

const PACKAGES = [
  { name: "Smart Contract Review", price: "$800", deliverable: "7-day turnaround", highlight: false, scope: "Up to 500 lines of Solidity", ideal: "Simple token contracts, NFT collections, single-function protocols", includes: ["Manual line-by-line code review", "All 10 vulnerability categories checked", "Severity-rated findings report", "Remediation recommendations", "PDF report on company letterhead", "Fix verification included"] },
  { name: "Protocol Audit", price: "$2,000", deliverable: "10-day turnaround", highlight: true, scope: "Up to 2,000 lines across multiple contracts", ideal: "DEXs, lending protocols, yield farming, staking systems", includes: ["Everything in Smart Contract Review", "Cross-contract interaction analysis", "Economic attack simulation", "Flash loan attack vectors", "Oracle manipulation review", "Governance logic audit", "Gas optimisation report", "Kickoff call with lead auditor", "Priority turnaround"] },
  { name: "Full System Audit", price: "From $4,500", deliverable: "Timeline agreed per scope", highlight: false, scope: "Unlimited — full protocol, multi-chain, upgradeable proxy systems", ideal: "Launch-ready protocols, pre-IDO audit, institutional-grade projects", includes: ["Everything in Protocol Audit", "Multi-chain deployment review", "Upgradeability & proxy pattern review", "Formal economic risk modelling", "Pre-launch checklist", "Post-deployment monitoring setup", "Co-marketing as 'Audited by DecaFlow'", "Quarterly re-audit discount"] },
];

const SEVERITY = [
  { level: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.08)", desc: "Immediate loss of funds. Must be fixed before deployment or further use." },
  { level: "High", color: "#f97316", bg: "rgba(249,115,22,0.08)", desc: "Significant risk of fund loss or protocol failure under realistic conditions." },
  { level: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", desc: "Vulnerability requires specific conditions to exploit but poses real risk." },
  { level: "Low", color: "#3B82F6", bg: "rgba(59,130,246,0.08)", desc: "Minor issue with limited impact — should be addressed for robustness." },
  { level: "Informational", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", desc: "Gas optimisations, code quality improvements, and best practice recommendations." },
];

const PROCESS = [
  { step: "01", title: "Submit Your Codebase", desc: "Share your GitHub repo link. We accept Solidity, Vyper, and Rust (Anchor) contracts.", time: "Day 1" },
  { step: "02", title: "Scoping & Kickoff Call", desc: "We review your codebase and schedule a 30-minute kickoff call to understand your protocol mechanics.", time: "Day 1–2" },
  { step: "03", title: "Manual Code Review", desc: "Line-by-line review across all 10 vulnerability categories. We study your protocol from an attacker's perspective.", time: "Day 2–5" },
  { step: "04", title: "Findings & Remediation", desc: "Every vulnerability categorised by severity with specific remediation guidance.", time: "Day 5–6" },
  { step: "05", title: "Report Delivery", desc: "Full written audit report on DecaFlow Solutions Limited letterhead — publishable and investor-ready.", time: "Day 7" },
  { step: "06", title: "Fix Verification", desc: "After you implement fixes, we re-review all flagged items and issue a final clean report. No extra charge.", time: "Day 8–10" },
];

const FAQS = [
  { q: "Are you a formal audit firm like CertiK or Trail of Bits?", a: "We are a registered technology company providing professional smart contract security review services. We built and deployed our own DeFi protocol with smart contracts live on Arbitrum mainnet — we know these attack vectors firsthand. Our reports are formal, written on company letterhead, and designed to be published or shared with investors and regulators." },
  { q: "What languages do you audit?", a: "Solidity (all major EVM chains — Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BNB Chain), Vyper, and Rust/Anchor (Solana). Most audits are Solidity." },
  { q: "Can we publish the audit report publicly?", a: "Yes. The report is yours. Many projects publish audit reports on their website and GitHub as part of their launch transparency documentation." },
  { q: "Is fix verification included?", a: "Yes — fix verification is included in every package at no extra cost. After you implement the recommended fixes, we re-review all flagged items and issue a final clean report confirming resolution." },
  { q: "How do we pay?", a: "We accept USDC, USDT, ETH, or bank transfer (NGN or USD). 50% upfront, 50% on report delivery. Full payment upfront receives a 10% discount." },
];

const NAV_LINKS = [
  { label: "Compliance", href: "/compliance" },
  { label: "Security Audit", href: "/audit", active: true },
  { label: "Verify API", href: "/verify" },
];

export default function Audit() {
  useEffect(() => { document.title = "Smart Contract Security Audit | DecaFlow"; }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState("");
  const [formStep, setFormStep] = useState<"form"|"success">("form");
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ projectName:"", contactName:"", email:"", telegram:"", githubRepo:"", blockchain:"", language:"", linesOfCode:"", auditPackage:"", timeline:"", description:"" });

  const openForm = (pkg: string) => { setSelectedPkg(pkg); setFormData(p=>({...p,auditPackage:pkg})); setFormStep("form"); setFormOpen(true); document.body.style.overflow="hidden"; };
  const closeForm = () => { setFormOpen(false); document.body.style.overflow=""; };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try { await fetch(`${API_BASE}/v1/audit/enquiry`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...formData,source:"audit-page"})}); } catch {}
    setFormStep("success"); setFormLoading(false);
  };

  const inp: React.CSSProperties = {width:"100%",padding:"0.7rem 0.875rem",borderRadius:"8px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:"0.875rem",outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const sel: React.CSSProperties = {...inp,background:"#1f2937",cursor:"pointer"};

  return (
    <div style={{background:"#0A0E27",color:"#fff",minHeight:"100vh",fontFamily:"Inter,system-ui,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;}::placeholder{color:rgba(255,255,255,0.3);}
        .mob-btn{display:none!important;}.desk-nav{display:flex!important;}
        @media(max-width:768px){
          .mob-btn{display:flex!important;}.desk-nav{display:none!important;}
          .fg2{grid-template-columns:1fr!important;}
          .pkg-grid{grid-template-columns:1fr!important;}
          .scope-grid{grid-template-columns:1fr!important;}
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
            <a key={label} href={href} style={{color:active?"#ef4444":"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"0.9rem",fontWeight:active?600:400}}>{label}</a>
          ))}
          <button onClick={()=>openForm("Protocol Audit")} style={{background:"#ef4444",color:"#fff",padding:"0.5rem 1.25rem",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.875rem",fontWeight:600}}>Request Audit</button>
        </div>
        <button className="mob-btn" onClick={()=>setMenuOpen(!menuOpen)} style={{background:"none",border:"none",color:"#fff",fontSize:"1.5rem",cursor:"pointer",padding:"0.25rem"}}>{menuOpen?"✕":"☰"}</button>
      </nav>

      {menuOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,14,39,0.98)",zIndex:99,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2rem"}}>
          {NAV_LINKS.map(({label,href})=>(<a key={label} href={href} onClick={()=>setMenuOpen(false)} style={{color:"#fff",textDecoration:"none",fontSize:"1.5rem",fontWeight:700}}>{label}</a>))}
          <button onClick={()=>{setMenuOpen(false);openForm("Protocol Audit");}} style={{background:"#ef4444",color:"#fff",padding:"0.875rem 2.5rem",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"1rem",fontWeight:700}}>Request Audit</button>
        </div>
      )}

      {/* Hero */}
      <section style={{padding:"5rem 2rem 3rem",maxWidth:"1100px",margin:"0 auto",textAlign:"center"}}>
        <div style={{display:"inline-block",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"100px",padding:"0.4rem 1rem",fontSize:"0.78rem",color:"#FCA5A5",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:"1.5rem"}}>Security Audit Services</div>
        <h1 style={{fontSize:"clamp(1.8rem,5vw,3.4rem)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.03em",marginBottom:"1.5rem"}}>Smart Contract Audits{" "}<span style={{background:"linear-gradient(135deg,#ef4444,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>That Don't Cost a Fortune</span></h1>
        <p style={{fontSize:"1.05rem",color:"rgba(255,255,255,0.65)",maxWidth:"620px",margin:"0 auto 2.5rem",lineHeight:1.7}}>Professional, thorough, and formally documented security audits for DeFi protocols, token contracts, and blockchain applications.</p>
        <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>openForm("Protocol Audit")} style={{background:"#ef4444",color:"#fff",padding:"0.875rem 2rem",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"1rem",fontWeight:700}}>Request an Audit</button>
          <a href="#packages" style={{background:"rgba(255,255,255,0.06)",color:"#fff",padding:"0.875rem 2rem",borderRadius:"10px",textDecoration:"none",fontSize:"1rem",fontWeight:600,border:"1px solid rgba(255,255,255,0.12)"}}>View Packages</a>
        </div>
        <div style={{marginTop:"3.5rem",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",background:"rgba(255,255,255,0.04)",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden"}}>
          {[["CertiK / Trail of Bits","$20K–$100K","3–6 month wait","#ef4444"],["DecaFlow Audit","From $800","7-day turnaround","#22c55e"],["Random Freelancer","$200–$500","No formal report","#f59e0b"]].map(([l,v,s,c],i)=>(
            <div key={i} style={{padding:"1.5rem 1rem",textAlign:"center",borderRight:i<2?"1px solid rgba(255,255,255,0.08)":"none"}}>
              <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)",marginBottom:"0.5rem",textTransform:"uppercase"}}>{l}</div>
              <div style={{fontSize:"1.3rem",fontWeight:800,color:c as string}}>{v}</div>
              <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)",marginTop:"0.25rem"}}>{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What we check */}
      <section style={{padding:"4rem 2rem",maxWidth:"1100px",margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(1.4rem,3.5vw,2rem)",fontWeight:800,textAlign:"center",marginBottom:"2.5rem"}}>What we check — every time</h2>
        <div className="scope-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.25rem"}}>
          {AUDIT_SCOPE.map((item,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"1.5rem"}}>
              <div style={{fontSize:"1.5rem",marginBottom:"0.6rem"}}>{item.icon}</div>
              <h3 style={{fontSize:"0.95rem",fontWeight:700,marginBottom:"0.4rem"}}>{item.title}</h3>
              <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.82rem",lineHeight:1.6,margin:0}}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Severity */}
      <section style={{padding:"3rem 2rem",background:"rgba(255,255,255,0.02)",borderTop:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:"900px",margin:"0 auto"}}>
          <h2 style={{fontSize:"clamp(1.4rem,3.5vw,1.75rem)",fontWeight:800,textAlign:"center",marginBottom:"2rem"}}>How we rate severity</h2>
          <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            {SEVERITY.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"1rem",background:s.bg,border:`1px solid ${s.color}30`,borderRadius:"12px",padding:"1rem 1.25rem",flexWrap:"wrap"}}>
                <div style={{background:s.color,color:"#fff",padding:"0.25rem 0.75rem",borderRadius:"6px",fontSize:"0.75rem",fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{s.level}</div>
                <p style={{color:"rgba(255,255,255,0.7)",fontSize:"0.875rem",lineHeight:1.5,margin:0}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{padding:"4rem 2rem",maxWidth:"900px",margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(1.4rem,3.5vw,2rem)",fontWeight:800,textAlign:"center",marginBottom:"2.5rem"}}>How it works</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {PROCESS.map((p,i)=>(
            <div key={i} style={{display:"flex",gap:"1.25rem",alignItems:"flex-start",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"1.25rem"}}>
              <div style={{width:44,height:44,borderRadius:"12px",background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",fontWeight:800,color:"#ef4444",flexShrink:0}}>{p.step}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"0.5rem",marginBottom:"0.35rem"}}>
                  <h3 style={{fontSize:"0.95rem",fontWeight:700,margin:0}}>{p.title}</h3>
                  <span style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",padding:"0.2rem 0.6rem",borderRadius:"6px",fontSize:"0.72rem",fontWeight:600}}>{p.time}</span>
                </div>
                <p style={{color:"rgba(255,255,255,0.55)",fontSize:"0.85rem",lineHeight:1.6,margin:0}}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" style={{padding:"4rem 2rem",background:"rgba(255,255,255,0.02)",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <h2 style={{fontSize:"clamp(1.4rem,3.5vw,2rem)",fontWeight:800,textAlign:"center",marginBottom:"3rem"}}>Audit packages</h2>
          <div className="pkg-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1.5rem"}}>
            {PACKAGES.map((pkg,i)=>(
              <div key={i} style={{background:pkg.highlight?"rgba(239,68,68,0.06)":"rgba(255,255,255,0.03)",border:pkg.highlight?"1px solid rgba(239,68,68,0.3)":"1px solid rgba(255,255,255,0.08)",borderRadius:"20px",padding:"2rem",position:"relative"}}>
                {pkg.highlight&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#ef4444",color:"#fff",padding:"0.25rem 1rem",borderRadius:"100px",fontSize:"0.75rem",fontWeight:700,whiteSpace:"nowrap"}}>Most Popular</div>}
                <h3 style={{fontSize:"1.05rem",fontWeight:700,marginBottom:"0.35rem"}}>{pkg.name}</h3>
                <div style={{fontSize:"1.9rem",fontWeight:800,color:pkg.highlight?"#ef4444":"#fff",marginBottom:"0.25rem"}}>{pkg.price}</div>
                <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.45)",marginBottom:"0.75rem"}}>{pkg.deliverable}</div>
                <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"8px",padding:"0.5rem 0.75rem",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.4rem"}}><strong style={{color:"rgba(255,255,255,0.8)"}}>Scope:</strong> {pkg.scope}</div>
                <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"8px",padding:"0.5rem 0.75rem",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"1.25rem"}}><strong style={{color:"rgba(255,255,255,0.8)"}}>Ideal for:</strong> {pkg.ideal}</div>
                <ul style={{listStyle:"none",padding:0,margin:"0 0 1.5rem",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                  {pkg.includes.map((item,j)=><li key={j} style={{display:"flex",gap:"0.5rem",fontSize:"0.83rem",color:"rgba(255,255,255,0.7)"}}><span style={{color:"#22c55e",flexShrink:0}}>✓</span>{item}</li>)}
                </ul>
                <button onClick={()=>openForm(pkg.name)} style={{display:"block",width:"100%",padding:"0.875rem",borderRadius:"10px",fontWeight:700,fontSize:"0.9rem",background:pkg.highlight?"#ef4444":"rgba(255,255,255,0.07)",color:"#fff",border:pkg.highlight?"none":"1px solid rgba(255,255,255,0.12)",cursor:"pointer"}}>
                  Request This Audit
                </button>
              </div>
            ))}
          </div>
          <p style={{textAlign:"center",color:"rgba(255,255,255,0.4)",fontSize:"0.8rem",marginTop:"1.5rem"}}>50% upfront · 50% on report delivery · 10% discount for full upfront payment · USDC, USDT, ETH, or bank transfer accepted</p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:"4rem 2rem",maxWidth:"750px",margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(1.4rem,3.5vw,2rem)",fontWeight:800,textAlign:"center",marginBottom:"2.5rem"}}>Frequently asked questions</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {FAQS.map((faq,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",overflow:"hidden"}}>
              <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.25rem 1.5rem",background:"none",border:"none",color:"#fff",cursor:"pointer",textAlign:"left",gap:"1rem"}}>
                <span style={{fontSize:"0.9rem",fontWeight:600,lineHeight:1.4}}>{faq.q}</span>
                <span style={{fontSize:"1.2rem",color:"#ef4444",flexShrink:0}}>{openFaq===i?"−":"+"}</span>
              </button>
              {openFaq===i&&<div style={{padding:"0 1.5rem 1.25rem",color:"rgba(255,255,255,0.6)",fontSize:"0.875rem",lineHeight:1.7}}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"5rem 2rem",textAlign:"center",background:"rgba(239,68,68,0.04)",borderTop:"1px solid rgba(239,68,68,0.12)"}}>
        <h2 style={{fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:800,marginBottom:"1rem"}}>Don't launch unaudited.</h2>
        <p style={{color:"rgba(255,255,255,0.55)",fontSize:"1rem",maxWidth:"480px",margin:"0 auto 2.5rem",lineHeight:1.7}}>Every week a DeFi protocol gets exploited. Every time, the post-mortem says the same thing: it could have been caught in an audit.</p>
        <button onClick={()=>openForm("Protocol Audit")} style={{background:"#ef4444",color:"#fff",padding:"1rem 2.5rem",borderRadius:"12px",border:"none",cursor:"pointer",fontSize:"1.05rem",fontWeight:700}}>Request Your Audit</button>
      </section>

      <footer style={{borderTop:"1px solid rgba(255,255,255,0.08)",padding:"2rem 1.25rem",textAlign:"center",color:"rgba(255,255,255,0.35)",fontSize:"0.8rem"}}>
        © 2026 DecaFlow Solutions Limited · <a href="mailto:contact@decaflow.xyz" style={{color:"rgba(255,255,255,0.35)",textDecoration:"none"}}>contact@decaflow.xyz</a>
      </footer>

      {/* Form Modal */}
      {formOpen&&(
        <div onClick={e=>e.target===e.currentTarget&&closeForm()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",overflowY:"auto"}}>
          <div style={{background:"#111827",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"20px",width:"100%",maxWidth:"620px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{padding:"1.5rem 1.5rem 1rem",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <h2 style={{fontSize:"1.2rem",fontWeight:800,marginBottom:"0.25rem"}}>{formStep==="success"?"Request Received! 🎉":`Audit Request — ${selectedPkg}`}</h2>
                {formStep!=="success"&&<p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",margin:0}}>Our team will review and respond within 24 hours.</p>}
              </div>
              <button onClick={closeForm} style={{background:"rgba(255,255,255,0.07)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
            </div>
            {formStep==="success"?(
              <div style={{padding:"3rem 1.5rem",textAlign:"center"}}>
                <div style={{fontSize:"3.5rem",marginBottom:"1rem"}}>🔐</div>
                <h3 style={{fontSize:"1.2rem",fontWeight:700,marginBottom:"0.75rem"}}>Audit request submitted!</h3>
                <p style={{color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:"2rem"}}>We'll review your project and get back to <strong>{formData.email}</strong> within 24 hours.</p>
                <button onClick={closeForm} style={{background:"#ef4444",color:"#fff",padding:"0.875rem 2rem",borderRadius:"10px",border:"none",cursor:"pointer",fontWeight:700}}>Close</button>
              </div>
            ):(
              <form onSubmit={handleSubmit} style={{padding:"1.5rem"}}>
                <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.875rem",marginBottom:"0.875rem"}}>
                  {([["Project Name *","projectName","e.g. MyProtocol","text"],["Your Name *","contactName","Full name","text"],["Email *","email","you@project.com","email"],["Telegram / Discord","telegram","@handle","text"]] as [string,string,string,string][]).map(([label,field,ph,type])=>(
                    <div key={field}>
                      <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.35rem",fontWeight:600}}>{label}</label>
                      <input required={label.includes("*")} type={type} placeholder={ph} value={(formData as any)[field]} onChange={e=>setFormData(p=>({...p,[field]:e.target.value}))} style={inp}/>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:"0.875rem"}}>
                  <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.35rem",fontWeight:600}}>GitHub Repo *</label>
                  <input required type="url" placeholder="https://github.com/..." value={formData.githubRepo} onChange={e=>setFormData(p=>({...p,githubRepo:e.target.value}))} style={inp}/>
                </div>
                <div className="fg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.875rem",marginBottom:"0.875rem"}}>
                  <div>
                    <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.35rem",fontWeight:600}}>Blockchain</label>
                    <select value={formData.blockchain} onChange={e=>setFormData(p=>({...p,blockchain:e.target.value}))} style={sel}>
                      <option value="">Select chain</option>
                      {["Ethereum","Arbitrum","Base","Optimism","Polygon","Avalanche","BNB Chain","Solana","Multiple"].map(o=><option key={o} value={o} style={{background:"#1f2937"}}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.35rem",fontWeight:600}}>Desired Timeline</label>
                    <select value={formData.timeline} onChange={e=>setFormData(p=>({...p,timeline:e.target.value}))} style={sel}>
                      <option value="">Select timeline</option>
                      {["ASAP","Within 1 week","Within 2 weeks","Within 1 month","Flexible"].map(o=><option key={o} value={o} style={{background:"#1f2937"}}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{marginBottom:"1.25rem"}}>
                  <label style={{display:"block",fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.35rem",fontWeight:600}}>Describe Your Project *</label>
                  <textarea required value={formData.description} onChange={e=>setFormData(p=>({...p,description:e.target.value}))} rows={4}
                    placeholder="What does your protocol do? Any specific concerns or areas you want us to focus on?"
                    style={{...inp,resize:"vertical"}}/>
                </div>
                <button type="submit" disabled={formLoading} style={{width:"100%",padding:"1rem",borderRadius:"10px",background:"#ef4444",color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:"1rem",opacity:formLoading?0.6:1}}>
                  {formLoading?"Submitting...":`Submit Audit Request — ${selectedPkg}`}
                </button>
                <p style={{textAlign:"center",color:"rgba(255,255,255,0.35)",fontSize:"0.72rem",marginTop:"0.75rem"}}>🔒 Your code is kept strictly confidential. We sign an NDA on request.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
