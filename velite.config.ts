import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { defineCollection, defineConfig, s } from 'velite';
import rehypePrettyCode from 'rehype-pretty-code';

// const slugify = (input: string) =>
//   input
//     .toLowerCase()
//     .replace(/\s+/g, '-')
//     .replace(/[^a-z0-9-]/g, '');

const execAsync = promisify(exec);

// refer to https://velite.js.org/guide/last-modified#based-on-git-timestamp for more details
const timestamp = () =>
  s
    .custom<string | undefined>((i) => i === undefined || typeof i === 'string')
    .transform<string>(async (value, { meta, addIssue }) => {
      if (value != null) {
        addIssue({
          fatal: false,
          code: 'custom',
          message: '`s.timestamp()` schema will resolve the value from `git log -1 --format=%cd`',
        });
      }
      const { stdout } = await execAsync(`git log -1 --format=%cd ${meta.path}`);
      return new Date(stdout || Date.now()).toISOString();
    });
const meta = s
  .object({
    title: s.string().optional(),
    description: s.string().optional(),
    keywords: s.array(s.string()).optional(),
  })
  .default({});

// TODO: Update schema...

const posts = defineCollection({
  name: 'Post',
  pattern: ['posts/**/*.md', 'posts/**/*.svx', 'posts/*.md', 'posts/*.svx'],
  schema: s
    .object({
      title: s.string().max(99),
      slug: s.slug('post'),
      date: s.isodate(),
      updated: timestamp(),
      cover: s.image().optional(),
      video: s.file().optional(),
      description: s.string().max(999).optional(),
      draft: s.boolean().default(false),
      featured: s.boolean().default(false),
      categories: s.array(s.string()).default(['Journal']),
      tags: s.array(s.string()).default([]),
      meta: meta,
      toc: s.toc(),
      metadata: s.metadata(),
      excerpt: s.excerpt(),
      content: s.markdown(),
    })
    .transform((data) => ({
      ...data,
      // TODO: Verify link...
      permalink: `/blog/${data.slug}`,
    })),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: {
    //  options, categories, tags, pages,
    posts,
  },
  markdown: { rehypePlugins: [rehypePrettyCode] },
  // prepare: ({
  //   // categories, tags,
  //   posts,
  // }) => {
  //   const docs = posts.filter((i) => process.env.NODE_ENV !== 'production' || !i.draft);

  // missing categories, tags from posts or courses inlined
  // const categoriesFromDoc = Array.from(new Set(docs.flatMap((i) => i.categories))).filter(
  //   (i) => categories.find((j) => j.name === i) == null,
  // );
  // categories.push(
  //   ...categoriesFromDoc.map((name) => ({
  //     name,
  //     slug: slugify(name),
  //     permalink: '',
  //     count: { total: 0, posts: 0 },
  //   })),
  // );
  // for (const category of categories) {
  //   category.count.posts = posts.filter((j) => j.categories.includes(category.name)).length;
  //   category.count.total = category.count.posts;
  //   category.permalink = `/${category.slug}`;
  // }

  // const tagsFromDoc = Array.from(new Set(docs.flatMap((i) => i.tags))).filter(
  //   (i) => tags.find((j) => j.name === i) == null,
  // );
  // tags.push(
  //   ...tagsFromDoc.map((name) => ({
  //     name,
  //     slug: slugify(name),
  //     permalink: '',
  //     count: { total: 0, posts: 0 },
  //   })),
  // );
  // for (const tag of tags) {
  //   tag.count.posts = posts.filter((j) => j.tags.includes(tag.name)).length;
  //   tag.count.total = tag.count.posts;
  //   tag.permalink = `/${tag.slug}`;
  // }

  // push extra data to collections, it's ok!! but they are not type-safed
  // Object.assign(collections, {
  //   anything: { name: 'Anything', data: { name: 'Anything' } },
  //   list: ['one', 'two', 'three']
  // })

  // return false // return false to prevent velite from writing data to disk
  // },
});
