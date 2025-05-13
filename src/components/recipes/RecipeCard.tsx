"use client";
import type { Recipe } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BeerIcon, Trash2Icon } from 'lucide-react';
import { useRecipeStore } from '@/lib/store';
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
} from "@/components/ui/alert-dialog"

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    e.preventDefault();
    deleteRecipe(recipe.id);
  };

  return (
    <Link href={`/recipes/${recipe.id}`} passHref legacyBehavior>
      <a className="block hover:no-underline">
        <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                  <BeerIcon className="h-6 w-6" />
                  {recipe.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">{recipe.style}</CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={(e) => e.stopPropagation()} 
                  // Prevent triggering Link navigation when clicking the trigger
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()} /* Prevent closing dialog on click outside if it also triggers link */>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera définitivement votre recette.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Volume:</strong> {recipe.volume} L</p>
              {recipe.initialGravity && <p><strong>DI:</strong> {recipe.initialGravity.toFixed(3)}</p>}
              {recipe.finalGravity && <p><strong>DF:</strong> {recipe.finalGravity.toFixed(3)}</p>}
              {recipe.alcoholABV && <p><strong>ABV:</strong> {recipe.alcoholABV.toFixed(1)}%</p>}
              {recipe.bitternessIBU && <p><strong>IBU:</strong> {recipe.bitternessIBU}</p>}
              {recipe.colorEBC && <p><strong>EBC:</strong> {recipe.colorEBC}</p>}
            </div>
            {recipe.notes && <p className="mt-2 text-sm italic text-muted-foreground truncate">Notes: {recipe.notes}</p>}
          </CardContent>
          <CardFooter>
            {/* Footer can be used for quick actions or tags in the future */}
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
