// SaintSal™ Subscription Tiers Configuration
// Build 308 - Production Ready

export type TierId = 'free' | 'pro' | 'research' | 'business' | 'elite' | 'enterprise';

export interface TierFeature {
  name: string;
  included: boolean;
  limit?: number | 'unlimited';
  description?: string;
}

export interface SubscriptionTier {
  id: TierId;
  name: string;
  price: number;
  priceId: string; // Stripe Price ID
  description: string;
  badge?: string;
  popular?: boolean;
  features: {
    chat: TierFeature;
    research: TierFeature;
    properties: TierFeature;
    leads: TierFeature;
    loans: TierFeature;
    agents: TierFeature;
    voiceAgents: TierFeature;
    apiAccess: TierFeature;
    ghlAccess: TierFeature;
    extensionLite: TierFeature;
    extensionPro: TierFeature;
    priority: TierFeature;
  };
  limits: {
    chatMessagesPerDay: number | 'unlimited';
    researchQueriesPerDay: number | 'unlimited';
    propertySearchesPerDay: number | 'unlimited';
    leadsPerMonth: number | 'unlimited';
    customAgents: number;
    voiceAgents: number;
    teamMembers: number;
  };
}

export const TIERS: Record<TierId, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: '',
    description: 'Get started with SaintSal™',
    features: {
      chat: { name: 'AI Chat', included: true, limit: 10, description: '10 messages total' },
      research: { name: 'Deep Research', included: false },
      properties: { name: 'Property Analysis', included: false },
      leads: { name: 'Lead Generation', included: false },
      loans: { name: 'Loan Matching', included: false },
      agents: { name: 'Custom Agents', included: false },
      voiceAgents: { name: 'Voice Agents', included: false },
      apiAccess: { name: 'API Access', included: false },
      ghlAccess: { name: 'GHL Integration', included: false },
      extensionLite: { name: 'Chrome Extension Lite', included: false },
      extensionPro: { name: 'Chrome Extension Pro', included: false },
      priority: { name: 'Priority Support', included: false },
    },
    limits: {
      chatMessagesPerDay: 10,
      researchQueriesPerDay: 0,
      propertySearchesPerDay: 0,
      leadsPerMonth: 0,
      customAgents: 0,
      voiceAgents: 0,
      teamMembers: 1,
    },
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    price: 20,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    description: 'Unlimited AI chat power',
    badge: 'Best Value',
    features: {
      chat: { name: 'AI Chat', included: true, limit: 'unlimited', description: 'Unlimited messages' },
      research: { name: 'Deep Research', included: true, limit: 25, description: '25 queries/day' },
      properties: { name: 'Property Analysis', included: false },
      leads: { name: 'Lead Generation', included: false },
      loans: { name: 'Loan Matching', included: false },
      agents: { name: 'Custom Agents', included: false },
      voiceAgents: { name: 'Voice Agents', included: false },
      apiAccess: { name: 'API Access', included: false },
      ghlAccess: { name: 'GHL Integration', included: false },
      extensionLite: { name: 'Chrome Extension Lite', included: true, description: 'Basic scraping' },
      extensionPro: { name: 'Chrome Extension Pro', included: false },
      priority: { name: 'Priority Support', included: false },
    },
    limits: {
      chatMessagesPerDay: 'unlimited',
      researchQueriesPerDay: 25,
      propertySearchesPerDay: 0,
      leadsPerMonth: 0,
      customAgents: 0,
      voiceAgents: 0,
      teamMembers: 1,
    },
  },

  research: {
    id: 'research',
    name: 'Research',
    price: 50,
    priceId: process.env.NEXT_PUBLIC_STRIPE_RESEARCH_PRICE_ID || '',
    description: 'Research + Chat + Social Intelligence',
    features: {
      chat: { name: 'AI Chat', included: true, limit: 'unlimited', description: 'Unlimited messages' },
      research: { name: 'Deep Research', included: true, limit: 'unlimited', description: 'Unlimited queries' },
      properties: { name: 'Property Analysis', included: true, limit: 10, description: '10 searches/day' },
      leads: { name: 'Lead Generation', included: true, limit: 50, description: '50 leads/month' },
      loans: { name: 'Loan Matching', included: false },
      agents: { name: 'Custom Agents', included: false },
      voiceAgents: { name: 'Voice Agents', included: false },
      apiAccess: { name: 'API Access', included: true, description: 'Basic API access' },
      ghlAccess: { name: 'GHL Integration', included: false },
      extensionLite: { name: 'Chrome Extension Lite', included: true },
      extensionPro: { name: 'Chrome Extension Pro', included: false },
      priority: { name: 'Priority Support', included: false },
    },
    limits: {
      chatMessagesPerDay: 'unlimited',
      researchQueriesPerDay: 'unlimited',
      propertySearchesPerDay: 10,
      leadsPerMonth: 50,
      customAgents: 0,
      voiceAgents: 0,
      teamMembers: 1,
    },
  },

  business: {
    id: 'business',
    name: 'Business',
    price: 100,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || '',
    description: 'Properties + Custom Agents + API',
    popular: true,
    features: {
      chat: { name: 'AI Chat', included: true, limit: 'unlimited' },
      research: { name: 'Deep Research', included: true, limit: 'unlimited' },
      properties: { name: 'Property Analysis', included: true, limit: 50, description: '50 searches/day' },
      leads: { name: 'Lead Generation', included: true, limit: 200, description: '200 leads/month' },
      loans: { name: 'Loan Matching', included: true, limit: 'unlimited' },
      agents: { name: 'Custom Agents', included: true, limit: 5, description: 'Up to 5 agents' },
      voiceAgents: { name: 'Voice Agents', included: false },
      apiAccess: { name: 'API Access', included: true, description: 'Full API access' },
      ghlAccess: { name: 'GHL Integration', included: false },
      extensionLite: { name: 'Chrome Extension Lite', included: true },
      extensionPro: { name: 'Chrome Extension Pro', included: true, description: 'Full CRM integration' },
      priority: { name: 'Priority Support', included: true },
    },
    limits: {
      chatMessagesPerDay: 'unlimited',
      researchQueriesPerDay: 'unlimited',
      propertySearchesPerDay: 50,
      leadsPerMonth: 200,
      customAgents: 5,
      voiceAgents: 0,
      teamMembers: 3,
    },
  },

  elite: {
    id: 'elite',
    name: 'Elite',
    price: 220,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID || '',
    description: 'UNLIMITED Everything + Voice Agent + GHL',
    badge: 'Most Popular',
    features: {
      chat: { name: 'AI Chat', included: true, limit: 'unlimited' },
      research: { name: 'Deep Research', included: true, limit: 'unlimited' },
      properties: { name: 'Property Analysis', included: true, limit: 'unlimited' },
      leads: { name: 'Lead Generation', included: true, limit: 'unlimited' },
      loans: { name: 'Loan Matching', included: true, limit: 'unlimited' },
      agents: { name: 'Custom Agents', included: true, limit: 'unlimited', description: 'Unlimited agents' },
      voiceAgents: { name: 'Voice Agents', included: true, limit: 1, description: '1 ElevenLabs agent' },
      apiAccess: { name: 'API Access', included: true, description: 'Full API access' },
      ghlAccess: { name: 'GHL Integration', included: true, description: 'Full GHL subaccount' },
      extensionLite: { name: 'Chrome Extension Lite', included: true },
      extensionPro: { name: 'Chrome Extension Pro', included: true },
      priority: { name: 'Priority Support', included: true, description: '24/7 Priority' },
    },
    limits: {
      chatMessagesPerDay: 'unlimited',
      researchQueriesPerDay: 'unlimited',
      propertySearchesPerDay: 'unlimited',
      leadsPerMonth: 'unlimited',
      customAgents: 999,
      voiceAgents: 1,
      teamMembers: 10,
    },
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 400,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '',
    description: '2 Voice Agents + Full GHL + SaaS Configurator',
    badge: 'Fortune 500',
    features: {
      chat: { name: 'AI Chat', included: true, limit: 'unlimited' },
      research: { name: 'Deep Research', included: true, limit: 'unlimited' },
      properties: { name: 'Property Analysis', included: true, limit: 'unlimited' },
      leads: { name: 'Lead Generation', included: true, limit: 'unlimited' },
      loans: { name: 'Loan Matching', included: true, limit: 'unlimited' },
      agents: { name: 'Custom Agents', included: true, limit: 'unlimited' },
      voiceAgents: { name: 'Voice Agents', included: true, limit: 2, description: '2 ElevenLabs agents' },
      apiAccess: { name: 'API Access', included: true, description: 'Enterprise API' },
      ghlAccess: { name: 'GHL Integration', included: true, description: 'SaaS Configurator + Full Access' },
      extensionLite: { name: 'Chrome Extension Lite', included: true },
      extensionPro: { name: 'Chrome Extension Pro', included: true },
      priority: { name: 'Priority Support', included: true, description: 'Dedicated Success Manager' },
    },
    limits: {
      chatMessagesPerDay: 'unlimited',
      researchQueriesPerDay: 'unlimited',
      propertySearchesPerDay: 'unlimited',
      leadsPerMonth: 'unlimited',
      customAgents: 999,
      voiceAgents: 2,
      teamMembers: 999,
    },
  },
};

// Extension Tiers
export const EXTENSION_TIERS = {
  lite: {
    id: 'lite',
    name: 'Extension Lite',
    price: 20,
    priceId: process.env.NEXT_PUBLIC_STRIPE_EXTENSION_LITE_PRICE_ID || '',
    description: 'Unlimited page scraping',
    features: ['Unlimited page analysis', 'Basic AI chat', 'Page context awareness', 'Quick actions'],
  },
  pro: {
    id: 'pro',
    name: 'Extension Pro',
    price: 100,
    priceId: process.env.NEXT_PUBLIC_STRIPE_EXTENSION_PRO_PRICE_ID || '',
    description: 'Full CRM integration',
    features: [
      'All Lite features',
      'CRM integration (GHL, HubSpot, Salesforce)',
      'Automated lead capture',
      'Advanced scraping with lazy-load support',
      'Custom prompts',
      'Priority support',
    ],
  },
};

// Helper functions
export function getTier(tierId: TierId): SubscriptionTier {
  return TIERS[tierId] || TIERS.free;
}

export function canAccess(userTier: TierId, feature: keyof SubscriptionTier['features']): boolean {
  const tier = getTier(userTier);
  return tier.features[feature]?.included || false;
}

export function getLimit(userTier: TierId, limit: keyof SubscriptionTier['limits']): number | 'unlimited' {
  const tier = getTier(userTier);
  return tier.limits[limit];
}

export function formatPrice(price: number): string {
  return price === 0 ? 'Free' : `$${price}/mo`;
}

export function getUpgradePath(currentTier: TierId): TierId | null {
  const tierOrder: TierId[] = ['free', 'pro', 'research', 'business', 'elite', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1];
  }
  return null;
}
