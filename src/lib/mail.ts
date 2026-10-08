import 'server-only';

/**
 * Who the site's emails come from.
 *
 * The domain is the one verified in Resend (read from RESEND_FROM). The mailbox and the display name are the
 * site's own. Supabase sends the admin sign-in emails from the address in RESEND_FROM, and a mail app remembers
 * a name against an address: while the site shared that address, a reader's mail app could show the site's
 * emails under the other name. So the site sends from addresses of its own.
 */
const FALLBACK_ADDRESS = 'noreply@notifications.falconbp.com';
type Kind = 'research' | 'website';
const NAME: Record<Kind, string> = { research: 'FB Research', website: 'FalconBridge Website' };

function configuredAddress(): string {
  const raw = process.env.RESEND_FROM || '';
  const address = (/<([^>]+)>/.exec(raw)?.[1] ?? raw).trim();
  return /^[^@\s]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(address) ? address.toLowerCase() : FALLBACK_ADDRESS;
}

/** research@… for emails to readers about research; website@… for notices to the firm about the site. */
export const siteSender = (kind: Kind) => `${NAME[kind]} <${kind}@${configuredAddress().split('@')[1]}>`;
/** The same name on the address in RESEND_FROM: used only if the site's own address is refused. */
const sharedSender = (kind: Kind) => `${NAME[kind]} <${configuredAddress()}>`;

/** Where a reader books a discovery call. DISCOVERY_CALL_URL overrides the default. */
export const discoveryCallUrl = () => {
  const url = (process.env.DISCOVERY_CALL_URL || '').trim();
  return /^https:\/\/[^\s"<>]+$/.test(url) ? url : 'https://calendly.com/falconbp/discovery';
};

/** Where pack requests are reported, and where a reader's reply goes. */
export const leadsAddress = () => process.env.RESEND_LEADS_EMAIL || 'info@falconbp.com';

/**
 * Sends from the site's own address. If the mail service refuses that address, the email still goes, from the
 * address in RESEND_FROM, and the refusal is logged: a reader waiting for a pack is never left without it.
 */
export async function sendFromSite<T extends { error: unknown }>(kind: Kind, send: (from: string) => Promise<T>): Promise<T> {
  const first = await send(siteSender(kind));
  if (!first.error) return first;
  console.error(`[mail] ${siteSender(kind)} was refused; sending from ${configuredAddress()} instead.`, first.error);
  return send(sharedSender(kind));
}
