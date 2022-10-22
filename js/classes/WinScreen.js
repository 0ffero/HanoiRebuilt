let WinScreen = class {
    constructor() {
        
        this.upperString = 'WELL DONE';
        this.middleString = null;
        this.lowerString = 'YOU REBUILT THE TOWER IN THE LEAST MOVES NEEDED!';

        let cC = consts.canvas;
        this.yPositions = [cC.height*0.25,cC.height*0.85,cC.height*0.5];
        this.init();

    }

    init() {
        let cC = consts.canvas;
        let depth = consts.depths.winScreen;

        let mC = this.mainContainer = scene.add.container().setName('winScreenContainer').setDepth(depth).setAlpha(0);
        this.mainContainer.show = (_show=true)=> {
            scene.tweens.add({ targets: mC, alpha: _show ? 1: 0, duration: 1000, onComplete: ()=> { _show && (vars.input.enabled=true);} });
        };

        let bg = scene.add.image(cC.cX,cC.cY,'pixel15').setScale(cC.width, cC.height).setName(`winContainerBG`).setInteractive();
        bg.on('pointerdown', ()=> {
            scene.containers.newGame.hide(false);
            scene.tweens.addCounter({ from: 0, to: 1, duration: 500, onComplete: ()=> { vars.game.puzzle.fireworksDisable(); mC.show(false); }})
        });
        this.mainContainer.add(bg);

        // particle splash
        this.initParticleSplash();

        this.upperStringContainer = scene.add.container().setName('upperStringContainer');
        this.upperStringContainer.y = cC.height*0.2;

        this.middleStringContainer = scene.add.container().setName('middleStringContainer');
        this.middleStringContainer.y = cC.height*0.5;

        this.lowerStringContainer = scene.add.container().setName('lowerStringContainer');
        this.lowerStringContainer.y = cC.height*0.75;

        this.mainContainer.add([this.upperStringContainer,this.middleStringContainer,this.lowerStringContainer])

        this.font = { ...vars.fonts.default, ... { fontSize: '64px' }};

        let xSpacing = 50; let cX = consts.canvas.cX;
        ['upperString','lowerString'].forEach((_var,_i)=> {
            let text = this[_var].split('');
            let offsetX = text.length/2|0;
            let x = offsetX*xSpacing;
            text.length%2 && (x+=xSpacing/2);
            x = cX-x;

            let y = 0;
            text.forEach((_letter,_i)=> {
                let colour = _i%2 ? '#4DA6FF' : '#006DD9';
                let letterObject = scene.add.text(x,y,_letter,this.font).setColor(colour).setOrigin(0.5);
                letterObject.tween = scene.tweens.add({ targets: letterObject, useFrames: true, y: -10, delay: _i*10, duration: 30, yoyo: true, repeat: -1, ease: 'Quad.easeInOut' });
                this[`${_var}Container`].add(letterObject);
                x+=xSpacing;
            });
        });
    }
    initParticleSplash() {
        let cC = consts.canvas;

        let duration = 8000;

        this.particleSplash = scene.add.particles('flares');
        this.emitter = this.particleSplash.createEmitter({
            x: cC.cX,
            y: cC.height+50,
            alpha: { min: 0.25, max: 0.75 },
            angle: { min: 180, max: 360 },
            speed: 1000,
            gravityY: 350,
            lifespan: duration,
            quantity: 4,
            scale: { start: 0.1, end: 1 },
            blendMode: 'ADD'
        });
        this.mainContainer.add(this.particleSplash);

        // let the particles spawn then pause them
        scene.tweens.addCounter({
            from: 0, to: 1, duration: duration-2000,
            onComplete: ()=> { vars.game.winScreen.startEmitter(false); }
        });
    }

    addTimeString(_time) {
        this.middleString = `YOU BUILT THE TOWER IN ${_time}s - A NEW RECORD!`;

        let xSpacing = 50; let cX = consts.canvas.cX;
        let text = this.middleString.split('');
        let offsetX = text.length/2|0;
        let x = offsetX*xSpacing;
        text.length%2 && (x+=xSpacing/2);
        x = cX-x;

        let y = 200;
        text.forEach((_letter,_i)=> {
            let letterObject = scene.add.text(x,y,_letter,this.font).setOrigin(0.5);
            let tinted = false;
            (_letter.charCodeAt(0)>45 && _letter.charCodeAt(0)<58) && (letterObject.setColor('#4dff4d'), tinted=true);
            if (!tinted) { let colour = _i%2 ? '#4DA6FF' : '#006DD9'; letterObject.setColor(colour); };
            letterObject.tween = scene.tweens.add({ targets: letterObject, useFrames: true, y: y-10, delay: _i*10, duration: 30, yoyo: true, repeat: -1, ease: 'Quad.easeInOut' });
            this.middleStringContainer.add(letterObject);
            x+=xSpacing;
        });
        this.middleStringContainer.y = consts.canvas.height*0.4;
    }

    generateMiddleString() {
        this.middleStringContainer.getAll().forEach((_c)=> { _c.destroy(); });
        this.middleStringContainer.y = consts.canvas.height*0.5;
        let puzzle = vars.game.puzzle;
        let moves = puzzle.moveCount;
        this.middleString = `YOU FINISHED THE NEW TOWER IN ${moves} MOVES`;

        let xSpacing = 50; let cX = consts.canvas.cX;
        let text = this.middleString.split('');
        let offsetX = text.length/2|0;
        let x = offsetX*xSpacing;
        text.length%2 && (x+=xSpacing/2);
        x = cX-x;

        let y = 0;
        text.forEach((_letter,_i)=> {
            let letterObject = scene.add.text(x,y,_letter,this.font).setOrigin(0.5);
            let tinted = false;
            (_letter.charCodeAt(0)>45 && _letter.charCodeAt(0)<58) && (letterObject.setColor('#4dff4d'), tinted-=true);
            if (!tinted) { let colour = _i%2 ? '#4DA6FF' : '#006DD9'; letterObject.setColor(colour); };
            letterObject.tween = scene.tweens.add({ targets: letterObject, useFrames: true, y: -10, delay: _i*10, duration: 30, yoyo: true, repeat: -1, ease: 'Quad.easeInOut' });
            this.middleStringContainer.add(letterObject);
            x+=xSpacing;
        });

        let n = puzzle.piecesCount;
        if (Math.pow(2,n)-1===moves) {
            this.lowerStringContainer.alpha=1;
        } else {
            this.lowerStringContainer.alpha=0;
        };
    }

    show(_show=true) {
        this.startEmitter(_show);
        this.mainContainer.show(_show);
    }

    startEmitter(_start=true) {
        // restart the particles
        if (_start) {
            this.emitter.resume();
            this.emitter.visible=true;
        } else {
            this.emitter.pause();
            this.emitter.visible=false;
        };
    }
};