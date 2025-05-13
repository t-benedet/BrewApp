"use client";
import type { Recipe } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BeerIcon, EditIcon, Trash2Icon } from 'lucide-react';
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

  const handleDelete = () => {
    deleteRecipe(recipe.id);
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <BeerIcon className="h-6 w-6" />
              {recipe.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground">{recipe.style}</CardDescription>
          </div>
          <div className="flex gap-2">
             {/* Link to an edit page if it exists, for now placeholder */}
            {/* <Button variant="ghost" size="icon" asChild>
              <Link href={`/recipes/edit/${recipe.id}`}> 
                <EditIcon className="h-4 w-4" />
              </Link>
            </Button> */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
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
        {recipe.notes && <p className="mt-2 text-sm italic text-muted-foreground">Notes: {recipe.notes}</p>}
      </CardContent>
      <CardFooter>
        {/* Placeholder for a "View Details" button if needed */}
        {/* <Button variant="outline" asChild>
          <Link href={`/recipes/${recipe.id}`}>Voir les détails</Link>
        </Button> */}
      </CardFooter>
    </Card>
  );
}
