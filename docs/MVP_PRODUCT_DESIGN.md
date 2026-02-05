# ANGLA - The AI Couple Finance Copilot

## Product Design Document (PRD) — MVP

> **One-liner:** Angla is the first AI-powered financial copilot built exclusively for couples, turning money fights into money wins through income-proportional splitting, predictive budgeting, and intelligent settlement.

---

## 1. THE MARKET GAP (Why This Will Make Money)

### What Exists Today

| App | Users | Revenue | Weakness |
|-----|-------|---------|----------|
| **Splitwise** | 50M+ | ~$6.6M/yr | Generic groups, aggressive paywall, no AI, no couples focus |
| **Tricount** | 17M+ | Ad-based | No AI, no smart splitting, basic features |
| **Splid** | 5M+ | Freemium | No AI, no income-proportional logic |
| **Venmo/PayPal** | 100M+ | Transaction fees | Payment only, no expense intelligence |

### What NOBODY Does

1. **No app uses AI to analyze couple spending patterns** — $0 competition
2. **No app splits expenses proportionally by income** — everyone does 50/50
3. **No app predicts overspending before it happens** — all are retroactive
4. **No app acts as a neutral financial mediator** for couples
5. **No app combines tracking + settlement + AI coaching** in one product

### The Opportunity

- **70% of couples** report fighting about money (American Psychological Association)
- **Money is the #1 cause of relationship stress** across all demographics
- The AI-in-fintech market is worth **$30B in 2025**, projected **$83B by 2030**
- Splitwise proves the model works at $6.6M revenue with a *generic* product
- **A couples-specific, AI-powered product can capture 10x the ARPU**

---

## 2. PRODUCT VISION

### Core Differentiators (Moat)

```
SPLITWISE                          ANGLA
─────────────────────────────      ─────────────────────────────
Generic groups                  →  Couples-first design
50/50 splits                    →  Income-proportional fairness
Manual tracking only            →  AI predictive insights
No settlement                   →  One-tap payment settlement
Retroactive only                →  Predictive budget alerts
No relationship context         →  Financial harmony score
Basic charts                    →  AI spending coach
```

### Target Personas

**Primary: "The Fair Couple" (TAM: 200M+ couples globally)**
- Couples (married or cohabiting) with different incomes
- Ages 25-45, digitally native
- Want fairness without awkward money conversations
- Currently using spreadsheets, Splitwise, or nothing

**Secondary: "The Optimizers"**
- Couples saving for specific goals (house, wedding, vacation)
- Want data-driven financial planning together
- Willing to pay for premium AI insights

---

## 3. MVP FEATURE SET

### Phase 1 — Core MVP (8 weeks)

#### 3.1 Smart Income-Proportional Splitting (Already Built)
Your existing calculation engine is the **foundation moat**. No competitor has this.

```
Simon earns €3,000/month (70.6%)
André earns €1,250/month (29.4%)

€150 grocery bill paid by Simon:
  → Simon's fair share: €105.98
  → André's fair share: €44.02
  → André owes Simon: €44.02
```

**Enhancement for MVP:** Add dynamic income updates (salary changes, bonuses, freelance income).

#### 3.2 AI Spending Coach (NEW — Key Differentiator)

The AI analyzes spending patterns and provides actionable insights:

```
┌─────────────────────────────────────────────────────┐
│  🧠 AI Insight of the Week                          │
│                                                     │
│  "You spent 43% more on restaurants this month      │
│   than your 3-month average. At this pace, you'll   │
│   exceed your dining budget by €180.                 │
│                                                     │
│   Suggestion: Try cooking 2 more meals at home      │
│   this week — you'd save ~€90."                     │
│                                                     │
│  [Adjust Budget]  [Dismiss]  [Tell Me More]         │
└─────────────────────────────────────────────────────┘
```

**AI Features (MVP):**
- Weekly spending summary with trend analysis
- Category overspend predictions (7-day lookahead)
- Smart suggestions based on spending patterns
- "Who's paying more" fairness alerts
- Natural language expense queries ("How much did we spend on food in January?")

**Tech:** OpenAI GPT-4o-mini API for insights generation, local pattern detection for real-time alerts.

#### 3.3 One-Tap Settlement (NEW — Revenue Driver)

```
┌─────────────────────────────────────────────────────┐
│  Balance Summary                                     │
│                                                     │
│  André owes Simon: €147.50                          │
│                                                     │
│  [Settle Now — €147.50]                             │
│                                                     │
│  Via: Apple Pay | Google Pay | Bank Transfer         │
└─────────────────────────────────────────────────────┘
```

**Integration:** Stripe Connect for payment processing.
**Revenue:** 1.5% transaction fee on settlements (industry standard).

#### 3.4 Shared Financial Goals (NEW — Engagement + Premium)

```
┌─────────────────────────────────────────────────────┐
│  🏠 House Down Payment                              │
│  ━━━━━━━━━━━━━━━━━━━░░░░░  €15,420 / €30,000       │
│                                                     │
│  Simon contributes: €725/mo (proportional)          │
│  André contributes: €302/mo (proportional)          │
│                                                     │
│  AI: "At this rate, you'll reach your goal in       │
│   14.2 months. Reducing dining out by 20% could     │
│   shave 2.3 months off."                            │
│                                                     │
│  [Add Funds]  [Adjust Goal]                         │
└─────────────────────────────────────────────────────┘
```

#### 3.5 Financial Harmony Score (NEW — Viral Hook)

A unique "couple financial health" score (0-100) based on:
- Expense balance fairness
- Budget adherence
- Goal progress
- Settlement speed
- Spending alignment

```
┌─────────────────────────────────────────────────────┐
│  Your Financial Harmony: 78/100                     │
│  ████████████████████░░░░░                          │
│                                                     │
│  ↑ 5 points from last month                         │
│  "Great progress! Settling expenses within 3 days   │
│   boosted your score. Keep it up."                  │
│                                                     │
│  [Share Score]  [Improve Score]                      │
└─────────────────────────────────────────────────────┘
```

**Viral mechanic:** Shareable score cards on social media. Couples compete/compare.

---

## 4. MONETIZATION MODEL

### Tier Structure

| Feature | Free | Premium (€4.99/mo) | Pro (€9.99/mo) |
|---------|------|---------------------|-----------------|
| Income-proportional splitting | ✅ | ✅ | ✅ |
| Unlimited expenses | 15/month | ✅ | ✅ |
| Basic balance tracking | ✅ | ✅ | ✅ |
| Category breakdown | ✅ | ✅ | ✅ |
| AI Weekly Summary | 1/month | ✅ | ✅ |
| AI Spending Coach | ❌ | ✅ | ✅ |
| Predictive Budgeting | ❌ | ✅ | ✅ |
| One-Tap Settlement | ❌ | ✅ | ✅ |
| Shared Goals | 1 goal | 3 goals | Unlimited |
| Financial Harmony Score | Basic | Full + History | Full + Insights |
| Natural Language Queries | ❌ | 10/month | Unlimited |
| PDF/CSV Export | ❌ | ❌ | ✅ |
| Tax-ready Reports | ❌ | ❌ | ✅ |
| Multi-currency Support | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

### Revenue Projections (Conservative)

```
Year 1 Target: 50,000 users (achievable via social/viral + €5k marketing)

Conversion rates (industry benchmarks for fintech):
  Free → Premium: 5% = 2,500 users × €4.99/mo = €12,475/mo
  Free → Pro:      2% = 1,000 users × €9.99/mo = €9,990/mo
  Settlement fees: 30% active × avg €200/mo settlement × 1.5% = €4,500/mo

  Monthly Recurring Revenue (MRR): ~€27,000/mo
  Annual Recurring Revenue (ARR): ~€324,000/yr (Year 1)
```

```
Year 2 Target: 250,000 users (with product-market fit)

  Premium: 12,500 × €4.99 = €62,375/mo
  Pro:      5,000 × €9.99 = €49,950/mo
  Settlement fees:          = €22,500/mo

  MRR: ~€135,000/mo
  ARR: ~€1.6M/yr
```

### Additional Revenue Streams (Post-MVP)

1. **B2B White-Label API** — License the proportional-split engine to banks and neobanks (€500-2,000/mo per client)
2. **Affiliate Partnerships** — Recommend savings accounts, investment products, insurance to couples (CPA: €20-50 per lead)
3. **Financial Advisor Marketplace** — Connect couples with certified financial planners (15% commission)

---

## 5. TECHNICAL ARCHITECTURE — MVP

### System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      ANGLA ARCHITECTURE                       │
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐   │
│  │  React Native│    │   Supabase   │    │   AI Engine   │   │
│  │  (Expo) App  │◄──►│   Backend    │◄──►│  (Edge Func)  │   │
│  │             │    │              │    │               │   │
│  │ - Screens   │    │ - Auth       │    │ - OpenAI API  │   │
│  │ - Components│    │ - PostgreSQL │    │ - Pattern     │   │
│  │ - Services  │    │ - Realtime   │    │   Detection   │   │
│  │ - State     │    │ - Storage    │    │ - Predictions │   │
│  └─────────────┘    └──────────────┘    └───────────────┘   │
│         │                   │                    │            │
│         │           ┌──────────────┐             │            │
│         │           │   Stripe     │             │            │
│         └──────────►│   Connect    │◄────────────┘            │
│                     │              │                          │
│                     │ - Payments   │                          │
│                     │ - Payouts    │                          │
│                     │ - Fees       │                          │
│                     └──────────────┘                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                   RevenueCat                          │    │
│  │         (Subscription & Paywall Management)           │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Tech Stack Decision Matrix

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile** | React Native + Expo (existing) | Already built, cross-platform, fast iteration |
| **Backend** | Supabase | Free tier generous, real-time sync, auth built-in, PostgreSQL, Edge Functions |
| **AI** | OpenAI GPT-4o-mini | Cheapest quality AI ($0.15/1M tokens), fast, good for structured insights |
| **Payments** | Stripe Connect | Industry standard, supports EU, handles payouts |
| **Subscriptions** | RevenueCat | Handles iOS/Android subscriptions, analytics, A/B testing paywalls |
| **Analytics** | PostHog (self-hosted) or Mixpanel (free tier) | Track conversion funnels, feature usage |
| **Push Notifications** | Expo Push + OneSignal | Free, reliable, supports rich notifications |
| **CI/CD** | EAS Build (Expo) | Native builds in cloud, OTA updates |

### Database Schema (Supabase/PostgreSQL)

```sql
-- Core tables for MVP

CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code VARCHAR(8) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  income DECIMAL(10,2) NOT NULL DEFAULT 0,
  contribution_rate DECIMAL(5,2) NOT NULL DEFAULT 50,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  paid_by UUID REFERENCES users(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expense_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL
);

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id),
  from_user UUID REFERENCES users(id),
  to_user UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id),
  name VARCHAR(100) NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id),
  insight_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) for multi-tenancy
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own couple's expenses"
  ON expenses FOR ALL
  USING (couple_id IN (
    SELECT couple_id FROM users WHERE id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_expenses_couple_date ON expenses(couple_id, expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(couple_id, category);
CREATE INDEX idx_settlements_couple ON settlements(couple_id, created_at DESC);
```

### AI Engine Design

```typescript
// Edge Function: generate-insights (runs weekly via cron)

interface InsightRequest {
  coupleId: string;
  expenses: Expense[];
  users: User[];
  goals: FinancialGoal[];
  period: { start: Date; end: Date };
}

interface InsightResponse {
  weeklySummary: string;
  predictions: SpendingPrediction[];
  suggestions: ActionableSuggestion[];
  harmonyScore: number;
  harmonyFactors: HarmonyFactor[];
}

// AI Prompt Template (optimized for GPT-4o-mini)
const INSIGHT_PROMPT = `
You are Angla AI, a financial copilot for couples.
Analyze this couple's spending data and provide:

1. A warm, constructive weekly summary (2-3 sentences)
2. Spending predictions for next 7 days based on patterns
3. 2-3 actionable money-saving suggestions
4. A Financial Harmony Score (0-100) with breakdown

Rules:
- Never blame one partner
- Frame everything as "together" language
- Be specific with numbers
- Suggest, don't demand
- Keep tone supportive and constructive

Data: {serialized_expense_data}
`;
```

### Key API Endpoints (Supabase Edge Functions)

```
POST   /functions/v1/couple/create      → Create couple + invite code
POST   /functions/v1/couple/join        → Join couple via invite code
GET    /functions/v1/expenses           → List expenses (with filters)
POST   /functions/v1/expenses           → Add expense
PATCH  /functions/v1/expenses/:id       → Update expense
DELETE /functions/v1/expenses/:id       → Delete expense
GET    /functions/v1/balance            → Get current balance
POST   /functions/v1/settle             → Initiate settlement (Stripe)
POST   /functions/v1/settle/confirm     → Stripe webhook confirmation
GET    /functions/v1/insights           → Get AI insights
POST   /functions/v1/insights/generate  → Trigger insight generation
GET    /functions/v1/goals              → List financial goals
POST   /functions/v1/goals              → Create goal
PATCH  /functions/v1/goals/:id          → Update goal progress
GET    /functions/v1/harmony-score      → Get harmony score + history
POST   /functions/v1/ai/query           → Natural language query
```

---

## 6. USER FLOWS

### Flow 1: Onboarding (Critical for Conversion)

```
[Download App]
     │
     ▼
[Welcome Screen]
  "Manage money together, fairly."
     │
     ▼
[Sign Up] ← Google/Apple/Email
     │
     ▼
[Create or Join Couple]
  ┌─────────────┐   ┌─────────────┐
  │ Create New   │   │ Join Partner │
  │ Get Code:    │   │ Enter Code:  │
  │   "A7X-K2M"  │   │   [_ _ _ _]  │
  └─────────────┘   └─────────────┘
     │                      │
     ▼                      ▼
[Enter Your Income]
  "This stays private — we only
   calculate your fair share %"
     │
     ▼
[See Your Split Preview]
  "Based on your incomes:
   You pay 70.6% | Partner pays 29.4%
   of shared expenses"
     │
     ▼
[Add First Expense]
  Quick guided tutorial
     │
     ▼
[Dashboard — You're Set!]
```

### Flow 2: Daily Usage

```
[Open App → Dashboard]
     │
     ├── Quick Add Expense (FAB button)
     │     → Amount → Category → Who Paid → Done
     │     → Auto-calculates proportional split
     │     → Partner gets push notification
     │
     ├── View Balance
     │     → "André owes Simon €47.50"
     │     → [Settle Now] or [Remind Later]
     │
     ├── AI Insights (bell icon)
     │     → Weekly summary card
     │     → Spending predictions
     │     → Actionable suggestions
     │
     └── Financial Goals
           → Progress bars
           → Contribution tracker
```

### Flow 3: Settlement

```
[View Balance: André owes €147.50]
     │
     ▼
[Tap "Settle Now"]
     │
     ▼
[Choose Payment Method]
  Apple Pay | Google Pay | Bank Transfer
     │
     ▼
[Confirm Amount: €147.50]
  Fee: €2.21 (1.5%)
     │
     ▼
[Payment Processing...]
     │
     ▼
[Settlement Complete!]
  Balance: €0.00
  Harmony Score: +3 points
     │
     ▼
[Partner Notification]
  "Simon received €147.50 from André"
```

---

## 7. GO-TO-MARKET STRATEGY

### Phase 1: Organic + Viral (Months 1-3)

**Cost: €0 - €2,000**

1. **TikTok/Reels Content Strategy**
   - "How we split expenses fairly as a couple" (educational)
   - "POV: Your partner earns 2x more but you still split 50/50" (relatable pain)
   - "Our Financial Harmony Score this month" (shareable)
   - Target: 3 videos/week, aim for viral hooks around money + relationships

2. **Reddit + Forums**
   - r/personalfinance, r/relationships, r/ynab, r/frugal
   - Genuine value-add posts about income-proportional splitting
   - "Built an app that calculates fair expense splits based on income — here's the math"

3. **Couple Influencer Partnerships**
   - Micro-influencers (5K-50K followers) in couples/finance niches
   - Offer free Pro accounts + affiliate commission (30% of first 3 months)

4. **Product Hunt Launch**
   - Coordinate with couple-finance community
   - Target: Top 5 of the day

### Phase 2: Paid Growth (Months 4-6)

**Budget: €3,000-5,000/month**

1. **Meta Ads (Instagram/Facebook)**
   - Target: Couples 25-40, recently moved in together, engaged, married
   - Creative: "Stop splitting 50/50. Start splitting fairly."
   - CPA target: €2-4 per install

2. **Google Ads**
   - Keywords: "couple expense app", "split bills fairly", "shared expenses app"
   - Landing page with calculator tool (SEO play)

3. **App Store Optimization (ASO)**
   - Keywords: couple finance, expense sharing, fair split, budget together
   - Localize: French, English, Spanish, German, Portuguese

### Viral Mechanics Built Into Product

1. **Invite Code System** — Can't use the app solo, must invite partner (forced virality)
2. **Harmony Score Sharing** — Social media share cards
3. **"Created with Angla"** watermark on free tier PDF exports
4. **Referral Program** — Invite another couple → both get 1 month free Premium

---

## 8. IMPLEMENTATION ROADMAP

### Sprint 1-2 (Weeks 1-4): Foundation

- [ ] Set up Supabase project (auth, database, RLS policies)
- [ ] Migrate existing ExpenseService to Supabase client
- [ ] Implement couple creation/joining flow (invite codes)
- [ ] Build income setup + contribution rate calculation
- [ ] Real-time expense sync between partners (Supabase Realtime)
- [ ] Push notifications for new expenses

### Sprint 3-4 (Weeks 5-8): Monetization + AI

- [ ] Integrate Stripe Connect for settlements
- [ ] Build settlement flow UI
- [ ] Integrate RevenueCat for subscription management
- [ ] Build paywall screens
- [ ] Implement AI insight generation (Edge Function + OpenAI)
- [ ] Financial Harmony Score algorithm
- [ ] Shared financial goals feature

### Sprint 5-6 (Weeks 9-12): Polish + Launch

- [ ] App Store submission (iOS + Android)
- [ ] Landing page + website
- [ ] Onboarding flow optimization
- [ ] Analytics integration (PostHog/Mixpanel)
- [ ] A/B test paywall positioning
- [ ] Product Hunt launch preparation
- [ ] TikTok content creation (pre-launch)

### Post-Launch (Month 4+)

- [ ] Receipt scanning (OCR via Google Vision)
- [ ] Natural language expense queries
- [ ] Multi-currency support
- [ ] Recurring expense automation
- [ ] B2B API for white-label licensing
- [ ] Financial advisor marketplace

---

## 9. COST ANALYSIS — MVP

| Service | Free Tier | Paid (at scale) |
|---------|-----------|-----------------|
| **Supabase** | 50K MAU, 500MB DB, 1GB storage | $25/mo (Pro) |
| **OpenAI GPT-4o-mini** | — | ~$15/mo for 50K users (1 insight/week/couple) |
| **Stripe** | No monthly fee | 1.5% + €0.25 per transaction |
| **RevenueCat** | 2,500 MTR free | $0 until $2.5K MRR |
| **Expo EAS** | 30 builds/mo free | $99/mo (Production) |
| **OneSignal** | 10K subscribers free | $0 at MVP scale |
| **Domain + Hosting** | — | ~$15/mo |
| **Apple Developer** | — | $99/year |
| **Google Play** | — | $25 one-time |

**Total MVP cost to launch: ~€200/month + €124 one-time**
**Break-even: ~45 Premium subscribers**

---

## 10. KEY METRICS TO TRACK

### North Star Metric
**Weekly Active Couples (WAC)** — At least one partner logs an expense per week

### Funnel Metrics
| Metric | Target |
|--------|--------|
| Install → Sign Up | > 60% |
| Sign Up → Partner Invited | > 40% |
| Partner Invited → Partner Joined | > 70% |
| Couple Created → First Expense | > 80% |
| Week 1 Retention | > 50% |
| Month 1 Retention | > 30% |
| Free → Paid Conversion | > 5% |
| Monthly Churn (paid) | < 5% |

### Revenue Metrics
| Metric | Target (Month 6) |
|--------|-------------------|
| MRR | > €10,000 |
| ARPU (paid users) | > €6.50 |
| LTV | > €78 (12-month) |
| CAC | < €5 |
| LTV:CAC Ratio | > 15:1 |

---

## 11. COMPETITIVE DEFENSE (Why Splitwise Can't Copy This)

1. **Income-proportional splitting is a mindset, not a feature** — Splitwise's entire UX is built around equal splits and group dynamics. Retrofitting couple-first, income-based logic would alienate their core user base.

2. **AI requires couple-specific training data** — Our AI model will be fine-tuned on couple spending patterns, not group trips. This data moat grows with every couple that joins.

3. **Couples are a fundamentally different product** — Two people with shared finances behave nothing like 8 friends splitting a dinner. The onboarding, notifications, tone, and features are entirely different.

4. **Network effects are couple-locked** — Each couple is a self-contained unit. They don't need the platform to have millions of users. The value is immediate for the first couple.

5. **Brand positioning** — "The app for couples" is a brand position that generic apps cannot claim without confusing their existing users.

---

## 12. RISK MATRIX

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low initial adoption | Medium | High | Strong content marketing + viral mechanics |
| Payment integration complexity | Medium | Medium | Start with manual settlement, add Stripe in Sprint 3 |
| AI insight quality | Low | High | Human-reviewed prompt templates, feedback loop |
| App Store rejection | Low | Medium | Follow guidelines strictly, no gambling/crypto |
| Competitor copies features | Low | Low | Speed of execution + brand moat + data flywheel |
| Regulatory (payments) | Medium | High | Use Stripe as regulated intermediary, no banking license needed |

---

## APPENDIX A: Why "Angla"?

The name **Angla** (from the repo name) evokes:
- **Angle** — A new angle on couple finances
- **Angular** — Precision, mathematical fairness
- Short, memorable, works in English/French/Spanish
- Available as a brand name in the couples/fintech space
- Easy to say, easy to spell, easy to search

---

## APPENDIX B: Existing Code Assets to Leverage

From the current Expanse codebase, these components are **directly reusable**:

| Existing Asset | Reuse in Angla |
|---------------|----------------|
| `calculations.ts` — Income-proportional split engine | Core algorithm (tested, working) |
| `ExpenseService.ts` — Business logic | Migrate to Supabase client wrapper |
| `types.ts` — Data models | Extend for new features |
| `ExpenseForm.tsx` — Expense input UI | Redesign with new brand |
| `ExpenseList.tsx` — Expense display | Enhance with AI annotations |
| `BalanceCard.tsx` — Balance visualization | Add settlement CTA |
| `HomeScreen.tsx` — Dashboard | Add AI insights + harmony score |
| Navigation structure — Tab-based | Keep architecture, add screens |
| Jest test setup — Testing infrastructure | Expand coverage for new features |
| Expo/RN config — Build pipeline | Ready for production |

**Estimated development time saved by reusing existing code: 3-4 weeks**

---

*Document version: 1.0*
*Author: AI Product Design — Opus 4.6*
*Date: February 2026*
