<script lang="ts">
  import Dices from 'lucide-svelte/icons/dices';
  import Footprints from 'lucide-svelte/icons/footprints';
  import Globe from 'lucide-svelte/icons/globe';
</script>

<!-- TODO: Finish this (moving from my previous site) -->

<h1 class="h1">About</h1>

<p>🚧 WIP 🚧 -- please come back later!</p>

<div class="p-4">
  <h2 class="h2">Hello there, I'm Sam</h2>
  <h3 class="h3">Full stack developer</h3>
</div>

<hr />

<section class="flex flex-col gap-8">
  <div class="flex flex-col gap-4 p-4">
    <h2 class="h2 text-center">Who is Sam Peterson?</h2>

    <div class="flex flex-col gap-4">
      <p class="mx-auto w-full md:w-3/4">
        Hello there, my name is Sam and I'm a full stack web developer with a passion for front end
        development. I've been learning web development since 2013 where things looked a lot
        different than they do today. I aspire to always work with something that brings me joy and
        have a hand in making a better web experience through beautiful software and engaging web
        experiences. My other passions are playing video or board games, listening to audio books,
        cycling, playing and going on hikes with my dog, and traveling to some of the most beautiful
        places on earth.
      </p>

      <div
        class="logo-cloud [&>.logo-item]:variant-filled-secondary mx-auto grid w-1/2 grid-cols-3 gap-4 md:w-3/4"
      >
        <div class="logo-item flex flex-col">
          <Dices />
          Games
        </div>
        <div class="logo-item flex flex-col">
          <Footprints />
          Dog
        </div>

        <div class="flex flex-col">
          <!-- <a class="logo-item btn flex flex-col" href="/travel"> -->
          <Globe />
          Travel
          <!-- </a> -->
        </div>
      </div>
    </div>
  </div>
</section>
