import { PageHead } from '@/components/admin/ui';
import WeeklyImport from '@/components/admin/WeeklyImport';
import { loadImportScreen } from '@/lib/admin/importActions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
// Copying a territory's pack from Dropbox into storage can take longer than the default function window.
export const maxDuration = 60;

const NOTES: Record<string, string> = {
  connected: 'Dropbox is connected.',
  declined: 'Dropbox access was declined. Nothing was connected.',
  state: 'The Dropbox reply could not be matched to this browser. Start the connection again.',
  failed: 'Dropbox did not complete the connection. Check the app key, secret and redirect address, then try again.',
  'not-configured': 'Add DROPBOX_APP_KEY and DROPBOX_APP_SECRET in Vercel and redeploy before connecting.',
};

export default async function ImportPage({ searchParams }: { searchParams?: { dropbox?: string } }) {
  const screen = await loadImportScreen();
  const note = searchParams?.dropbox ? NOTES[searchParams.dropbox] : undefined;
  return (
    <>
      <PageHead title="Weekly import" sub="Bring a week’s scan entries, studies and pack files in from Dropbox." />
      {note && <p className="tile-ivory p-3 text-sm mb-6" role="status">{note}</p>}
      <WeeklyImport screen={screen} />
    </>
  );
}
