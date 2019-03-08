"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seconds = (n) => n * 1000;
exports.minutes = (n) => n * exports.seconds(60);
exports.DEFAULT_WAIT_PAGE_LOAD = exports.seconds(10);
exports.DEFAULT_WAIT = exports.seconds(60);
exports.LONG_WAIT = exports.minutes(1);
exports.LONGER_WAIT = exports.minutes(10);
exports.LONGEST_WAIT = exports.minutes(30);
//# sourceMappingURL=timeouts.js.map