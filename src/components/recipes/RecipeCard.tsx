"use client";
import type { Recipe } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BeerIcon, Trash2Icon, EyeIcon } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import React from 'react';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const { toast } = useToast();

  const handleDelete = () => {
    deleteRecipe(recipe.id);
    toast({
      title: "Recette supprimée",
      description: `La recette "${recipe.name}" a été supprimée.`,
      variant: "destructive",
    });
  };

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const targetElement = e.target as HTMLElement;
    // If the clicked element or its parent has 'data-noclick-navigate', prevent link navigation
    if (targetElement.closest('[data-noclick-navigate="true"]')) {
      e.preventDefault();
    }
  };

  return (
    <Link href={`/recipes/${recipe.id}`} passHref legacyBehavior>
      <a className="block hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg" onClick={handleCardClick}>
        <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full rounded-lg overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2 truncate">
                  <BeerIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                  <span className="truncate" title={recipe.name}>{recipe.name}</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm truncate" title={recipe.style}>{recipe.style}</CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    data-noclick-navigate="true"
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                    aria-label="Supprimer la recette"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-noclick-navigate="true">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette recette ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. La recette "{recipe.name}" sera définitivement supprimée.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-noclick-navigate="true">Annuler</AlertDialogCancel>
                    <AlertDialogAction data-noclick-navigate="true" onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="flex-grow pt-2 pb-4 px-4 sm:px-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm">
              <div><strong>Volume:</strong> {recipe.volume} L</div>
              {recipe.initialGravity && <div><strong>DI:</strong> {recipe.initialGravity.toFixed(3)}</div>}
              {recipe.finalGravity && <div><strong>DF:</strong> {recipe.finalGravity.toFixed(3)}</div>}
              {recipe.alcoholABV && <div><strong>ABV:</strong> {recipe.alcoholABV.toFixed(1)}%</div>}
              {recipe.bitternessIBU && <div><strong>IBU:</strong> {recipe.bitternessIBU}</div>}
              {recipe.colorEBC && <div><strong>EBC:</strong> {recipe.colorEBC}</div>}
            </div>
            {recipe.notes && <p className="mt-2 text-xs sm:text-sm italic text-muted-foreground line-clamp-2">Notes: {recipe.notes}</p>}
          </CardContent>
          <CardFooter className="p-3 sm:p-4 border-t bg-muted/30">
             {/* This button should allow navigation via the parent Link, so no data-noclick-navigate */}
             <Button variant="outline" size="sm" className="w-full text-accent hover:text-accent-foreground hover:bg-accent/20">
                <EyeIcon className="mr-2 h-4 w-4" />
                Voir les détails
            </Button>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}