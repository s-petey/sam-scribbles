<script lang="ts">
  import SimpleSvelte from '~icons/simple-icons/svelte';
  import SimpleHtml5 from '~icons/simple-icons/html5';
  import SimpleTypescript from '~icons/simple-icons/typescript';
  import SimpleCss3 from '~icons/simple-icons/css3';
  import SimpleFigma from '~icons/simple-icons/figma';
  import SimpleAngular from '~icons/simple-icons/angular';
  import SimpleFirebase from '~icons/simple-icons/firebase';
  import SimpleDocker from '~icons/simple-icons/docker';
  import SimpleGithub from '~icons/simple-icons/github';
  import SimplePlaywright from '~icons/simple-icons/playwright';
  import SimpleReact from '~icons/simple-icons/react';
  import SimpleReactQueryIcon from '~icons/simple-icons/reactquery';
  import SimpleNode from '~icons/simple-icons/nodedotjs';
  import SimpleJava from '~icons/cib/java';
  import SimplePostgresql from '~icons/simple-icons/postgresql';
  import SimpleMysqlIcon from '~icons/simple-icons/mysql';
  import SimpleSqlite from '~icons/simple-icons/sqlite';
  import SimpleFlutter from '~icons/simple-icons/flutter';
  import SimpleIconsReactRouter from '~icons/simple-icons/reactrouter';
  import SimpleIconsSupabase from '~icons/simple-icons/supabase';

  const iconGroup = [
    {
      title: 'Favorites',
      icons: [
        SimpleTypescript,
        SimpleSvelte,
        SimpleHtml5,
        SimpleCss3,
        SimpleDocker,
        SimpleGithub,
        SimplePostgresql,
        SimpleIconsSupabase,
      ],
    },
    {
      title: 'Working with',
      icons: [
        SimpleReact,
        SimpleReactQueryIcon,
        SimpleFigma,
        SimpleFirebase,
        SimpleNode,
        SimpleIconsReactRouter,
      ],
    },
    {
      title: 'Previous flames',
      icons: [
        SimpleMysqlIcon,
        SimpleSqlite,
        SimplePlaywright,
        SimpleAngular,
        SimpleJava,
        SimpleFlutter,
      ],
    },
  ];
</script>

<svelte:head>
  <title>Sam's Scribbles - personal website</title>
  <meta name="description" content="My blog and link sharing website." />
</svelte:head>

<div class="flex flex-col gap-8">
  <section class="flex flex-col gap-2">
    <h1 class="h1 font-extrabold">Sam's Scribbles</h1>

    <p class="font-light italic">
      Sharing things I find exciting around web, programming, and more.
    </p>

    <hr class="hr border-surface-400-600" />

    <section class="flex flex-col items-stretch gap-2 text-center">
      <h3 class="h3">Tech in my stack, current or previous</h3>

      {#each iconGroup as group}
        <section class="grid grid-cols-3 items-center justify-items-center gap-2 md:grid-cols-4">
          <h3 class="h3 col-span-3 font-bold md:col-span-4">{group.title}</h3>
          {#each group.icons as Icon}
            <Icon aria-hidden="true" class="text-primary-800-200 text-[2em]" />
          {/each}
        </section>
      {/each}
    </section>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="h2 font-bold">The medium description</h2>

    <p class="text-sm font-light">
      My blog and link sharing website. The link sharing is intended to be a source of all of the
      interesting articles or things I discover on the web to pin, archive, mark for reading later,
      group and categorize, share with friends, and make the most of.
    </p>
  </section>
</div>

<section
  class="justify-center gap-2 text-justify text-[500%] font-semibold text-amber-300 perspective-[350px]"
>
  <div class="position-relative translate-z-[-100px] rotate-x-[25deg] transform">
    <h3 class="h3 text-center text-[90%] font-bold uppercase">The long description</h3>

    <p class="text-sm font-light">
      The vision of this website is to be my one stop shop to reference all the fun sources of
      information or things I find interesting. This could be articles, blog posts, videos,
      podcasts, or anything else, as long as there is a link or something that can be written about
      it.
    </p>

    <hr class="hr border-surface-400-600" />

    <h4 class="h4">Link sharing</h4>
    <p class="text-sm font-light">
      A place where I can keep track of all the links I'd like to read, pin, archive, or share with
      others. It is intended to be shared and linkable and written about. The future here is that I
      may write my own take on the information shared within the link and have a blog post related
      to it. Grouping is intended to enhance the likelihood of discovery for myself and others of
      this content.
    </p>

    <hr class="hr border-surface-400-600" />

    <h4 class="h4">Blogging</h4>
    <p class="text-sm font-light">
      A place to write about things I'm passionate about. For those that care to read it I hope you
      find some nuggets of inspiration. I'm not writing for any thing specifically, but to better
      understand things myself and to share the findings I have with others. This information is
      meant to be my understanding and may not be always <i>100% correct</i>.
    </p>
  </div>
</section>
