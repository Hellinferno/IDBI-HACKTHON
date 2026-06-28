export type User = {
  id: string;
  customerRef: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
};

export type Account = {
  id: string;
  userId: string;
  accountType: 'savings' | 'current' | 'demat';
  balance: string;
  syncedAt: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  amount: string;
  direction: 'credit' | 'debit';
  description: string;
  categoryId: string | null;
  txnDate: string;
  sourceRef: string;
};

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  isDiscretionary: boolean;
};

export type FinancialProfile = {
  id: string;
  userId: string;
  monthlyIncome: string;
  monthlySurplus: string;
  savingsRate: string;
  spendPersonality: 'saver' | 'balanced' | 'spender' | 'drifter';
  lifeStage: string;
  computedAt: string;
};

export type RiskAssessment = {
  id: string;
  userId: string;
  score: number;
  band: 'conservative' | 'moderate' | 'aggressive';
  questionnaire: Record<string, unknown>;
  validUntil: string;
};

export type Goal = {
  id: string;
  userId: string;
  name: string;
  goalType: 'retirement' | 'home' | 'education' | 'emergency' | 'custom';
  targetAmount: string;
  targetDate: string;
  inflationRate: string;
  priority: number;
  status: 'active' | 'met' | 'paused';
};

export type GoalProjection = {
  id: string;
  goalId: string;
  requiredCorpus: string;
  monthlyContribution: string;
  projectedCorpus: string;
  gap: string;
  assumptions: { inflation: string; expectedReturn: string };
  computedAt: string;
};

export type Portfolio = {
  id: string;
  userId: string;
  name: string;
};

export type Holding = {
  id: string;
  portfolioId: string;
  instrumentRef: string;
  assetClass: string;
  units: string;
  avgCost: string;
  currentValue: string;
  asOf: string;
};

export type Product = {
  id: string;
  productCode: string;
  name: string;
  assetClass: 'equity' | 'debt' | 'hybrid' | 'cash';
  riskBand: 'conservative' | 'moderate' | 'aggressive';
  minInvestment: string;
  attributes: Record<string, unknown>;
  active: boolean;
};

export type Recommendation = {
  id: string;
  userId: string;
  recoType: 'allocation' | 'product' | 'idle_cash' | 'tax' | 'rebalance';
  payload: Record<string, unknown>;
  rationale: string;
  suitabilityStatus: 'passed' | 'blocked';
  disclaimerId: string;
  status: 'active' | 'accepted' | 'dismissed' | 'expired';
  computationInputs: Record<string, unknown>;
};

export type Disclaimer = {
  id: string;
  text: string;
  version: string;
  active: boolean;
};

export type Conversation = {
  id: string;
  userId: string;
  startedAt: string;
  channel: 'text' | 'voice';
};

export type Message = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  avatarState: string | null;
  tokens: number | null;
  createdAt: string;
};

export type AvatarState = {
  key: string;
  colorHint: string;
  motionProfile: string;
};

export type Consent = {
  id: string;
  userId: string;
  scope: 'data_read' | 'advisory' | 'notifications';
  granted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
};

export type AuditLog = {
  id: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
  hash: string;
  createdAt: string;
};

export type Nudge = {
  id: string;
  userId: string;
  trigger: 'idle_cash' | 'missed_sip' | 'overspend' | 'tax_deadline' | 'goal_drift';
  payload: Record<string, unknown>;
  priority: number;
  state: 'pending' | 'shown' | 'acted' | 'dismissed';
  expiresAt: string;
};

export type SuitabilityResult = {
  passed: boolean;
  reasons: string[];
};

export type AllocationRecommendation = {
  equity: number;
  debt: number;
  hybrid: number;
  cash: number;
};

export type IdleCashRecommendation = {
  amount: string;
  product: string;
  rationale: string;
};

export type TaxRecommendation = {
  remaining80C: string;
  suggestedProduct: string;
  monthlyAmount: string;
};

export type RebalanceRecommendation = {
  assetClass: string;
  current: number;
  target: number;
  action: 'buy' | 'sell';
  amount: string;
};

export type SpendingCategory = {
  category: string;
  amount: string;
  discretionary: boolean;
};

export type SpendingInsight = {
  period: string;
  categories: SpendingCategory[];
  idleCash: { amount: string; suggestedAction: string };
};

export type GoalSimulateRequest = {
  targetDate?: string;
  monthlyContribution?: string;
};

export type RecommendationAction = {
  action: 'accept' | 'dismiss';
};

export type ConsentRequest = {
  scope: 'data_read' | 'advisory' | 'notifications';
  granted: boolean;
};

export type RiskAssessmentRequest = {
  answers: { qid: string; value: number }[];
};

export type RiskAssessmentResponse = {
  score: number;
  band: string;
  validUntil: string;
};

export type ProfileResponse = {
  userId: string;
  financialProfile: {
    monthlyIncome: string;
    monthlySurplus: string;
    savingsRate: string;
    spendPersonality: string;
    lifeStage: string;
  };
  risk: { score: number; band: string; validUntil: string } | null;
};

export type GoalResponse = {
  goal: Goal;
  projection: GoalProjection;
};

export type RecommendationResponse = {
  items: (Recommendation & { disclaimer: string })[];
};

export type ConversationResponse = {
  conversationId: string;
  wsUrl: string;
};

export type AvatarStateEvent = {
  type: 'avatar_state';
  state: string;
  mood?: string;
};

export type TokenEvent = {
  type: 'token';
  text: string;
};

export type CardEvent = {
  type: 'card';
  card: { kind: string; data: Record<string, unknown> };
};

export type TtsAudioEvent = {
  type: 'tts_audio';
  chunk: string;
  final: boolean;
};

export type DoneEvent = {
  type: 'done';
  messageId: string;
};

export type ServerEvent = AvatarStateEvent | TokenEvent | CardEvent | TtsAudioEvent | DoneEvent;

export type UserMessage = {
  type: 'user_message';
  text: string;
};

export type UserAudio = {
  type: 'user_audio';
  chunk: string;
  final: boolean;
};

export type ClientMessage = UserMessage | UserAudio;

export type ErrorResponse = {
  type: string;
  title: string;
  status: number;
  detail: string;
};
