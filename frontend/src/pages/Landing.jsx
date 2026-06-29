import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const floatingItems = [
  'MATCH 94', 'Python · Flask', 'offer received', 'Senior Engineer · Google',
  'MATCH 78', 'React · TypeScript', 'interview scheduled', 'Backend Dev · Stripe',
  'MATCH 87', 'AWS · Docker', 'resume optimized', 'Full Stack · Vercel',
  'MATCH 91', 'Machine Learning', 'skills gap closed', 'Data Scientist · OpenAI',
  'MATCH 83', 'Node.js · SQL', 'application sent', 'DevOps · Cloudflare',
  'MATCH 96', 'PyTorch · CUDA', 'offer negotiated', 'AI Engineer · Anthropic',
];

function FloatingBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.18, 0.18, 0] }}
          transition={{ duration: 8, delay: i * 1.1, repeat: Infinity, repeatDelay: 4 }}
          style={{
            position: 'absolute',
            left: `${(i * 17 + 5) % 90}%`,
            top: `${(i * 13 + 8) % 85}%`,
            color: '#ffffff',
            fontSize: '13px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            letterSpacing: '0.05em',
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}

function NavLink({ children }) {
  return (
    <motion.a
      whileHover={{ color: '#ffffff' }}
      style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s' }}
    >
      {children}
    </motion.a>
  );
}

function FeatureRow({ number, title, desc, delay }) {
  const [ref, inView] = useInView({ triggerOnce: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr 2fr',
        gap: '32px',
        padding: '32px 0',
        borderBottom: '1px solid #1a1a1a',
        alignItems: 'start',
      }}
    >
      <span style={{ color: '#333', fontSize: '13px', fontFamily: 'monospace', paddingTop: '4px' }}>{number}</span>
      <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>{title}</span>
      <span style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6' }}>{desc}</span>
    </motion.div>
  );
}

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: 'white', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <FloatingBg />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 48px',
          background: 'rgba(8,8,8,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #111',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'black', fontWeight: '900', fontSize: '14px' }}>R</span>
          </div>
          <span style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '-0.3px' }}>resumap.</span>
        </div>

        <div style={{ display: 'flex', gap: '36px' }}>
          <NavLink>Resume Score</NavLink>
          <NavLink>Roadmaps</NavLink>
          <NavLink>Interview Prep</NavLink>
          <NavLink>Pricing</NavLink>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <motion.button
            whileHover={{ color: '#fff' }}
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
          >
            Sign in
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, background: '#f0f0f0' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            style={{ background: 'white', border: 'none', borderRadius: '100px', color: 'black', fontSize: '14px', fontWeight: '600', padding: '10px 20px', cursor: 'pointer' }}
          >
            Start free →
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 48px', paddingTop: '80px' }}>
        <motion.div style={{ opacity }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ maxWidth: '820px' }}
          >
            <p style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '32px' }}>
              AI-Powered Career Navigation
            </p>

            <h1 style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: '800', lineHeight: '1.0', letterSpacing: '-3px', marginBottom: '32px', color: 'white' }}>
              The AI that gets<br />
              <span style={{ color: '#3B82F6' }}>you hired.</span>
            </h1>

            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '520px', lineHeight: '1.7', marginBottom: '48px' }}>
              ResuMap analyzes your resume, maps skill gaps, and gives you a precise roadmap to your next role. Built for the most competitive job market in years.
            </p>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.02, background: '#f0f0f0' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                style={{ background: 'white', border: 'none', borderRadius: '100px', color: 'black', fontSize: '16px', fontWeight: '700', padding: '14px 32px', cursor: 'pointer' }}
              >
                Start free →
              </motion.button>
              <span style={{ color: '#333', fontSize: '13px' }}>No credit card required</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', borderTop: '1px solid #111' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', maxWidth: '700px' }}>
          {[
            { value: 10000, suffix: '+', label: 'Resumes analyzed' },
            { value: 98, suffix: '%', label: 'AI accuracy rate' },
            { value: 30, suffix: 's', label: 'Time to results' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ padding: '0 32px 0 0' }}
            >
              <div style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1px', color: 'white' }}>
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ color: '#444', fontSize: '14px', marginTop: '4px' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: '900px' }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ color: '#333', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '48px' }}
          >
            What ResuMap does
          </motion.p>

          <FeatureRow number="01" title="Resume Analysis" desc="Upload your resume. Get a match score, a list of missing keywords, and exact edits to make — all in under 30 seconds." delay={0} />
          <FeatureRow number="02" title="Skill Gap Mapping" desc="Paste any job description. See exactly which skills you have, which you're missing, and how far you are from a perfect match." delay={0.1} />
          <FeatureRow number="03" title="Career Roadmap" desc="Tell us your target role. Get a step-by-step learning path with free resources, projects, and certifications to get there." delay={0.2} />
          <FeatureRow number="04" title="Interview Prep" desc="Practice with real interview questions for your target role. Get AI feedback on your answers instantly. Coming soon." delay={0.3} />
          <FeatureRow number="05" title="Auto Apply" desc="Set your preferences. ResuMap automatically applies to matching jobs with your tailored resume. Premium feature." delay={0.4} />
        </div>
      </section>

      {/* Pricing */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: '900px' }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ color: '#333', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '48px' }}
          >
            Pricing
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#111' }}>
            {[
              {
                plan: 'Free',
                price: '$0',
                sub: 'forever',
                features: ['5 resume analyses / month', 'Job match scoring', 'Skill gap analysis', 'Improvement suggestions'],
                cta: 'Get started',
                highlight: false,
              },
              {
                plan: 'Pro',
                price: '$9.99',
                sub: 'per month',
                features: ['Unlimited analyses', 'Career roadmaps', 'Interview prep (soon)', 'Auto-apply to jobs (soon)', 'Priority support'],
                cta: 'Start free trial →',
                highlight: true,
              },
            ].map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: tier.highlight ? '#0d0d0d' : '#080808',
                  padding: '48px',
                  position: 'relative',
                }}
              >
                {tier.highlight && (
                  <div style={{ position: 'absolute', top: '24px', right: '24px', background: '#3B82F6', color: 'white', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.05em' }}>
                    POPULAR
                  </div>
                )}
                <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '16px' }}>{tier.plan}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-2px', color: 'white' }}>{tier.price}</span>
                  <span style={{ color: '#444', fontSize: '14px' }}>{tier.sub}</span>
                </div>
                <div style={{ height: '1px', background: '#111', margin: '32px 0' }} />
                {tier.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', color: '#9ca3af', fontSize: '14px' }}>
                    <span style={{ color: '#3B82F6', fontSize: '16px' }}>—</span> {f}
                  </div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.02, background: tier.highlight ? '#2563eb' : '#1a1a1a' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    marginTop: '32px',
                    background: tier.highlight ? '#3B82F6' : 'transparent',
                    border: tier.highlight ? 'none' : '1px solid #222',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {tier.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 48px', borderTop: '1px solid #111' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: '800', letterSpacing: '-2px', marginBottom: '24px', lineHeight: '1.1' }}>
            Your next job starts<br />with one upload.
          </h2>
          <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '48px' }}>
            Free to start. Takes 30 seconds.
          </p>
          <motion.button
            whileHover={{ scale: 1.02, background: '#f0f0f0' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            style={{ background: 'white', border: 'none', borderRadius: '100px', color: 'black', fontSize: '16px', fontWeight: '700', padding: '16px 36px', cursor: 'pointer' }}
          >
            Analyze my resume →
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '32px 48px', borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '22px', height: '22px', background: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'black', fontWeight: '900', fontSize: '11px' }}>R</span>
          </div>
          <span style={{ fontWeight: '700', fontSize: '14px' }}>resumap.</span>
        </div>
        <p style={{ color: '#333', fontSize: '13px' }}>© 2026 ResuMap. All rights reserved.</p>
      </footer>
    </div>
  );
}