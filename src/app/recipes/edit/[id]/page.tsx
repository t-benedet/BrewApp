
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import type { Recipe } from '@/types';
import { useRecipeStore } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GrainFields, HopFields, YeastFields } from '@/components/recipes/RecipeFormFields';
import { BeerMugDisplay } from '@/components/recipes/BeerMugDisplay';
import { BeerIcon, CalendarIcon, SaveIcon, ArrowLeftIcon, InfoIcon, StickyNoteIcon, CalendarDaysIcon } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from 'react';

const recipeSchema = z.object({
  name: z.string().min(1, "Le nom de la bière est requis."),
  style: z.string().min(1, "Le style de bière est requis."),
  volume: z.number().min(0.1, "Le volume doit être positif.").max(1000, "Volume excessif."),
  initialGravity: z.optional(z.number().min(0.9).max(1.2).nullable()),
  finalGravity: z.optional(z.number().min(0.9).max(1.2).nullable()),
  colorEBC: z.optional(z.number().min(0).max(200).nullable()),
  bitternessIBU: z.optional(z.number().min(0).max(200).nullable()),
  alcoholABV: z.optional(z.number().min(0).max(25).nullable()),
  grains: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Nom requis"),
    weight: z.number().min(0, "Le poids doit être positif ou nul (g)"),
  })).min(1, "Au moins une céréale/sucre est requis."),
  hops: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Nom requis"),
    weight: z.number().min(0, "Le poids doit être positif ou nul (g)"),
    format: z.enum(['Pellets', 'Cones', 'Extract', 'Other']),
    alphaAcid: z.number().min(0).max(100, "% AA invalide"),
  })).min(1, "Au moins un houblon est requis."),
  yeast: z.optional(z.object({
    id: z.string(),
    name: z.string().min(1, "Nom de levure requis"),
    type: z.enum(['Ale', 'Lager', 'Wild', 'Other']),
    weight: z.number().min(0, "Le poids doit être positif ou nul (g)"),
  })),
  fermentationStartDate: z.optional(z.string().nullable()),
  bottlingDate: z.optional(z.string().nullable()),
  conditioningStartDate: z.optional(z.string().nullable()),
  tastingDate: z.optional(z.string().nullable()),
  notes: z.optional(z.string().nullable()),
  instructions: z.optional(z.string().nullable()), // Keep AI instructions if they exist
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const defaultYeast = { id: crypto.randomUUID(), name: '', type: 'Ale' as const, weight: 0 };

export default function EditRecipePage() {
  const { updateRecipe, getRecipeById } = useRecipeStore();
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      style: '',
      volume: 20,
      initialGravity: null,
      finalGravity: null,
      colorEBC: null,
      bitternessIBU: null,
      alcoholABV: null,
      grains: [{ id: crypto.randomUUID(), name: '', weight: 0 }],
      hops: [{ id: crypto.randomUUID(), name: '', weight: 0, format: 'Pellets', alphaAcid: 0 }],
      yeast: defaultYeast,
      fermentationStartDate: null,
      bottlingDate: null,
      conditioningStartDate: null,
      tastingDate: null,
      notes: '',
      instructions: '',
    },
  });

  useEffect(() => {
    if (recipeId) {
      const existingRecipe = getRecipeById(recipeId);
      if (existingRecipe) {
        form.reset({
          ...existingRecipe,
          initialGravity: existingRecipe.initialGravity ?? null,
          finalGravity: existingRecipe.finalGravity ?? null,
          colorEBC: existingRecipe.colorEBC ?? null,
          bitternessIBU: existingRecipe.bitternessIBU ?? null,
          alcoholABV: existingRecipe.alcoholABV ?? null,
          fermentationStartDate: existingRecipe.fermentationStartDate ?? null,
          bottlingDate: existingRecipe.bottlingDate ?? null,
          conditioningStartDate: existingRecipe.conditioningStartDate ?? null,
          tastingDate: existingRecipe.tastingDate ?? null,
          notes: existingRecipe.notes ?? '',
          instructions: existingRecipe.instructions ?? '',
          yeast: existingRecipe.yeast || defaultYeast,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Recette non trouvée.",
          variant: "destructive",
        });
        router.push('/recipes');
      }
      setIsLoading(false);
    }
  }, [recipeId, getRecipeById, form, router, toast]);

  const { fields: grainFields, append: appendGrain, remove: removeGrain } = useFieldArray({
    control: form.control, name: "grains",
  });
  const { fields: hopFields, append: appendHop, remove: removeHop } = useFieldArray({
    control: form.control, name: "hops",
  });

  function onSubmit(data: RecipeFormData) {
    const recipeToUpdate: Recipe = {
      id: recipeId, 
      ...data,
      createdAt: getRecipeById(recipeId)?.createdAt || new Date().toISOString(), // Preserve original creation date
      yeast: data.yeast?.name ? { ...data.yeast, id: data.yeast.id || crypto.randomUUID() } : undefined,
      initialGravity: data.initialGravity === null ? undefined : data.initialGravity,
      finalGravity: data.finalGravity === null ? undefined : data.finalGravity,
      colorEBC: data.colorEBC === null ? undefined : data.colorEBC,
      bitternessIBU: data.bitternessIBU === null ? undefined : data.bitternessIBU,
      alcoholABV: data.alcoholABV === null ? undefined : data.alcoholABV,
      fermentationStartDate: data.fermentationStartDate === null ? undefined : data.fermentationStartDate,
      bottlingDate: data.bottlingDate === null ? undefined : data.bottlingDate,
      conditioningStartDate: data.conditioningStartDate === null ? undefined : data.conditioningStartDate,
      tastingDate: data.tastingDate === null ? undefined : data.tastingDate,
      notes: data.notes === null ? undefined : data.notes,
      instructions: data.instructions === null ? undefined : data.instructions,
    };
    updateRecipe(recipeToUpdate);
    toast({
      title: "Recette modifiée!",
      description: `La recette "${recipeToUpdate.name}" a été mise à jour.`,
    });
    router.push(`/recipes/${recipeId}`);
  }
  
  const watchColorEBC = form.watch('colorEBC');

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Chargement de la recette pour modification...</div>;
  }

  const dateField = (name: keyof RecipeFormData, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                >
                  {field.value && isValid(parseISO(field.value)) ? (
                    format(parseISO(field.value), "PPP", { locale: fr })
                  ) : (
                    <span>Choisir une date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value && isValid(parseISO(field.value)) ? parseISO(field.value) : undefined}
                onSelect={(date) => field.onChange(date?.toISOString())}
                locale={fr}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Modifier la recette</h1>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Annuler
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BeerIcon className="h-6 w-6 text-primary" />
                Statistiques
              </CardTitle>
              <CardDescription>Valeurs cibles de votre recette.</CardDescription>
               <BeerMugDisplay ebcColor={watchColorEBC ?? undefined} />
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Densité initiale (SG)", field: "initialGravity", max: 1.150, step: 0.001, formatFn: (v?: number | null) => v?.toFixed(3) },
                { label: "Densité finale (SG)", field: "finalGravity", max: 1.050, step: 0.001, formatFn: (v?: number | null) => v?.toFixed(3) },
                { label: "Couleur (EBC)", field: "colorEBC", max: 100, step: 1 },
                { label: "Amertume (IBU)", field: "bitternessIBU", max: 120, step: 1 },
                { label: "Alcool (% ABV)", field: "alcoholABV", max: 20, step: 0.1, formatFn: (v?: number | null) => v?.toFixed(1) },
              ].map(stat => (
                <FormField
                  key={stat.field}
                  control={form.control}
                  name={stat.field as keyof RecipeFormData}
                  render={({ field: { onChange, value, ...restField } }) => {
                    const displayValue = stat.formatFn ? stat.formatFn(value) : value;
                    return (
                      <FormItem>
                        <FormLabel>{stat.label} ({displayValue || 'N/A'})</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step={stat.step || 1}
                            placeholder={`Ex: ${stat.max / 2}`}
                            {...restField}
                            value={value === null || value === undefined ? '' : String(value)} // Handle null for input
                            onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <Progress value={(typeof value === 'number' && stat.max > 0) ? (value / stat.max) * 100 : 0} className="h-2 mt-1" />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><InfoIcon className="h-5 w-5 text-accent" /> Informations de base</CardTitle>
                </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Nom de la bière</FormLabel><FormControl><Input placeholder="Ex: Ma Super IPA" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="style" render={({ field }) => (
                      <FormItem><FormLabel>Style de bière</FormLabel><FormControl><Input placeholder="Ex: American IPA" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <Separator />
                <FormField control={form.control} name="volume" render={({ field }) => (
                    <FormItem><FormLabel>Volume (Litres)</FormLabel><FormControl><Input type="number" placeholder="Ex: 20" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )}/>
              </CardContent>
            </Card>
            
            <GrainFields control={form.control} name="grains" fields={grainFields} append={appendGrain} remove={removeGrain} errors={form.formState.errors} />
            <HopFields control={form.control} name="hops" fields={hopFields} append={appendHop} remove={removeHop} errors={form.formState.errors} />
            <YeastFields control={form.control} errors={form.formState.errors} />

            <Card className="shadow-md">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2"><CalendarDaysIcon className="h-5 w-5 text-accent"/>Calendrier</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {dateField("fermentationStartDate", "Date de début de fermentation")}
                {dateField("bottlingDate", "Date de mise en bouteille")}
                {dateField("conditioningStartDate", "Date de début de garde / conditionnement")}
                {dateField("tastingDate", "Date de dégustation prévue")}
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2"><StickyNoteIcon className="h-5 w-5 text-accent"/>Notes & Instructions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem><FormLabel>Notes additionnelles</FormLabel><FormControl><Textarea placeholder="Notes sur le brassage, la fermentation, etc." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="instructions" render={({ field }) => (
                      <FormItem><FormLabel>Instructions de brassage</FormLabel><FormControl><Textarea placeholder="Instructions de brassage..." {...field} value={field.value ?? ''} rows={8} /></FormControl><FormMessage /></FormItem>
                  )}/>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button type="submit" size="lg">
            <SaveIcon className="mr-2 h-5 w-5" />
            Sauvegarder les modifications
          </Button>
        </div>
      </form>
    </Form>
  );
}
