import { redirect } from 'next/navigation';

export default function RootPage() {
  // Everyone visiting the main domain lands directly on the Patient Home Care App.
  // Nurse portal (/nurse) and Admin portal (/admin) are separate, protected URLs.
  redirect('/patient');
}
