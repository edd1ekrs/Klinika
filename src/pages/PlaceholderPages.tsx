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

export function PaymentsPage() {
  return (
    <PlaceholderPage
      title="Payments"
      description="Payment processing and billing management will be available here. Track transactions, generate invoices, and manage insurance claims."
    />
  );
}

export function MedicalRecordsPage() {
  return (
    <PlaceholderPage
      title="Medical Records"
      description="Access and manage patient medical records securely. View diagnoses, prescriptions, and treatment history."
    />
  );
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Configure system settings, user preferences, and clinic information. Manage roles and permissions."
    />
  );
}
