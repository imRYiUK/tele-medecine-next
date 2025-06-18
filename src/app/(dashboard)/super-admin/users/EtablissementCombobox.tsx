"use client";
import { useEffect, useState } from "react";
import { etablissementsService, Etablissement } from "@/lib/services/etablissements.service";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function EtablissementCombobox({ value, onChange, disabled }: {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [etabs, setEtabs] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    etablissementsService.getAll().then((data) => setEtabs(data)).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? etabs.filter(e => e.nom.toLowerCase().includes(search.toLowerCase()))
    : etabs;

  const selected = etabs.find(e => e.etablissementID === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selected ? selected.nom : "Sélectionner un établissement"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput
            placeholder="Rechercher un établissement..."
            value={search}
            onValueChange={setSearch}
            disabled={loading}
          />
          <CommandList>
            {loading ? (
              <CommandItem disabled>Chargement...</CommandItem>
            ) : (
              <>
                <CommandEmpty>Aucun établissement</CommandEmpty>
                <CommandGroup>
                  {filtered.map((etab) => (
                    <CommandItem
                      key={etab.etablissementID}
                      value={etab.etablissementID}
                      onSelect={() => {
                        onChange(etab.etablissementID);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === etab.etablissementID ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {etab.nom}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 