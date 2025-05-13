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
import { useToast } from '@/hooks/use-toast';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent) => {
    // Stop propagation to prevent the Link navigation or other unwanted parent handlers.
    e.stopPropagation();
    e.preventDefault(); 
    deleteRecipe(recipe.id);
    toast({
      title: "Recette supprimée",
      description: `La recette "${recipe.name}" a été supprimée.`,
      variant: "destructive",
    });
  };

  return (
    <Link href={`/recipes/${recipe.id}`} passHref legacyBehavior>
      <a className="block hover:no-underline">
        <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col h-full">
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10" 
                    onClick={(e) => {
                      // Prevent Link navigation when clicking the trigger for the dialog.
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    aria-label="Supprimer la recette"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent 
                  onClick={(e) => {
                    // Prevent Link navigation if clicking on the dialog overlay.
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera définitivement votre recette.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Volume:</strong> {recipe.volume} L</p>
              {recipe.initialGravity && <p><strong>DI:</strong> {recipe.initialGravity.toFixed(3)}</p>}
              {recipe.finalGravity && <p><strong>DF:</strong> {recipe.finalGravity.toFixed(3)}</p>}
              {recipe.alcoholABV && <p><strong>ABV:</strong> {recipe.alcoholABV.toFixed(1)}%</p>}
              {recipe.bitternessIBU && <p><strong>IBU:</strong> {recipe.bitternessIBU}</p>}
              {recipe.colorEBC && <p><strong>EBC:</strong> {recipe.colorEBC}</p>}
            </div>
            {recipe.notes && <p className="mt-2 text-sm italic text-muted-foreground line-clamp-2">Notes: {recipe.notes}</p>}
          </CardContent>
          <CardFooter>
            {/* Footer can be used for quick actions or tags in the future */}
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
