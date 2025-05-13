"use client";

import type { Control, FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import type { Recipe, HopFormat, YeastType } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2Icon, PlusCircleIcon } from "lucide-react";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";


interface FieldArrayProps<TField extends { id: string }> {
  control: Control<Recipe>;
  name: `grains` | `hops`; // Extend this if Yeast becomes an array
  fields: TField[];
  append: UseFieldArrayAppend<Recipe, any>;
  remove: UseFieldArrayRemove;
  errors: FieldErrors<Recipe>;
  renderFields: (field: TField, index: number, control: Control<Recipe>, errors: FieldErrors<Recipe>) => React.ReactNode;
  title: string;
  addItemText: string;
}

function DynamicFieldArray<TField extends { id: string }>({
  control,
  name,
  fields,
  append,
  remove,
  errors,
  renderFields,
  title,
  addItemText,
}: FieldArrayProps<TField>) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md bg-background/50 relative">
              {renderFields(field, index, control, errors)}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                onClick={() => remove(index)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => append({ id: crypto.randomUUID(), name: '', weight: 0, ...(name === 'hops' && { format: 'Pellets', alphaAcid: 0 }) })}
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" /> {addItemText}
        </Button>
      </CardContent>
    </Card>
  );
}

export const GrainFields: React.FC<Omit<FieldArrayProps<Recipe['grains'][number]>, 'renderFields' | 'title' | 'addItemText'>> = (props) => (
  <DynamicFieldArray
    {...props}
    name="grains"
    title="Céréales et Sucres"
    addItemText="Ajouter Céréale/Sucre"
    renderFields={(field, index, control, errors) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`grains.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Malt Pale Ale" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`grains.${index}.weight`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poids (g)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} placeholder="Ex: 5000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    )}
  />
);


const hopFormats: HopFormat[] = ['Pellets', 'Cones', 'Extract', 'Other'];

export const HopFields: React.FC<Omit<FieldArrayProps<Recipe['hops'][number]>, 'renderFields' | 'title' | 'addItemText'>> = (props) => (
  <DynamicFieldArray
    {...props}
    name="hops"
    title="Houblons"
    addItemText="Ajouter Houblon"
    renderFields={(field, index, control, errors) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField
          control={control}
          name={`hops.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Citra" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`hops.${index}.weight`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poids (g)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} placeholder="Ex: 100" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`hops.${index}.format`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hopFormats.map(format => <SelectItem key={format} value={format}>{format}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`hops.${index}.alphaAcid`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>% Acide Alpha</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} placeholder="Ex: 5.5" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    )}
  />
);


const yeastTypes: YeastType[] = ['Ale', 'Lager', 'Wild', 'Other'];

export const YeastFields: React.FC<{ control: Control<Recipe>, errors: FieldErrors<Recipe> }> = ({ control, errors }) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-xl">Levure</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="yeast.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: SafAle US-05" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="yeast.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {yeastTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="yeast.weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poids (g) / Quantité</FormLabel>
              <FormControl>
                <Input {...field} type="number" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} placeholder="Ex: 11.5" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </CardContent>
  </Card>
);
