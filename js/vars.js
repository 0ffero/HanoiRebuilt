"use strict"
var vars = {
    DEBUG: false,
    name: 'HanoiRebuilt',

    version: 1.2,

    TODO: [ ],

    fonts: {
        default:  { fontFamily: 'Consolas', fontSize: '36px', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }
    },

    init: function(_phase) {
        switch (_phase) {
            case 'PRELOAD': // PRELOADS
                vars.files.loadAssets();
                vars.localStorage.init();
            break;
            case 'CREATE': // CREATES
                vars.audio.init();
                vars.containers.init();
                vars.input.init();
                vars.UI.init();
            break;
            case 'STARTAPP': // GAME IS READY TO PLAY
                vars.game.init();
            break;

            default:
                console.error(`Phase (${_phase}) was invalid!`);
                return false;
            break;
        }
    },

    files: {
        audio: {
            load: function() {
                scene.load.audio('buttonClick',  'audio/buttonClick.ogg');
                scene.load.audio('liftPiece',    'audio/lift.ogg');
                scene.load.audio('dropPiece',    'audio/drop.ogg');
                scene.load.audio('perfectScore', 'audio/perfectScore.ogg');
                scene.load.audio('sparkler',     'audio/sparkler.ogg');
            }
        },

        images: {
            header: 'data:image/png;base64,',
            preA: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCA',
            preB: 'AAAAA6fptV[d]QIHW',
            postC: 'AAAABJRU5ErkJggg==',
            postD: 'AAAACklEQV',
            base64s: {
                'blackpixel'        : '[a]IAAACQd1Pe[d]R4AWMAAgAABAABsYaQRA[c]',
                'whitepixel'        : '[a][b]P4DwABAQEANl9ngA[c]',
                'pixel2'            : '[a][b]NQAgAAJAAjw8NKCg[c]',
                'pixel3'            : '[a][b]MwBgAANQA0TdMIeQ[c]',
                'pixel6'            : '[a][b]NIAwAAaABnVJ+6Kw[c]',
                'pixel9'            : '[a][b]OYCQAAmwCaKknZIA[c]',
                'pixel15'           : '[a][b]MQBQAAFwAW6lOQIQ[c]',
                'pixelC'            : '[a][b]M4AwAAzgDNUwEBJA[c]'
            },
            init: ()=> {
                let fIV = vars.files.images;
                let base64s = fIV.base64s;
                let header = fIV.header;
                let preA = fIV.preA;
                let preB = fIV.preB;
                let postC = fIV.postC;
                let postD = fIV.postD;
                for (let b in base64s) {
                    let b64 = header + base64s[b];
                    let newb64 = b64.replace('[a]', preA).replace('[b]',preB).replace('[c]',postC).replace('[d]',postD);
                    scene.textures.addBase64(b, newb64);
                };

            },
            load: ()=> {
                vars.files.images.init();

                scene.load.atlas('ui', 'images/ui.png', 'images/ui.json');
                scene.load.atlas('newGame', 'images/newGame.png', 'images/newGame.json');
                scene.load.atlas('flares', 'particles/flares.png', 'particles/flares.json');
            }
        },

        loadAssets: ()=> {
            scene.load.setPath('assets');

            let fV = vars.files;
            fV.audio.load();
            fV.images.load();
        }
    },

    containers: {
        init: function() {
            let depths = consts.depths;
            !scene.containers ? scene.containers = {} : null;
            //scene.containers.game = scene.add.container().setName('game').setDepth(depths.gameMap);
        }
    },

    localStorage: {
        pre: 'HRB',
        savedGames: { 3: { score: null, time: null}, 4: { score: null, time: null}, 5: { score: null, time: null}, 6: { score: null, time: null}, 7: { score: null, time: null}, 8: { score: null, time: null}, 9: { score: null, time: null} },

        init: ()=> {
            let lV = vars.localStorage;
            let lS = window.localStorage;
            let pre = lV.pre;
            let gV = vars.game;

            !lS[`${pre}_options`] && (lS[`${pre}_options`] = JSON.stringify(gV.options));
            gV.options = JSON.parse(lS[`${pre}_options`]);

            !lS[`${pre}_bests`] && (lS[`${pre}_bests`] = JSON.stringify(gV.best));
            gV.best = JSON.parse(lS[`${pre}_bests`]);

            !lS[`${pre}_savedGames`] && (lS[`${pre}_savedGames`] = JSON.stringify(lV.savedGames));
            lV.savedGames = JSON.parse(lS[`${pre}_savedGames`]);
        },

        saveBests: ()=> {
            vars.DEBUG && console.log(`%cSaving bests`,`color: #ff0000`);
            let lV = vars.localStorage;
            let pre = lV.pre;
            let lS = window.localStorage;

            lS[`${pre}_bests`] = JSON.stringify(vars.game.best);
            lS[`${pre}_savedGames`] = JSON.stringify(lV.savedGames);
        },

        saveOptions: ()=> {
            vars.DEBUG && console.log(`%cSaving options`,`color: #ff0000`);
            let lV = vars.localStorage;
            let pre = lV.pre;
            let lS = window.localStorage;

            lS[`${pre}_options`] = JSON.stringify(vars.game.options);
        }
    },



    // GAME/APP
    audio: {
        sparkler: null,

        init: ()=> { scene.sound.volume=0.4; vars.audio.sparkler = scene.sound.add('sparkler', {loop: true}); },
        playSound: (_key)=> { scene.sound.play(_key); },
        sparklersStart: (_start=true)=> {
            _start ? vars.audio.sparkler.play() : vars.audio.sparkler.stop();
        },
        sparklerSetVolume: (_newVolume=1)=> {
            vars.audio.sparkler.setVolume(_newVolume);
        }
    },

    camera: {
        // cameras
        mainCam: null,

        init: ()=> {
            vars.DEBUG && console.log(`FN: camera > init`);
            vars.camera.mainCam = scene.cameras.main;
        }
    },

    game: {
        puzzle: null,

        best: {
            scores: { 3: 99999, 4: 99999, 5: 99999, 6: 99999, 7: 99999, 8: 99999, 9: 99999 },
            times:  { 3: 999999999, 4: 999999999, 5: 999999999, 6: 999999999, 7: 999999999, 8: 999999999, 9: 999999999 }
        },
        checkForBest: (_type,_pieces,_value)=> {
            let gV = vars.game;

            let best = gV.best;
            let options = gV.options;

            let pieces = options.pieces;

            let updated = false;
            switch (_type) {
                case 'score': _value < best.scores[pieces] && (best.scores[pieces]=_value, updated=true); break;
                case 'time': _value < best.times[pieces] && (best.times[pieces]=_value, updated=true); break;
            };

            return updated;
        },
        
        options: { colourfulPieces: true, peg: 0, pieces: 3, forceRandomEndPeg: false },

        init: ()=> {
           vars.DEBUG ? console.log(`\nFN: game > init`) : null;
        },

        begin: ()=> {
            let gV = vars.game;
            gV.puzzle && gV.puzzle.destroy();
            gV.puzzle = new Puzzle();
        }
    },

    input: {
        cursors: null,
        enabled: false,
        locked: false,

        init: ()=> {
            vars.DEBUG ? console.log(`FN: input > init`) : null;

            scene.input.on('pointermove', function (_pointer) {});
            scene.input.on('pointerup', (_pointer)=> {
                //vars.DEBUG && console.log(`${mouseButtonNames[_pointer.button]} mouse button clicked`);
            });

            // mouse scroll (zoom in / out)
            scene.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {});
            
            // phaser objects
            scene.input.on('gameobjectup', function (pointer, gameObject) {
                if (!vars.input.enabled) return false;

                vars.input.click(gameObject);
            });
            
            scene.input.on('gameobjectover', function (pointer, gameObject) {
                let name = gameObject.name;
                
                if (name.startsWith('peg_')) {
                    vars.game.puzzle.hoverOverPeg(gameObject.id);
                    return;
                };

                if (name.startsWith('piece_')) {
                    let p = vars.game.puzzle;
                    if (p.floatingPiece && p.floatingPiece.name===name) return false;
                    let peg = gameObject.peg;
                    vars.game.puzzle.hoverOverPeg(peg);
                    return;
                };

                if (name==='tickBox') {
                    vars.phaserObjects.forceEndPegInfo.setVisible(true);
                    return;
                };

                if (name==='tickCBox') {
                    vars.phaserObjects.useColourful.setVisible(true);
                    return;
                };

                if (name==='rec_browser_icon') {
                    vars.UI.requirements.showMoreInfo(gameObject);
                    return;
                };

            });

            scene.input.on('gameobjectout', function (pointer, gameObject) {
                let name = gameObject.name;
                if (name==='tickBox') {
                    vars.phaserObjects.forceEndPegInfo.setVisible(false);
                    return;
                };
                if (name==='tickCBox') {
                    vars.phaserObjects.useColourful.setVisible(false);
                    return;
                };
                if (name==='rec_browser_icon') {
                    vars.UI.requirements.hideMoreInfo();
                    return;
                };
            });
        },

        click(_gameObject) {
            if (!vars.input.enabled) return false;

            let puzzle = vars.game.puzzle;
            let name = _gameObject.name;
            if (name.startsWith('peg_')) {
                puzzle.clickPeg(_gameObject.id); 
                return;
            };

            if (name.startsWith('piece_')) {
                puzzle.clickPiece(_gameObject);
                return;
            };

            if (name==='requirements' || name==='rec_browser_icon') {
                let UI = vars.UI;
                UI.requirements.destroy();
                delete(UI.requirements);
            };
        },

        clickOptions(_button) {
            let opt = vars.game.options;
            let changing;
            vars.audio.playSound('buttonClick');
            switch (_button.name) {
                case 'piecesDec':
                    opt.pieces--;
                    changing = 'pieces';
                break;

                case 'piecesInc':
                    opt.pieces++;
                    changing = 'pieces';
                break;

                case 'pegPrev':
                    opt.peg--;
                    changing = 'peg';
                break;

                case 'pegNext':
                    opt.peg++;
                    changing = 'peg';
                break;

                case 'start':
                    if (!vars.input.enabled) return;

                    scene.containers.newGame.hide();
                    vars.game.begin();
                    return;
                break;
            };

            switch (changing) {
                case 'pieces':
                    opt.pieces = clamp(opt.pieces,3,9);
                    vars.phaserObjects.piecesCount.setText(opt.pieces);
                break;

                case 'peg':
                    opt.peg = clamp(opt.peg,0,3)
                    let pText = opt.peg===3 ? 'RANDOM' : opt.peg+1;
                    vars.phaserObjects.pegNumber.setText(pText);
                break;
            };
            
            vars.localStorage.saveOptions();
        }
    },

    particles: {
        init: ()=> { },
    },

    phaserObjects: {},

    UI: {
        requirements: null,

        init: ()=> {
            vars.DEBUG ? console.log(`FN: ui > init`) : null;
            let cC = consts.canvas;
            let UI = vars.UI;
            let container = scene.containers.ui = scene.add.container().setName('uiContainer');
            let mainBG = vars.phaserObjects.background = scene.add.image(cC.cX,cC.cY,'ui','background');
            let scale = cC.width/mainBG.width;
            mainBG.setScale(scale);
            
            container.add(mainBG);

            UI.initNewGameScreen();
            UI.initWinScreen();

            UI.initRequirements();
        },
        initNewGameScreen() {
            let cC = consts.canvas;
            let container = scene.containers.newGame = scene.add.container().setName('newGame').setDepth(consts.depths.options);
            container.hide = (_hide=true)=> {
                let alpha = _hide ? 0 : 1;
                container.tween = scene.tweens.add({
                    targets: container, alpha: alpha, duration: 500, onComplete: ()=> { container.tween = null }
                });
            };
            container.tween = null;

            let font = { ...vars.fonts.default, ...{ fontSize: '42px'} };
            let lineSpacing = 10;
            let texture = 'newGame';

            // the bg is interactive, so the player cant accidentally click behind it
            let bg = scene.add.image(cC.cX,cC.cY,'pixel15').setScale(cC.width, cC.height).setInteractive();
            let stack = scene.add.image(cC.width*0.825,cC.cY,'ui','stack').setAlpha(0.2);
            container.add([bg,stack]);

            vars.UI.initWavyMessage('Welcome to Hanoi Rebuilt', cC.height*0.1);
            vars.UI.initWavyMessage('Created by Offer0 - OCT 2022', cC.height*0.9);


            let options = vars.game.options;
            let y = cC.height*0.35;
            let x = cC.width*0.225;
            
            /*
               ****************
               * PIECES START *
               ****************
            */
            let piecesLabel = scene.add.text(x,y-125,'PIECES',font).setOrigin(0.5);
            let pieceCount = options.pieces;

            let piecesCount = vars.phaserObjects.piecesCount = scene.add.text(x,y,pieceCount,font).setOrigin(0.5).setColor('#4dff4d');
            piecesCount.pieces = pieceCount;
            let piecesDecrease = scene.add.image(x-150,y,texture,'arrowDown').setAngle(90).setName('piecesDec').setInteractive();
            piecesDecrease.on('pointerdown', ()=> { vars.input.clickOptions(piecesDecrease); });
            let piecesIncrease = scene.add.image(x+150,y,texture,'arrowDown').setAngle(270).setName('piecesInc').setInteractive();
            piecesIncrease.on('pointerdown', ()=> { vars.input.clickOptions(piecesIncrease); });
            container.add([piecesLabel,piecesCount,piecesIncrease,piecesDecrease]);
            /*
               **************
               * PIECES END *
               **************
            */

            /*
                **************************
                * Simple Colouring START *
                **************************
            */
            x = cC.width*0.475;
            let useColourful = scene.add.text(x,y-125,'COLOURFUL PIECES',font).setOrigin(0.5);
            let originalCString = `When this box is ticked, the pieces will be multi-coloured\nOtherwise they'll use a single colour that's darker at the base and brighter at the top.\n`;
            let useColourfulInfo = vars.phaserObjects.useColourful = scene.add.text(cC.cX,cC.height*0.75,originalCString + `Currently, colourful pieces are ${options.colourfulPieces ? 'ON': 'OFF'}.`,font).setLineSpacing(lineSpacing).setColor('#666666').setOrigin(0.5).setVisible(false);
            useColourfulInfo.originalCString = originalCString;
            let tickCBox = scene.add.image(x,y,texture,'tickBox').setName(`tickCBox`).setInteractive();
            let tickCIcon = scene.add.image(x,y,texture,'tickIcon').setVisible(options.colourfulPieces);
            tickCBox.on('pointerdown', ()=> {
                vars.audio.playSound('buttonClick');
                options.colourfulPieces=!options.colourfulPieces;
                vars.localStorage.saveOptions();
                tickCIcon.setVisible(options.colourfulPieces);
                useColourfulInfo.setText(useColourfulInfo.originalCString + `Currently, colourful pieces are ${options.colourfulPieces ? 'ON': 'OFF'}.`);
            });
            container.add([useColourful,tickCBox,tickCIcon,useColourfulInfo]);
            /*
                ************************
                * Simple Colouring END *
                ************************
            */


            /*
               *************
               * PEG START *
               *************
            */
            x = cC.width*0.225;
            y = cC.height*0.625;
            let pegLabel = scene.add.text(x,y-125,'STARTING PEG',font).setOrigin(0.5);
            let pegInt = options.peg;
            let pText = pegInt===3 ? 'RANDOM' : pegInt+1;

            let pegNumber = vars.phaserObjects.pegNumber = scene.add.text(x,y,pText,font).setOrigin(0.5).setColor('#4dff4d');
            pegNumber.peg = pegInt;
            let pegPrev = scene.add.image(x-150,y,texture,'arrowDown').setAngle(90).setName('pegPrev').setInteractive();
            pegPrev.on('pointerdown', ()=> { vars.input.clickOptions(pegPrev); });
            let pegNext = scene.add.image(x+150,y,texture,'arrowDown').setAngle(270).setName('pegNext').setInteractive();
            pegNext.on('pointerdown', ()=> { vars.input.clickOptions(pegNext); });
            container.add([pegLabel,pegNumber,pegPrev,pegNext]);
            /*
                ***********
                * PEG END *
                ***********
            */

            /*
                ***********************
                * Force End Peg START *
                ***********************
            */
            x = cC.width*0.475;
            let forceEndPeg = scene.add.text(x,y-125,'RANDOM END PEG',font).setOrigin(0.5);
            let originalString = `When this box is ticked, the computer will select a random peg which you'll have to rebuilt the tower on.\nOnly when you've rebuilt the tower on that peg will you complete the puzzle.\n`;
            let forceEndPegInfo = vars.phaserObjects.forceEndPegInfo = scene.add.text(cC.cX,cC.height*0.75,originalString + `Currently, the computer will ${!options.forceRandomEndPeg ? 'not ': ''}be setting the rebuild peg.`,font).setLineSpacing(lineSpacing).setColor('#666666').setOrigin(0.5).setVisible(false);
            forceEndPegInfo.originalString = originalString;
            let tickBox = scene.add.image(x,y,texture,'tickBox').setName(`tickBox`).setInteractive();
            let tickIcon = scene.add.image(x,y,texture,'tickIcon').setVisible(options.forceRandomEndPeg);
            tickBox.on('pointerdown', ()=> {
                vars.audio.playSound('buttonClick');
                options.forceRandomEndPeg=!options.forceRandomEndPeg;
                vars.localStorage.saveOptions();
                tickIcon.setVisible(options.forceRandomEndPeg);
                forceEndPegInfo.setText(forceEndPegInfo.originalString + `Currently, the computer will ${!options.forceRandomEndPeg ? 'not ': ''}be setting the rebuild peg.`);
            });
            container.add([forceEndPeg,tickBox,tickIcon,forceEndPegInfo]);
            /*
                **********************
                * Force End Peg  END *
                **********************
            */

            // START BUTTON
            x = cC.width * 0.825;
            let startButton = scene.add.image(x,y,texture,'startButton').setName('start').setInteractive();
            startButton.on('pointerdown', ()=> { vars.input.clickOptions(startButton); });
            container.add(startButton);

            // Cert
            let cert = scene.add.image(cC.width-20,cC.height-20,'ui','CERT').setOrigin(1).setAlpha(0.1);
            cert.tween = scene.tweens.add({ targets: cert, alpha: 1, delay: 10000, duration: 1000, yoyo: true, loop: true });
            container.add(cert);
        },
        initRequirements() {
            vars.UI.requirements = new Requirements({firefox: {valid: false, reason: 'This game runs at 1440p (2560x1440). Every browser except firefox is happy with this.\nExpect a lot of stuttering in the NEW GAME screen.'}});
        },
        initWavyMessage: (_msg,_yPos=null)=> {
            if (_yPos===null) return 'Unable to generate message as no y position was passed!';

            let container;
            if (scene.containers.welcomeMessage) {
                container = scene.containers.welcomeMessage;
            } else {
                container = scene.add.container().setName('welcomeMessage');
            };

            let cX = consts.canvas.cX;
            let xInc = 64;
            let offsetX = _msg.length/2|0;
            let xStart = offsetX*xInc;
            _msg.length%2 && (xStart+=xInc/2);
            xStart = cX-xStart;
            let y = _yPos;
            if (_msg.length>0) {
                let msgArray = _msg.split('');
                msgArray.forEach( (l, i)=> {
                    [1.0,0.8,0.6,0.4,0.2].reverse().forEach( (a)=> {
                        let x = xStart + (i*xInc);
                        let colour = a<1 ? '#f80' : '#A00';
                        let c = scene.add.text(x,y,l, { fontStyle: 'bold', color: colour, fontSize: 112 }).setAlpha(a);
                        c.tween = scene.tweens.add({
                            targets: c, delay: i*17+((1-a) * 100), y: y-80, duration: 500, yoyo: true, repeat: -1, ease: 'Quad.easeInOut'
                        });
                        container.add(c);
                    });
                });
            };
            
            scene.containers.newGame.add(container);
        },
        
        initWinScreen: ()=> {
            vars.game.winScreen = new WinScreen();
        }
    }
}