// Landing — 6 chapters of a Son Daven-style monograph.
// Prolog → About → Method → Results → Trust → Begin.

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import SiteNav from '../components/chrome/SiteNav';
import ChapterNav from '../components/chrome/ChapterNav';
import Footer from '../components/chrome/Footer';
import ChapterSection from '../components/editorial/ChapterSection';
import SerifHeadline from '../components/editorial/SerifHeadline';
import ItalicByline from '../components/editorial/ItalicByline';
import SignaturePhrase from '../components/editorial/SignaturePhrase';
import GoldDivider from '../components/editorial/GoldDivider';
import FilledButton from '../components/ui/FilledButton';
import GhostButton from '../components/ui/GhostButton';
import Counter from '../components/ui/Counter';
import MarqeeRow from '../components/ui/MarqeeRow';
import FullBleedImage from '../components/ui/FullBleedImage';
import Logo from '../components/ui/Logo';
import FadeUp from '../components/motion/FadeUp';
import StaggerChildren from '../components/motion/StaggerChildren';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { chapterIds, chapters } from '../lib/chapters';

// --- Background ambience: faint monospace "signals" drifting through the page
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
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {floatingItems.slice(0, 12).map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.18, 0.18, 0] }}
          transition={{ duration: 12, delay: i * 1.6, repeat: Infinity, repeatDelay: 6 }}
          style={{
            position: 'absolute',
            left: `${(i * 17 + 5) % 90}%`,
            top: `${(i * 13 + 8) % 85}%`,
            color: '#C9A961',
            fontSize: 12,
            fontFamily: '"JetBrains Mono", monospace',
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

// --- Hero scroll-fade
function HeroProlog() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <FullBleedImage variant="hero" style={{ minHeight: '100vh' }}>
      <motion.div
        ref={ref}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'clamp(7rem, 14vh, 10rem) clamp(1.25rem, 4vw, 4rem) clamp(4rem, 8vh, 6rem)',
          opacity: heroOpacity,
          y: heroY,
        }}
      >
        <FadeUp>
          <span
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 500,
              color: '#C9A961',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              marginBottom: 32,
              display: 'inline-block',
            }}
          >
            Chapter 00 — Prolog
          </span>
        </FadeUp>

        <SerifHeadline
          lines={['The AI that', 'reads you.']}
          size="xl"
          stagger={0.18}
          trigger="mount"
          style={{ textAlign: 'center', maxWidth: 900 }}
        />

        <FadeUp delay={0.6}>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(1.05rem, 1.6vw, 1.4rem)',
              color: '#7A7268',
              maxWidth: 560,
              margin: '36px auto 0',
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: '#F2E9D8' }}>by ResuMap</span> — a precise reading of your resume, mapped against the role you want.
          </p>
        </FadeUp>

        <FadeUp delay={0.85}>
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 56,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <FilledButton onClick={() => navigate('/login')}>
              Begin
            </FilledButton>
            <GhostButton onClick={() => {
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Tour the chapters
            </GhostButton>
          </div>
        </FadeUp>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: 9,
              fontWeight: 500,
              color: '#5C5550',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
            }}
          >
            scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 1,
              height: 24,
              background: 'linear-gradient(to bottom, #C9A961 0%, transparent 100%)',
            }}
          />
        </motion.div>
      </motion.div>
    </FullBleedImage>
  );
}

// --- Chapter 01: About
function AboutChapter() {
  return (
    <ChapterSection id="about" index="01" label="About" bg="ink-950">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(2rem, 6vw, 5rem)',
          alignItems: 'start',
        }}
      >
        <div>
          <SerifHeadline
            lines={['Most resumes', 'are never read.']}
            size="lg"
          />
          <FadeUp delay={0.3}>
            <GoldDivider mode="rule-diamond" style={{ marginTop: 32 }} />
          </FadeUp>
        </div>

        <StaggerChildren style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <FadeUp>
            <p
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 16,
                color: '#F2E9D8',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              The average job posting draws <span style={{ color: '#C9A961' }}>250 applications</span>.
              The average recruiter spends <span style={{ color: '#C9A961' }}>seven seconds</span> on yours.
              Most never make it past the first filter.
            </p>
          </FadeUp>
          <FadeUp>
            <p
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 16,
                color: '#7A7268',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              ResuMap reads what they read. It scores the match, names the gaps, and tells you, in plain
              prose, what to add before you send.
            </p>
          </FadeUp>
          <FadeUp>
            <p
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 17,
                color: '#F2E9D8',
                lineHeight: 1.6,
                margin: 0,
                paddingLeft: 16,
                borderLeft: '1px solid rgba(201, 169, 97, 0.4)',
              }}
            >
              Not a spell-check. A second pair of eyes, calibrated to the role.
            </p>
          </FadeUp>
          <FadeUp>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 16 }}>
              <Counter end={750000000} duration={2.4} size={48} />
              <span
                style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 12,
                  color: '#7A7268',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  maxWidth: 200,
                  lineHeight: 1.4,
                }}
              >
                resumes lost to filters each year
              </span>
            </div>
          </FadeUp>
        </StaggerChildren>
      </div>
    </ChapterSection>
  );
}

// --- Chapter 02: Method
const methodSteps = [
  {
    n: '01',
    title: 'Upload your manuscript.',
    body: 'A PDF or DOCX. We parse it into a structured profile of your skills, your history, the shape of your career so far.',
  },
  {
    n: '02',
    title: 'Paste the role.',
    body: 'The job description, in full. We score your match against it — keyword overlap, seniority fit, and the soft signals between the lines.',
  },
  {
    n: '03',
    title: 'Read the chapter.',
    body: 'A precise score, the skills you are missing, and three concrete recommendations written in your voice, not a template.',
  },
];

function MethodChapter() {
  return (
    <ChapterSection id="method" index="02" label="Method" bg="ink-900">
      <SerifHeadline lines={['Three readings.']} size="lg" />
      <FadeUp delay={0.3}>
        <p
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 18,
            color: '#7A7268',
            marginTop: 16,
            maxWidth: 560,
            lineHeight: 1.5,
          }}
        >
          How a single pass becomes a precise roadmap.
        </p>
      </FadeUp>

      <div style={{ marginTop: 'clamp(3rem, 8vh, 6rem)' }}>
        {methodSteps.map((step, i) => (
          <FadeUp key={step.n} delay={i * 0.1}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 2fr',
                gap: 'clamp(1.5rem, 4vw, 3rem)',
                padding: 'clamp(1.5rem, 4vh, 3rem) 0',
                borderBottom: i < methodSteps.length - 1 ? '1px solid #26221B' : 'none',
                alignItems: 'start',
              }}
              className="method-row"
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#C9A961',
                  letterSpacing: '0.08em',
                }}
              >
                {step.n}
              </span>
              <h3
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: 'clamp(1.4rem, 2.4vw, 2rem)',
                  fontWeight: 500,
                  color: '#F8F2E4',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 15,
                  color: '#7A7268',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {step.body}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </ChapterSection>
  );
}

// --- MarqeeRow between 02 and 03
function Interlude() {
  return (
    <div
      style={{
        background: '#0A0907',
        borderTop: '1px solid #26221B',
        borderBottom: '1px solid #26221B',
        padding: '32px 0',
      }}
    >
      <MarqeeRow
        text="ResuMap"
        repeat={6}
        duration={40}
        separator="·"
        opacity={0.5}
        size={14}
      />
    </div>
  );
}

// --- Chapter 03: Results (Dashboard preview card)
function ResultsChapter() {
  const [pressed, setPressed] = useState(false);
  const navigate = useNavigate();

  return (
    <ChapterSection id="results" index="03" label="Results" bg="ink-950">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: 'clamp(2rem, 6vw, 5rem)',
          alignItems: 'center',
        }}
      >
        <div>
          <SerifHeadline lines={['A precise', 'reading.']} size="lg" />
          <FadeUp delay={0.3}>
            <p
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 16,
                color: '#7A7268',
                marginTop: 24,
                lineHeight: 1.7,
                maxWidth: 420,
              }}
            >
              The dashboard gives you a single number — your match — and the
              path to improve it. No dashboards-for-dashboards-sake.
            </p>
          </FadeUp>
          <FadeUp delay={0.5}>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <GhostButton onClick={() => navigate('/login')}>
                Try a reading
              </GhostButton>
            </div>
          </FadeUp>
        </div>

        {/* Dashboard preview card */}
        <FadeUp delay={0.3} y={32}>
          <div
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            style={{
              position: 'relative',
              border: '1px solid #26221B',
              background: '#0F0D0A',
              padding: 'clamp(1.5rem, 3vw, 2.5rem)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 10,
                  color: '#C9A961',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                }}
              >
                Resume Match Score
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 10,
                  color: '#5C5550',
                }}
              >
                preview
              </span>
            </div>

            <div
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 11,
                color: '#7A7268',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Senior Engineer · Google
            </div>

            <div
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 'clamp(4.5rem, 9vw, 7rem)',
                fontWeight: 500,
                color: '#F8F2E4',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                marginBottom: 24,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={pressed ? 'after' : 'before'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'inline-block' }}
                >
                  {pressed ? '94' : '87'}
                </motion.span>
              </AnimatePresence>
              <span style={{ color: '#C9A961' }}>%</span>
            </div>

            {/* Brass hairline that animates 0 → match% */}
            <div
              style={{
                position: 'relative',
                height: 1,
                background: '#26221B',
                marginBottom: 28,
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: pressed ? '94%' : '87%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 1,
                  background: '#C9A961',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {['Distributed systems', 'Go', 'Kubernetes', 'gRPC'].map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 12,
                    color: '#F2E9D8',
                  }}
                >
                  <span style={{ color: '#C9A961' }}>✓</span>
                  {skill}
                </motion.div>
              ))}
            </div>

            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px solid #26221B',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 12,
                color: '#5C5550',
                textAlign: 'center',
                letterSpacing: '0.04em',
              }}
            >
              hold to compare — before and after
            </div>
          </div>
        </FadeUp>
      </div>
    </ChapterSection>
  );
}

// --- Chapter 04: Trust (testimonials + counters)
const testimonials = [
  {
    quote: 'It told me to add a single line about cost optimization. I got the interview within the week.',
    author: 'Eliza M.',
    role: 'Senior Backend, Stripe',
  },
  {
    quote: 'I have rewritten my resume eight times. ResuMap found two missing keywords in ninety seconds.',
    author: 'Daniel R.',
    role: 'Full Stack, Vercel',
  },
  {
    quote: 'The roadmap felt like a real human had read it. It had.',
    author: 'Priya K.',
    role: 'ML Engineer, Anthropic',
  },
];

function TrustChapter() {
  return (
    <ChapterSection id="trust" index="04" label="Trust" bg="ink-900">
      <SerifHeadline lines={['Voices from', 'the field.']} size="lg" />
      <FadeUp delay={0.3}>
        <GoldDivider mode="rule-diamond" style={{ marginTop: 32, justifyContent: 'flex-start' }} />
      </FadeUp>

      <div
        style={{
          marginTop: 'clamp(3rem, 8vh, 5rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 3rem)',
        }}
      >
        {testimonials.map((t, i) => (
          <FadeUp key={t.author} delay={i * 0.12}>
            <blockquote
              style={{
                margin: 0,
                padding: 0,
                borderLeft: '1px solid rgba(201, 169, 97, 0.4)',
                paddingLeft: 24,
              }}
            >
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
                  color: '#F2E9D8',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                "{t.quote}"
              </p>
              <footer
                style={{
                  marginTop: 20,
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 12,
                  color: '#C9A961',
                  letterSpacing: '0.04em',
                }}
              >
                — {t.author}
                <span
                  style={{
                    display: 'block',
                    color: '#5C5550',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  {t.role}
                </span>
              </footer>
            </blockquote>
          </FadeUp>
        ))}
      </div>

      {/* Counters row */}
      <div
        style={{
          marginTop: 'clamp(4rem, 10vh, 7rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 3rem)',
          paddingTop: 'clamp(2rem, 5vh, 3rem)',
          borderTop: '1px solid #26221B',
        }}
      >
        {[
          { end: 48293, label: 'Resumes read', suffix: '' },
          { end: 94, label: 'Avg. match lift', suffix: '%' },
          { end: 72, label: 'Interview rate', suffix: '%' },
          { end: 4.9, label: 'Candidate rating', suffix: '/5', decimals: 1 },
        ].map((stat, i) => (
          <FadeUp key={stat.label} delay={i * 0.1}>
            <div>
              <Counter
                end={stat.end}
                decimals={stat.decimals || 0}
                suffix={stat.suffix}
                size={48}
                color="cream-50"
              />
              <div
                style={{
                  marginTop: 8,
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 10,
                  color: '#7A7268',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </ChapterSection>
  );
}

// --- Chapter 05: Begin
function BeginChapter() {
  const navigate = useNavigate();
  return (
    <ChapterSection
      id="begin"
      index="05"
      label="Begin"
      bg="forest"
      py="clamp(8rem, 18vh, 14rem)"
      style={{ borderTop: '1px solid #26221B' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 28,
        }}
      >
        <SerifHeadline
          lines={['Your next chapter', 'starts here.']}
          size="xl"
          trigger="whileInView"
          style={{ textAlign: 'center' }}
        />
        <FadeUp delay={0.3}>
          <ItalicByline color="cream" size={16}>
            one free reading. no card. no catch.
          </ItalicByline>
        </FadeUp>
        <FadeUp delay={0.55}>
          <FilledButton
            onClick={() => navigate('/login')}
            style={{ marginTop: 24 }}
          >
            Begin — it's free
          </FilledButton>
        </FadeUp>
        <SignaturePhrase size={14} color="mute-500">
          * a monograph on being hired
        </SignaturePhrase>
      </div>
    </ChapterSection>
  );
}

// --- Main
export default function Landing() {
  const activeId = useScrollSpy(chapterIds);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: '#0A0907', position: 'relative' }}>
      <FloatingBg />
      <SiteNav transparent />
      <ChapterNav activeId={activeId} onSelect={scrollTo} />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* Prolog (no ChapterSection wrapper — uses FullBleedImage hero) */}
        <section id="prolog" style={{ position: 'relative' }}>
          <HeroProlog />
        </section>

        <AboutChapter />
        <MethodChapter />
        <Interlude />
        <ResultsChapter />
        <TrustChapter />
        <BeginChapter />
      </main>

      <Footer />
    </div>
  );
}
