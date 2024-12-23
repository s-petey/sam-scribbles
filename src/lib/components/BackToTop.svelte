<script lang="ts">
  let showScrollButton = $state(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  function handleScroll() {
    const currentScrollTop = window.scrollY;
    showScrollButton = currentScrollTop > 0;
  }
</script>

<svelte:window onscroll={handleScroll} />

<button
  onclick={scrollToTop}
  class="back-to-top-button btn z-10 preset-filled-surface-500"
  class:show-button={showScrollButton}
  class:hide-button={!showScrollButton}
  aria-label="Back to top"
>
  Back to top
</button>

<style>
  @keyframes flyIn {
    0% {
      transform: translateY(75px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes flyOut {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(75px);
      opacity: 0;
    }
  }

  .back-to-top-button {
    position: fixed;
    right: 1rem;
    bottom: -1rem;
    transition: bottom 0.3s ease-in-out;
  }

  .show-button {
    bottom: 3.75rem;
    animation: flyIn 0.3s ease forwards;
  }

  @media (min-width: 1024px) {
    /* Tailwind's 'lg' breakpoint */
    .show-button {
      bottom: 1rem;
    }
  }

  .hide-button {
    animation: flyOut 0.3s ease forwards;
  }
</style>
