window.game = window.game || {};

(function () {

    /**
     * A spin button, dispatches a signal when clicked
     * @class game.SpinButton
     * @param {object} states The graphical states for the button
     * @constructor
     */
    var SpinButton = function (states) {
        PIXI.Sprite.call(this, states.up.texture);

        // Create the signals
        this.clickSignal = new signals.Signal();
        this.anchor.x = this.anchor.y = 0.5;

        // Set up the button
        this._states = states;
        this.interactive = true;
        this.alpha = states.up.alpha;

        var onUpStateChange = this._onStateChange.bind(this, "up");
        var onDownStateChange = this._onStateChange.bind(this, "down");

        // Down
        this.on("mousedown", onDownStateChange);
        this.on("pointerdown", onDownStateChange);
        this.on("touchstart", onDownStateChange);

        // Up
        this.on("pointerup", onUpStateChange);
        this.on("pointerupoutside", onUpStateChange);
        this.on("mouseup", onUpStateChange);
        this.on("mouseupoutside", onUpStateChange);
        this.on("touchend", onUpStateChange);
        this.on("touchendoutside", onUpStateChange);
        this.on("touchcancel", onUpStateChange);

        // Click
        this.on("click", this._onClicked.bind(this));

        // Create the text
        var text = new PIXI.Text("Spin", { fontSize: 72, fill: 0xffffff });
        text.anchor.x = text.anchor.y = 0.5;
        this.addChild(text);

        // Update the state
        this._onStateChange("up");
    };
    var p = SpinButton.prototype = Object.create(PIXI.Sprite.prototype);
    p.constructor = SpinButton;

    /**
     * Dispatched when the button is clicked
     * @type {signals.Signal}
     * @event clickSignal
     */
    p.clickSignal = null;

    /**
     * The states of the button
     * @type {object}
     * @private
     */
    p._states = null;

    /**
     * Whether the button is enabled
     * @type {boolean}
     * @private
     */
    p._enabled = false;

    /**
     * The ID of the current state
     * @type {string}
     * @private
     */
    p._currentStateId = "";

    /**
     * Set whether the buttons input should be enabled
     * @param {boolean} enabled True if input should be enabled
     */
    p.setEnabled = function (enabled) {
        this._enabled = enabled;
        this.cursor = enabled ? "pointer" : "default";

        this._onStateChange();
    };

    /**
     * Update the sprite when the state changes
     * @param {string} [stateId] The state to change to, if not provided the last state ID will be used
     * @private
     */
    p._onStateChange = function (stateId) {
        // Update the current state ID
        if (typeof stateId == "string") {
            this._currentStateId = stateId;
        }

        // Select the active state
        var state = this._enabled ? this._states[this._currentStateId] : this._states["disabled"];
        if (state != null) {
            this.texture = state.texture;
            this.alpha = state.alpha;
        }
    };

    /**
     * Dispatch the clicked signal
     * @private
     */
    p._onClicked = function () {
        this.clickSignal.dispatch(this);
    };

    window.game.SpinButton = SpinButton;

})();