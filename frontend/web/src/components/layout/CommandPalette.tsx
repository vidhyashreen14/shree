import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
<<<<<<< HEAD
} from "@/components/ui/command";
import { patients, doctors, medicines } from "@/lib/mock/data";
import { useAuth } from "@/lib/store/auth";
import { NAV } from "./nav-config";
import { Users, Stethoscope, Pill, Compass } from "lucide-react";
=======
} from '@/components/ui/command';
import { patients, doctors, medicines } from '@/lib/mock/data';
import { useAuth } from '@/lib/store/auth';
import { NAV } from './nav-config';
import { Users, Stethoscope, Pill, Compass } from 'lucide-react';
>>>>>>> a821a0c (second update)

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
<<<<<<< HEAD
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
=======
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
>>>>>>> a821a0c (second update)
        e.preventDefault();
        onOpenChange(!open);
      }
    };
<<<<<<< HEAD
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
=======
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
>>>>>>> a821a0c (second update)
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search patients, doctors, medicines, pages…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {user && (
          <CommandGroup heading="Navigation">
            {NAV[user.role].map((n) => (
              <CommandItem key={n.to} onSelect={() => go(n.to)}>
                <Compass className="mr-2 h-4 w-4" />
                {n.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />
        <CommandGroup heading="Patients">
          {patients.slice(0, 6).map((p) => (
            <CommandItem key={p.id} onSelect={() => go(`/doctor/patients/${p.id}`)}>
              <Users className="mr-2 h-4 w-4" />
              {p.name} <span className="ml-auto text-xs text-muted-foreground">{p.mrn}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Doctors">
          {doctors.slice(0, 5).map((d) => (
<<<<<<< HEAD
            <CommandItem key={d.id} onSelect={() => go("/admin/doctors")}>
=======
            <CommandItem key={d.id} onSelect={() => go('/admin/doctors')}>
>>>>>>> a821a0c (second update)
              <Stethoscope className="mr-2 h-4 w-4" />
              {d.name}
              <span className="ml-auto text-xs text-muted-foreground">{d.department}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Medicines">
<<<<<<< HEAD
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {medicines.slice(0, 5).map((m: any) => (
            <CommandItem key={m.id} onSelect={() => go("/pharmacy/inventory")}>
=======
          {medicines.slice(0, 5).map((m: { id: string; name: string; stock: number }) => (
            <CommandItem key={m.id} onSelect={() => go('/pharmacy/inventory')}>
>>>>>>> a821a0c (second update)
              <Pill className="mr-2 h-4 w-4" />
              {m.name}
              <span className="ml-auto text-xs text-muted-foreground">{m.stock} in stock</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
