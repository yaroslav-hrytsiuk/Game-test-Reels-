window.game = window.game || {};

/*--------------------HELPER FUNCTIONS------------------------*/

// Basic lerp funtion.
function lerp(a1, a2, t) {
    return a1 * (1 - t) + a2 * t;
}

// Backout function from tweenjs.
function backout(amount) {
    return function (t) {
        return (--t * t * ((amount + 1) * t + amount) + 1);
    };
}
/*-----------------------------------------------------------*/

(function () {

    /**
     * The reels for the game
     * @class game.Reels
     * @param {PXII.Texture[]} symbolTextures The available symbols
     * @constructor
     */


    var Reels = function (symbolTextures) {
        PIXI.Container.call(this);

        // Create the signals
        this.spinBeganSignal = new signals.Signal();
        this.spinCompleteSignal = new signals.Signal();

        // Store the symbol textures
        this._symbolTextures = symbolTextures;
        reelSlots = this.children;
        tweening = [];
    };
    var p = Reels.prototype = Object.create(PIXI.Container.prototype);
    p.constructor = Reels;

    /**
     * Dispatched when the spin has began
     * @type {signals.Signal}
     * @event spinBeganSignal
     */
    p.spinBeganSignal = null;

    /**
     * Dispatched when the spin has completed
     * @type {signals.Signal}
     * @event spinCompleteSignal
     */
    p.spinCompleteSignal = null;

    /**
     * The states of the button
     * @type {object}
     * @private
     */
    p._symbolTextures = null;

    // Base function for start animation
    p.startAnimation = function () {
        TweenMax.ticker.addEventListener('tick', this.startSpinList);
        running = true;
        for (var i = 0; i < reelSlots.length; i++) {
            var r = reelSlots[i];
            var extra = Math.floor(Math.random() * 3);
            var target = r.position + 10 + i * 5 + extra;
            var timeSpinning = 2500 + i * 600;
            var oncomplete = i === reelSlots.length - 1 ? running = false : null;
            this.tweenTo(r, 'position', target, timeSpinning, backout(0.5), oncomplete);
        }
    }

    p.tweenTo = function (object, property, target, time, easing, oncomplete) {
        var tween = {
            object: object,
            property: property,
            propertyBeginValue: object[property],
            target: target,
            easing: easing,
            time: time,
            complete: oncomplete,
            start: Date.now()
        };

        tweening.push(tween);
        return tween;
    }

    /**
     * Start the reel spin
     */
    p.startSpin = function () {
        this.startAnimation();
        this.spinBeganSignal.dispatch(this);
        TweenMax.ticker.addEventListener('tick', this.spinListener);

    };

    // Listen for animation start
    p.startSpinList = function () {
        var slotWidth = 310;
        for (var i = 0; i < reelSlots.length; i++) {
            var r = reelSlots[i];
            r.previousPosition = r.position;

            for (var j = 0; j < r.items.length; j++) {
                var s = r.items[j];
                s.y = ((r.position + j) % r.items.length) * slotWidth - slotWidth;
            }
        }
    }

    // Listen for animate update.
    p.spinListener = function () {
        var now = Date.now();
        var remove = [];
        for (var i = 0; i < tweening.length; i++) {
            var t = tweening[i];
            var phase = Math.min(1, (now - t.start) / t.time);
            t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (t.change) t.change(t);
            if (phase === 1) {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (var i = 0; i < remove.length; i++) {
            tweening.splice(tweening.indexOf(remove[i]), 1);
        }
    }

    /**
     * Stop the reel spin
     */
    p.stopSpin = function () {
        this.spinCompleteSignal.dispatch(this);
        TweenMax.ticker.removeEventListener('tick', this.spinListener);
        TweenMax.ticker.removeEventListener('tick', this.startSpinList);
    };

    window.game.Reels = Reels;

})();