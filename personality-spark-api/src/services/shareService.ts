import type { Env } from '../types/env';
import type { QuizResult } from '../types/models';

export class ShareService {
  constructor(private env: Env) {}

  async generateShareCard(params: {
    result: QuizResult;
    style: 'modern' | 'classic' | 'playful';
    includeDetails: boolean;
  }): Promise<Response> {
    const { result, style, includeDetails } = params;
    
    // Generate SVG share card
    const svg = this.generateSVG({
      primaryType: result.results.primary_type,
      traits: result.results.personality_traits,
      style,
      includeDetails,
    });
    
    // Convert SVG to PNG using Workers AI or a simple SVG response
    // For now, we'll return the SVG as a response
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }

  private generateSVG(params: {
    primaryType: string;
    traits: Record<string, number>;
    style: string;
    includeDetails: boolean;
  }): string {
    const { primaryType, traits, style, includeDetails } = params;
    
    // Style configurations
    const styles = {
      modern: {
        bgGradient: 'from-purple-600 to-pink-600',
        textColor: 'white',
        accentColor: '#fbbf24',
        fontFamily: 'Inter, sans-serif',
      },
      classic: {
        bgGradient: 'from-blue-900 to-blue-700',
        textColor: 'white',
        accentColor: '#60a5fa',
        fontFamily: 'Georgia, serif',
      },
      playful: {
        bgGradient: 'from-yellow-400 to-orange-500',
        textColor: '#1f2937',
        accentColor: '#ec4899',
        fontFamily: 'Comic Sans MS, cursive',
      },
    };
    
    const currentStyle = styles[style as keyof typeof styles];
    
    // Sort traits by value
    const sortedTraits = Object.entries(traits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 traits
    
    const width = 1200;
    const height = 630;
    
    let svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8b5cf6" />
            <stop offset="100%" style="stop-color:#ec4899" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.1"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bg)" />
        
        <!-- Pattern overlay -->
        <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2" fill="white" opacity="0.1" />
        </pattern>
        <rect width="${width}" height="${height}" fill="url(#dots)" />
        
        <!-- Content container -->
        <rect x="60" y="60" width="${width - 120}" height="${height - 120}" 
              fill="white" rx="20" filter="url(#shadow)" opacity="0.95" />
        
        <!-- Logo/Brand -->
        <text x="100" y="120" font-family="${currentStyle.fontFamily}" 
              font-size="32" font-weight="bold" fill="#6b7280">
          Personality Spark
        </text>
        
        <!-- Primary Type -->
        <text x="100" y="200" font-family="${currentStyle.fontFamily}" 
              font-size="48" font-weight="bold" fill="#1f2937">
          ${primaryType}
        </text>
        
        <!-- Trait bars -->
        ${includeDetails ? sortedTraits.map((trait, index) => {
          const y = 280 + index * 60;
          const barWidth = trait[1] * 400;
          return `
            <g>
              <!-- Trait name -->
              <text x="100" y="${y}" font-family="${currentStyle.fontFamily}" 
                    font-size="18" fill="#4b5563">
                ${this.formatTraitName(trait[0])}
              </text>
              <!-- Trait bar background -->
              <rect x="100" y="${y + 10}" width="400" height="20" 
                    fill="#e5e7eb" rx="10" />
              <!-- Trait bar fill -->
              <rect x="100" y="${y + 10}" width="${barWidth}" height="20" 
                    fill="${currentStyle.accentColor}" rx="10" />
              <!-- Trait percentage -->
              <text x="520" y="${y}" font-family="${currentStyle.fontFamily}" 
                    font-size="16" fill="#6b7280">
                ${Math.round(trait[1] * 100)}%
              </text>
            </g>
          `;
        }).join('') : ''}
        
        <!-- Call to action -->
        <text x="${width - 100}" y="${height - 80}" 
              font-family="${currentStyle.fontFamily}" 
              font-size="20" fill="#6b7280" text-anchor="end">
          Discover your personality at
        </text>
        <text x="${width - 100}" y="${height - 50}" 
              font-family="${currentStyle.fontFamily}" 
              font-size="24" font-weight="bold" fill="#8b5cf6" text-anchor="end">
          PersonalitySpark.com
        </text>
      </svg>
    `;
    
    return svg;
  }

  private formatTraitName(trait: string): string {
    return trait
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async createShareableLink(resultId: string): Promise<string> {
    // Generate a short, shareable ID
    const shareId = this.generateShareId();
    
    // Store the mapping in KV
    await this.env.CACHE.put(
      `share:${shareId}`,
      resultId,
      { expirationTtl: 30 * 24 * 60 * 60 } // 30 days
    );
    
    return `https://personalityspark.com/share/${shareId}`;
  }

  private generateShareId(): string {
    // Generate a short, URL-safe ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  async generateOGMetadata(result: QuizResult): Promise<Record<string, string>> {
    const title = `I'm ${result.results.primary_type} - Personality Spark`;
    const description = `Discover your personality type with our AI-powered quizzes. I just found out I'm ${result.results.primary_type}!`;
    
    // Top traits
    const topTraits = Object.entries(result.results.personality_traits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trait]) => this.formatTraitName(trait))
      .join(', ');
    
    return {
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:url': `https://personalityspark.com/result/${result.id}`,
      'og:image': `https://personalityspark.com/api/v1/share/card/${result.id}.png`,
      'og:image:width': '1200',
      'og:image:height': '630',
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': `My top traits: ${topTraits}`,
      'twitter:image': `https://personalityspark.com/api/v1/share/card/${result.id}.png`,
    };
  }
}