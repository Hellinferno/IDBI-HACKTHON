# 05 — Database Schema

Primary store: **PostgreSQL**. Cache: **Redis**. Embeddings: **Vector DB** (RAG corpus, separate).

## Conventions
- All tables: `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at`.
- Money stored as `numeric(18,2)` in minor-unit-safe decimal. Never float.
- Customer linked via tokenized `customer_ref` (no raw bank PII in app DB).
- Soft delete via `deleted_at` where retention applies.

## Core tables

### users
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| customer_ref | text unique | tokenized bank customer id |
| locale | text | e.g. en-IN, hi-IN |
| created_at / updated_at | timestamptz | |

### accounts
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk→users | |
| account_type | text | savings/current/demat |
| balance | numeric(18,2) | last synced |
| synced_at | timestamptz | |

### transactions
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| account_id | uuid fk→accounts | |
| amount | numeric(18,2) | signed |
| direction | text | credit/debit |
| description | text | raw narration |
| category_id | uuid fk→categories | nullable until classified |
| txn_date | date | |
| source_ref | text | dedupe key from core |

### categories
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text | groceries, rent, sip… |
| parent_id | uuid fk→categories | nullable |
| is_discretionary | bool | |

### financial_profiles
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk unique | one current per user |
| monthly_income | numeric(18,2) | |
| monthly_surplus | numeric(18,2) | |
| savings_rate | numeric(5,2) | % |
| spend_personality | text | saver/balanced/spender/drifter |
| life_stage | text | |
| computed_at | timestamptz | |

### risk_assessments
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk | |
| score | int | 0–100 |
| band | text | conservative/moderate/aggressive |
| questionnaire | jsonb | raw answers |
| valid_until | date | forces periodic retake |

### goals
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk | |
| name | text | |
| goal_type | text | retirement/home/education/emergency/custom |
| target_amount | numeric(18,2) | today's value |
| target_date | date | |
| inflation_rate | numeric(5,2) | assumption used |
| priority | int | |
| status | text | active/met/paused |

### goal_projections (snapshot of last compute)
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| goal_id | uuid fk | |
| required_corpus | numeric(18,2) | inflation-adjusted |
| monthly_contribution | numeric(18,2) | |
| projected_corpus | numeric(18,2) | |
| gap | numeric(18,2) | |
| assumptions | jsonb | return %, etc. |
| computed_at | timestamptz | |

### portfolios / holdings
**portfolios**: id, user_id, name.
**holdings**: id, portfolio_id, instrument_ref, asset_class, units numeric(18,4), avg_cost numeric(18,2), current_value numeric(18,2), as_of date.

### products (bank catalog)
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| product_code | text | |
| name | text | |
| asset_class | text | equity/debt/hybrid/cash |
| risk_band | text | |
| min_investment | numeric(18,2) | |
| attributes | jsonb | tenure, lock-in, tax flag |
| active | bool | |

### recommendations
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk | |
| reco_type | text | allocation/product/idle_cash/tax/rebalance |
| payload | jsonb | structured detail |
| rationale | text | |
| suitability_status | text | passed/blocked |
| disclaimer_id | uuid fk→disclaimers | |
| status | text | active/accepted/dismissed/expired |
| computation_inputs | jsonb | inputs that produced numbers |

### conversations / messages
**conversations**: id, user_id, started_at, channel(text/voice).
**messages**: id, conversation_id, role(user/assistant/system), content text, avatar_state text, tokens int, created_at.

### avatar_states (catalog, not per-row events)
| col | type | notes |
|---|---|---|
| key | text pk | idle/listening/thinking/speaking/alert/celebrate |
| color_hint | text | |
| motion_profile | text | |

### consents
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk | |
| scope | text | data_read/advisory/notifications |
| granted | bool | |
| granted_at / revoked_at | timestamptz | |

### audit_logs (immutable)
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk | |
| event_type | text | recommendation_shown/advice_given/consent_change |
| payload | jsonb | full inputs + output |
| hash | text | chained hash of prev for tamper-evidence |
| created_at | timestamptz | append-only |

### nudges
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk | |
| trigger | text | idle_cash/missed_sip/overspend/tax_deadline/goal_drift |
| payload | jsonb | |
| priority | int | |
| state | text | pending/shown/acted/dismissed |
| expires_at | timestamptz | |

## Key relations
- user 1—N accounts 1—N transactions N—1 categories
- user 1—1 financial_profile, 1—N risk_assessments (current = latest valid)
- user 1—N goals 1—N goal_projections
- user 1—N portfolios 1—N holdings
- user 1—N recommendations N—1 disclaimers, → audit_logs

## Retention
- transactions, profiles: while consent active + regulatory minimum.
- audit_logs: ≥ 7 years, append-only, never deleted.
- conversations: configurable; default 13 months.
