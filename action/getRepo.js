require('dotenv').config();
const TOKEN = process.env.TOKEN;
const fs = require('fs');
const path = require('path');
const request = require('superagent');
const admzip = require('adm-zip');
const { Octokit } = require('@octokit/rest');
// const { createTokenAuth } = require('@octokit/auth-token');
// const auth = createTokenAuth(TOKEN);
// const token = auth().then(res => res);

const client = TOKEN ? new Octokit({
    auth: TOKEN
}) : new Octokit();

const config = {
    REPO: {
        outputPath: process.env.OUTPUT_DIR,
        repo: process.env.REPOSITORY,
        branch: process.env.BRANCH,
    },
    OPTIONS: {
        state: 'open',
        sort: 'created',
        archive_format: 'zipball'
    }
}

//for downloading the repo
const download = async (outPath, data) => {
    await data.forEach(async config => {
        const file = path.resolve(outPath, `${config.owner}-${config.repo}.zip`);
        try {
            const Archive = await client.repos.getArchiveLink(config);
            request
                .get(Archive.url)
                .on('error', function (err) {
                    console.log(err)
                })
                .pipe(fs.createWriteStream(file))
                .on('finish', function () {
                    extract({
                        zipFile: file,
                        extractEntryTo: outPath,
                        outputDir: outPath,
                        owner: config.owner
                    })
                })
        } catch (err) {
            throw err;
        } finally {
            console.log(`${config.owner}'s repo has been downloaded.`);
        }
    })
}

const parse = url => {
    const path = new URL(url).pathname.split('/');
    return {
        owner: path[1],
        folder: path[2],
    }
}
//for extracting the archive
const extract = (config) => {
    var zip = new admzip(config.zipFile);
    zip.extractAllTo(config.outputDir, false)
    console.log(`${config.owner}'s archive has been extracted. . .`);
}

//deleting archives
// const clearArchives = (path) => {
//     fs.readdir(`${path}`, (err, files) => {
//         let archives = files.filter(ar => /\.zip$/.test(ar)).forEach(ar => {
//             fs.unlink(`${path}/${ar}`, err => {
//                 if (err) throw err;
//                 console.log(`${ar} was deleted`);
//             });
//         });
//     });
// }

//running the function
(async function(config){
    const { REPO, OPTIONS } = config;
    try {
        const RData = parse(REPO.repo);
        const PRList = await client.pulls.list({
            owner: RData.owner,
            repo: RData.folder,
            state: OPTIONS.state,
            sort: OPTIONS.sort
        });
        // console.log(PRList)
        const ARList = PRList.data.map(pr => {
            // console.log(pr.head.repo.name)
            return {
                owner: pr.user.login,
                repo: pr.head.repo.name,
                archive_format: OPTIONS.archive_format,
                ref: REPO.branch
            }
        })
        await download(REPO.outputPath, ARList)
    } catch (e) {
        throw e;
    } 
})(config).catch(er => console.log(er))