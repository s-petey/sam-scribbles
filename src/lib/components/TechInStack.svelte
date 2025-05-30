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

<section class="flex flex-col items-stretch gap-2 text-center">
  <h3 class="h3">Tech in my stack, current or previous</h3>

  {#each iconGroup as group (group.title)}
    <section class="grid grid-cols-3 items-center justify-items-center gap-2 md:grid-cols-4">
      <h3 class="h3 col-span-3 font-bold md:col-span-4">{group.title}</h3>

      {#each group.icons as Icon, idx (idx)}
        <Icon aria-hidden="true" class="text-primary-800-200 text-[2em]" />
      {/each}
    </section>
  {/each}
</section>
