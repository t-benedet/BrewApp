// src/ai/flows/generate-beer-recipe.ts
'use server';
/**
 * @fileOverview Generates beer recipes using AI based on a user's natural language query.
 *
 * - generateBeerRecipe - A function that handles the beer recipe generation process.
 * - GenerateBeerRecipeInput - The input type for the generateBeerRecipe function.
 * - GenerateBeerRecipeOutput - The return type for the generateBeerRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBeerRecipeInputSchema = z.object({
  userQuery: z.string().describe('The user\'s detailed request for a beer recipe, including desired style, key ingredients, or brewing method preferences.'),
});
export type GenerateBeerRecipeInput = z.infer<typeof GenerateBeerRecipeInputSchema>;

const GenerateBeerRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated beer recipe.'),
  detectedStyle: z.string().describe('The beer style detected or chosen by the AI based on the user query.'),
  ingredients: z.string().describe('A detailed list of ingredients for the recipe.'),
  instructions: z.string().describe('Step-by-step brewing instructions.'),
  originalGravity: z.string().describe('The original gravity of the beer.'),
  finalGravity: z.string().describe('The final gravity of the beer.'),
  color: z.string().describe('The color of the beer in EBC.'),
  bitterness: z.string().describe('The bitterness of the beer in IBU.'),
  alcoholContent: z.string().describe('The alcohol content of the beer in % alc./vol.'),
});
export type GenerateBeerRecipeOutput = z.infer<typeof GenerateBeerRecipeOutputSchema>;

export async function generateBeerRecipe(input: GenerateBeerRecipeInput): Promise<GenerateBeerRecipeOutput> {
  return generateBeerRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBeerRecipePrompt',
  input: {schema: GenerateBeerRecipeInputSchema},
  output: {schema: GenerateBeerRecipeOutputSchema},
  prompt: `You are an expert beer recipe generator. Analyze the user's request below and generate a detailed beer recipe.
If the user specifies a style, use that. If not, infer a suitable style.
If specific ingredients or equipment are mentioned, try to incorporate them. If equipment is not mentioned, assume standard homebrewing equipment.
User Query: {{{userQuery}}}

Ensure the recipe includes a recipe name, the detected beer style, a detailed list of ingredients, step-by-step brewing instructions, original gravity, final gravity, color (EBC), bitterness (IBU), and alcohol content (% alc./vol.).
The recipe name should be creative and reflect the style and key characteristics.
The ingredients list should be clearly formatted, ideally with subheadings for malts/grains, hops, yeast, and other additions.
The instructions should be clear, concise, and easy to follow for a homebrewer.
Provide numerical values for OG, FG, EBC, IBU, and ABV.
`,
});

const generateBeerRecipeFlow = ai.defineFlow(
  {
    name: 'generateBeerRecipeFlow',
    inputSchema: GenerateBeerRecipeInputSchema,
    outputSchema: GenerateBeerRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

