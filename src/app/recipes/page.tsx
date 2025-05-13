
'use client';

import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { useRecipeStore } from '@/lib/store';
import Link from 'next/link';
import { PlusCircleIcon, FilterIcon, BeerIcon } from 'lucide-react'; // Added BeerIcon
import { useEffect, useState } from 'react';
import type { Recipe } from '@/types';

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const storeRecipes = useRecipeStore((state) => state.recipes);

  useEffect(() => {
    setRecipes(storeRecipes);
  }, [storeRecipes]);


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
        <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

