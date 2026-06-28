Status: ✅ COMPLETE

# 14 — Pilot Cohort Rollout & Feedback Loop

## Pilot Cohort Design

### Target Cohort
- **Size**: 100–500 users (internal employees first, then selected customers)
- **Segment**: Age 25–45, moderate-to-high digital adoption, existing bank account holders
- **Duration**: 4 weeks
- **Success Criteria**: Zero suitability violations, >80% task completion, <5% error rate

### Feature Flags for Phased Rollout
| Flag | Default | Purpose |
|------|---------|---------|
| `voice_enabled` | false | Enable STT/TTS voice channel |
| `hindi_enabled` | false | Enable Hindi language support |
| `nudge_enabled` | true | Enable proactive nudge engine |
| `whatif_enabled` | true | Enable what-if simulator |
| `reco_types` | allocation,tax,idle_cash | Subset of recommendation types |

### Rollout Stages
1. **Week 1**: Internal employees (50 users), text-only, English, allocation + tax recos
2. **Week 2**: Expand to 200 users, add idle-cash nudges, enable what-if simulator
3. **Week 3**: Add voice channel (opt-in), Hindi support (opt-in)
4. **Week 4**: Full feature set, feedback collection, compliance review

## Monitoring During Pilot

### Key Metrics (per dashboard)
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Suitability violations | 0 | Any violation → immediate halt |
| Audit chain integrity | 100% valid | Any break → alert |
| Engine latency p95 | <500ms | >1s → warning |
| First-token latency p95 | <2.5s | >3s → warning |
| Consent revocation effect time | <1s | >2s → warning |
| Nudge daily cap respect | 100% | Any breach → alert |
| Error rate | <1% | >2% → warning |
| User satisfaction (CSAT) | >4.0/5 | <3.5 → review |

### Health Checks
- `/health` endpoint: Returns overall system health
- `/health/engine`: Engine latency + error rate
- `/health/compliance`: Audit integrity status
- Alert on any unhealthy component

## Feedback Collection

### In-App Feedback
- Post-interaction rating (1–5 stars) on each advisory turn
- "Was this helpful?" quick feedback on recommendation cards
- Free-text feedback on settings screen

### Weekly Review Process
1. **Monday**: Review pilot metrics dashboard
2. **Wednesday**: Analyze user feedback themes
3. **Friday**: Compliance + security review of audit logs

### Feedback Loop Actions
| Signal | Action |
|--------|--------|
| Repeated disclaimers ignored | Review disclaimer placement/wording |
| Low CSAT on voice channel | Review STT/TTS quality, adjust prompts |
| Suitability blocks increasing | Review risk band thresholds |
| Nudge dismissals > 70% | Review nudge triggers and frequency |
| What-if usage low | Improve discoverability, add onboarding |

## Rollback Plan

### Automatic Rollback Triggers
- Any suitability violation detected
- Audit chain integrity failure
- Error rate > 5% for 5 minutes
- PII leak detected in logs

### Manual Rollback Process
1. Disable feature flag for affected feature
2. Notify pilot cohort via in-app banner
3. File incident report
4. Root cause analysis within 24 hours
5. Fix + re-deploy after compliance sign-off

## Post-Pilot Criteria for Production

### Must-Have Before Production
- [ ] Zero suitability violations in pilot
- [ ] Audit trail 100% verifiable
- [ ] CSAT > 4.0/5
- [ ] Error rate < 1%
- [ ] Security review complete
- [ ] Compliance sign-off obtained
- [ ] Load test passed (1000 concurrent users)
- [ ] Disaster recovery tested

### Nice-to-Have
- [ ] Voice channel CSAT > 3.5/5
- [ ] Hindi parity with English
- [ ] What-if adoption > 30%
- [ ] Nudge acceptance rate > 20%
