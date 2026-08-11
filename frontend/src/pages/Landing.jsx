// Landing — 6 chapters of a Son Daven-style monograph.
// Prolog → About → Method → Results → Trust → Begin.
//
// NOTE: All scroll-driven effects have been removed (no useScroll, no
// useTransform, no IntersectionObserver fade-ins). Every section is a
// plain block in the document flow, so the page is rock-stable during
// scroll. Section navigation (ChapterNav) still works via scrollIntoView.

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import MarqeeRow from '../components/ui/MarqeeRow';
import { chapterIds, chapters } from '../lib/chapters';

// --- Hero (Prolog) — fixed-height section, fully static. No scroll effects.
function HeroProlog() {
  const navigate = useNavigate();

  return (
    <section
      id="prolog"
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: 640,
        width: '100%',
        background: '#0A0907',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {/* Static gradient layer — pinned to the section */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(201, 169, 97, 0.12) 0%, rgba(10, 9, 7, 0) 50%), radial-gradient(ellipse at 80% 80%, rgba(14, 31, 25, 0.6) 0%, rgba(10, 9, 7, 0) 60%), #0A0907',
          zIndex: 0,
        }}
      />
      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'clamp(7rem, 14vh, 10rem) clamp(1.25rem, 4vw, 4rem) clamp(4rem, 8vh, 6rem)',
        }}
      >
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

        <SerifHeadline
          lines={['The AI that', 'reads you.']}
          size="xl"
          style={{ textAlign: 'center', maxWidth: 900 }}
        />

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

        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 56,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <FilledButton onClick={() => navigate('/scan')}>
            Try a free scan
          </FilledButton>
          <GhostButton
            onClick={() => {
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Tour the chapters
          </GhostButton>
        </div>

        {/* Scroll cue (static) */}
        <div
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
          <div
            style={{
              width: 1,
              height: 24,
              background: 'linear-gradient(to bottom, #C9A961 0%, transparent 100%)',
            }}
          />
        </div>
      </div>
    </section>
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
          <SerifHeadline lines={['Most resumes', 'are never read.']} size="lg" />
          <div style={{ marginTop: 32 }}>
            <GoldDivider mode="rule-diamond" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              marginTop: 16,
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 48,
              fontWeight: 500,
              color: '#F8F2E4',
            }}
          >
            <span>750,000,000</span>
            <span
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 12,
                color: '#7A7268',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                maxWidth: 200,
                lineHeight: 1.4,
                fontWeight: 400,
              }}
            >
              resumes lost to filters each year
            </span>
          </div>
        </div>
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

      <div style={{ marginTop: 'clamp(3rem, 8vh, 6rem)' }}>
        {methodSteps.map((step, i) => (
          <div
            key={step.n}
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
          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <GhostButton onClick={() => navigate('/scan')}>Try a reading</GhostButton>
          </div>
        </div>

        {/* Dashboard preview card — fully static, no animation */}
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
            <span style={{ display: 'inline-block' }}>
              {pressed ? '94' : '87'}
            </span>
            <span style={{ color: '#C9A961' }}>%</span>
          </div>

          {/* Brass hairline — static width */}
          <div
            style={{
              position: 'relative',
              height: 1,
              background: '#26221B',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: 1,
                width: pressed ? '94%' : '87%',
                background: '#C9A961',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {['Distributed systems', 'Go', 'Kubernetes', 'gRPC'].map((skill) => (
              <div
                key={skill}
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
              </div>
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
      <div style={{ marginTop: 32 }}>
        <GoldDivider mode="rule-diamond" style={{ justifyContent: 'flex-start' }} />
      </div>

      <div
        style={{
          marginTop: 'clamp(3rem, 8vh, 5rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 3rem)',
        }}
      >
        {testimonials.map((t) => (
          <blockquote
            key={t.author}
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
              &ldquo;{t.quote}&rdquo;
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
              &mdash; {t.author}
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
        ))}
      </div>

      {/* Counters row — static values, no animation */}
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
          { value: '48,293', label: 'Resumes read' },
          { value: '94%', label: 'Avg. match lift' },
          { value: '72%', label: 'Interview rate' },
          { value: '4.9/5', label: 'Candidate rating' },
        ].map((stat) => (
          <div key={stat.label}>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 48,
                fontWeight: 500,
                color: '#F8F2E4',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {stat.value}
            </div>
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
          style={{ textAlign: 'center' }}
        />
        <ItalicByline color="cream" size={16}>
          one free reading. no card. no catch.
        </ItalicByline>
        <FilledButton onClick={() => navigate('/scan')} style={{ marginTop: 24 }}>
          Begin &mdash; it&rsquo;s free
        </FilledButton>
        <SignaturePhrase size={14} color="mute-500">
          * a monograph on being hired
        </SignaturePhrase>
      </div>
    </ChapterSection>
  );
}

// --- Main
export default function Landing() {
  // Plain scroll-spy: a passive scroll listener that picks the section whose
  // top is closest to a target line ~30% from the top of the viewport.
  // No IntersectionObserver, no animation — just a single rAF-throttled
  // read on scroll.
  const [activeId, setActiveId] = useState(chapterIds[0]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const target = window.innerHeight * 0.3;
        let best = chapterIds[0];
        let bestDist = Infinity;
        for (const id of chapterIds) {
          const el = document.getElementById(id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          const dist = Math.abs(top - target);
          if (top <= target && dist < bestDist) {
            best = id;
            bestDist = dist;
          }
        }
        setActiveId((cur) => (cur === best ? cur : best));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: '#0A0907' }}>
      <SiteNav transparent />
      <ChapterNav activeId={activeId} onSelect={scrollTo} />

      <main>
        <HeroProlog />
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
