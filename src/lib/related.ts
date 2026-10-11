import { getPublishedPieces, getPublishedReports, getPublishedScans, territoryName, TERRITORIES, type Piece, type Report, type Scan } from '@/lib/data';
import { getSitePartners, type PartnerView } from '@/lib/partners';

/**
 * The connections between the research pages: what else a reader of one signal, study or piece can reach from it.
 * Every public research page links sideways (same territory, same week, neighbouring weeks) as well as up and down,
 * so no page sits on its own and a search engine sees the whole body of work.
 */

export const territoryPath = (territory: string) => `/research/territories/${territory}`;
export const territoryLabel = (territory: string) => territoryName[territory] ?? territory;
export const isTerritory = (key: string) => TERRITORIES.some((t) => t.value === key);

export type TerritoryHub = { territory: string; name: string; scans: Scan[]; reports: Report[]; pieces: Piece[]; partners: PartnerView[] };

/** Everything published for one territory, newest first. */
export async function getTerritoryHub(territory: string): Promise<TerritoryHub | null> {
  if (!isTerritory(territory)) return null;
  const [scans, allReports, pieces, partners] = await Promise.all([getPublishedScans(territory), getPublishedReports(), getPublishedPieces(territory), getSitePartners()]);
  const reports = allReports.filter((r) => r.territory === territory).sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''));
  return { territory, name: territoryLabel(territory), scans, reports, pieces, partners: partners.filter((p) => p.territories.includes(territory)) };
}

/** The signal before and after this one in its territory, by week. */
export function neighbourScans(inTerritory: Scan[], current: Scan): { earlier: Scan | null; later: Scan | null } {
  const sorted = [...inTerritory].sort((a, b) => a.week_of.localeCompare(b.week_of));
  const i = sorted.findIndex((s) => s.id === current.id);
  return { earlier: i > 0 ? sorted[i - 1] : null, later: i >= 0 && i < sorted.length - 1 ? sorted[i + 1] : null };
}

/** The other territories' signals for the same week. */
export function sameWeekScans(all: Scan[], current: Scan): Scan[] {
  if (!current.week_label) return [];
  return all.filter((s) => s.id !== current.id && s.week_label === current.week_label && !s.sample);
}

/** Other studies in the same territory, newest first. */
export function otherStudies(all: Report[], current: Report, limit = 3): Report[] {
  return all.filter((r) => r.id !== current.id && r.territory === current.territory).sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? '')).slice(0, limit);
}

/** Other pieces, the same territory first, newest first. */
export function otherPieces(all: Piece[], current: Piece, limit = 3): Piece[] {
  const rest = all.filter((p) => p.id !== current.id);
  const same = rest.filter((p) => p.territory === current.territory);
  const others = rest.filter((p) => p.territory !== current.territory);
  return [...same, ...others].slice(0, limit);
}

/** The title a signal is listed under: the lead topic as issued, or the question for the older form. */
export const scanTitle = (s: Scan) => s.content?.lead?.title ?? s.question;
