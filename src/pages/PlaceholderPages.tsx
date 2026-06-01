import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Construction className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}

export function MedicalRecordsPage() {
  return (
    <PlaceholderPage
      title="Dosjet Mjekësore"
      description="Qasja dhe menaxhimi i dosjeve mjekësore të pacientëve në mënyrë të sigurt. Shikoni diagnozat, recetat dhe historikun e trajtimit."
    />
  );
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Cilësimet"
      description="Konfiguro cilësimet e sistemit, preferencat dhe informatat e poliklinikës. Menaxho rolet dhe lejet."
    />
  );
}
