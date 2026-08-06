// AnalysisResults — shared renderer for a single analysis result.
// Used by the live scan (Analyze) and by saved analyses (SavedAnalysis).
// Action buttons are configurable so each caller supplies its own flow.

import { motion } from 'framer-motion';
import { colors, fonts } from '../../lib/theme';
import FilledButton from '../ui/FilledButton';
import GhostButton from '../ui/GhostButton';

export default function AnalysisResults({
  analysis,
  primaryLabel = 'Scan Another Job',
  primaryAction,
  secondaryLabel = 'Back to Dashboard',
  secondaryAction,
}) {
  const score = Number(analysis.match_score || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Score Card */}
      <div style={{ border: `1px solid ${colors.border}`, background: colors.card, padding: 32 }}>
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
              fontFamily: fonts.sans,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: colors.gold,
            }}
          >
            Overall Match Score
          </span>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: colors.textDim,
            }}
          >
            {analysis.job_title}
          </span>
        </div>

        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: 72,
            fontWeight: 500,
            color: colors.cream,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          {score}<span style={{ fontSize: 32, color: colors.gold }}>%</span>
        </div>

        {/* Progress bar — gold hairline */}
        <div
          style={{
            position: 'relative',
            height: 1,
            background: colors.border,
            marginBottom: 24,
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: 1,
              background: colors.gold,
            }}
          />
        </div>

        <p
          style={{
            color: colors.textMuted,
            fontSize: 15,
            fontFamily: fonts.sans,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {analysis.verdict ||
            (score >= 80
              ? 'Excellent match. Your resume aligns very well with the requirements.'
              : score >= 60
                ? 'Good match. Some adjustments recommended to improve your chances.'
                : 'Needs improvement. Focus on the missing skills below.')}
        </p>
      </div>

      {/* Missing Skills */}
      {analysis.missing_skills && analysis.missing_skills.length > 0 && (
        <div style={{ border: `1px solid ${colors.border}`, background: colors.card, padding: 24 }}>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: 16,
            }}
          >
            Missing Keywords &amp; Skills
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {analysis.missing_skills.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  padding: '6px 14px',
                  border: `1px solid rgba(239, 68, 68, 0.3)`,
                  background: colors.error,
                  color: colors.errorText,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div style={{ border: `1px solid ${colors.goldBorder}`, background: colors.goldBg, padding: 24 }}>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: colors.gold,
              marginBottom: 16,
            }}
          >
            AI Recommendations
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analysis.recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px 20px',
                  border: `1px solid ${colors.border}`,
                  background: colors.ink,
                }}
              >
                <p
                  style={{
                    color: colors.cream,
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: fonts.serif,
                    marginBottom: 4,
                    margin: 0,
                  }}
                >
                  {rec.text}
                </p>
                {rec.action && (
                  <p style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans, margin: '6px 0 0' }}>
                    {rec.action}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        {primaryAction && (
          <FilledButton onClick={primaryAction} style={{ flex: 1 }}>
            {primaryLabel}
          </FilledButton>
        )}
        {secondaryAction && (
          <GhostButton onClick={secondaryAction} style={{ flex: 1 }}>
            {secondaryLabel}
          </GhostButton>
        )}
      </div>
    </motion.div>
  );
}
