#!/usr/bin/env node

import * as yargs from 'yargs';

yargs
  .commandDir('cmds')
  .help()
  .demandCommand()
  .argv
