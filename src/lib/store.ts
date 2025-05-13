import type { Recipe, EquipmentState } from '@/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RecipeState {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
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
      addRecipe: (recipe) => set((state) => ({ recipes: [...state.recipes, recipe] })),
      updateRecipe: (updatedRecipe) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === updatedRecipe.id ? updatedRecipe : recipe
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
