'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEquipmentStore } from '@/lib/store';
import { useEffect } from 'react';
import { SaveIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


const equipmentFormSchema = z.object({
  description: z.string().min(10, "Veuillez décrire votre équipement plus en détail (min. 10 caractères)."),
});

type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

export default function EquipmentPage() {
  const { equipment, setEquipment } = useEquipmentStore();
  const { toast } = useToast();

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      description: '',
    },
  });

  useEffect(() => {
    if (equipment.description) {
      form.setValue('description', equipment.description);
    }
  }, [equipment, form]);

  function onSubmit(data: EquipmentFormData) {
    setEquipment(data);
    toast({
      title: "Équipement sauvegardé!",
      description: "La description de votre équipement a été mise à jour.",
    });
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Mon Équipement de Brassage</CardTitle>
          <CardDescription>Décrivez votre équipement. Ces informations peuvent être utilisées par l'IA pour générer des recettes adaptées.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description de l'équipement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Cuve de brassage 30L, fermenteur inox, moulin à malt, refroidisseur à plaques..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:w-auto">
                <SaveIcon className="mr-2 h-4 w-4" />
                Sauvegarder la description
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
