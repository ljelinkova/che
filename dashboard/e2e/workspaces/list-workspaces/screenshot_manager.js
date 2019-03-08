"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mkdirp_1 = require("mkdirp");
const protractor_1 = require("protractor");
const fs_1 = require("fs");
const logger = require("../list-workspaces/logging");
const runner = require("../list-workspaces/script_runner");
const timeouts = require("../list-workspaces/timeouts");
class ScreenshotManager {
    constructor(path = 'target/screenshots') {
        this.testCounter = 0;
        this.screenshotCounter = 1;
        this.path = path;
        mkdirp_1.sync(path);
    }
    async save(name = 'screenshot') {
        try {
            await this.writeScreenshot(this.path + '/' + this.getFormattedCounters() + '-' + name + '.png');
            await this.writePageSource(this.path + '/' + this.getFormattedCounters() + '-' + name + '.html');
            await this.writeBrowserLog(this.path + '/' + this.getFormattedCounters() + '-' + name + '.log');
            await this.writeNetworkLog(this.path + '/' + this.getFormattedCounters() + '-' + name + '.perf.log');
        }
        catch (e) {
            logger.error('Saving screenshot, page or browser logs failed with error: ' + e);
            await this.desktopScreenshot(this.path + '/' + this.getFormattedCounters() + '-' + name + '-desktop.png');
        }
        finally {
            this.screenshotCounter++;
        }
    }
    async saveUnformatted(name = 'screenshot') {
        await this.writeScreenshot(this.path + '/' + name + '.png');
        await this.writePageSource(this.path + '/' + name + '.html');
        await this.writeBrowserLog(this.path + '/' + name + '.log');
    }
    nextTest() {
        this.testCounter++;
        this.screenshotCounter = 1;
    }
    getFormattedCounters() {
        return this.formatCounter(this.testCounter) + '-' + this.formatCounter(this.screenshotCounter);
    }
    formatCounter(counter) {
        return counter.toString().padStart(2, '0');
    }
    async writeScreenshot(filename) {
        return Promise.race([this.writeScreenshotPromise(filename), this.createTimeoutPromise()]);
    }
    async writeScreenshotPromise(filename) {
        logger.debug('Saving screenshot');
        let png = await protractor_1.browser.takeScreenshot();
        let stream = fs_1.createWriteStream(filename);
        stream.write(new Buffer(png, 'base64'));
        stream.end();
        logger.debug(`Saved screenshot to: ${filename}`);
    }
    async writePageSource(filename) {
        return Promise.race([this.writePageSourcePromise(filename), this.createTimeoutPromise()]);
    }
    async writePageSourcePromise(filename) {
        logger.debug('Saving page source');
        let txt = await protractor_1.browser.getPageSource();
        let stream = fs_1.createWriteStream(filename);
        stream.write(new Buffer(txt));
        stream.end();
        logger.debug(`Saved page source to: ${filename}`);
    }
    async writeBrowserLog(filename) {
        return Promise.race([this.writeBrowserLogPromise(filename), this.createTimeoutPromise()]);
    }
    async writeNetworkLog(filename) {
        return Promise.race([this.writeNetworkLogPromise(filename), this.createTimeoutPromise()]);
    }
    async writeBrowserLogPromise(filename) {
        logger.debug('Saving browser logs');
        let logs = await protractor_1.browser.manage().logs().get('browser');
        let stream = fs_1.createWriteStream(filename);
        logs.forEach((entry) => {
            let message = this.hideTokens(entry.message);
            const template = `[${logger.formatTimestamp(entry.timestamp)}] ${entry.level.name} ${message}`;
            if (entry.level.value >= protractor_1.logging.Level.WARNING.value) {
                logger.debug(template);
            }
            stream.write(template + '\n');
        });
        stream.end();
        logger.debug(`Saved browser logs to: ${filename}`);
    }
    async writeNetworkLogPromise(filename) {
        logger.debug('Saving network logs');
        let logs = await protractor_1.browser.manage().logs().get('performance');
        let stream = fs_1.createWriteStream(filename);
        logs.forEach((entry) => {
            let formattedMessage = this.getFormattedMessage(entry);
            if (formattedMessage !== undefined) {
                stream.write(formattedMessage + '\n');
            }
        });
        stream.end();
        logger.debug(`Saved network logs to: ${filename}`);
    }
    getFormattedMessage(entry) {
        let message = JSON.parse(entry.message).message;
        let formattedMessage = `[${logger.formatTimestamp(entry.timestamp)}]   req_id:${message.params.requestId}   `;
        switch (message.method) {
            case 'Network.requestWillBeSent': {
                let url = this.hideTokens(message.params.request.url);
                formattedMessage += `[REQUEST]    ${message.params.request.method}   ${url}`;
                break;
            }
            case 'Network.responseReceived': {
                let response = message.params.response;
                let url = this.hideTokens(response.url);
                formattedMessage += `[RESPONSE]   ${response.status}   ${response.statusText}   ${url}`;
                if (response.status >= 400) {
                    if (response.requestHeaders && response.requestHeaders.Authorization) {
                        response.requestHeaders.Authorization = response.requestHeaders.Authorization.replace(/(Bearer ).+/i, '$1 <hidden>');
                    }
                    formattedMessage += `\nrequest headers:\n${JSON.stringify(response.requestHeaders, null, 2)}`;
                    formattedMessage += `\nresponse headers:\n${JSON.stringify(response.headers, null, 2)}`;
                }
                break;
            }
            case 'Network.webSocketCreated': {
                let url = this.hideTokens(message.params.url);
                formattedMessage += `[WEBSOCKET_CREATED]    ${url}`;
                break;
            }
            case 'Network.webSocketFrameSent': {
                formattedMessage += `[WEBSOCKET_REQUEST]    ${message.params.response.payloadData}`;
                break;
            }
            case 'Network.webSocketFrameReceived': {
                formattedMessage += `[WEBSOCKET_RESPONSE]   ${message.params.response.payloadData}`;
                break;
            }
            default: return undefined;
        }
        return formattedMessage;
    }
    async desktopScreenshot(fileName) {
        try {
            logger.debug(`Save desktop screenshot`);
            await runner.runScript('.', // working directory
            './take-screenshot.sh', // script
            [fileName], // params
            `./target/screenshots/desktopScreenshot.txt`, // output file
            false, timeouts.LONGER_WAIT);
            logger.debug(`Save desktop screenshot saved`);
        }
        catch (e) {
            logger.error('Save desktop screenshot failed with error: ' + e);
        }
    }
    createTimeoutPromise() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(`Saving resources exited after timeout of ${timeouts.DEFAULT_WAIT / 1000}s`);
            }, timeouts.DEFAULT_WAIT);
        });
    }
    // hide JWT tokens in URL parameters
    hideTokens(input) {
        return input.replace(/([?&_])(token[a-zA-Z0-9_]*=)[a-zA-Z0-9\._\-%]+/g, '$1$2<hidden>');
    }
}
exports.screenshotManager = new ScreenshotManager();
//# sourceMappingURL=screenshot_manager.js.map