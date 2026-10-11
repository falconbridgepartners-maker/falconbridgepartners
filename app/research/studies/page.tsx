import { permanentRedirect } from 'next/navigation';

/** The library is the studies index; this address only ever pointed there. */
export default function StudiesIndex() { permanentRedirect('/research/library'); }
