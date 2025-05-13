'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import type { Recipe } from '@/types';
import { useRecipeStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GrainFields, HopFields, YeastFields } from '@/components/recipes/RecipeFormFields';
import { BeerIcon, CalendarIcon, SaveIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

const recipeSchema = z.object({
  name: z.string().min(1, "Le nom de la bière est requis."),
  style: z.string().min(1, "Le style de bière est requis."),
  volume: z.number().min(0.1, "Le volume doit être positif.").max(1000, "Volume excessif."),
  initialGravity: z.optional(z.number().min(0.9).max(1.2)),
  finalGravity: z.optional(z.number().min(0.9).max(1.2)),
  colorEBC: z.optional(z.number().min(0).max(200)),
  bitternessIBU: z.optional(z.number().min(0).max(200)),
  alcoholABV: z.optional(z.number().min(0).max(25)),
  grains: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Nom requis"),
    weight: z.number().min(1, "Poids requis (g)"),
  })).min(1, "Au moins une céréale/sucre est requis."),
  hops: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Nom requis"),
    weight: z.number().min(1, "Poids requis (g)"),
    format: z.enum(['Pellets', 'Cones', 'Extract', 'Other']),
    alphaAcid: z.number().min(0).max(100, "% AA invalide"),
  })).min(1, "Au moins un houblon est requis."),
  yeast: z.optional(z.object({
    id: z.string(),
    name: z.string().min(1, "Nom de levure requis"),
    type: z.enum(['Ale', 'Lager', 'Wild', 'Other']),
    weight: z.number().min(0, "Poids/Qté requis"),
  })),
  fermentationStartDate: z.optional(z.string()),
  notes: z.optional(z.string()),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

// Default values for yeast need an ID
const defaultYeast = { id: crypto.randomUUID(), name: '', type: 'Ale' as const, weight: 0 };


export default function NewRecipePage() {
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      style: '',
      volume: 20,
      grains: [{ id: crypto.randomUUID(), name: '', weight: 0 }],
      hops: [{ id: crypto.randomUUID(), name: '', weight: 0, format: 'Pellets', alphaAcid: 0 }],
      yeast: defaultYeast,
      notes: '',
    },
  });

  const { fields: grainFields, append: appendGrain, remove: removeGrain } = useFieldArray({
    control: form.control,
    name: "grains",
  });

  const { fields: hopFields, append: appendHop, remove: removeHop } = useFieldArray({
    control: form.control,
    name: "hops",
  });

  function onSubmit(data: RecipeFormData) {
    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      ...data,
      // Ensure yeast has an id if it exists, even if user didn't touch it but it was defaulted
      yeast: data.yeast?.name ? { ...data.yeast, id: data.yeast.id || crypto.randomUUID() } : undefined, 
    };
    addRecipe(newRecipe);
    toast({
      title: "Recette enregistrée!",
      description: `La recette "${newRecipe.name}" a été ajoutée.`,
    });
    router.push('/recipes');
  }
  
  const watchAlcoholABV = form.watch('alcoholABV', 0);
  const watchBitternessIBU = form.watch('bitternessIBU', 0);
  const watchColorEBC = form.watch('colorEBC', 0);
  const watchInitialGravity = form.watch('initialGravity', 1.000);
  const watchFinalGravity = form.watch('finalGravity', 1.000);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Nouvelle recette</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats Panel */}
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BeerIcon className="h-6 w-6 text-primary" />
                Statistiques de la bière
              </CardTitle>
              <CardDescription>Valeurs cibles pour votre recette.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Densité initiale", field: "initialGravity", value: watchInitialGravity, max: 1.150, step: 0.001, unitSuffix: " SG", displayValue: watchInitialGravity?.toFixed(3) },
                { label: "Densité finale", field: "finalGravity", value: watchFinalGravity, max: 1.050, step: 0.001, unitSuffix: " SG", displayValue: watchFinalGravity?.toFixed(3) },
                { label: "Couleur", field: "colorEBC", value: watchColorEBC, max: 100, unitSuffix: " EBC" },
                { label: "Amertume", field: "bitternessIBU", value: watchBitternessIBU, max: 120, unitSuffix: " IBU" },
                { label: "Alcool", field: "alcoholABV", value: watchAlcoholABV, max: 20, unitSuffix: "% alc./vol", displayValue: watchAlcoholABV?.toFixed(1) },
              ].map(stat => (
                <FormField
                  key={stat.field}
                  control={form.control}
                  name={stat.field as keyof RecipeFormData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{stat.label} ({stat.displayValue || field.value || 0}{stat.unitSuffix})</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step={stat.step || 1}
                          placeholder={`Ex: ${stat.field === 'initialGravity' ? '1.050' : (stat.max / 2)}`}
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <Progress value={field.value ? (field.value / stat.max) * 100 : 0} className="h-2 mt-1" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          {/* Right Column: Recipe Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la bière</FormLabel>
                        <FormControl><Input placeholder="Ex: Ma Super IPA" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style de bière</FormLabel>
                        <FormControl><Input placeholder="Ex: American IPA" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Separator />
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (Litres)</FormLabel>
                      <FormControl><Input type="number" placeholder="Ex: 20" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <GrainFields control={form.control} name="grains" fields={grainFields} append={appendGrain} remove={removeGrain} errors={form.formState.errors} />
            <HopFields control={form.control} name="hops" fields={hopFields} append={appendHop} remove={removeHop} errors={form.formState.errors} />
            <YeastFields control={form.control} errors={form.formState.errors} />

            <Card className="shadow-md">
              <CardHeader><CardTitle className="text-xl">Calendrier de fermentation</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="fermentationStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de début de fermentation</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
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
                            selected={field.value ? parseISO(field.value) : undefined}
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
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader><CardTitle className="text-xl">Notes additionnelles</CardTitle></CardHeader>
              <CardContent>
                 <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Notes sur le brassage, la fermentation, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button type="submit" size="lg">
            <SaveIcon className="mr-2 h-5 w-5" />
            Enregistrer la recette
          </Button>
        </div>
      </form>
    </Form>
  );
}
