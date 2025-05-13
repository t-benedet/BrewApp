'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generateBeerRecipe, type GenerateBeerRecipeInput, type GenerateBeerRecipeOutput } from '@/ai/flows/generate-beer-recipe';
import { useState, useEffect } from 'react';
import { useEquipmentStore, useRecipeStore } from '@/lib/store';
import { Wand2Icon, SaveIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from '@/types'; // Import the Recipe type

const aiRecipeFormSchema = z.object({
  style: z.string().min(1, "Le style de bière est requis."),
  availableIngredients: z.string().min(1, "Les ingrédients disponibles sont requis."),
  equipment: z.string().min(1, "La description de l'équipement est requise."),
});

type AiRecipeFormData = z.infer<typeof aiRecipeFormSchema>;

export default function AiRecipesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GenerateBeerRecipeOutput | null>(null);
  const equipmentDescription = useEquipmentStore((state) => state.equipment.description);
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const { toast } = useToast();

  const form = useForm<AiRecipeFormData>({
    resolver: zodResolver(aiRecipeFormSchema),
    defaultValues: {
      style: '',
      availableIngredients: '',
      equipment: '',
    },
  });
  
  useEffect(() => {
    if (equipmentDescription) {
      form.setValue('equipment', equipmentDescription);
    }
  }, [equipmentDescription, form]);

  async function onSubmit(data: AiRecipeFormData) {
    setIsLoading(true);
    setGeneratedRecipe(null);
    try {
      const input: GenerateBeerRecipeInput = data;
      const recipeOutput = await generateBeerRecipe(input);
      setGeneratedRecipe(recipeOutput);
      toast({
        title: "Recette IA générée!",
        description: `La recette "${recipeOutput.recipeName}" a été créée.`,
      });
    } catch (error) {
      console.error("Error generating AI recipe:", error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer la recette IA. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveRecipe = () => {
    if (!generatedRecipe) return;

    // Approximation: Convert AI output to our Recipe structure
    // This is a simplified conversion. More complex parsing might be needed.
    const recipeToSave: Recipe = {
      id: crypto.randomUUID(),
      name: generatedRecipe.recipeName,
      style: form.getValues('style') || 'Style IA', // Get style from form or default
      volume: 20, // Default volume, AI doesn't specify this
      initialGravity: parseFloat(generatedRecipe.originalGravity) || undefined,
      finalGravity: parseFloat(generatedRecipe.finalGravity) || undefined,
      colorEBC: parseInt(generatedRecipe.color) || undefined,
      bitternessIBU: parseInt(generatedRecipe.bitterness) || undefined,
      alcoholABV: parseFloat(generatedRecipe.alcoholContent) || undefined,
      grains: [], // AI output for ingredients is a string, needs parsing
      hops: [],   // Same for hops
      // yeast: { name: 'Levure IA', type: 'Ale', weight: 1, id: crypto.randomUUID() }, // Placeholder
      notes: `Recette générée par IA. Style: ${form.getValues('style')}. Ingrédients: ${form.getValues('availableIngredients')}`,
      instructions: generatedRecipe.instructions,
    };
    
    addRecipe(recipeToSave);
    toast({
      title: "Recette IA sauvegardée!",
      description: `La recette "${recipeToSave.name}" a été ajoutée à "Mes recettes".`,
    });
    setGeneratedRecipe(null); // Clear displayed recipe after saving
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Générateur de Recettes IA</CardTitle>
          <CardDescription>Laissez l'IA créer une recette de bière unique pour vous !</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style de bière désiré</FormLabel>
                    <FormControl><Input placeholder="Ex: IPA, Stout, Lager..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableIngredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingrédients disponibles</FormLabel>
                    <FormControl><Textarea placeholder="Ex: Malt Pale Ale, Houblon Citra, Levure US-05..." {...field} rows={3} /></FormControl>
                    <FormDescription>Liste séparée par des virgules.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Équipement disponible</FormLabel>
                    <FormControl><Textarea placeholder="Décrivez votre équipement de brassage..." {...field} rows={3} /></FormControl>
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
            <div>
              <h3 className="font-semibold text-lg mb-1">Ingrédients:</h3>
              <Textarea value={generatedRecipe.ingredients} readOnly rows={6} className="bg-muted/50" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Instructions:</h3>
              <Textarea value={generatedRecipe.instructions} readOnly rows={10} className="bg-muted/50" />
            </div>
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
