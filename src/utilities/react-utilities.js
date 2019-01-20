const asyncSetState = function(stateObj) {
    return new Promise(resolve => {
        this.setState(stateObj, resolve);
    });
};

module.exports = { asyncSetState };