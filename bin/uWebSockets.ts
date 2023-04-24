#!/usr/bin/env node
import { join } from 'path';
import { program } from 'commander';

const runServer = program
     .command('run <file_name>')
     .description('Start uWebSockets server using provided file.');
runServer
     .action(async (file: string, options) => {
          if (file.split('.').length < 2)
               console.log(`Please provide a file name or path. Provided ${file}.`);
          else if (!['js', 'ts'].filter((ext) => file.endsWith(`.${ext}`)).length)
               console.log(`You must provide a 'js or ts' extension file. Provided ${file}.`);
          else
               console.log(file, options);
     });

program.parse(process.argv);