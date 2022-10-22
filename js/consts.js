const consts = {

    canvas: {
        width: 2560, height: 1440,
        cX: 2560/2, cY: 1440/2
    },

    depths: {
        puzzle          : 10,
        sparklers       : 20,
        pieces          : 30,
        perfect         : 35,
        winScreen       : 40,
        options         : 50,
        loadingScreen   : 100
    },

    mouse: {
        buttons: {
            LEFT: 0,
            MIDDLE: 1,
            RIGHT: 2,
            THUMB_1: 3,
            THUMB_2: 4
        },
        buttonNames: {
            0: 'LEFT',
            1: 'MIDDLE',
            2: 'RIGHT',
            3: 'THUMB_1',
            4: 'THUMB_2'
        }
    }
}

// for easy access as I used them a lot
var mouseButtons = consts.mouse.buttons;
var mouseButtonNames = consts.mouse.buttonNames;