/*
 node-jvm
 Copyright (c) 2013 Yaroslav Gaponov <yaroslav.gaponov@gmail.com>
*/

var util = require("util");
var Object = require("./Object.js");
var Frame = require("./../../frame.js");

var STATE = {
    NEW: "NEW",
    RUNNABLE: "RUNNABLE",
    BLOCKED: "BLOCKED",
    WAITING: "WAITING",
    TIMED_WAITING: "TIMED_WAITING",
    TERMINATED: "TERMINATED"
};

var Thread = module.exports = function() {
    if (this instanceof Thread) {
        this._instance = null;
        this._state = STATE.NEW;
    } else {
        return new Thread();
    }
}

util.inherits(String, Object);


Thread.getClassName = function() {
    return "java/lang/Thread";
}
 
Thread.prototype["<init>"] = function(instance) {
    this._instance = instance;
    this._state = STATE.NEW;
    this._join = false;
    return this;
}

Thread.prototype["join"] = function() {
    this._join = true;
    process.JVM.Threads++;
}

Thread.prototype["start"] = function() {
    var self = this;
    this._state = STATE.RUNNABLE;
    if (this._instance["run"] instanceof Frame) {
        this._instance["run"].run([this._instance], function() {
            self._state = STATE.TERMINATED;
            if (self._join) {
                process.JVM.Threads--;
            }
        });
    } else {
        self._instance["run"]();
        self._state = STATE.TERMINATED;
        if (self._join) {
            process.JVM.Threads--;
        }
    }
};

