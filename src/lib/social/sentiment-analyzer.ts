import natural from 'natural';

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  keywords: string[];
}

interface MarketSentiment {
  bullish: number;
  bearish: number;
  neutral: number;
  momentum: number; // -100 to 100
  confidence: number;
}

// Financial sentiment lexicon
const FINANCIAL_LEXICON = {
  positive: {
    strong: ['bullish', 'surge', 'soar', 'moon', 'breakout', 'rally', 'boom', 'explosive', 'skyrocket', 'parabolic'],
    moderate: ['buy', 'long', 'growth', 'profit', 'gain', 'uptrend', 'support', 'accumulation', 'green', 'positive'],
    weak: ['hope', 'potential', 'opportunity', 'maybe', 'could', 'possibly', 'recovery', 'stabilize'],
  },
  negative: {
    strong: ['bearish', 'crash', 'plunge', 'collapse', 'dump', 'selloff', 'panic', 'catastrophe', 'bubble', 'bankrupt'],
    moderate: ['sell', 'short', 'loss', 'decline', 'downtrend', 'resistance', 'red', 'negative', 'concern', 'risk'],
    weak: ['worry', 'uncertain', 'volatile', 'caution', 'might', 'possibly', 'correction', 'pullback'],
  },
  neutral: ['hold', 'wait', 'watch', 'sideways', 'consolidation', 'range', 'stable', 'flat'],
};

// Emoji sentiment mapping
const EMOJI_SENTIMENT = {
  positive: ['🚀', '💎', '🙌', '📈', '💰', '🔥', '✅', '💪', '🎯', '⬆️', '🟢', '💵', '🏦'],
  negative: ['📉', '💔', '😱', '🔴', '⬇️', '❌', '🚨', '😰', '💸', '🔻', '🆘', '⚠️'],
  neutral: ['🤔', '📊', '💭', '👀', '⏳', '🔄', '➡️', '💤'],
};

export class SentimentAnalyzer {
  private tokenizer: natural.WordTokenizer;
  private sentiment: natural.SentimentAnalyzer;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.sentiment = new natural.SentimentAnalyzer('English');
  }

  /**
   * Analyze sentiment of a single text
   */
  analyzeSentiment(text: string): SentimentResult {
    // Clean and tokenize text
    const cleanText = this.preprocessText(text);
    const tokens = this.tokenizer.tokenize(cleanText);
    
    if (!tokens || tokens.length === 0) {
      return {
        sentiment: 'neutral',
        score: 0,
        confidence: 0,
        keywords: [],
      };
    }

    // Get base sentiment score
    const baseScore = this.sentiment.getSentiment(tokens);
    
    // Apply financial lexicon adjustments
    const lexiconAdjustment = this.applyFinancialLexicon(text, tokens);
    
    // Apply emoji sentiment
    const emojiAdjustment = this.analyzeEmojis(text);
    
    // Combine scores with weights
    const finalScore = (baseScore * 0.4) + (lexiconAdjustment * 0.4) + (emojiAdjustment * 0.2);
    
    // Extract keywords
    const keywords = this.extractKeywords(tokens);
    
    // Determine sentiment category and confidence
    const { sentiment, confidence } = this.categorize(finalScore);

    return {
      sentiment,
      score: Math.max(-1, Math.min(1, finalScore)),
      confidence,
      keywords,
    };
  }

  /**
   * Analyze multiple texts for market sentiment
   */
  analyzeMarketSentiment(texts: string[]): MarketSentiment {
    if (texts.length === 0) {
      return {
        bullish: 0,
        bearish: 0,
        neutral: 100,
        momentum: 0,
        confidence: 0,
      };
    }

    const sentiments = texts.map(text => this.analyzeSentiment(text));
    
    let bullishCount = 0;
    let bearishCount = 0;
    let neutralCount = 0;
    let totalScore = 0;
    let totalConfidence = 0;

    for (const sentiment of sentiments) {
      totalScore += sentiment.score;
      totalConfidence += sentiment.confidence;

      switch (sentiment.sentiment) {
        case 'positive':
          bullishCount++;
          break;
        case 'negative':
          bearishCount++;
          break;
        case 'neutral':
          neutralCount++;
          break;
      }
    }

    const total = texts.length;
    const bullish = (bullishCount / total) * 100;
    const bearish = (bearishCount / total) * 100;
    const neutral = (neutralCount / total) * 100;
    const momentum = (totalScore / total) * 100;
    const confidence = totalConfidence / total;

    return {
      bullish,
      bearish,
      neutral,
      momentum,
      confidence,
    };
  }

  /**
   * Detect sentiment trends over time
   */
  detectSentimentTrend(
    timeSeriesData: Array<{ time: string; sentiment: SentimentResult }>
  ): {
    trend: 'improving' | 'declining' | 'stable';
    changeRate: number;
    volatility: number;
  } {
    if (timeSeriesData.length < 2) {
      return { trend: 'stable', changeRate: 0, volatility: 0 };
    }

    const scores = timeSeriesData.map(d => d.sentiment.score);
    const recentScores = scores.slice(-5); // Last 5 data points
    const olderScores = scores.slice(0, 5); // First 5 data points

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    const changeRate = recentAvg - olderAvg;

    // Calculate volatility
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const volatility = Math.sqrt(variance);

    let trend: 'improving' | 'declining' | 'stable';
    if (changeRate > 0.1) {
      trend = 'improving';
    } else if (changeRate < -0.1) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    return { trend, changeRate, volatility };
  }

  /**
   * Preprocess text for analysis
   */
  private preprocessText(text: string): string {
    // Convert to lowercase but preserve cashtags and tickers
    let processed = text.toLowerCase();
    
    // Remove URLs
    processed = processed.replace(/https?:\/\/\S+/g, '');
    
    // Remove mentions but keep the context
    processed = processed.replace(/@\w+/g, '');
    
    // Keep hashtags as they often contain sentiment
    processed = processed.replace(/#(\w+)/g, '$1');
    
    return processed;
  }

  /**
   * Apply financial lexicon for domain-specific sentiment
   */
  private applyFinancialLexicon(text: string, tokens: string[]): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    let matches = 0;

    // Check positive terms
    for (const term of FINANCIAL_LEXICON.positive.strong) {
      if (lowerText.includes(term)) {
        score += 1.0;
        matches++;
      }
    }
    for (const term of FINANCIAL_LEXICON.positive.moderate) {
      if (lowerText.includes(term)) {
        score += 0.5;
        matches++;
      }
    }
    for (const term of FINANCIAL_LEXICON.positive.weak) {
      if (lowerText.includes(term)) {
        score += 0.25;
        matches++;
      }
    }

    // Check negative terms
    for (const term of FINANCIAL_LEXICON.negative.strong) {
      if (lowerText.includes(term)) {
        score -= 1.0;
        matches++;
      }
    }
    for (const term of FINANCIAL_LEXICON.negative.moderate) {
      if (lowerText.includes(term)) {
        score -= 0.5;
        matches++;
      }
    }
    for (const term of FINANCIAL_LEXICON.negative.weak) {
      if (lowerText.includes(term)) {
        score -= 0.25;
        matches++;
      }
    }

    // Normalize by number of matches
    return matches > 0 ? score / matches : 0;
  }

  /**
   * Analyze emoji sentiment
   */
  private analyzeEmojis(text: string): number {
    let score = 0;
    let emojiCount = 0;

    for (const emoji of EMOJI_SENTIMENT.positive) {
      const count = (text.match(new RegExp(emoji, 'g')) || []).length;
      score += count;
      emojiCount += count;
    }

    for (const emoji of EMOJI_SENTIMENT.negative) {
      const count = (text.match(new RegExp(emoji, 'g')) || []).length;
      score -= count;
      emojiCount += count;
    }

    return emojiCount > 0 ? score / emojiCount : 0;
  }

  /**
   * Extract important keywords
   */
  private extractKeywords(tokens: string[]): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their',
    ]);

    const keywords = tokens
      .filter(token => token.length > 2 && !stopWords.has(token))
      .filter(token => /^[a-z0-9]+$/i.test(token));

    // Count frequency
    const frequency: Record<string, number> = {};
    for (const keyword of keywords) {
      frequency[keyword] = (frequency[keyword] || 0) + 1;
    }

    // Sort by frequency and return top keywords
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }

  /**
   * Categorize sentiment based on score
   */
  private categorize(score: number): { 
    sentiment: 'positive' | 'negative' | 'neutral'; 
    confidence: number 
  } {
    const absScore = Math.abs(score);
    
    if (score > 0.1) {
      return {
        sentiment: 'positive',
        confidence: Math.min(absScore, 1),
      };
    } else if (score < -0.1) {
      return {
        sentiment: 'negative',
        confidence: Math.min(absScore, 1),
      };
    } else {
      return {
        sentiment: 'neutral',
        confidence: 1 - absScore,
      };
    }
  }

  /**
   * Identify financial entities (tickers, prices, percentages)
   */
  identifyFinancialEntities(text: string): {
    tickers: string[];
    prices: string[];
    percentages: string[];
  } {
    const tickers = (text.match(/\$[A-Z]{1,5}\b/g) || []).map(t => t.substring(1));
    const prices = text.match(/\$[\d,]+\.?\d*/g) || [];
    const percentages = text.match(/[+-]?\d+\.?\d*%/g) || [];

    return { tickers, prices, percentages };
  }
}