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

const AiGrainSchema = z.object({
  name: z.string().describe("Name of the grain or fermentable sugar."),
  weight: z.number().describe("Weight of the grain/sugar in grams."),
});

const AiHopSchema = z.object({
  name: z.string().describe("Name of the hop."),
  weight: z.number().describe("Weight of the hop in grams."),
  format: z.enum(['Pellets', 'Cones', 'Extract', 'Other']).describe("Form of the hop (Pellets, Cones, Extract, Other)."),
  alphaAcid: z.number().describe("Alpha acid percentage of the hop (e.g., 12.5 for 12.5%)."),
});

const AiYeastSchema = z.object({
  name: z.string().describe("Name of the yeast strain."),
  type: z.enum(['Ale', 'Lager', 'Wild', 'Other']).describe("Type of yeast (Ale, Lager, Wild, Other)."),
  weight: z.number().describe("Weight/amount of yeast in grams (for dry yeast) or a count (e.g., 1 for one pack of liquid yeast)."),
});

const AiAdditionalIngredientSchema = z.object({
  name: z.string().describe("Name of the additional ingredient (e.g., Irish Moss, Orange Peel)."),
  weight: z.number().describe("Weight of the ingredient in grams. If weight is not applicable (e.g. 1 tablet), use a representative number like 1 and clarify unit in description."),
  description: z.string().optional().describe("Brief description, type, or unit of the additional ingredient (e.g., 'for clarity', 'zest', '1 tablet')."),
});


const GenerateBeerRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated beer recipe.'),
  detectedStyle: z.string().describe('The beer style detected or chosen by the AI based on the user query.'),
  
  grains: z.array(AiGrainSchema).describe("List of grains and fermentable sugars with their names and weights in grams."),
  hops: z.array(AiHopSchema).describe("List of hops with name, weight in grams, format (Pellets, Cones, Extract, Other), and alpha acid percentage."),
  yeast: AiYeastSchema.describe("Details of the yeast including name, type (Ale, Lager, Wild, Other), and weight/amount in grams or units."),
  additionalIngredients: z.array(AiAdditionalIngredientSchema).optional().describe("List of any additional ingredients like spices, fruits, or finings, with name, weight (grams or units), and optional description."),

  instructions: z.string().describe('Step-by-step brewing instructions. This should NOT include the ingredient list again if they are provided in structured format above.'),
  originalGravity: z.string().describe('The original gravity of the beer (e.g., "1.050").'),
  finalGravity: z.string().describe('The final gravity of the beer (e.g., "1.010").'),
  color: z.string().describe('The color of the beer in EBC (e.g., "12").'),
  bitterness: z.string().describe('The bitterness of the beer in IBU (e.g., "35").'),
  alcoholContent: z.string().describe('The alcohol content of the beer in % alc./vol. (e.g., "5.5%").'),
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

Provide the output in the structured format defined by the output schema.
Ensure the recipe includes a recipe name, the detected beer style, structured lists for grains, hops, yeast, and additional ingredients (if any), step-by-step brewing instructions, original gravity (e.g., "1.050"), final gravity (e.g., "1.010"), color (EBC, e.g., "12"), bitterness (IBU, e.g., "35"), and alcohol content (% alc./vol., e.g., "5.5%").

- For grains, provide 'name' (string) and 'weight' (number, in grams).
- For hops, provide 'name' (string), 'weight' (number, in grams), 'format' (enum: 'Pellets', 'Cones', 'Extract', 'Other'), and 'alphaAcid' (number, e.g., 12.5 for 12.5% AA).
- For yeast, provide 'name' (string), 'type' (enum: 'Ale', 'Lager', 'Wild', 'Other'), and 'weight' (number, in grams or units like '1' for 1 pack).
- For additionalIngredients (optional), provide 'name' (string), 'weight' (number, in grams or units), and 'description' (string, optional, e.g. "for clarity at 15 min boil").

The recipe name should be creative and reflect the style and key characteristics.
The instructions should be clear, concise, and easy to follow for a homebrewer. DO NOT repeat the full ingredient list within the instructions if they are already provided in the structured fields (grains, hops, yeast, additionalIngredients). You can refer to them generally (e.g., "Add bittering hops").
Provide numerical values for OG, FG, EBC, IBU, and ABV as strings in the specified formats.
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
    if (!output) {
      throw new Error("AI failed to generate a recipe or the output was invalid.");
    }
    return output;
  }
);

