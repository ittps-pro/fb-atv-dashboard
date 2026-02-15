'use server';
/**
 * @fileOverview A Genkit flow for generating personalized content recommendations.
 *
 * - personalizedContentRecommendations - A function that provides AI-powered content recommendations.
 * - PersonalizedContentRecommendationsInput - The input type for the personalizedContentRecommendations function.
 * - PersonalizedContentRecommendationsOutput - The return type for the personalizedContentRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const PersonalizedContentRecommendationsInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('A list of content items previously viewed by the user.'),
  preferences: z
    .array(z.string())
    .describe('A list of user preferences, e.g., preferred genres, actors, themes.'),
});
export type PersonalizedContentRecommendationsInput = z.infer<
  typeof PersonalizedContentRecommendationsInputSchema
>;

// Content Recommendation Item Schema
const ContentRecommendationSchema = z.object({
  type: z.enum(['movie', 'tv_show', 'live_channel']).describe('The type of content.'),
  title: z.string().describe('The title of the content.'),
  genre: z.string().describe('The main genre of the content.'),
  description: z.string().describe('A brief description of the content.'),
  reason: z.string().describe('The reason for this recommendation.'),
});

// Output Schema
const PersonalizedContentRecommendationsOutputSchema = z.array(
  ContentRecommendationSchema
);
export type PersonalizedContentRecommendationsOutput = z.infer<
  typeof PersonalizedContentRecommendationsOutputSchema
>;

// Tool for content diversification
const diversifyContentTool = ai.defineTool(
  {
    name: 'diversifyContent',
    description:
      'Filters and diversifies a list of content recommendations to ensure a broad range of types and genres.',
    inputSchema: z.object({
      recommendations: z.array(ContentRecommendationSchema),
    }),
    outputSchema: PersonalizedContentRecommendationsOutputSchema,
  },
  async (input) => {
    const {recommendations} = input;
    if (recommendations.length === 0) {
      return [];
    }

    // A simple diversification strategy:
    // Try to ensure at least one of each type if available, then fill with others.
    const diversified: PersonalizedContentRecommendationsOutput = [];
    const seenTypes = new Set<string>();

    for (const rec of recommendations) {
      if (!seenTypes.has(rec.type)) {
        diversified.push(rec);
        seenTypes.add(rec.type);
      }
    }

    // Add remaining recommendations, ensuring a maximum of 5 for simplicity or
    // until we reach a diverse set.
    let addedCount = diversified.length;
    for (const rec of recommendations) {
      // Check if the recommendation (or a similar one) is already in the diversified list based on title and type
      const isDuplicate = diversified.some(
        (dRec) => dRec.title === rec.title && dRec.type === rec.type
      );
      if (!isDuplicate && addedCount < 5) {
        diversified.push(rec);
        addedCount++;
      }
    }
    
    return diversified.slice(0, 5);
  }
);


const recommendationPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedContentRecommendationsInputSchema},
  output: {schema: PersonalizedContentRecommendationsOutputSchema},
  tools: [diversifyContentTool],
  prompt: `You are an expert content recommendation engine.
The user wants personalized recommendations for movies, TV shows, and live channels.
Your task is to generate a diverse list of content recommendations based on their viewing history and preferences.

First, generate a list of at least 5 potential recommendations (can be more if you think it's relevant).
For each recommendation, include its type ('movie', 'tv_show', or 'live_channel'), title, genre, a brief description, and the reason for the recommendation.
After generating this initial list, use the 'diversifyContent' tool to filter and ensure a diverse set of recommendations.

Here is the user's viewing history:
{{#if viewingHistory}}
{{#each viewingHistory}}
- {{{this}}}
{{/each}}
{{else}}
No viewing history provided.
{{/if}}

Here are the user's preferences:
{{#if preferences}}
{{#each preferences}}
- {{{this}}}
{{/each}}
{{else}}
No preferences provided.
{{/if}}

After generating your initial recommendations, *call the diversifyContent tool with your recommendations* to get the final diversified list.
Then, output the result of the diversifyContent tool as your final answer.
`
});

const personalizedContentRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedContentRecommendationsFlow',
    inputSchema: PersonalizedContentRecommendationsInputSchema,
    outputSchema: PersonalizedContentRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await recommendationPrompt(input);
    if (!output) {
      throw new Error('No recommendations generated.');
    }
    return output;
  }
);

export async function personalizedContentRecommendations(
  input: PersonalizedContentRecommendationsInput
): Promise<PersonalizedContentRecommendationsOutput> {
  return personalizedContentRecommendationsFlow(input);
}
