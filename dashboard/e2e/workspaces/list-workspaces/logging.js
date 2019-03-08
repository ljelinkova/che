"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
function error(...msg) {
    // tslint:disable-next-line:no-console
    console.error(chalk.red(...msg));
}
exports.error = error;
function specTitle(...msg) {
    // tslint:disable-next-line:no-console
    console.info(chalk.green(' ---------- ') + chalk.green(...msg) + chalk.green(' ---------- '));
}
exports.specTitle = specTitle;
function info(...msg) {
    // tslint:disable-next-line:no-console
    console.info(`[${formatTimestamp()}]`, ...msg);
}
exports.info = info;
exports.debug = process.env.DEBUG ? debugEnabled : debugNoop;
function script(...msg) {
    exports.debug(chalk.dim(msg));
}
exports.script = script;
function debugEnabled(...msg) {
    // tslint:disable-next-line:no-console
    console.log(`[${formatTimestamp()}]`, '   ', ...msg);
}
function debugNoop(...msg) { }
function formatTimestamp(value) {
    let date = value ? new Date(value) : new Date();
    let time = date.toLocaleTimeString('en-US', { hour12: false });
    let ms = (date.getMilliseconds() + 1000).toString().substr(1);
    return `${time}.${ms}`;
}
exports.formatTimestamp = formatTimestamp;
//# sourceMappingURL=logging.js.map