import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────
   CalendarPro  —  Landing Page
   Aesthetic: Luxury Dark Editorial
   Palette: midnight navy · warm gold · coral accent
   Fonts: Platypi (display) · Outfit (body) · Archivo Black
───────────────────────────────────────────────────────── */

const G = {
  bg:       '#07111f',
  surface:  '#0d1a2e',
  card:     '#111f33',
  border:   'rgba(255,255,255,0.07)',
  gold:     '#e8b84b',
  goldDim:  '#c49a30',
  coral:    '#e8724b',
  text:     '#eef2ff',
  muted:    '#7a8daa',
  accent2:  '#4f9cf9',
};

/* ─── Tiny hooks ─────────────────────────────────────── */
const useInView = (threshold = 0.18) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
};

/* ─── Mini calendar mock ─────────────────────────────── */
const MINI_DAYS  = ['M','T','W','T','F','S','S'];
const MINI_DATES = [
  [null,null,1,2,3,4,5],
  [6,7,8,9,10,11,12],
  [13,14,15,16,17,18,19],
  [20,21,22,23,24,25,26],
  [27,28,29,30,31,null,null],
];
const EVENTS = new Set([8, 15, 22]);

const MiniCalendar = ({ month, accent }) => (
  <div style={{
    background: G.card, borderRadius: 16,
    border: `1px solid ${G.border}`,
    overflow: 'hidden',
    boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accent}22`,
  }}>
    <div style={{
      background: `linear-gradient(135deg, ${accent}dd, ${accent}88)`,
      padding: '14px 18px 12px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontFamily:'"Platypi",serif', fontSize:18, color:'#fff', fontWeight:700 }}>{month}</span>
      <span style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:'rgba(255,255,255,0.7)', letterSpacing:'0.1em' }}>2025</span>
    </div>
    <div style={{ padding:'12px 14px 14px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
        {MINI_DAYS.map((d,i) => (
          <div key={i} style={{ textAlign:'center', fontSize:10, fontWeight:700, fontFamily:'Outfit,sans-serif', color: i>=5?accent:G.muted, padding:'2px 0' }}>{d}</div>
        ))}
      </div>
      {MINI_DATES.map((row,ri) => (
        <div key={ri} style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {row.map((d,ci) => {
            const ev = d && EVENTS.has(d);
            return (
              <div key={ci} style={{
                textAlign:'center', fontSize:13, fontFamily:'Outfit,sans-serif',
                padding:'4px 2px', borderRadius:6, position:'relative',
                color: !d?'transparent': ev?accent: ci===5||ci===6?`${accent}99`:G.text,
                background: ev?`${accent}18`:'transparent',
                fontWeight: ev?700:400,
              }}>
                {d || ''}
                {ev && <span style={{ position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:accent }} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </div>
);

/* ─── Feature card ───────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, delay, accent }) => {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      background: G.card,
      border: `1px solid ${G.border}`,
      borderRadius: 20,
      padding: '32px 28px',
      transition: `opacity 0.6s ${delay}ms, transform 0.6s ${delay}ms`,
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(30px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position:'absolute', top:-30, right:-30,
        width:100, height:100, borderRadius:'50%',
        background:`${accent}09`,
      }}/>
      <div style={{
        width:52, height:52, borderRadius:14,
        background:`linear-gradient(135deg,${accent}33,${accent}11)`,
        border:`1px solid ${accent}33`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:24, color:accent, marginBottom:20,
      }}>{icon}</div>
      <div style={{ fontFamily:'"Syne",sans-serif', fontSize:19, fontWeight:700, color:G.text, marginBottom:10 }}>{title}</div>
      <div style={{ fontFamily:'Outfit,sans-serif', fontSize:14, color:G.muted, lineHeight:1.7 }}>{desc}</div>
    </div>
  );
};

/* ─── Step ───────────────────────────────────────────── */
const Step = ({ num, title, desc, delay }) => {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      display:'flex', gap:24, alignItems:'flex-start',
      transition:`opacity 0.6s ${delay}ms, transform 0.6s ${delay}ms`,
      opacity: vis?1:0, transform: vis?'translateX(0)':'translateX(-24px)',
    }}>
      <div style={{
        width:52, height:52, borderRadius:'50%', flexShrink:0,
        background:`linear-gradient(135deg,${G.gold},${G.coral})`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'"Archivo Black",sans-serif', fontSize:20, color:'#07111f',
        boxShadow:`0 8px 24px ${G.gold}44`,
      }}>{num}</div>
      <div>
        <div style={{ fontFamily:'"Syne",sans-serif', fontSize:18, fontWeight:700, color:G.text, marginBottom:6 }}>{title}</div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:14, color:G.muted, lineHeight:1.7 }}>{desc}</div>
      </div>
    </div>
  );
};

/* ─── Template preview card ──────────────────────────── */
const TemplateCard = ({ label, tag, icon, gradient, delay }) => {
  const [ref, vis] = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius:20, overflow:'hidden',
        border:`1px solid ${G.border}`,
        transition:`opacity 0.7s ${delay}ms, transform 0.7s ${delay}ms, box-shadow 0.3s`,
        opacity:vis?1:0, transform:vis?(hov?'translateY(-6px)':'translateY(0)'):'translateY(40px)',
        boxShadow: hov?`0 24px 60px rgba(0,0,0,0.5)`:  '0 8px 24px rgba(0,0,0,0.3)',
        cursor:'default',
      }}>
      <div style={{ height:180, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, position:'relative' }}>
        {icon}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(transparent,rgba(7,17,31,0.7))' }}/>
      </div>
      <div style={{ background:G.card, padding:'18px 22px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <span style={{ fontFamily:'"Syne",sans-serif', fontSize:17, fontWeight:700, color:G.text }}>{label}</span>
          <span style={{ fontFamily:'Outfit,sans-serif', fontSize:11, color:G.gold, background:`${G.gold}18`, border:`1px solid ${G.gold}33`, padding:'3px 10px', borderRadius:20, letterSpacing:'0.06em' }}>{tag}</span>
        </div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.muted }}>Professional print-ready layout</div>
      </div>
    </div>
  );
};

/* ─── MAIN LANDING ───────────────────────────────────── */
const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [heroVis, setHeroVis]   = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVis(true), 80);
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const [featRef, featVis] = useInView();
  const [ctaRef,  ctaVis]  = useInView(0.3);

  const btnBase = {
    display:'inline-flex', alignItems:'center', gap:8,
    padding:'13px 30px', borderRadius:12,
    fontFamily:'Outfit,sans-serif', fontSize:15, fontWeight:600,
    cursor:'pointer', border:'none', textDecoration:'none',
    transition:'transform 0.18s, box-shadow 0.18s',
  };

  return (
    <div style={{ background:G.bg, minHeight:'100vh', color:G.text, overflowX:'hidden' }}>

      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${G.bg}; }
        ::-webkit-scrollbar-thumb { background: ${G.gold}44; border-radius: 4px; }
        .lp-btn-gold:hover  { transform:translateY(-2px)!important; box-shadow:0 12px 32px ${G.gold}44!important; }
        .lp-btn-ghost:hover { transform:translateY(-2px)!important; background:rgba(255,255,255,0.06)!important; }
        .nav-link-lp { font-family:Outfit,sans-serif; font-size:14px; color:${G.muted}; text-decoration:none; transition:color 0.2s; }
        .nav-link-lp:hover { color:${G.text}; }
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(-3deg)} }
        @keyframes floatC { 0%,100%{transform:translateY(-8px)} 50%{transform:translateY(8px)} }
        @keyframes pulse  { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes shimmer{ 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:200,
        height:68,
        background: scrolled?`rgba(7,17,31,0.92)`:'transparent',
        backdropFilter: scrolled?'blur(20px)':'none',
        borderBottom: scrolled?`1px solid ${G.border}`:'none',
        transition:'all 0.3s',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 48px',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${G.gold},${G.coral})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
            📅
          </div>
          <span style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:18, color:G.text }}>
            Calendar<span style={{ color:G.gold }}>Pro</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display:'flex', alignItems:'center', gap:36 }}>
          <a href="#features" className="nav-link-lp">Features</a>
          <a href="#templates" className="nav-link-lp">Templates</a>
          <a href="#how" className="nav-link-lp">How it works</a>
        </div>

        {/* Auth buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Link to="/login" className="lp-btn-ghost" style={{ ...btnBase, background:'rgba(255,255,255,0.04)', color:G.text, border:`1px solid ${G.border}`, padding:'9px 22px' }}>
            Login
          </Link>
          <Link to="/register" className="lp-btn-gold" style={{ ...btnBase, background:`linear-gradient(135deg,${G.gold},${G.coral})`, color:'#07111f', padding:'9px 22px', boxShadow:`0 4px 16px ${G.gold}44` }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════ */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'100px 48px 60px', position:'relative', overflow:'hidden' }}>

        {/* Background glow blobs */}
        <div style={{ position:'absolute', top:'15%', left:'5%', width:500, height:500, borderRadius:'50%', background:`radial-gradient(circle,${G.gold}12 0%,transparent 70%)`, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'10%', right:'8%', width:400, height:400, borderRadius:'50%', background:`radial-gradient(circle,${G.coral}10 0%,transparent 70%)`, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'40%', right:'30%', width:300, height:300, borderRadius:'50%', background:`radial-gradient(circle,${G.accent2}08 0%,transparent 70%)`, pointerEvents:'none' }}/>

        {/* Grid dots texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(circle,${G.border} 1px,transparent 1px)`, backgroundSize:'40px 40px', pointerEvents:'none', opacity:0.5 }}/>

        {/* Left: Text */}
        <div style={{ flex:1, maxWidth:640, position:'relative', zIndex:2 }}>
          {/* Badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:`${G.gold}15`, border:`1px solid ${G.gold}33`,
            borderRadius:40, padding:'6px 16px', marginBottom:28,
            opacity: heroVis?1:0, transform: heroVis?'translateY(0)':'translateY(16px)',
            transition:'opacity 0.6s 0ms, transform 0.6s 0ms',
          }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:G.gold, animation:'pulse 2s infinite' }}/>
            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.gold, letterSpacing:'0.06em' }}>Personal Calendar Generator</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily:'"Platypi",serif', fontSize:'clamp(44px,5.5vw,72px)',
            fontWeight:700, lineHeight:1.1, margin:'0 0 24px',
            opacity: heroVis?1:0, transform: heroVis?'translateY(0)':'translateY(24px)',
            transition:'opacity 0.7s 100ms, transform 0.7s 100ms',
          }}>
            Design Calendars<br/>
            <span style={{ background:`linear-gradient(135deg,${G.gold},${G.coral})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              That Tell Your Story
            </span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontFamily:'Outfit,sans-serif', fontSize:18, color:G.muted,
            lineHeight:1.8, margin:'0 0 40px', maxWidth:520,
            opacity: heroVis?1:0, transform: heroVis?'translateY(0)':'translateY(24px)',
            transition:'opacity 0.7s 200ms, transform 0.7s 200ms',
          }}>
            Upload your photos, mark your special events, choose a stunning template — and create a beautiful print-ready calendar in minutes.
          </p>

          {/* CTAs */}
          <div style={{
            display:'flex', gap:14, flexWrap:'wrap',
            opacity: heroVis?1:0, transform: heroVis?'translateY(0)':'translateY(24px)',
            transition:'opacity 0.7s 300ms, transform 0.7s 300ms',
          }}>
            <Link to="/register" className="lp-btn-gold" style={{ ...btnBase, background:`linear-gradient(135deg,${G.gold},${G.coral})`, color:'#07111f', fontSize:16, padding:'14px 34px', boxShadow:`0 8px 28px ${G.gold}44` }}>
              <i className="bi bi-stars" /> Create Free Calendar
            </Link>
            <Link to="/login" className="lp-btn-ghost" style={{ ...btnBase, background:'rgba(255,255,255,0.04)', color:G.text, border:`1px solid ${G.border}`, fontSize:16, padding:'14px 34px' }}>
              <i className="bi bi-box-arrow-in-right" /> Login
            </Link>
          </div>

          {/* Social proof */}
          <div style={{
            marginTop:44, display:'flex', alignItems:'center', gap:20,
            opacity: heroVis?1:0, transition:'opacity 0.7s 450ms',
          }}>
            <div style={{ display:'flex' }}>
              {['#e8b84b','#e8724b','#4f9cf9','#52b788'].map((c,i) => (
                <div key={i} style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${c},${c}88)`, border:`2px solid ${G.bg}`, marginLeft:i?-10:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                  {['👩','👨','🧑','👩'][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily:'Outfit,sans-serif', fontSize:14, color:G.text, fontWeight:600 }}>1,200+ calendars created</div>
              <div style={{ fontFamily:'Outfit,sans-serif', fontSize:12, color:G.muted }}>Join thousands of happy users</div>
            </div>
          </div>
        </div>

        {/* Right: Floating calendars */}
        <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', position:'relative', minHeight:520, zIndex:2 }}>
          <div style={{ animation:'floatA 6s ease-in-out infinite', position:'absolute', right:'12%', top:'8%', width:240 }}>
            <MiniCalendar month="January" accent={G.gold} />
          </div>
          <div style={{ animation:'floatB 7s ease-in-out infinite 1s', position:'absolute', right:'38%', top:'30%', width:220 }}>
            <MiniCalendar month="March" accent={G.coral} />
          </div>
          <div style={{ animation:'floatC 5s ease-in-out infinite 0.5s', position:'absolute', right:'6%', bottom:'10%', width:200 }}>
            <MiniCalendar month="July" accent={G.accent2} />
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ═══════════════════════════════════ */}
      <div style={{ borderTop:`1px solid ${G.border}`, borderBottom:`1px solid ${G.border}`, padding:'28px 48px', display:'flex', justifyContent:'center', gap:'8%', flexWrap:'wrap', background:`${G.surface}88` }}>
        {[['3', 'Stunning Templates'],['📅', 'Custom Events & Dates'],['🖨️', 'Print-Ready Output'],['🖼️', 'Your Own Photos']].map(([val,lbl],i) => (
          <div key={i} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:30, color:G.gold, lineHeight:1 }}>{val}</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.muted, marginTop:4 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* ══ FEATURES ════════════════════════════════════ */}
      <section id="features" style={{ padding:'100px 48px' }}>
        <div ref={featRef} style={{ textAlign:'center', marginBottom:64, transition:'opacity 0.6s, transform 0.6s', opacity:featVis?1:0, transform:featVis?'translateY(0)':'translateY(30px)' }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.gold, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>Why CalendarPro</div>
          <h2 style={{ fontFamily:'"Platypi",serif', fontSize:'clamp(32px,4vw,52px)', fontWeight:700, margin:'0 0 16px', color:G.text }}>Everything You Need</h2>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:16, color:G.muted, maxWidth:500, margin:'0 auto' }}>Create beautiful, meaningful calendars with all the tools you need, right out of the box.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24, maxWidth:1100, margin:'0 auto' }}>
          <FeatureCard icon="🖼️" title="Your Photos, Your Story"     desc="Upload up to 12 personal photos — one for each month. Every page becomes a memory."      delay={0}   accent={G.gold}    />
          <FeatureCard icon="📌" title="Mark Special Events"         desc="Add birthdays, anniversaries, holidays. Your events appear beautifully highlighted on every date." delay={120} accent={G.coral}   />
          <FeatureCard icon="🎨" title="3 Professional Templates"    desc="Choose from Annual, Monthly Flip, or Quarterly layouts — each professionally designed."  delay={240} accent={G.accent2}  />
          <FeatureCard icon="🖨️" title="Print-Ready Output"          desc="Every calendar is sized and optimized for high-quality printing at home or at a print shop." delay={60}  accent={G.gold}    />
          <FeatureCard icon="🔒" title="Secure & Private"            desc="Your photos and data are safe. Only you can access your calendars — always." delay={180} accent={G.coral}   />
          <FeatureCard icon="⚡" title="Lightning Fast"              desc="Create a full 12-month calendar in under 5 minutes — no design skills needed." delay={300} accent={G.accent2}  />
        </div>
      </section>

      {/* ══ TEMPLATES ═══════════════════════════════════ */}
      <section id="templates" style={{ padding:'80px 48px', background:`${G.surface}55` }}>
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.gold, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>Choose Your Style</div>
          <h2 style={{ fontFamily:'"Platypi",serif', fontSize:'clamp(30px,4vw,48px)', fontWeight:700, color:G.text, margin:0 }}>3 Stunning Templates</h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24, maxWidth:1000, margin:'0 auto' }}>
          <TemplateCard label="Annual Wall"      tag="12-in-1"   icon="🌿" gradient={`linear-gradient(135deg,#1b4332,#2d6a4f,#52b788)`} delay={0}   />
          <TemplateCard label="Monthly Flip"     tag="Per Month" icon="🌑" gradient={`linear-gradient(135deg,#0c1220,#1e2d3d,#f59e0b44)`} delay={150} />
          <TemplateCard label="Quarterly Spread" tag="4-in-1"    icon="🔷" gradient={`linear-gradient(135deg,#1d4ed8,#4f46e5,#0ea5e9)`} delay={300} />
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════ */}
      <section id="how" style={{ padding:'100px 48px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
          {/* Left: steps */}
          <div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.gold, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>Simple Process</div>
            <h2 style={{ fontFamily:'"Platypi",serif', fontSize:'clamp(30px,3.5vw,46px)', fontWeight:700, color:G.text, margin:'0 0 48px' }}>Create in 4 Easy Steps</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:36 }}>
              <Step num="1" title="Create Your Account"    desc="Sign up free in seconds — no credit card required." delay={0}   />
              <Step num="2" title="Upload Your Photos"     desc="Add up to 12 personal photos for each month of your calendar." delay={120} />
              <Step num="3" title="Mark Your Events"       desc="Add birthdays, holidays, and special dates you want to remember." delay={240} />
              <Step num="4" title="Choose & Print"         desc="Pick a template, preview your calendar, and print it beautifully." delay={360} />
            </div>
          </div>

          {/* Right: visual */}
          <div style={{ position:'relative', display:'flex', justifyContent:'center' }}>
            <div style={{ width:320, padding:28, background:G.card, borderRadius:24, border:`1px solid ${G.border}`, boxShadow:`0 32px 80px rgba(0,0,0,0.5)` }}>
              <div style={{ fontFamily:'"Syne",sans-serif', fontSize:15, color:G.gold, fontWeight:700, marginBottom:20, letterSpacing:'0.06em' }}>PREVIEW</div>
              <MiniCalendar month="August" accent={G.gold} />
              <div style={{ marginTop:16, padding:'12px 16px', background:`${G.gold}12`, border:`1px solid ${G.gold}22`, borderRadius:12, display:'flex', alignItems:'center', gap:10 }}>
                <i className="bi bi-check-circle-fill" style={{ color:G.gold, fontSize:18 }}/>
                <span style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.muted }}>Ready to print!</span>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{ position:'absolute', top:-20, right:-10, background:`linear-gradient(135deg,${G.coral},${G.gold})`, borderRadius:14, padding:'10px 18px', boxShadow:`0 8px 24px ${G.coral}44`, animation:'floatB 5s ease-in-out infinite' }}>
              <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:13, color:'#07111f' }}>5 min ⚡</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════ */}
      <section style={{ padding:'80px 48px' }}>
        <div ref={ctaRef} style={{
          maxWidth:820, margin:'0 auto', textAlign:'center',
          background:`linear-gradient(135deg,${G.card},${G.surface})`,
          border:`1px solid ${G.border}`,
          borderRadius:28, padding:'60px 48px',
          position:'relative', overflow:'hidden',
          transition:'opacity 0.7s, transform 0.7s',
          opacity:ctaVis?1:0, transform:ctaVis?'scale(1)':'scale(0.96)',
          boxShadow:`0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}>
          <div style={{ position:'absolute', top:-60, left:-60, width:200, height:200, borderRadius:'50%', background:`${G.gold}10` }}/>
          <div style={{ position:'absolute', bottom:-40, right:-40, width:160, height:160, borderRadius:'50%', background:`${G.coral}10` }}/>

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontFamily:'"Platypi",serif', fontSize:'clamp(28px,3.5vw,44px)', fontWeight:700, color:G.text, margin:'0 0 16px' }}>
              Start Creating Today
            </h2>
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:17, color:G.muted, margin:'0 0 36px', lineHeight:1.7 }}>
              Join thousands of people who've already created beautiful personal calendars. It's free to get started.
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/register" className="lp-btn-gold" style={{ ...btnBase, background:`linear-gradient(135deg,${G.gold},${G.coral})`, color:'#07111f', fontSize:16, padding:'14px 36px', boxShadow:`0 8px 28px ${G.gold}44` }}>
                <i className="bi bi-stars" /> Create Your Calendar — Free
              </Link>
              <Link to="/login" className="lp-btn-ghost" style={{ ...btnBase, background:'rgba(255,255,255,0.05)', color:G.text, border:`1px solid ${G.border}`, fontSize:16, padding:'14px 28px' }}>
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════ */}
      <footer style={{ borderTop:`1px solid ${G.border}`, padding:'36px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${G.gold},${G.coral})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>📅</div>
          <span style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:16, color:G.text }}>Calendar<span style={{ color:G.gold }}>Pro</span></span>
        </div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.muted }}>
          © {new Date().getFullYear()} CalendarPro — Made with ❤️ for beautiful memories
        </div>
        <div style={{ display:'flex', gap:20 }}>
          <Link to="/login"    style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.muted, textDecoration:'none' }}>Login</Link>
          <Link to="/register" style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:G.muted, textDecoration:'none' }}>Register</Link>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
