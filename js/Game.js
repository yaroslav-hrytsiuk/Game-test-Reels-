window.game = window.game || {};

(function () {

    /**
     * A simple reels game
     * @class game.Game
     */
    var Game = function () {
        this.slotWidth = 310;
    };
    var p = Game.prototype;
    p.constructor = Game;

    /**
     * The pixi application
     * @type {PIXI.Application}
     * @private
     */
    p._app = null;

    /**
     * The spin button
     * @type {game.SpinButton}
     * @private
     */
    p._spinButton = null;

    /**
     * The reels
     * @type {game.Reels}
     * @private
     */
    p._reels = null;

    /**
     * Initialise the game
     * @param {HTMLElement} domElement The dom element to add the canvas to
     */
    p.initialise = function (domElement) {
        // Set up pixi
        var app = new PIXI.Application();
        this._app = app;

        domElement.appendChild(app.view);
        app.renderer.resize(960, 640);

        var stageScale = app.stage.scale;
        stageScale.x = stageScale.y = 0.5;

        this._loadTextures();
    };

    /**
     * Load the textures for the game
     * @private
     */
    p._loadTextures = function () {
        var loader = new PIXI.loaders.Loader();
        loader.onComplete.add(this._onTexturesLoaded.bind(this));

        loader.add("background", "images/background.jpg");
        loader.add("game_frame", "images/gameframe.png");
        loader.add("high_bell", "images/highwin_bell.png");
        loader.add("high_cherry", "images/highwin_cherry.png");
        loader.add("high_jewel", "images/highwin_jewel.png");
        loader.add("high_lemon", "images/highwin_lemon.png");
        loader.add("high_seven", "images/highwin_seven.png");
        loader.add("low_club", "images/lowwin_club.png");
        loader.add("low_diamond", "images/lowwin_diamond.png");
        loader.add("low_heart", "images/lowwin_heart.png");
        loader.add("low_spade", "images/lowwin_spade.png");
        loader.add("button_up", "images/buttonstates_idle.png");
        loader.add("button_down", "images/buttonstates_down.png");

        loader.load();
    };

    /**
     * Handle the textures having loaded
     * @private
     */
    p._onTexturesLoaded = function () {
        this._createScene();
        this._waitForSpin();
    };

    /**
     * Create the scene
     * @private
     */
    p._createScene = function () {
        var stage = this._app.stage;

        // Create the background
        var background = new PIXI.Sprite(PIXI.Texture.from("background"));
        background.x = -480;
        background.y = -320;
        stage.addChild(background);

        // Create the game frame
        var gameFrame = new PIXI.Sprite(PIXI.Texture.from("game_frame"));
        gameFrame.y = 136
        gameFrame.scale.x = gameFrame.scale.y = 0.9;
        stage.addChild(gameFrame);

        // Create the spin button
        var spinButton = new game.SpinButton({
            up: {
                texture: PIXI.Texture.from("button_up"),
                alpha: 1
            },
            down: {
                texture: PIXI.Texture.from("button_down"),
                alpha: 1
            },
            disabled: {
                texture: PIXI.Texture.from("button_up"),
                alpha: 0.5
            }
        });
        spinButton.x = 1750;
        spinButton.y = 640;
        spinButton.scale.x = spinButton.scale.y = 0.8;
        stage.addChild(spinButton);
        this._spinButton = spinButton;

        // Create visible container for the Reels (size for 3 rows)
        var graphics = new PIXI.Graphics();
        graphics.beginFill();
        graphics.drawRect(50, 105, 700, 430);
        graphics.endFill();

        // Create the Reels
        var reels = new game.Reels([
            PIXI.Texture.from("high_bell"),
            PIXI.Texture.from("high_cherry"),
            PIXI.Texture.from("high_jewel"),
            PIXI.Texture.from("high_lemon"),
            PIXI.Texture.from("high_seven"),
            PIXI.Texture.from("low_spade"),
            PIXI.Texture.from("low_diamond"),
            PIXI.Texture.from("low_heart"),
            PIXI.Texture.from("low_club")
        ]),
            reelsTextures = reels._symbolTextures,
            reelContainer = new PIXI.Container(),
            slots = new game.Reels([]);

        // Apply visible container only for 3 rows
        reelContainer.mask = graphics;

        // Create basic field
        // Create columns
        for (var i = 0; i < 5; i++) {
            var rc = new PIXI.Container();
            rc.x = i * this.slotWidth;
            reelContainer.addChild(rc);
            var slot = {
                container: rc,
                items: [],
                position: 0,
                previousPosition: 0,
            }
            // Create rows 
            for (var j = 0; j < 5; j++) {
                var item = new PIXI.Sprite(reelsTextures[Math.floor(Math.random() * reelsTextures.length)]);
                item.y = j * this.slotWidth;
                item.scale.x = item.scale.y = 0.8;
                item.x = Math.round((this.slotWidth - item.width) / 2);
                slot.items.push(item);
                rc.addChild(item)
            }
            slots.children.push(slot)
        }
        stage.addChild(reelContainer);

        // Positioning reels container
        reelContainer.y = 250;
        reelContainer.x = 100;
        reelContainer.scale.x = reelContainer.scale.y = 0.9;

        stage.addChild(reels);
        this._reels = reels;
    };

    /**
     * Wait for the player to click spin
     * @private
     */
    p._waitForSpin = function () {
        var spinButton = this._spinButton;
        spinButton.clickSignal.addOnce(this._beginSpin, this);
        spinButton.setEnabled(true);
    };

    /**
     * Begin the spin
     * @private
     */
    p._beginSpin = function () {
        var spinButton = this._spinButton;
        spinButton.setEnabled(false);

        // Start the reels spinning
        var reels = this._reels;
        reels.spinBeganSignal.addOnce(this._onSpinBegan, this);
        reels.startSpin();
    };

    /**
     * Handle the spin beginning
     * @private
     */
    p._onSpinBegan = function () {
        setTimeout(this._onStopSpin.bind(this), 4900);
    };

    /**
     * Stop the spin
     * @private
     */
    p._onStopSpin = function () {
        var reels = this._reels;
        reels.spinCompleteSignal.addOnce(this._waitForSpin, this);
        reels.stopSpin();
    };

    window.game.Game = Game;
})();
