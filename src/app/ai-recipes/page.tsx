
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generateBeerRecipe, type GenerateBeerRecipeInput, type GenerateBeerRecipeOutput } from '@/ai/flows/generate-beer-recipe';
import { useState } from 'react';
import { useRecipeStore } from '@/lib/store';
import { Wand2Icon, SaveIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Recipe, Grain, Hop, Yeast, AdditionalIngredient } from '@/types';

const aiRecipeFormSchema = z.object({
  userQuery: z.string().min(10, "Votre demande doit contenir au moins 10 caractères pour que l'IA puisse générer une recette pertinente."),
});

type AiRecipeFormData = z.infer<typeof aiRecipeFormSchema>;

export default function AiRecipesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GenerateBeerRecipeOutput | null>(null);
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const { toast } = useToast();

  const form = useForm<AiRecipeFormData>({
    resolver: zodResolver(aiRecipeFormSchema),
    defaultValues: {
      userQuery: '',
    },
  });
  
  async function onSubmit(data: AiRecipeFormData) {
    setIsLoading(true);
    setGeneratedRecipe(null);
    try {
      const input: GenerateBeerRecipeInput = { userQuery: data.userQuery };
      const recipeOutput = await generateBeerRecipe(input);
      setGeneratedRecipe(recipeOutput);
      toast({
        title: "Recette IA générée!",
        description: `La recette "${recipeOutput.recipeName}" a été créée. Vous pouvez la sauvegarder.`,
      });
    } catch (error) {
      console.error("Error generating AI recipe:", error);
      let errorMessage = "Impossible de générer la recette IA. Veuillez réessayer ou reformuler votre demande.";
      if (error instanceof Error) {
        errorMessage = error.message.includes("output was invalid") 
          ? "L'IA a retourné une réponse inattendue. Veuillez réessayer." 
          : "Erreur de génération: " + error.message;
      }
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveRecipe = () => {
    if (!generatedRecipe) return;

    const recipeGrains: Grain[] = (generatedRecipe.grains || []).map(grain => ({
      ...grain,
      id: crypto.randomUUID(),
    }));

    const recipeHops: Hop[] = (generatedRecipe.hops || []).map(hop => ({
      ...hop,
      id: crypto.randomUUID(),
    }));
    
    const recipeYeast: Yeast | undefined = generatedRecipe.yeast ? {
      ...generatedRecipe.yeast,
      id: crypto.randomUUID(),
    } : undefined;

    const recipeAdditionalIngredients: AdditionalIngredient[] = (generatedRecipe.additionalIngredients || []).map(ingredient => ({
      ...ingredient,
      id: crypto.randomUUID(),
    }));

    const recipeToSave: Omit<Recipe, 'id' | 'createdAt'> = {
      name: generatedRecipe.recipeName,
      style: generatedRecipe.detectedStyle || 'Style IA',
      volume: 20, // Default volume, AI might provide this in instructions or future schema update
      initialGravity: parseFloat(generatedRecipe.originalGravity) || undefined,
      finalGravity: parseFloat(generatedRecipe.finalGravity) || undefined,
      colorEBC: parseInt(generatedRecipe.color) || undefined,
      bitternessIBU: parseInt(generatedRecipe.bitterness) || undefined,
      alcoholABV: parseFloat(generatedRecipe.alcoholContent.replace(/%[^0-9.]*$/, "")) || undefined,
      
      grains: recipeGrains,
      hops: recipeHops,
      yeast: recipeYeast,
      additionalIngredients: recipeAdditionalIngredients,
      
      notes: `Recette générée par IA. Requête: "${form.getValues('userQuery')}". Style détecté: ${generatedRecipe.detectedStyle}.`,
      instructions: generatedRecipe.instructions,
    };
    
    addRecipe(recipeToSave);
    toast({
      title: "Recette IA sauvegardée!",
      description: `La recette "${recipeToSave.name}" a été ajoutée à "Mes recettes".`,
    });
    setGeneratedRecipe(null); 
    form.reset(); 
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Générateur de Recettes IA</CardTitle>
          <CardDescription>Décrivez la bière de vos rêves et laissez l'IA créer une recette unique pour vous !</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre demande de recette</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Je voudrais une recette pour une IPA américaine fruitée avec des houblons Citra et Mosaic, pour un volume de 20 litres. J'ai un équipement de brassage tout grain standard." 
                        {...field} 
                        rows={5} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                <Wand2Icon className="mr-2 h-4 w-4" />
                {isLoading ? 'Génération en cours...' : 'Générer la recette'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">L'IA brasse votre recette...</p>
        </div>
      )}

      {generatedRecipe && !isLoading && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-accent">{generatedRecipe.recipeName}</CardTitle>
            <CardDescription>Style: {generatedRecipe.detectedStyle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Caractéristiques:</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Densité Initiale (DI):</strong> {generatedRecipe.originalGravity}</li>
                <li><strong>Densité Finale (DF):</strong> {generatedRecipe.finalGravity}</li>
                <li><strong>Couleur (EBC):</strong> {generatedRecipe.color}</li>
                <li><strong>Amertume (IBU):</strong> {generatedRecipe.bitterness}</li>
                <li><strong>Alcool (% alc./vol):</strong> {generatedRecipe.alcoholContent}</li>
              </ul>
            </div>
            {/* Removed the generic 'Ingrédients' textarea. Details will be seen after saving. */}
            <div>
              <h3 className="font-semibold text-lg mb-1">Instructions de brassage:</h3>
              <Textarea value={generatedRecipe.instructions} readOnly rows={12} className="bg-muted/50 text-sm" />
            </div>
             <p className="text-sm text-muted-foreground italic">
              Les listes détaillées des céréales, houblons, levure et ingrédients additionnels seront visibles dans &quot;Mes Recettes&quot; après sauvegarde.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveRecipe}>
              <SaveIcon className="mr-2 h-4 w-4" />
              Sauvegarder cette recette IA
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

