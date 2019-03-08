"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("../list-workspaces/logging");
const timeouts = require("../list-workspaces/timeouts");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const mkdirp_1 = require("mkdirp");
const path_1 = require("path");
async function runScript(baseDir, name, params, outputFile, outputToConsole = true, timeout = timeouts.DEFAULT_WAIT) {
    let runScriptPromise = new Promise((resolve, reject) => {
        logger.info(`Running script \"${name} > ${outputFile}\" from directory ${baseDir}`);
        mkdirp_1.sync(path_1.dirname(outputFile));
        const script = child_process_1.spawn(name, params, { cwd: baseDir });
        const stream = fs_1.createWriteStream(outputFile);
        script.on('exit', function (code) {
            stream.end();
            if (code !== 0) {
                logger.info(`Script \"${name} > ${outputFile}\" exited with code ${code}`);
                reject(`Script \"${name} > ${outputFile}\" exited with non zero value ${code}`);
            }
            else {
                logger.info('Script finished');
                resolve();
            }
        });
        script.stdout.on('data', (data) => {
            if (outputToConsole) {
                logger.script(data);
            }
            stream.write(new Buffer(data));
        });
        script.stderr.on('data', (data) => {
            // check if data contains some non-whitespace characters
            if (/\S/.test(data)) {
                logger.error(data);
                stream.write(new Buffer(data));
            }
        });
    });
    let timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(`Script \"${name} > ${outputFile}\" exited after timeout of ${timeout / 1000}s`);
        }, timeout);
    });
    return Promise.race([runScriptPromise, timeoutPromise]);
}
exports.runScript = runScript;
//# sourceMappingURL=script_runner.js.map