'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRecipeStore } from '@/lib/store';
import type { Recipe, Grain, Hop } from '@/types'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, BeerIcon, CalendarDaysIcon, EditIcon, InfoIcon, LayersIcon, HopIcon, WheatIcon } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BeerMugDisplay } from '@/components/recipes/BeerMugDisplay';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const getRecipeById = useRecipeStore((state) => state.getRecipeById);

  useEffect(() => {
    if (recipeId) {
      const foundRecipe = getRecipeById(recipeId);
      setRecipe(foundRecipe || null);
    }
  }, [recipeId, getRecipeById]);

  if (!recipe) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-muted-foreground">Recette non trouvée ou en cours de chargement...</p>
        <Button onClick={() => router.push('/recipes')} className="mt-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Retour aux recettes
        </Button>
      </div>
    );
  }

  const statDisplay = (label: string, value: number | undefined, unit: string, max: number, toFixedValue: number = 0) => (
    value !== undefined && (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground">{value.toFixed(toFixedValue)} {unit}</span>
        </div>
        <Progress value={max > 0 ? (value / max) * 100 : 0} className="h-2" aria-label={`${label}: ${value.toFixed(toFixedValue)} ${unit}, ${((value / max) * 100).toFixed(0)}%`} />
      </div>
    )
  );

  return (
    <div className="container mx-auto py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-6">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Button variant="default" asChild className="w-full sm:w-auto">
          <Link href={`/recipes/edit/${recipe.id}`}>
            <EditIcon className="mr-2 h-4 w-4" /> Modifier la recette
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/10 p-4 sm:p-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-3">
            <BeerIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            {recipe.name}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="shadow-md rounded-lg">
        <CardHeader className="p-4 sm:p-6 border-b">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 font-semibold">
                <InfoIcon className="h-5 w-5 text-accent"/>Informations & Statistiques
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <BeerMugDisplay ebcColor={recipe.colorEBC ?? undefined} className="mx-auto md:mx-0 mb-4" />
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Style</h3>
              <p className="text-md sm:text-lg font-semibold">{recipe.style}</p>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Volume Cible</h3>
              <p className="text-md sm:text-lg font-semibold">{recipe.volume} Litres</p>
            </div>
          </div>
          <div className="pt-2">
            {statDisplay("Densité Initiale", recipe.initialGravity, "SG", 1.150, 3)}
            {statDisplay("Densité Finale", recipe.finalGravity, "SG", 1.050, 3)}
            {statDisplay("Couleur", recipe.colorEBC, "EBC", 100, 0)}
            {statDisplay("Amertume", recipe.bitternessIBU, "IBU", 120, 0)}
            {statDisplay("Alcool", recipe.alcoholABV, "% alc./vol.", 20, 1)}
          </div>
        </CardContent>
      </Card>

      {recipe.grains && recipe.grains.length > 0 && (
        <Card className="shadow-md rounded-lg">
          <CardHeader className="p-4 sm:p-6 border-b">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 font-semibold"><WheatIcon className="h-5 w-5 text-accent"/>Céréales et Sucres</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 sm:px-6">Nom</TableHead>
                  <TableHead className="text-right px-4 py-3 sm:px-6">Poids (g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipe.grains.map((grain: Grain) => (<TableRow key={grain.id}><TableCell className="px-4 py-3 sm:px-6 font-medium">{grain.name}</TableCell><TableCell className="text-right px-4 py-3 sm:px-6">{grain.weight.toLocaleString()}</TableCell></TableRow>))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {recipe.hops && recipe.hops.length > 0 && (
        <Card className="shadow-md rounded-lg">
          <CardHeader className="p-4 sm:p-6 border-b">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 font-semibold"><HopIcon className="h-5 w-5 text-accent"/>Houblons</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 sm:px-6">Nom</TableHead>
                  <TableHead className="text-right px-4 py-3 sm:px-6 hidden sm:table-cell">Poids (g)</TableHead>
                  <TableHead className="px-4 py-3 sm:px-6">Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipe.hops.map((hop: Hop) => (<TableRow key={hop.id}><TableCell className="px-4 py-3 sm:px-6 font-medium">{hop.name}</TableCell><TableCell className="text-right px-4 py-3 sm:px-6 hidden sm:table-cell">{hop.weight.toLocaleString()}</TableCell><TableCell className="px-4 py-3 sm:px-6"><div className="sm:hidden text-xs text-muted-foreground">{hop.weight.toLocaleString()}g</div>{hop.format} ({hop.alphaAcid ? hop.alphaAcid.toFixed(1) : 'N/A'}% AA)</TableCell></TableRow>))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {recipe.yeast && recipe.yeast.name && (
        <Card className="shadow-md rounded-lg">
          <CardHeader className="p-4 sm:p-6 border-b">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 font-semibold"><LayersIcon className="h-5 w-5 text-accent"/>Levure</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 sm:px-6">Nom</TableHead>
                  <TableHead className="px-4 py-3 sm:px-6">Type</TableHead>
                  <TableHead className="text-right px-4 py-3 sm:px-6">Poids/Qté (g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="px-4 py-3 sm:px-6 font-medium">{recipe.yeast.name}</TableCell>
                  <TableCell className="px-4 py-3 sm:px-6">{recipe.yeast.type}</TableCell>
                  <TableCell className="text-right px-4 py-3 sm:px-6">{recipe.yeast.weight.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {recipe.instructions && (
        <Card className="shadow-md rounded-lg">
          <CardHeader className="p-4 sm:p-6 border-b">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 font-semibold">Instructions de Brassage</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-3 sm:p-4 rounded-md font-sans">{recipe.instructions}</pre>
          </CardContent>
        </Card>
      )}

      {(recipe.fermentationStartDate || recipe.notes) && (
        <Card className="shadow-md rounded-lg">
          <CardHeader className="p-4 sm:p-6 border-b">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 font-semibold"><CalendarDaysIcon className="h-5 w-5 text-accent"/>Fermentation et Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {recipe.fermentationStartDate && (
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Début de Fermentation Prévu</h3>
                <p className="text-md sm:text-lg">{format(parseISO(recipe.fermentationStartDate), "PPP", { locale: fr })}</p>
              </div>
            )}
            {recipe.notes && (
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Notes Additionnelles</h3>
                <p className="text-base whitespace-pre-wrap bg-muted/30 p-3 sm:p-4 rounded-md font-sans">{recipe.notes}</p>
              </div>
            )}
            {!recipe.fermentationStartDate && !recipe.notes && <p className="text-muted-foreground">Aucune information de fermentation ou note additionnelle.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}