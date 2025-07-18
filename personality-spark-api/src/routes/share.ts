import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Context } from '../types/env';
import { authenticate } from '../middleware/auth';
import { ShareService } from '../services/shareService';

const shareRouter = new Hono<Context>();

// Schema for share requests
const CreateShareCardSchema = z.object({
  resultId: z.string(),
  style: z.enum(['modern', 'classic', 'playful']).default('modern'),
  includeDetails: z.boolean().default(true),
});

const CreateChallengeSchema = z.object({
  resultId: z.string(),
  challengeMessage: z.string().optional(),
  expiresIn: z.number().min(1).max(7).default(3), // days
});

// POST /create-card - Generate share card
shareRouter.post('/create-card',
  authenticate({ required: false }),
  zValidator('json', CreateShareCardSchema),
  async (c) => {
    const { resultId, style, includeDetails } = c.req.valid('json');
    const shareService = new ShareService(c.env);
    
    try {
      // Get quiz result
      const resultData = await c.env.CACHE.get(`result:${resultId}`);
      if (!resultData) {
        return c.json({
          error: 'Not Found',
          message: 'Quiz result not found',
        }, 404);
      }
      
      const result = JSON.parse(resultData);
      
      // Generate share card
      const shareCard = await shareService.generateShareCard({
        result,
        style,
        includeDetails,
      });
      
      // Upload to R2
      const imageBuffer = await shareCard.arrayBuffer();
      const filename = `share-cards/${resultId}-${Date.now()}.png`;
      
      await c.env.STORAGE.put(filename, imageBuffer, {
        httpMetadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000', // 1 year
        },
      });
      
      // Generate public URL
      const shareUrl = `https://storage.personalityspark.com/${filename}`;
      
      // Create share record
      const shareId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO share_cards (id, result_id, image_url, created_at)
        VALUES (?, ?, ?, ?)
      `)
      .bind(shareId, resultId, shareUrl, new Date().toISOString())
      .run();
      
      // Update result to mark as shared
      await c.env.DB.prepare(`
        UPDATE quiz_results SET shared = 1, share_id = ? WHERE id = ?
      `)
      .bind(shareId, resultId)
      .run();
      
      return c.json({
        shareId,
        shareUrl,
        directLink: `https://personalityspark.com/share/${shareId}`,
      });
    } catch (error) {
      console.error('Error creating share card:', error);
      return c.json({
        error: 'Share Card Creation Failed',
        message: 'Unable to create share card',
      }, 500);
    }
  }
);

// GET /preview/:share_id - Preview shared result
shareRouter.get('/preview/:share_id', async (c) => {
  const shareId = c.req.param('share_id');
  
  try {
    // Get share card data
    const shareCard = await c.env.DB.prepare(`
      SELECT sc.*, qr.results, qr.quiz_type
      FROM share_cards sc
      JOIN quiz_results qr ON sc.result_id = qr.id
      WHERE sc.id = ?
    `)
    .bind(shareId)
    .first();
    
    if (!shareCard) {
      return c.json({
        error: 'Not Found',
        message: 'Share card not found',
      }, 404);
    }
    
    // Parse results
    const results = JSON.parse(shareCard.results as string);
    
    return c.json({
      shareId,
      imageUrl: shareCard.image_url,
      quizType: shareCard.quiz_type,
      results: {
        primaryType: results.primary_type,
        traits: results.personality_traits,
        description: results.description,
      },
      createdAt: shareCard.created_at,
    });
  } catch (error) {
    console.error('Error previewing share:', error);
    return c.json({
      error: 'Preview Failed',
      message: 'Unable to preview shared result',
    }, 500);
  }
});

// POST /challenge - Create friend challenge
shareRouter.post('/challenge',
  authenticate({ required: false }),
  zValidator('json', CreateChallengeSchema),
  async (c) => {
    const { resultId, challengeMessage, expiresIn } = c.req.valid('json');
    
    try {
      const challengeId = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
      
      // Store challenge in KV
      await c.env.CACHE.put(
        `challenge:${challengeId}`,
        JSON.stringify({
          resultId,
          challengeMessage,
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
        }),
        { expirationTtl: expiresIn * 86400 } // Convert days to seconds
      );
      
      const challengeUrl = `https://personalityspark.com/challenge/${challengeId}`;
      
      return c.json({
        challengeId,
        challengeUrl,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      console.error('Error creating challenge:', error);
      return c.json({
        error: 'Challenge Creation Failed',
        message: 'Unable to create challenge',
      }, 500);
    }
  }
);

// GET /challenge/:challenge_id - Get challenge details
shareRouter.get('/challenge/:challenge_id', async (c) => {
  const challengeId = c.req.param('challenge_id');
  
  try {
    const challengeData = await c.env.CACHE.get(`challenge:${challengeId}`);
    
    if (!challengeData) {
      return c.json({
        error: 'Not Found',
        message: 'Challenge not found or expired',
      }, 404);
    }
    
    const challenge = JSON.parse(challengeData);
    
    // Check if expired
    if (new Date(challenge.expiresAt) < new Date()) {
      await c.env.CACHE.delete(`challenge:${challengeId}`);
      return c.json({
        error: 'Expired',
        message: 'This challenge has expired',
      }, 410);
    }
    
    // Get original result for comparison
    const resultData = await c.env.CACHE.get(`result:${challenge.resultId}`);
    if (!resultData) {
      return c.json({
        error: 'Not Found',
        message: 'Original result not found',
      }, 404);
    }
    
    const result = JSON.parse(resultData);
    
    return c.json({
      challengeId,
      message: challenge.challengeMessage,
      originalResult: {
        primaryType: result.results.primary_type,
        traits: result.results.personality_traits,
      },
      expiresAt: challenge.expiresAt,
    });
  } catch (error) {
    console.error('Error getting challenge:', error);
    return c.json({
      error: 'Challenge Retrieval Failed',
      message: 'Unable to retrieve challenge',
    }, 500);
  }
});

export { shareRouter };