// AnalysisResults — shared renderer for a single analysis result.
// Used by the live scan (Analyze) and by saved analyses (SavedAnalysis).
// Action buttons are configurable so each caller supplies its own flow.

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { api } from '../../lib/api';
import { colors, fonts } from '../../lib/theme';
import FilledButton from '../ui/FilledButton';
import GhostButton from '../ui/GhostButton';
import { Sparkles, Copy, Loader2 } from 'lucide-react';

export default function AnalysisResults({
  analysis,
  primaryLabel = 'Scan Another Job',
  primaryAction,
  secondaryLabel = 'Back to Dashboard',
  secondaryAction,
}) {
  const [fixingIndex, setFixingIndex] = useState(null);
  const [fixes, setFixes] = useState({});
  const score = Number(analysis.match_score || 0);

  const handleFix = async (index) => {
    setFixingIndex(index);
    try {
      const res = await api.post(`/api/analyses/${analysis.id}/fix`, {
        recommendation_index: index,
      });
      setFixes((prev) => ({ ...prev, [index]: res.data }));
    } catch (err) {
      console.error('Fix failed:', err);
      alert('Failed to generate fix. Please try again.');
    } finally {
      setFixingIndex(null);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/api/analyses/${analysis.id}/export`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ResuMap_Report_${analysis.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export PDF. Please try again.');
    }
  };

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

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <GhostButton
                    small
                    onClick={() => handleFix(idx)}
                    disabled={fixingIndex === idx}
                    style={{ gap: 6, fontSize: 11, padding: '4px 10px' }}
                  >
                    {fixingIndex === idx ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    {fixingIndex === idx ? 'Generating...' : 'Fix this'}
                  </GhostButton>
                </div>

                <AnimatePresence>
                  {fixes[idx] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: `1px solid ${colors.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}
                    >
                      {fixes[idx].suggestions.map((sug, sIdx) => (
                        <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{
                            background: colors.card,
                            padding: '12px',
                            borderRadius: 4,
                            border: `1px solid ${colors.border}`,
                            color: colors.cream,
                            fontFamily: fonts.sans,
                            fontSize: 13,
                            lineHeight: 1.5,
                            position: 'relative'
                          }}>
                            {sug.content}
                            <button
                              onClick={() => copyToClipboard(sug.content)}
                              style={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                background: 'transparent',
                                border: 'none',
                                color: colors.gold,
                                cursor: 'pointer',
                                padding: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Copy to clipboard"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <p style={{
                            fontSize: 11,
                            color: colors.textMuted,
                            fontFamily: fonts.sans,
                            fontStyle: 'italic',
                            marginLeft: 4
                          }}>
                            {sug.explanation}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
        <GhostButton onClick={handleExport} style={{ flex: 1 }}>
          Export PDF
        </GhostButton>
        {secondaryAction && (
          <GhostButton onClick={secondaryAction} style={{ flex: 1 }}>
            {secondaryLabel}
          </GhostButton>
        )}
      </div>
    </motion.div>
  );
}
