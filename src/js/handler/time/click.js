/**
 * @fileoverview Allday event click event hander module
 */
'use strict';

var util = require('tui-code-snippet');
var config = require('../../config');
var domutil = require('../../common/domutil');

/**
 * @constructor
 * @implements {Handler}
 * @mixes util.CustomEvents
 * @param {Drag} [dragHandler] - Drag handler instance.
 * @param {TimeGrid} [timeGridView] - TimeGrid view instance.
 * @param {Base} [baseController] - Base controller instance.
 */
function TimeClick(dragHandler, timeGridView, baseController) {
    /**
     * @type {Drag}
     */
    this.dragHandler = dragHandler;

    /**
     * @type {TimeGrid}
     */
    this.timeGridView = timeGridView;

    /**
     * @type {Base}
     */
    this.baseController = baseController;

    dragHandler.on({
        'click': this._onClick,
        'contextmenu': this._onContextMenu
    }, this);
}

/**
 * Destroy method
 */
TimeClick.prototype.destroy = function() {
    this.dragHandler.off(this);
    this.timeGridView = this.baseController = this.dragHandler = null;
};

/**
 * Check target element is expected condition for activate this plugins.
 * @param {HTMLElement} target - The element to check
 * @returns {string} - model id
 */
TimeClick.prototype.checkExpectCondition = function(target) {
    var container,
        matches;

    container = domutil.closest(target, config.classname('.time-date'));

    if (!container) {
        return false;
    }

    matches = domutil.getClass(container).match(config.time.getViewIDRegExp);

    if (!matches || matches.length < 2) {
        return false;
    }

    return util.pick(this.timeGridView.children.items, Number(matches[1]));
};

/**
 * Click event hander
 * @param {object} clickEvent - click event from {@link Drag}
 * @emits TimeClick#clickEvent
 */
TimeClick.prototype._onClick = function(clickEvent) {
    var self = this,
        target = clickEvent.target,
        timeView = this.checkExpectCondition(target),
        blockElement = domutil.closest(target, config.classname('.time-date-schedule-block')),
        schedulesCollection = this.baseController.schedules;

    if (!timeView || !blockElement) {
        return;
    }

    schedulesCollection.doWhenHas(domutil.getData(blockElement, 'id'), function(schedule) {
        /**
         * @events TimeClick#clickSchedule
         * @type {object}
         * @property {Schedule} schedule - schedule instance
         * @property {MouseEvent} event - MouseEvent object
         */
        self.fire('clickSchedule', {
            schedule: schedule,
            event: clickEvent.originEvent
        });
    });
};

/**
 * Contextmenu event hander
 * @param {object} contextmenuEvent - click event from {@link Drag}
 * @emits TimeClick#ContextMenu
 */
TimeClick.prototype._onContextMenu = function(contextmenuEvent) {
    var self = this,
        target = contextmenuEvent.target,
        timeView = this.checkExpectCondition(target),
        blockElement = domutil.closest(target, config.classname('.time-date-schedule-block')),
        schedulesCollection = this.baseController.schedules;

    if (!timeView || !blockElement) {
        return;
    }

    schedulesCollection.doWhenHas(domutil.getData(blockElement, 'id'), function(schedule) {
        /**
         * @events TimeClick#clickSchedule
         * @type {object}
         * @property {Schedule} schedule - schedule instance
         * @property {MouseEvent} event - MouseEvent object
         */
        self.fire('contextmenuSchedule', {
            schedule: schedule,
            event: contextmenuEvent.originEvent
        });
    });
};

util.CustomEvents.mixin(TimeClick);

module.exports = TimeClick;
