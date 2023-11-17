import fs from 'fs-extra';
import chalk from 'chalk';
import prompt from 'prompt-sync';
import wildcard from 'wildcard';

function isOnIgnoreList(ignoreList, file) {
    let matched = false;
    ignoreList.forEach(ignoreEntry => {
        const result = wildcard(ignoreEntry, file);
        if(result) {
            matched = true;
        }
    });
    return matched;
}

function getCropList(ignoreList, parent, fileList, cropList) {
    fileList.forEach(fileEntry => {
        const fullPath = `${parent}${parent == ''? '' : '/'}${fileEntry}`;
        if(isOnIgnoreList(ignoreList, fileEntry)) {
            cropList.push(fullPath);
        } else {
            if(fs.lstatSync(fullPath).isDirectory()) {
                const newFileList = fs.readdirSync(fullPath);
                cropList = getCropList(ignoreList, fullPath, newFileList, cropList);
            }
        }
    });
    return cropList;
}

function crop(cropList) {
    cropList.forEach(fileEntry => {
        console.log(`Deleting ${fileEntry}\x1b[1M\x1bM`);
        fs.rmSync(fileEntry);
        console.log(`Deleted ${fileEntry} `);
    })
}

function getIgnoreList() {
    var ignoreList = [];
    var ignoreFile = fs.readFileSync(`.gitignore`, 'utf-8');
    const ignoreLines = ignoreFile.split(/\r?\n/);
    ignoreLines.forEach(ignoreLine => {
        if((ignoreLine.trim() != '') && (!ignoreLine.startsWith('#'))) {
            ignoreList.push(ignoreLine);
        }
    });
    return ignoreList;
}

export default function gitcrop(dryRun, quiet) {
    const ignoreList = getIgnoreList();
    const fileList = fs.readdirSync('.');
    const cropList = getCropList(ignoreList, '', fileList, []);
    if(cropList.length === 0) {
        if(!quiet) {
            console.info(chalk.yellow(`No files to crop`));
        }
        process.exit(0);
    }
    if(!quiet) {
        console.log(`Files to crop:`);
        cropList.forEach(fileEntry => {
            console.log(` ${fileEntry}`);
        });
        if(!dryRun) {
            var del = '';
            while(!((del === 'y') || (del === 'n'))) {
                var del = prompt()(`Crop (Y/n)?`, `Y`).toLowerCase();
            }
            if(del === 'y') {
                crop(cropList);
            }
        }
    } else {
        if(!dryRun) {
            crop(cropList);
        }
    }
}