type Field = {
  label: string;
  value: string;
};

const BRAND = {
  navy: '#151C2F',
  navyDark: '#010614',
  gold: '#C7A975',
  grey: '#C5C6CB',
  white: '#FFFFFF',
};

const LOGO_URL = 'https://www.falconbp.com/logo.png';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function buildBrandedEmail({
  title,
  subtitle,
  fields,
  footerNote,
}: {
  title: string;
  subtitle: string;
  fields: Field[];
  footerNote?: string;
}) {
  const rows = fields
    .map(
      (field) => `
        <tr>
          <td style="padding: 12px 0; color: ${BRAND.grey}; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">
            ${escapeHtml(field.label)}
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 18px; color: ${BRAND.white}; font-size: 16px; line-height: 1.6; border-bottom: 1px solid rgba(199,169,117,0.2);">
            ${escapeHtml(field.value).replace(/\n/g, '<br />')}
          </td>
        </tr>
      `
    )
    .join('');

  return `
  <div style="margin:0;padding:0;background:${BRAND.navy};font-family:'Helvetica Neue', Arial, sans-serif;color:${BRAND.grey};">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${BRAND.navy};padding:36px 18px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:${BRAND.navyDark};border:1px solid rgba(199,169,117,0.2);border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg, rgba(199,169,117,0.14), rgba(1,6,20,0.2));">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="width:120px;">
                      <img src="${LOGO_URL}" alt="FalconBridge Partners" width="120" style="display:block;border:0;outline:none;" />
                    </td>
                    <td style="text-align:right;color:${BRAND.gold};font-size:11px;letter-spacing:0.32em;text-transform:uppercase;">
                      Confidential Intake
                    </td>
                  </tr>
                </table>
                <h1 style="margin:18px 0 6px;font-size:24px;line-height:1.3;color:${BRAND.white};font-weight:600;">
                  ${escapeHtml(title)}
                </h1>
                <p style="margin:0;color:${BRAND.grey};font-size:14px;line-height:1.6;">
                  ${escapeHtml(subtitle)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  ${rows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:${BRAND.navy};border-top:1px solid rgba(199,169,117,0.15);font-size:12px;color:${BRAND.grey};line-height:1.6;">
                ${footerNote ? escapeHtml(footerNote) : 'This request is reviewed manually and handled with discretion.'}
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;color:rgba(197,198,203,0.6);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">
            FalconBridge Partners · Decision-grade research & advisory
          </p>
        </td>
      </tr>
    </table>
  </div>
  `;
}

// ── Research pack link (sent to the reader) ──────────────────────────────────
const PACK = { charcoal: '#262626', tile: '#2e2e2e', ivory: '#F4F2EC', gold: '#C8A86A', goldPale: '#E3CE98', grey: '#B8BDC8' };

/** The email a reader receives after completing the pack form: one button, the file list, the expiry date. */
export function buildPackEmail({ name, studyTitle, link, expires, files, replyTo }: {
  name: string; studyTitle: string; link: string; expires: string; files: string[]; replyTo: string;
}) {
  const items = files.map((f) => `<tr><td style="padding:7px 0;color:${PACK.ivory};font-size:15px;line-height:1.5;border-bottom:1px solid rgba(200,168,106,0.18);">${escapeHtml(f)}</td></tr>`).join('');
  return `
  <div style="margin:0;padding:0;background:${PACK.charcoal};font-family:Arial, 'Helvetica Neue', sans-serif;color:${PACK.grey};">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${PACK.charcoal};padding:36px 18px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:${PACK.tile};border:1px solid rgba(200,168,106,0.25);border-radius:14px;overflow:hidden;">
          <tr><td style="padding:30px 34px 8px;">
            <img src="${LOGO_URL}" alt="FalconBridge Partners" width="120" style="display:block;border:0;outline:none;" />
            <h1 style="margin:26px 0 10px;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">${escapeHtml(studyTitle)}</h1>
            <p style="margin:0 0 6px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;color:${PACK.goldPale};font-size:17px;line-height:1.5;">The research pack you asked for.</p>
          </td></tr>
          <tr><td style="padding:14px 34px 6px;color:${PACK.grey};font-size:15px;line-height:1.65;">
            <p style="margin:0 0 16px;">${escapeHtml(name)}, the pack is ready. The link below opens a page with each document. It works until ${escapeHtml(expires)}.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;"><tr><td style="border-radius:999px;background:${PACK.gold};">
              <a href="${link}" style="display:inline-block;padding:13px 28px;color:${PACK.charcoal};font-size:15px;font-weight:700;text-decoration:none;">Open the research pack</a>
            </td></tr></table>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">${items}</table>
            <p style="margin:0 0 14px;">Start with the first document, the guide. It explains how the report is built, what the evidence grades mean and where to enter the report for the time you have.</p>
            <p style="margin:0 0 14px;">The findings are bounded by their scope, evidence and date. The research supports your decision. It does not make it for you.</p>
          </td></tr>
          <tr><td style="padding:18px 34px 26px;border-top:1px solid rgba(200,168,106,0.18);font-size:12px;color:${PACK.grey};line-height:1.65;">
            The pack is released under a Type-1 licence for your own use. FalconBridge Partners retains its research IP; wider circulation or publication needs our agreement.
            Questions about the study: <a href="mailto:${escapeHtml(replyTo)}" style="color:${PACK.goldPale};">${escapeHtml(replyTo)}</a>.
            If the button does not work, paste this address into your browser:<br /><span style="color:${PACK.goldPale};word-break:break-all;">${link}</span>
          </td></tr>
        </table>
        <p style="margin:18px 0 0;color:rgba(184,189,200,0.6);font-size:11px;">FalconBridge Partners FZC LLC · falconbp.com</p>
      </td></tr>
    </table>
  </div>`;
}

/**
 * The email a reader receives once, after they first download a document from a pack: thanks, the step from a
 * general study to their own decision, and the offer of a discovery call. `html` and `text` say the same thing.
 */
export function buildDownloadFollowUpEmail({ name, studyTitle, bookingUrl, replyTo }: {
  name: string; studyTitle: string; bookingUrl: string; replyTo: string;
}): { subject: string; html: string; text: string } {
  const paragraphs = [
    'Thank you for downloading the research pack. The work is substantial, and by now most readers have been through the Executive Summary and used the full report\u2019s index to find their bearings.',
    'A study answers the question that we asked; it was not written for your organisation, your market or the decision in front of you. In our experience the useful conversation starts once the findings have settled and your own questions begin to surface \u2014 usually about now, and in the days ahead.',
    'When yours do, bring them to us. A discovery call takes 20 minutes, is held in strictest confidence and carries no obligation. Its purpose: to establish what needs to be understood before your next decision.',
  ];
  const afterButton = 'If you would rather write, reply to this email. And if the study has missed something you know, tell us. We would rather be corrected than be comfortable.';
  const tagline = 'Sharper thinking when the decision stays with you.';
  const why = 'You are receiving this because you asked for this research pack on falconbp.com and agreed that we may contact you about the study. We send it once.';
  const p = 'margin:0 0 16px;';

  const html = `
  <div style="margin:0;padding:0;background:${PACK.charcoal};font-family:Arial, 'Helvetica Neue', sans-serif;color:${PACK.grey};">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${PACK.charcoal};padding:36px 18px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:${PACK.tile};border:1px solid rgba(200,168,106,0.25);border-radius:14px;overflow:hidden;">
          <tr><td style="padding:30px 34px 8px;">
            <img src="${LOGO_URL}" alt="FalconBridge Partners" width="120" style="display:block;border:0;outline:none;" />
            <h1 style="margin:26px 0 10px;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">${escapeHtml(studyTitle)}</h1>
            <p style="margin:0 0 6px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;color:${PACK.goldPale};font-size:17px;line-height:1.5;">When the reading settles, the questions surface.</p>
          </td></tr>
          <tr><td style="padding:14px 34px 6px;color:${PACK.grey};font-size:15px;line-height:1.65;">
            <p style="${p}">Dear ${escapeHtml(name)},</p>
            ${paragraphs.map((t) => `<p style="${p}">${escapeHtml(t)}</p>`).join('\n            ')}
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;"><tr><td style="border-radius:999px;background:${PACK.gold};">
              <a href="${bookingUrl}" style="display:inline-block;padding:13px 28px;color:${PACK.charcoal};font-size:15px;font-weight:700;text-decoration:none;">Book a discovery call</a>
            </td></tr></table>
            <p style="${p}">${escapeHtml(afterButton)}</p>
            <p style="margin:0 0 4px;">With kind regards,<br />FalconBridge Partners</p>
            <p style="margin:0 0 14px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;color:${PACK.goldPale};font-size:14px;">${escapeHtml(tagline)}</p>
          </td></tr>
          <tr><td style="padding:18px 34px 26px;border-top:1px solid rgba(200,168,106,0.18);font-size:12px;color:${PACK.grey};line-height:1.65;">
            ${escapeHtml(why)}
            Questions about the study: <a href="mailto:${escapeHtml(replyTo)}" style="color:${PACK.goldPale};">${escapeHtml(replyTo)}</a>.
            If the button does not work, paste this address into your browser:<br /><span style="color:${PACK.goldPale};word-break:break-all;">${bookingUrl}</span>
          </td></tr>
        </table>
        <p style="margin:18px 0 0;color:rgba(184,189,200,0.6);font-size:11px;">FalconBridge Partners FZC LLC · falconbp.com</p>
      </td></tr>
    </table>
  </div>`;

  const text = [
    `Dear ${name},`,
    ...paragraphs,
    `Book a discovery call: ${bookingUrl}`,
    afterButton,
    `With kind regards,\nFalconBridge Partners\n${tagline}`,
    `--\n${studyTitle}\n${why}\nQuestions about the study: ${replyTo}\nFalconBridge Partners FZC LLC · falconbp.com`,
  ].join('\n\n');

  return { subject: `Two days with “${studyTitle}”`, html, text };
}
