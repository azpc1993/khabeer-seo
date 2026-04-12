export interface HistoryItem {
  id: string;
  user_id?: string;
  product_name?: string;
  pk?: string;
  result?: string;
  content_type?: string;
  created_at?: string | number | Date | { toMillis?: () => number };
}

export interface ResearchResult {
  keyword: string;
  volume?: number;
  difficulty?: string;
  cpc?: number;
  competition?: string;
  trend?: string;
}

export interface ResearchResults {
  primaryKeywords: ResearchResult[];
  secondaryKeywords: { keyword: string }[];
  searchIntent?: {
    intent: string;
    audience: string;
    strategy: string;
  };
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  store_name: string;
  store_url: string;
  role: string;
  avatar_url: string;
}

export interface TrackedProduct {
  id: string;
  name: string;
  url: string;
  keyword: string;
  rank: number | null;
  last_checked: string | null;
  updated_at?: string | number | Date;
  created_at?: string | number | Date;
}
