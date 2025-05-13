// src/ai/flows/generate-beer-recipe.ts
'use server';
/**
 * @fileOverview Generates beer recipes using AI based on style and available ingredients.
 *
 * - generateBeerRecipe - A function that handles the beer recipe generation process.
 * - GenerateBeerRecipeInput - The input type for the generateBeerRecipe function.
 * - GenerateBeerRecipeOutput - The return type for the generateBeerRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBeerRecipeInputSchema = z.object({
  style: z.string().describe('The desired style of beer (e.g., IPA, Stout, Lager).'),
  availableIngredients: z.string().describe('A comma-separated list of available ingredients.'),
  equipment: z.string().describe('Description of the brewing equipment available.'),
});
export type GenerateBeerRecipeInput = z.infer<typeof GenerateBeerRecipeInputSchema>;

const GenerateBeerRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated beer recipe.'),
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
  prompt: `You are an expert beer recipe generator. Generate a beer recipe based on the specified style, available ingredients, and equipment.

Style: {{{style}}}
Available Ingredients: {{{availableIngredients}}}
Equipment: {{{equipment}}}

Ensure the recipe includes a detailed list of ingredients, step-by-step brewing instructions, original gravity, final gravity, color (EBC), bitterness (IBU), and alcohol content (% alc./vol.).
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
