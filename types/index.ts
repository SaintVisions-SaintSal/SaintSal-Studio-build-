// SaintSal™ Platform Types
// Build 308 - Production Ready

import { TierId } from '@/config/tiers';

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  tierId: TierId;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  ghlLocationId: string | null;
  ghlApiKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing';

export interface Session {
  user: User;
  accessToken?: string;
  expiresAt: number;
}

// ============================================
// CHAT & MESSAGE TYPES
// ============================================

export type ChatContext = 'chat' | 'property' | 'analyzer' | 'leads' | 'loans' | 'apply' | 'research';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: AIModel;
  tokens?: number;
  cost?: number;
  context?: ChatContext;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  pageUrl?: string;
  pageTitle?: string;
  pageContent?: string;
  images?: string[];
  tools?: ToolUsage[];
  citations?: Citation[];
}

export interface Citation {
  title: string;
  url: string;
  snippet: string;
}

export interface ToolUsage {
  name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  context: ChatContext;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AI MODEL TYPES
// ============================================

export type AIModel =
  // Claude
  | 'claude-opus-4-20250514'
  | 'claude-sonnet-4-20250514'
  | 'claude-haiku-3-5-latest'
  // OpenAI
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'o1-preview'
  | 'o1-mini'
  // Google
  | 'gemini-2.0-flash-exp'
  | 'gemini-2.0-flash-thinking-exp'
  // xAI
  | 'grok-2-latest'
  | 'grok-3'
  // Perplexity
  | 'sonar-pro'
  | 'sonar';

export interface ModelConfig {
  id: AIModel;
  name: string;
  provider: 'anthropic' | 'openai' | 'google' | 'xai' | 'perplexity';
  inputCostPer1k: number;
  outputCostPer1k: number;
  contextWindow: number;
  bestFor: string[];
}

export const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
  'claude-opus-4-20250514': {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
    contextWindow: 200000,
    bestFor: ['complex analysis', 'creative writing', 'deep reasoning'],
  },
  'claude-sonnet-4-20250514': {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    contextWindow: 200000,
    bestFor: ['general chat', 'code', 'analysis'],
  },
  'claude-haiku-3-5-latest': {
    id: 'claude-haiku-3-5-latest',
    name: 'Claude Haiku 3.5',
    provider: 'anthropic',
    inputCostPer1k: 0.0008,
    outputCostPer1k: 0.004,
    contextWindow: 200000,
    bestFor: ['quick tasks', 'summaries', 'classification'],
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    inputCostPer1k: 0.005,
    outputCostPer1k: 0.015,
    contextWindow: 128000,
    bestFor: ['multimodal', 'vision', 'general purpose'],
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
    contextWindow: 128000,
    bestFor: ['fast responses', 'simple tasks', 'cost-efficient'],
  },
  'o1-preview': {
    id: 'o1-preview',
    name: 'O1 Preview',
    provider: 'openai',
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.06,
    contextWindow: 128000,
    bestFor: ['math', 'reasoning', 'complex problems'],
  },
  'o1-mini': {
    id: 'o1-mini',
    name: 'O1 Mini',
    provider: 'openai',
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.012,
    contextWindow: 128000,
    bestFor: ['code', 'STEM', 'logical reasoning'],
  },
  'gemini-2.0-flash-exp': {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    inputCostPer1k: 0.0001,
    outputCostPer1k: 0.0004,
    contextWindow: 1000000,
    bestFor: ['long context', 'fast responses', 'multimodal'],
  },
  'gemini-2.0-flash-thinking-exp': {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Thinking',
    provider: 'google',
    inputCostPer1k: 0.0001,
    outputCostPer1k: 0.0004,
    contextWindow: 1000000,
    bestFor: ['reasoning', 'complex analysis'],
  },
  'grok-2-latest': {
    id: 'grok-2-latest',
    name: 'Grok 2',
    provider: 'xai',
    inputCostPer1k: 0.002,
    outputCostPer1k: 0.01,
    contextWindow: 128000,
    bestFor: ['real-time data', 'X integration', 'current events'],
  },
  'grok-3': {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xai',
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    contextWindow: 128000,
    bestFor: ['advanced reasoning', 'real-time analysis'],
  },
  'sonar-pro': {
    id: 'sonar-pro',
    name: 'Perplexity Sonar Pro',
    provider: 'perplexity',
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    contextWindow: 128000,
    bestFor: ['web search', 'research', 'citations'],
  },
  sonar: {
    id: 'sonar',
    name: 'Perplexity Sonar',
    provider: 'perplexity',
    inputCostPer1k: 0.001,
    outputCostPer1k: 0.001,
    contextWindow: 128000,
    bestFor: ['quick search', 'fact checking'],
  },
};

// ============================================
// AGENT TYPES
// ============================================

export interface Agent {
  id: string;
  userId: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: AIModel;
  temperature: number;
  maxTokens: number;
  tools: string[];
  isVoiceEnabled: boolean;
  voiceId?: string;
  voiceSettings?: VoiceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

// ============================================
// PROPERTY TYPES
// ============================================

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  propertyType: PropertyType;
  listingStatus: ListingStatus;
  estimatedValue: number;
  estimatedRent: number;
  capRate: number;
  cashOnCash: number;
  arv?: number;
  repairCost?: number;
  images: string[];
  description: string;
  source: string;
  sourceUrl: string;
  fetchedAt: Date;
}

export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial';
export type ListingStatus = 'active' | 'pending' | 'sold' | 'off_market';

export interface PropertyAnalysis {
  property: Property;
  roi: number;
  cashFlow: number;
  debtService: number;
  noi: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'pass';
  reasoning: string;
  comparables: Property[];
}

// ============================================
// LEAD TYPES
// ============================================

export interface Lead {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  title?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  notes: string;
  tags: string[];
  crmId?: string;
  crmType?: CRMType;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadSource = 'extension' | 'apollo' | 'property_radar' | 'manual' | 'api' | 'research';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export type CRMType = 'ghl' | 'hubspot' | 'salesforce' | 'pipedrive';

// ============================================
// LOAN TYPES
// ============================================

export interface LoanRequest {
  id: string;
  userId: string;
  propertyId?: string;
  loanType: LoanType;
  loanAmount: number;
  propertyValue: number;
  ltv: number;
  creditScore: number;
  experience: string;
  timeline: string;
  status: LoanStatus;
  matchedLenders: LenderMatch[];
  createdAt: Date;
  updatedAt: Date;
}

export type LoanType = 'fix_and_flip' | 'dscr' | 'bridge' | 'construction' | 'conventional' | 'commercial';
export type LoanStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'funded' | 'declined';

export interface LenderMatch {
  lenderId: string;
  lenderName: string;
  rate: number;
  points: number;
  ltv: number;
  term: string;
  score: number;
}

// ============================================
// USAGE & ANALYTICS TYPES
// ============================================

export interface UsageRecord {
  id: string;
  userId: string;
  type: UsageType;
  count: number;
  model?: AIModel;
  tokens?: number;
  cost?: number;
  context?: ChatContext;
  date: Date;
}

export type UsageType = 'chat' | 'research' | 'property' | 'lead' | 'loan' | 'agent' | 'api';

export interface DailyUsage {
  chatMessages: number;
  researchQueries: number;
  propertySearches: number;
  leadsGenerated: number;
  apiCalls: number;
}

// ============================================
// EXTENSION TYPES
// ============================================

export interface ExtensionLicense {
  id: string;
  userId: string;
  licenseKey: string;
  tier: 'lite' | 'pro';
  status: 'active' | 'inactive' | 'expired';
  activatedAt: Date;
  expiresAt: Date;
}

export interface PageData {
  url: string;
  title: string;
  description: string;
  content: string;
  images: string[];
  metadata: Record<string, string>;
  scrapedAt: Date;
}

// ============================================
// API TYPES
// ============================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface StreamChunk {
  type: 'text' | 'tool_use' | 'tool_result' | 'error' | 'done';
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: Record<string, unknown>;
  error?: string;
}
