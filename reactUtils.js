var React = require('react');

exports.Mixin = {
  contextTypes: {
    controller: React.PropTypes.object
  },

  componentWillMount: function () {
    var controller = this.context.controller;
    this.signals = controller.signals;
    this.recorder = controller.recorder;
    this.get = controller.get;
    this._onChangeListener = controller.eventEmitter.addListener('change', this._update);
    this._onRememberListener = controller.eventEmitter.addListener('remember', this._update);
    this._update(controller.get([]));
  },

  componentWillUnmount: function () {
    this._isUmounting = true;
    this._onChangeListener.remove();
    this._onRememberListener.remove();
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    var propKeys = Object.keys(nextProps);
    var stateKeys = Object.keys(nextState);

    // props
    if (this.props !== nextProps) {
      return true;
    }

    for (var x = 0; x < propKeys.length; x++) {
      var key = propKeys[x];
      if (!Immutable.is(this.props[key], nextProps[key])) {
        return true;
      }
    }

    // State
    if (this.state !== nextState) {
      return true;
    }

    for (var x = 0; x < stateKeys.length; x++) {
      var key = stateKeys[x];
      if (!Immutable.is(this.state[key], nextProps[key])) {
        return true;
      }
    }

    return false;
  },

  _update: function (state) {
    if (this._isUmounting || !this.getStatePaths) {
      return;
    }

    var statePaths = this.getStatePaths();
    var newState = Object.keys(statePaths).reduce(function (newState, key) {
      newState[key] = state.getIn(statePaths[key]);
      return newState;
    }, {});

    this.setState(newState);
  }
};

var Render = function (Component) {
  return function () {
    var state = this.state || {};
    var props = this.props || {};

    var propsToPass = Object.keys(state).reduce(function (props, key) {
      props[key] = state[key];
      return props;
    }, {});

    propsToPass = Object.keys(props).reduce(function (propsToPass, key) {
      propsToPass[key] = props[key];
      return propsToPass;
    }, propsToPass);

    propsToPass.signals = this.signals;
    propsToPass.recorder = this.recorder;
    propsToPass.get = this.get;

    return React.createElement(Component, propsToPass);
  };
};

exports.Decorator = function (paths) {
  return function (Component) {
    return React.createClass({
      displayName: Component.name + 'Container',

      mixins: [exports.Mixin],

      getStatePaths: function () {
        return paths || {};
      },

      render: Render(Component)
    });
  };
};

exports.HOC = function (Component, paths) {
  return React.createClass({
    displayName: Component.name + 'Container',

    mixins: [exports.Mixin],

    getStatePaths: function () {
      return paths || {};
    },

    render: Render(Component)
  });
};

