'use client';

import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { useRecipeStore } from '@/lib/store';
import Link from 'next/link';
import { PlusCircleIcon, FilterIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MyRecipesPage() {
  // Zustand state needs to be accessed in useEffect for SSR/hydration safety
  const [recipes, setRecipes] = useState<ReturnType<typeof useRecipeStore.getState>['recipes']>([]);
  const storeRecipes = useRecipeStore((state) => state.recipes);

  useEffect(() => {
    setRecipes(storeRecipes);
  }, [storeRecipes]);


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Mes recettes</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button asChild>
            <Link href="/recipes/new">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Créer une recette
            </Link>
          </Button>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">Aucune recette pour le moment.</p>
          <p className="text-muted-foreground">Commencez par en créer une nouvelle !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
