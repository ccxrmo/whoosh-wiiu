function checkBoxClicked() {
    var toggle = document.getElementById('toggle');
    var checkbox = toggle.getElementsByClassName('material-icons')[0];
    var isChecked = toggle.getAttribute('aria-pressed') === 'true';
    toggle.setAttribute('aria-pressed', String(!isChecked));
    checkbox.innerHTML = isChecked ? '&#xe835;' : '&#xe834;';
}

function getControls() {
    var links = document.getElementsByTagName('a');
    var buttons = document.getElementsByTagName('button');
    var controls = [];
    var i;

    for (i = 0; i < links.length; i++) {
        controls.push(links[i]);
    }
    for (i = 0; i < buttons.length; i++) {
        if (!buttons[i].disabled) {
            controls.push(buttons[i]);
        }
    }
    return controls;
}

function moveFocus(direction) {
    var controls = getControls();
    var current = document.activeElement;
    var currentRect;
    var currentX;
    var currentY;
    var best = null;
    var bestScore = Infinity;
    var i;

    if (controls.length === 0) {
        return;
    }
    if (!current || controls.indexOf(current) === -1) {
        controls[0].focus();
        return;
    }

    currentRect = current.getBoundingClientRect();
    currentX = currentRect.left + currentRect.width / 2;
    currentY = currentRect.top + currentRect.height / 2;

    for (i = 0; i < controls.length; i++) {
        var candidate = controls[i];
        var rect;
        var x;
        var y;
        var primary;
        var secondary;
        var score;

        if (candidate === current) {
            continue;
        }

        rect = candidate.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
        primary = direction === 'left' ? currentX - x :
            direction === 'right' ? x - currentX :
            direction === 'up' ? currentY - y : y - currentY;

        if (primary <= 0) {
            continue;
        }

        secondary = direction === 'left' || direction === 'right' ?
            Math.abs(y - currentY) : Math.abs(x - currentX);
        score = primary + secondary * 2;
        if (score < bestScore) {
            best = candidate;
            bestScore = score;
        }
    }

    if (best) {
        best.focus();
    }
}

function handleArrowKey(event) {
    var directions = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    var direction = directions[event.keyCode];

    if (direction) {
        event.preventDefault();
        moveFocus(direction);
    }
}

function startControllerNavigation() {
    var nextMoveAt = 0;
    var moveInterval = 220;
    var activationWasPressed = false;

    function buttonIsPressed(button) {
        if (typeof button === 'number') {
            return button > 0.5;
        }
        return !!button && (button.pressed || button.value > 0.5);
    }

    function pollController() {
        var getGamepads = navigator.getGamepads || navigator.webkitGetGamepads;
        var gamepads = navigator.webkitGamepads;
        var gamepad = null;
        var direction = null;
        var activationPressed = false;
        var now = new Date().getTime();
        var i;

        if (getGamepads) {
            gamepads = getGamepads.call(navigator);
        }
        if (!gamepads) {
            return;
        }

        for (i = 0; i < gamepads.length; i++) {
            if (gamepads[i] && gamepads[i].connected !== false) {
                gamepad = gamepads[i];
                break;
            }
        }
        if (!gamepad) {
            activationWasPressed = false;
            return;
        }

        if (gamepad.axes && gamepad.axes.length >= 2) {
            var horizontal = gamepad.axes[0];
            var vertical = gamepad.axes[1];
            if (Math.abs(horizontal) > 0.55 || Math.abs(vertical) > 0.55) {
                if (Math.abs(horizontal) > Math.abs(vertical)) {
                    direction = horizontal < 0 ? 'left' : 'right';
                } else {
                    direction = vertical < 0 ? 'up' : 'down';
                }
            }
        }

        if (!direction && gamepad.buttons) {
            if (buttonIsPressed(gamepad.buttons[12])) {
                direction = 'up';
            } else if (buttonIsPressed(gamepad.buttons[13])) {
                direction = 'down';
            } else if (buttonIsPressed(gamepad.buttons[14])) {
                direction = 'left';
            } else if (buttonIsPressed(gamepad.buttons[15])) {
                direction = 'right';
            }
            activationPressed = buttonIsPressed(gamepad.buttons[0]);
        }

        if (direction && now >= nextMoveAt) {
            moveFocus(direction);
            nextMoveAt = now + moveInterval;
        } else if (!direction) {
            nextMoveAt = 0;
        }

        if (activationPressed && !activationWasPressed) {
            if (document.activeElement && document.activeElement.click) {
                document.activeElement.click();
            }
        }
        activationWasPressed = activationPressed;
    }

    window.setInterval(pollController, 50);
}

if (document.addEventListener) {
    document.addEventListener('keydown', handleArrowKey, false);
}
if (window.addEventListener) {
    window.addEventListener('load', startControllerNavigation, false);
}
