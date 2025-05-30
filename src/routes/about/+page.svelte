<script lang="ts">
  import TechInStack from '$lib/components/TechInStack.svelte';
</script>

<!-- TODO: Finish this (moving from my previous site) -->
<svelte:head>
  <title>Sam's Scribbles - About</title>
  <meta name="description" content="About Sam Peterson, a full stack developer." />
</svelte:head>

<h2 class="h2 text-center">Who is Sam Peterson?</h2>
<div class="card preset-filled-surface-200-800 p-4">
  <h3 class="h3">A Full stack developer</h3>
  <p class="text-base">
    I've been learning web development since 2013 where things looked a lot different than they do
    today. I've worked in a number of industries from internal admin and HR sites, global digital
    signage, financial operations, and canteen or kitchen apps.
  </p>
  <p class="text-base">
    I have a pass to always learn and a want to enjoy or share any information I gain with others.
    I'm a member of several meetup groups which help me learn and share information with others. If
    you'd like to collaborate on a project, contact me!
  </p>
</div>

<TechInStack />

<h2 class="h2">What is Sam's Scribbles</h2>
<div class="flex flex-col gap-8">
  <section class="flex flex-col gap-2">
    <p class="font-light italic">
      A place where I can share things I find exciting around web, programming, and more.
    </p>

    <hr class="hr border-surface-400-600" />
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
  class="justify-center gap-2 bg-gray-800/50 text-justify text-2xl font-semibold text-amber-300 perspective-[350px] md:text-8xl"
>
  <div class="position-relative translate-z-[-100px] rotate-x-[25deg] transform">
    <h3 class="h3 text-primary-600-400 text-center text-[90%] font-bold uppercase">
      The long description
    </h3>

    <p class="text-sm font-light">
      The vision of this website is to be my one stop shop to reference all the fun sources of
      information or things I find interesting. This could be articles, blog posts, videos,
      podcasts, or anything else, as long as there is a link or something that can be written about
      it.
    </p>

    <hr class="hr border-surface-400-600" />

    <h4 class="h4 text-primary-600-400">Link sharing</h4>
    <p class="text-sm font-light">
      A place where I can keep track of all the links I'd like to read, pin, archive, or share with
      others. It is intended to be shared and linkable and written about. The future here is that I
      may write my own take on the information shared within the link and have a blog post related
      to it. Grouping is intended to enhance the likelihood of discovery for myself and others of
      this content.
    </p>

    <hr class="hr border-surface-400-600" />

    <h4 class="h4 text-primary-600-400">Blogging</h4>
    <p class="text-sm font-light">
      A place to write about things I'm passionate about. For those that care to read it I hope you
      find some nuggets of inspiration. I'm not writing for any thing specifically, but to better
      understand things myself and to share the findings I have with others. This information is
      meant to be my understanding and may not be always <i>100% correct</i>.
    </p>
  </div>
</section>
