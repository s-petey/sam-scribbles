/**
 * A generated module for Dagger functions
 *
 * This module has been generated via dagger init and serves as a reference to
 * basic module structure as you get started with Dagger.
 *
 * Two functions have been pre-created. You can modify, delete, or add to them,
 * as needed. They demonstrate usage of arguments and return types using simple
 * echo and grep commands. The functions can be called from the dagger CLI or
 * from one of the SDKs.
 *
 * The first line in this comment block is a short description line and the
 * rest is a long description with more detail on the module's purpose or usage,
 * if appropriate. All modules should have a short description.
 */
import type { Container, Directory } from '@dagger.io/dagger';
import { argument, dag, func, object } from '@dagger.io/dagger';

@object()
export class Dagger {
  // container: Container;

  // constructor(
  //   @argument({ defaultPath: '/', ignore: ['dagger', '**.md'] })
  //   source: Directory,
  // ) {
  //   this.container = dag
  //     .container()
  //     .from('oven/bun:latest')
  //     .withMountedDirectory('/src', source)
  //     .withWorkdir('/src')
  //     .withExec(['bun', 'install']);
  // }

  // @func()
  // async lint() {
  //   return await this.container.withExec(['bun', 'run', 'lint']).stdout();
  // }

  // @func()
  // async check() {
  //   return await this.container.withExec(['bun', 'run', 'check']).stdout();
  // }

  // @func()
  // async test() {
  //   return await this.container.withExec(['bun', 'run', 'test']).stdout();
  // }

  /**
   * Return the result of running unit tests
   */
  @func()
  async test(@argument({ defaultPath: '/' }) source: Directory): Promise<string> {
    return await this.buildEnv(source).withExec(['bun', 'run', 'test']).stdout();
  }

  /**
   * Build a ready-to-use development environment
   */
  @func()
  buildEnv(@argument({ defaultPath: '/' }) source: Directory): Container {
    // const nodeCache = dag.cacheVolume('node');
    // const playwrightCache = dag.cacheVolume('playwright');
    const bunCache = dag.cacheVolume('bun-cache');
    return (
      dag
        .container()
        // .from('node:lts')
        .from('mcr.microsoft.com/playwright:v1.54.1-noble')
        .withDirectory('/src', source)
        .withEnvVariable('CI', 'true')
        // .withExec(['apt-get', 'update'])
        // .withExec(['apt-get', 'install', '-y', 'xvfb'])
        // .withExec(['Xvfb :99 -screen 1280x1024x24 & export DISPLAY=:99'])
        // .withMountedCache('/root/.npm', nodeCache)
        .withWorkdir('/src')
        .withExec(['npm', 'install', '-g', 'bun'])
        // .withExec(['bunx', 'playwright', 'install', '--with-deps'])
        // .withMountedCache('/root/.cache/ms-playwright', playwrightCache)
        .withExec(['bun', 'install'])
        .withMountedCache('/root/.bun/install/cache', bunCache)
    );
  }

  /**
   * Returns a container that echoes whatever string argument is provided
   */
  @func()
  containerEcho(stringArg: string): Container {
    return dag.container().from('alpine:latest').withExec(['echo', stringArg]);
  }

  /**
   * Returns lines that match a pattern in the files of the provided Directory
   */
  @func()
  async grepDir(directoryArg: Directory, pattern: string): Promise<string> {
    return dag
      .container()
      .from('alpine:latest')
      .withMountedDirectory('/mnt', directoryArg)
      .withWorkdir('/mnt')
      .withExec(['grep', '-R', pattern, '.'])
      .stdout();
  }
}
