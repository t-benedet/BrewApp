
'use client';

import { Button } from '@/components/ui/button';
import { useRecipeStore } from '@/lib/store';
import Link from 'next/link';
import { PlusCircleIcon, FilterIcon, BeerIcon, EyeIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Recipe } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const storeRecipes = useRecipeStore((state) => state.recipes);
  const deleteRecipeFromStore = useRecipeStore((state) => state.deleteRecipe);
  const { toast } = useToast();

  useEffect(() => {
    const sortedRecipes = [...storeRecipes].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (a.createdAt) return -1;
      if (b.createdAt) return 1;
      return 0;
    });
    setRecipes(sortedRecipes);
  }, [storeRecipes]);

  const handleDeleteRecipe = (recipeId: string, recipeName: string) => {
    deleteRecipeFromStore(recipeId);
    toast({
      title: "Recette supprimée",
      description: `La recette "${recipeName}" a été supprimée.`,
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Mes recettes</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button asChild className="flex-1 sm:flex-initial">
            <Link href="/recipes/new">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Créer une recette
            </Link>
          </Button>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg bg-card">
          <BeerIcon className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg sm:text-xl text-muted-foreground font-semibold">Aucune recette pour le moment.</p>
          <p className="text-sm sm:text-base text-muted-foreground">Commencez par en créer une nouvelle ou explorez les recettes IA !</p>
          <Button asChild className="mt-6">
            <Link href="/recipes/new">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Créer ma première recette
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] sm:w-[80px] text-center">Voir</TableHead>
                <TableHead>Nom de la recette</TableHead>
                <TableHead className="hidden sm:table-cell">Style</TableHead>
                <TableHead className="hidden md:table-cell text-right">Date d'ajout</TableHead>
                <TableHead className="w-[50px] sm:w-[80px] text-center">Supprimer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="text-center">
                    <Button asChild variant="ghost" size="icon" aria-label="Voir la recette">
                      <Link href={`/recipes/${recipe.id}`}>
                        <EyeIcon className="h-5 w-5 text-primary" />
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {recipe.name}
                    <div className="sm:hidden text-xs text-muted-foreground">{recipe.style}</div>
                    <div className="md:hidden text-xs text-muted-foreground">
                       {recipe.createdAt ? format(parseISO(recipe.createdAt), "dd MMM yy", { locale: fr }) : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{recipe.style}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    {recipe.createdAt ? format(parseISO(recipe.createdAt), "dd MMM yyyy", { locale: fr }) : 'Date inconnue'}
                  </TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Supprimer la recette">
                          <Trash2Icon className="h-5 w-5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette recette ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. La recette "{recipe.name}" sera définitivement supprimée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
