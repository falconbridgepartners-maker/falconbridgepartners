import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'falconbridgepartners-maker/falconbridgepartners',
  },
  ui: {
    brand: { name: 'FalconBridge Insights' },
    navigation: {
      Content: ['insights'],
    },
  },
  collections: {
    insights: collection({
      label: 'Insights',
      slugField: 'title',
      path: 'content/insights/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            validation: { length: { min: 1, max: 120 } },
          },
        }),
        summary: fields.text({
          label: 'Summary',
          description: 'One or two sentences shown on the index and in social cards.',
          multiline: true,
          validation: { length: { min: 1, max: 300 } },
        }),
        publishedAt: fields.date({
          label: 'Published',
          defaultValue: { kind: 'today' },
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Drafts are hidden from the /insights index, the RSS feed, and the sitemap.',
          defaultValue: true,
        }),
        ogImage: fields.image({
          label: 'Social image (recommended 1200x630)',
          directory: 'public/insights/og',
          publicPath: '/insights/og/',
        }),
        body: fields.mdx({
          label: 'Body',
          options: {
            image: {
              directory: 'public/insights/images',
              publicPath: '/insights/images/',
            },
          },
        }),
      },
    }),
  },
});
