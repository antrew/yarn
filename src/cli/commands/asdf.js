/* @flow */

import commands from './index.js';
import * as constants from '../../constants.js';
import type {Reporter} from '../../reporters/index.js';
import type Config from '../../config.js';
import {sortAlpha, sortOptionsByFlags, hyphenate} from '../../util/misc.js';
import aliases from '../aliases';
import Lockfile from "../../lockfile"
import {Install, wrapLifecycle} from "./install"
import {Add} from "./add"
import {MessageError} from "../../errors"
const chalk = require('chalk');

export function hasWrapper(flags: Object, args: Array<string>): boolean {
  return false;
}

export function setFlags(commander: Object) {
  commander.description('Displays transitive upgrades information.');
}

class UpgradeTransitive extends Install {
  constructor(args: Array<string>, flags: Object, config: Config, reporter: Reporter, lockfile: Lockfile) {
    const workspaceRootIsCwd = config.cwd === config.lockfileFolder;
    const _flags = flags ? {...flags, workspaceRootIsCwd} : {workspaceRootIsCwd};
    super(_flags, config, reporter, lockfile);
    this.args = args;
    // only one flag is supported, so we can figure out which one was passed to `yarn add`
    this.flagToOrigin = [
      flags.dev && 'devDependencies',
      flags.optional && 'optionalDependencies',
      flags.peer && 'peerDependencies',
      'dependencies',
    ]
      .filter(Boolean)
      .shift();
  }

  async init(): Promise<Array<string>> {
    const isWorkspaceRoot = this.config.workspaceRootFolder && this.config.cwd === this.config.workspaceRootFolder;

    // running "yarn add something" in a workspace root is often a mistake
    if (isWorkspaceRoot && !this.flags.ignoreWorkspaceRootCheck) {
      throw new MessageError(this.reporter.lang('workspacesAddRootCheck'));
    }

    this.addedPatterns = [];
    const patterns = await Install.prototype.init.call(this);
    // await this.maybeOutputSaveTree(patterns);
    return patterns;
  }

}


export async function run(config: Config, reporter: Reporter, flags: Object, args: Array<string>): Promise<void> {
  console.log('helllllllo worlllllld!')

  const lockfile = await Lockfile.fromDirectory(config.lockfileFolder, reporter);

  // console.log(lockfile);

  console.log(Object.keys(lockfile.cache['wrappy@1']))

  // FIXME remove matching entries from the lockfile
  delete lockfile.cache['wrappy@1']

  await wrapLifecycle(config, flags, async () => {
    // FIXME parameters
    const install = new UpgradeTransitive(args, flags, config, reporter, lockfile);
    await install.init();
  });
}
