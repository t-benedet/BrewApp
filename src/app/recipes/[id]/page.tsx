
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRecipeStore } from '@/lib/store';
import type { Recipe, Grain, Hop, Yeast } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, BeerIcon, CalendarDaysIcon, EditIcon, InfoIcon, ThermometerIcon, LayersIcon, HopIcon, WheatIcon } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const getRecipeById = useRecipeStore((state) => state.getRecipeById);

  useEffect(() => {
    if (recipeId) {
      const foundRecipe = getRecipeById(recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        // Optionally redirect or show a not found message
        // For now, let's assume recipe will be found or handle UI below
      }
    }
  }, [recipeId, getRecipeById]);

  if (!recipe) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-muted-foreground">Chargement de la recette...</p>
        {/* Or a skeleton loader */}
      </div>
    );
  }

  const statDisplay = (label: string, value: number | undefined, unit: string, max: number, toFixedValue: number = 0) => (
    value !== undefined && (
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>{label} ({value.toFixed(toFixedValue)} {unit})</span>
          <span className="text-muted-foreground">{((value / max) * 100).toFixed(0)}%</span>
        </div>
        <Progress value={(value / max) * 100} className="h-2" />
      </div>
    )
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Retour
      </Button>

      {/* Beer Name */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
            <BeerIcon className="h-8 w-8" />
            {recipe.name}
          </CardTitle>
          {/* Placeholder for Edit Button - Future Feature */}
          {/* <Button variant="outline" size="icon" asChild>
            <Link href={`/recipes/edit/${recipe.id}`}>
              <EditIcon className="h-5 w-5" />
            </Link>
          </Button> */}
        </CardHeader>
      </Card>

      {/* General Info & Stats */}
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><InfoIcon className="h-5 w-5 text-accent"/>Informations Générales & Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {/* Left: Style & Volume */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Style</h3>
              <p className="text-lg">{recipe.style}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Volume Cible</h3>
              <p className="text-lg">{recipe.volume} Litres</p>
            </div>
          </div>
          {/* Right: Stats with Gauges */}
          <div>
            {statDisplay("Densité Initiale", recipe.initialGravity, "SG", 1.150, 3)}
            {statDisplay("Densité Finale", recipe.finalGravity, "SG", 1.050, 3)}
            {statDisplay("Couleur", recipe.colorEBC, "EBC", 100)}
            {statDisplay("Amertume", recipe.bitternessIBU, "IBU", 120)}
            {statDisplay("Alcool", recipe.alcoholABV, "% alc./vol.", 20, 1)}
          </div>
        </CardContent>
      </Card>

      {/* Grains & Sugars */}
      {recipe.grains && recipe.grains.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><WheatIcon className="h-5 w-5 text-accent"/>Céréales et Sucres</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Poids (g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipe.grains.map((grain: Grain) => (
                  <TableRow key={grain.id}>
                    <TableCell>{grain.name}</TableCell>
                    <TableCell className="text-right">{grain.weight.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Hops */}
      {recipe.hops && recipe.hops.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><HopIcon className="h-5 w-5 text-accent"/>Houblons</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Poids (g)</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead className="text-right">% Alpha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipe.hops.map((hop: Hop) => (
                  <TableRow key={hop.id}>
                    <TableCell>{hop.name}</TableCell>
                    <TableCell className="text-right">{hop.weight.toLocaleString()}</TableCell>
                    <TableCell>{hop.format}</TableCell>
                    <TableCell className="text-right">{hop.alphaAcid.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Yeast */}
      {recipe.yeast && recipe.yeast.name && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><LayersIcon className="h-5 w-5 text-accent"/>Levure</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Poids/Qté (g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{recipe.yeast.name}</TableCell>
                  <TableCell>{recipe.yeast.type}</TableCell>
                  <TableCell className="text-right">{recipe.yeast.weight.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* AI Recipe Instructions (if available) */}
      {recipe.instructions && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">Instructions de Brassage (IA)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md">{recipe.instructions}</pre>
          </CardContent>
        </Card>
      )}

      {/* Fermentation & Notes */}
      {(recipe.fermentationStartDate || recipe.notes) && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><CalendarDaysIcon className="h-5 w-5 text-accent"/>Fermentation et Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recipe.fermentationStartDate && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Début de Fermentation Prévu</h3>
                <p className="text-lg">{format(parseISO(recipe.fermentationStartDate), "PPP", { locale: fr })}</p>
              </div>
            )}
            {recipe.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Notes Additionnelles</h3>
                <p className="text-base whitespace-pre-wrap">{recipe.notes}</p>
              </div>
            )}
            {!recipe.fermentationStartDate && !recipe.notes && <p className="text-muted-foreground">Aucune information de fermentation ou note additionnelle.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
