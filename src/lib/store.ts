import type { Recipe, EquipmentState } from '@/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RecipeState {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void; // Input type adjusted
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;
  getRecipeById: (recipeId: string) => Recipe | undefined;
}

interface AppEquipmentState {
  equipment: EquipmentState;
  setEquipment: (equipment: EquipmentState) => void;
}

const initialEquipmentState: EquipmentState = {
  description: '',
};

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      addRecipe: (recipeData) => {
        const newRecipe: Recipe = {
          ...recipeData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ recipes: [...state.recipes, newRecipe] }));
      },
      updateRecipe: (updatedRecipe) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === updatedRecipe.id ? { ...recipe, ...updatedRecipe } : recipe // Ensure createdAt is preserved
          ),
        })),
      deleteRecipe: (recipeId) =>
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== recipeId),
        })),
      getRecipeById: (recipeId) => get().recipes.find(recipe => recipe.id === recipeId),
    }),
    {
      name: 'brewmate-recipes-storage', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useEquipmentStore = create<AppEquipmentState>()(
  persist(
    (set) => ({
      equipment: initialEquipmentState,
      setEquipment: (equipment) => set({ equipment }),
    }),
    {
      name: 'brewmate-equipment-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

