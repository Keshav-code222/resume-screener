// LoadingAnalysis — shared "scanning" animation used by the live Analyze
// flow and the anonymous public scan. Same editorial treatment everywhere.

import { motion } from 'framer-motion';
import { colors, fonts } from '../../lib/theme';

export default function LoadingAnalysis() {
  return (
    <motion.div
      key="scanning"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
        minHeight: 400,
      }}
    >
      {/* Document icon with scanning line */}
      <div
        style={{
          position: 'relative',
          width: 100,
          height: 140,
          border: `1px solid ${colors.border}`,
          background: colors.card,
          overflow: 'hidden',
          marginBottom: 32,
        }}
      >
        <div
          style={{ position: 'absolute', top: 24, left: 20, width: '60%', height: 3, background: colors.border }}
        />
        <div
          style={{ position: 'absolute', top: 38, left: 20, width: '75%', height: 3, background: colors.border }}
        />
        <div
          style={{ position: 'absolute', top: 52, left: 20, width: '65%', height: 3, background: colors.border }}
        />
        <div
          style={{ position: 'absolute', top: 66, left: 20, width: '80%', height: 3, background: colors.border }}
        />
        <div
          style={{ position: 'absolute', top: 80, left: 20, width: '45%', height: 3, background: colors.border }}
        />
        {/* Scanning laser */}
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            background: colors.gold,
            boxShadow: `0 0 12px 3px ${colors.goldMuted}`,
          }}
        />
      </div>

      <motion.h2
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          fontFamily: fonts.serif,
          fontWeight: 400,
          fontSize: 20,
          color: colors.cream,
          marginBottom: 8,
        }}
      >
        Analyzing with AI
      </motion.h2>
      <p style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans }}>
        Extracting keywords, scoring skills, and mapping gaps...
      </p>
    </motion.div>
  );
}
