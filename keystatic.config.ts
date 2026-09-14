import { config, fields, collection } from '@keystatic/core';

const hasGitHubCreds = Boolean(
  process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
    process.env.KEYSTATIC_SECRET,
);

export const TERRITORIES = [
  { label: 'UAE / GCC', value: 'uae-gcc' },
  { label: 'South Africa', value: 'south-africa' },
  { label: 'New Zealand', value: 'new-zealand' },
  { label: 'Mauritius', value: 'mauritius' },
  { label: 'North Carolina', value: 'north-carolina' },
  { label: 'Singapore', value: 'singapore' },
] as const;

export const SERVICES = [
  { label: 'CEaaS · Critical Evaluation', value: 'ceaas' },
  { label: 'RaaS · Research', value: 'raas' },
  { label: 'CaaS · Coaching', value: 'caas' },
  { label: 'EMaaS · Execution Modelling', value: 'emaas' },
  { label: 'AaaS · Advisory', value: 'aaas' },
  { label: 'None / general', value: 'none' },
] as const;

export default config({
  storage: hasGitHubCreds
    ? { kind: 'github', repo: 'falconbridgepartners-maker/falconbridgepartners' }
    : { kind: 'local' },
  ui: {
    brand: { name: 'FalconBridge Research' },
    navigation: {
      Research: ['scans', 'studies'],
    },
  },
  collections: {
    scans: collection({
      label: 'Weekly Scan',
      slugField: 'title',
      path: 'content/scans/*',
      format: { contentField: 'body' },
      entryLayout: 'form',
      schema: {
        title: fields.slug({
          name: { label: 'Title (internal — becomes the URL)', validation: { length: { min: 1, max: 120 } } },
        }),
        territory: fields.select({ label: 'Territory', options: [...TERRITORIES], defaultValue: 'uae-gcc' }),
        service: fields.select({ label: 'Closest service', options: [...SERVICES], defaultValue: 'none' }),
        weekOf: fields.date({ label: 'Week of', defaultValue: { kind: 'today' } }),
        signal: fields.text({
          label: 'The signal',
          description: 'What the weekly scan identified. One or two sentences. Firm voice ("Our research finds…").',
          multiline: true,
          validation: { length: { min: 1, max: 600 } },
        }),
        question: fields.text({
          label: 'The question it raises',
          description: 'A decision-relevant question a leader in this territory would recognise.',
          multiline: true,
          validation: { length: { min: 1, max: 400 } },
        }),
        finding: fields.text({
          label: 'What the evidence establishes',
          description: 'Findings only — sources, dates and scope. No interpretation here.',
          multiline: true,
        }),
        interpretation: fields.text({
          label: 'FBP’s interpretation',
          description: 'Kept visibly separate from the finding. What it may mean for a decision-maker.',
          multiline: true,
        }),
        openQuestions: fields.array(fields.text({ label: 'Open question' }), {
          label: 'What remains open',
          itemLabel: (p) => p.value,
        }),
        reviewed: fields.checkbox({
          label: 'Reviewed by a partner (internal — never shown publicly)',
          description: 'Required before publishing. AI-assisted, human-in-control.',
          defaultValue: false,
        }),
        sample: fields.checkbox({ label: 'Sample entry (prototype placeholder)', defaultValue: false }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Drafts are hidden from the Weekly Scan index, the RSS feed and the sitemap.',
          defaultValue: true,
        }),
        body: fields.mdx({ label: 'Further notes (optional)' }),
      },
    }),
    studies: collection({
      label: 'Public studies',
      slugField: 'title',
      path: 'content/studies/*',
      format: { contentField: 'body' },
      entryLayout: 'form',
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { length: { min: 1, max: 160 } } } }),
        subtitle: fields.text({ label: 'Subtitle', multiline: true }),
        territory: fields.select({ label: 'Territory', options: [...TERRITORIES], defaultValue: 'south-africa' }),
        publishedAt: fields.date({ label: 'Published', defaultValue: { kind: 'today' } }),
        facts: fields.array(
          fields.object({
            figure: fields.text({ label: 'Figure (e.g. 196 pages)' }),
            body: fields.text({ label: 'What it means', multiline: true }),
          }),
          { label: 'Key facts', itemLabel: (p) => p.fields.figure.value },
        ),
        extractNote: fields.text({ label: 'Extract note', multiline: true }),
        qualifier: fields.text({ label: 'Qualifier', description: 'What this sample does and does not demonstrate.', multiline: true }),
        extractImage: fields.image({
          label: 'Extract image (optional)',
          directory: 'public/research/studies',
          publicPath: '/research/studies/',
        }),
        files: fields.array(
          fields.object({
            label: fields.text({ label: 'Element (e.g. Executive summary)' }),
            url: fields.text({ label: 'Download URL (leave blank if requested via form)' }),
          }),
          { label: 'Package files', itemLabel: (p) => p.fields.label.value },
        ),
        draft: fields.checkbox({ label: 'Draft', defaultValue: true }),
        body: fields.mdx({ label: 'About the study' }),
      },
    }),
  },
});
