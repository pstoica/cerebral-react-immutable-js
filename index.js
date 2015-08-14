var cerebral = require('cerebral');
var React = require('react');
var Immutable = require('immutable');
var EventEmitter = require('fbemitter').EventEmitter;
var ReactUtils = require('./reactUtils');

var Factory = function (state, defaultArgs) {
  var eventEmitter = new EventEmitter();
  var initialState = Immutable.fromJS(state);
  state = initialState;

  var controller = cerebral.Controller({
    defaultArgs: defaultArgs,

    onReset: function () {
      state = initialState;
    },

    onGetRecordingState: function () {
      debugger;
      return state;
    },

    onError: function (error) {
      eventEmitter.emit('error', error);
    },

    onUpdate: function () {
      eventEmitter.emit('change', state);
    },

    onRemember: function () {
      eventEmitter.emit('remember', state);
    },

    onSeek: function (seek, isPlaying, currentRecording) {
      state = initialState.merge(recording.initialState);
      eventEmitter.emit('change', state);
    },

    onGet: function (path) {
      return state.getIn(path);
    },

    onSet: function (path, value) {
      state = state.setIn(path, value);
    },

    onUnset: function (path, key) {
      state = state.removeIn(path.concat(key));
    },

    onPush: function (path, value) {
      state = state.updateIn(path, function (list) {
        return list.push(value);
      });
    },

    onSplice: function (path) {
      var spliceArgs = Array.prototype.slice.call(arguments, 1);

      state = state.updateIn(path, function (list) {
        return list.splice.apply(list, spliceArgs);
      });
    },

    onMerge: function (path, value) {
      state = state.mergeIn(path, value);
    },

    onConcat: function (path, value) {
      var concatArgs = Array.prototype.slice.call(arguments, 1);

      state = state.updateIn(path, function (list) {
        return list.concat.apply(list, concatArgs);
      });
    },

    onPop: function (path) {
      state = state.updateIn(path, function (list) {
        return list.pop(list);
      });
    },

    onShift: function (path) {
      state = state.updateIn(path, function (list) {
        return list.shift();
      });
    },

    onUnshift: function () {
      state = state.updateIn(path, function (list) {
        return list.unshift.apply(list, arguments);
      });
    }
  });

  controller.injectInto = function (AppComponent) {
    return React.createElement(React.createClass({
      displayName: 'CerebralContainer',

      childContextTypes: {
        controller: React.PropTypes.object.isRequired
      },

      getChildContext: function () {
        return {
          controller: controller
        }
      },

      render: function () {
        return React.createElement(AppComponent);
      }
    }));
  };

  controller.eventEmitter = eventEmitter;

  return controller;
};

Factory.Mixin = ReactUtils.Mixin;
Factory.Decorator = ReactUtils.Decorator;
Factory.HOC = ReactUtils.HOC;

module.exports = Factory;
