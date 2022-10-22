let Puzzle = class {
    constructor(_pieces,_startPeg) {
        
        this.font = { ...vars.fonts.default };// take a copy of the font
        
        // init pieces vars
        this.piecesCount = clamp(_pieces||3,3,9);
        this.pieces = [];
        this.floatingPiece = null;

        // init peg vars
        this.pegXPositions = [400,1000,1600];
        this.startPeg = _startPeg||0;
        this.startPeg===3 && (this.startPeg=getRandom(0,2));

        // init move vars
        this.moveCount = 0;
        this.moves = [];

        // everything else
        this.inputEnabled = true; // used to diasble input while
        this.fireWorks = [];
        this.fireworksVisible=false;
        this.liftY = 500; // the Y position of the lifted piece
        this.lowY = consts.canvas.height; // this is the base of the pieces container. its only needed when placnig pieces on to empty pegs. everything else is calculated based on the pieces on the peg
        this.phaserObjects = {};
        this.timer = null;
        this.winState=false;

        this.cleanUpPieces();

        // and init
        this.init();

    }

    /* 
      *****************************
      *                           *
      *   INIT FUNCTIONS BEGIN    *
      *                           *
      *****************************
    */
    init() {
        let depths = consts.depths;
        this.container = scene.add.container().setName('PuzzleContainer').setDepth(depths.puzzle);
        this.piecesContainer = scene.add.container().setName('PiecesContainer').setDepth(depths.pieces);

        this.initPegs();
        this.initBase();

        //this.initPieceColours();
        this.initNewPieces();

        this.createFireworks();

        let cC = consts.canvas;
        
        let pS = this.perfectScore = scene.add.image(cC.cX,cC.cY,'ui','perfectScore').setDepth(depths.perfect).setAlpha(0);
        pS.show = (_show=true)=> {
            if (!_show) { pS.setAlpha(0); return; };

            pS.setScale(5).setAlpha(0);
            let duration = 2000;
            scene.tweens.add({ targets: pS, duration: duration, alpha: 1, scale: 1, ease: 'Quad.easeIn' });
            return duration;
        };

    }
    initBase() {
        let width = 2000;
        let xPadding = (consts.canvas.width-width)/2;
        let height = 200;
        let base = this.phaserObjects.base = scene.add.graphics();

        this.baseColours = { line: { size: 1, colour: 0x666666}, fill: { colour: 0x333333 } };
        base.lineStyle(this.baseColours.line.size,this.baseColours.line.colour);
        base.fillStyle(this.baseColours.fill.colour);
        base.fillRoundedRect(0,0, width, height, 10);
        base.strokeRoundedRect(0,0, width, height, 10);

        base.generateTexture('base',width,height);
        base.clear().destroy();
        let image = scene.add.image(0,0,'base').setOrigin(0);

        this.container.add(image);

        // add the amount of moves taken
        this.movesCountText = scene.add.text(width/2,65,'MOVES TAKEN SO FAR: 0', this.font).setOrigin(0.5);
        this.timerLabel = scene.add.text(width/2-210,135,'TIME TAKEN:', this.font).setOrigin(0,0.5);
        this.timerText = scene.add.text(width/2+30,135,'0s', this.font).setOrigin(0, 0.5);


        this.container.add([this.movesCountText, this.timerLabel, this.timerText]);

        this.container.setPosition(xPadding,consts.canvas.height-250);
        this.piecesContainer.y-=450-200;
        this.piecesContainer.x=xPadding;
    }
    initPegs() {
        let pegs = 3;
        this.pegsArray = [];
        this.pegObjects = [];
        for (let p=0; p<pegs; p++) { this.pegsArray.push([]); };

        // create the objects
        let width = 15; // picking an odd number so the centre is an int
        let height = 900; // this allows a total of 9 pieces stacked on top of each other (totalHeight=810px)

        let interactive = [new Phaser.Geom.Rectangle(0-200, 0, width+400, height), Phaser.Geom.Rectangle.Contains];

        this.pegColours = { line: { size: 1, colour: 0x333333}, fill: { colour: 0xCCCCCC } };
        this.pegXPositions.forEach((_x,_i)=> {
        
            let peg = scene.add.graphics();
            peg.lineStyle(this.pegColours.line.size,this.pegColours.line.colour);
            peg.fillStyle(this.pegColours.fill.colour);
            peg.fillRoundedRect(0,0, width, height, 10);
            peg.strokeRoundedRect(0,0, width, height, 10);

            let id = _i+1;
            let name = `peg_${id}`;
            peg.generateTexture(name,width,height);
            peg.clear().destroy();

            let image = scene.add.image(_x,20,name).setOrigin(0.5,1).setName(name).setInteractive(interactive[0],interactive[1]);
            image.id = id;

            this.container.add(image);
            this.pegObjects.push(image);
        });
    }
    initPieceColours() {
        // generating hues fgor pieces
        let lower = 1; let upper = 241;
        let mod = (upper-lower)/(this.piecesCount-1);
        this.hues = [];
        for (let p=0; p<this.piecesCount; p++) { this.hues.push(lower+p*mod); };
    }
    initNewPieces() {
        // NEW PIECES COLOURS
        let hsv = Phaser.Display.Color.HSVColorWheel();
        let maxHue=270;
        hsv = hsv.splice(0,maxHue);

        let height = 160;
        let hMod = 16;
        let pieces = this.piecesCount;
        let pieceHeights = [];

        let div = pieces<=4 ? 2 : 1; // less than 6 pieces? half the height of each piece
        let totalParts = 0;
        for (let p=pieces; p>0; p--) {
            let parts = height/8;
            totalParts+=parts;
            pieceHeights.push({ height: height, parts: parts });
            height-=hMod*div;
        };
        
        let tintInc = maxHue/(totalParts-1)|0;
        let hsvArray = [];
        hsv.forEach((_h,_i)=> {
            _i%tintInc<1 && (hsvArray.push(_h.color));
        });
        hsv = hsvArray;
        hsvArray=null;
        
        let minWidth = 100;
        let maxWidth = 500;
        let wMod = (maxWidth - minWidth)/(pieces-1);
        let x = this.pegXPositions[this.startPeg];
        let y = consts.canvas.height;
        
        for (let p=0; p<pieceHeights.length; p++) {
            let id = pieces-p;
            let key = `piece_${id}`;

            let w = maxWidth-p*wMod;
            let h = pieceHeights[p].height;
            
            let parts = pieceHeights[p].parts;
            let hsvs = hsv.splice(0,parts);
            
            let piece = this.generateNewStylePiece(w, h, hsvs);
            piece.generateTexture(key, w, h);
            piece.clear().destroy();

            // add the new image to the scene
            let image = scene.add.image(x, y, key);
            image.id = id;
            let pegID = this.startPeg+1;
            image.overPeg = pegID;
            image.peg = pegID;
            image.setName(key).setOrigin(0.5,1).setInteractive();
            this.piecesContainer.add(image);
            this.pieces.push(image);
            this.pegsArray[this.startPeg].push(image);
            y-=h;
        };
    }
    generateNewStylePiece(_width,_height,_hsv) {
        _hsv.reverse();
        let graphics = scene.add.graphics();
    
        let partHeight = 8;
        let parts = _height/partHeight;
        let x=0; let y = 0;
    
        for (let i=0; i<parts; i++) {
            graphics.fillStyle(_hsv[i], 1);
            if (!i || i===parts-1) {
                if (!i) {
                    graphics.fillRoundedRect(x, y+4, _width, partHeight*2, partHeight);
                } else {
                    graphics.fillRoundedRect(x, y-partHeight, _width, partHeight*2, partHeight);
                }
                y+=partHeight;
            } else {
                graphics.fillRect(x, y, _width, partHeight);
                y+=partHeight;
            };
        };
        
        return graphics;
    }
    cleanUpPieces() {
        let textures = game.textures.list;
        for (let texture in textures) { texture.startsWith('piece_') && game.textures.remove(texture); };
    }

    createFireworks() {
        let fA = this.fireWorks;
        let depth = consts.depths.sparklers;
        let pegOffset = { x: this.container.x, y: this.container.y };
        this.pegXPositions.forEach( (c)=>{
            let particle = scene.add.particles('flares').setName('particle_' + c).setDepth(depth)
            particle.createEmitter({
                frame: 'white',
                active: true, x: c+pegOffset.x, y: 320,
                speed: { min: 200, max: 400 },
                angle: { min: 250, max: 290 },
                scale: { start: 0.33, end: 0 },
                blendMode: 'SCREEN', lifespan: 600, gravityY: 600
            });
            fA.push(particle);
        });
        this.fireworksDisable();
    }
    /* 
      **************************
      *                        *
      *   INIT FUNCTIONS END   *
      *                        *
      **************************
    */

    
    animatePieceXPosition(_moveToX) {
        // note the speed of the tween here
        // it perferable to be faster than a user can move between pegs
        // its not necessary, as the current tween (if it exists) is killed
        // before generating the new tween. Doing this just keeps the
        // movement feeling consistent, no matter the speed of the player
        let fP = this.floatingPiece;
        this.moveTweenX && this.moveTweenX.remove();
        this.moveTweenX = scene.tweens.add({
            targets: fP,
            x: _moveToX,
            duration: 100
        })
    }
    animatePieceYPosition(_moveToY=null) {
        if (!_moveToY) return `Invalid Y position ${_moveToY}`;
        let piece = this.floatingPiece;
        
        // disable input
        let enableInput = this.enableInput;
        enableInput(false);
        let opts = _moveToY===this.liftY ? [125,''] : [500,'Bounce'];
        // and tween
        this.moveTweenY = scene.tweens.add({
            targets: piece,
            y: _moveToY,
            duration: opts[0],
            ease: opts[1],
            onComplete: enableInput
        });

        return opts[0];
    }

    checkForWin() {
        let puzzle = vars.game.puzzle;
        let startPeg = puzzle.startPeg;

        puzzle.pegsArray.forEach((_a,_i)=> {
            if (_i===startPeg) return;

            let win = _a.length===puzzle.piecesCount ? true : false;

            win && puzzle.win();
        });
    }

    clickPeg(_pegID) {
        if (this.floatingPiece) { // theres a floating piece, test the drop position
            this.drop();
            return;
        };

        // no floating piece yet, check the peg for pieces
        this.lift(_pegID);
    }

    clickPiece(_piece) {
        if (!this.floatingPiece) {
            let piece = _piece;
            // get the peg that this piece is on
            let pegID = piece.peg;
            this.lift(pegID);
            return;
        };

        if (this.floatingPiece) { // theres a floating piece, test the drop position
            this.drop();
            return;
        };
    }

    destroy() {
        this.container.destroy();
        this.piecesContainer.destroy();
    }

    drop() {
        let _piece = this.floatingPiece;
        let pegsA = this.pegsArray;
        let _pieceID = _piece.id;
        let _peg = _piece.overPeg-1;
        if (!pegsA[_peg].length) { // peg is empty
            vars.audio.playSound('dropPiece');
            pegsA[_peg].push(_piece);
            let move = [_piece.peg,_peg+1];
            _piece.peg = _peg+1;
            this.animatePieceYPosition(this.lowY);
            this.floatingPiece=null;
            this.updateMoves(move);
            return true;
        };
    
        let pegs = pegsA[_peg];
        let pLength = pegs.length;
        if (_pieceID<pegs[pLength-1].id) {
            vars.audio.playSound('dropPiece');
            // get the top centre for this piece so we can place the new one on top of it
            let _pieceID = pegs[pLength-1].id;
            let tC = this.getPieceTopCentre(_pieceID);
            pegsA[_peg].push(_piece); // push it onto the peg
            let move = [_piece.peg,_peg+1];
            _piece.peg = _peg+1;
            let waitTime = this.animatePieceYPosition(tC.y); // and animate the actual piece
            this.floatingPiece=null; // reset floatingPiece
            this.updateMoves(move);
            scene.tweens.addCounter({ from: 0, to: 1, duration: waitTime, onComplete: vars.game.puzzle.checkForWin })
            return;
        };
    
    }

    enableInput(_enable=true) {
        let puzzle = vars.game.puzzle;
        _enable && (puzzle.moveTweenY=null); // only the Y tween disables input
        puzzle.inputEnabled = _enable;
    }

    fireworksDisable() {
        this.fireWorks.forEach( (c)=> { c.visible=false; c.active=false; });
        vars.audio.sparklersStart(false);
        this.fireworksVisible=false;
    }

    fireworksEnable() {
        this.fireWorks.forEach( (c)=> { c.visible=true; c.active = true; });
        let aV = vars.audio;
        aV.sparklerSetVolume(); // sets the volume to 1
        aV.sparklersStart(true);
        this.fireworksVisible=true;
    }

    getPegArray(_pegID) {
        return this.pegsArray[_pegID-1];
    }

    getPieceByID(_pieceID) {
        return this.pieces.find(p=>p.id===_pieceID);
    }

    getPieceTopCentre(_pieceID) {
        let piece = this.getPieceByID(_pieceID);
        if (!piece) return false;

        return piece.getTopCenter();
    }

    hoverOverPeg(_pegID) {
        if (!this.floatingPiece) return false;
        
        let pegID = _pegID;
        let moveToX = this.pegXPositions[pegID-1];
        this.floatingPiece.overPeg = pegID;
        this.animatePieceXPosition(moveToX);
    }

    lift(_peg) {
        let pegsA = this.pegsArray;
        _peg--;
        if (!pegsA[_peg] || !pegsA[_peg].length) return 'No pieces on this peg';
    
        let pegs = pegsA[_peg];
        this.floatingPiece = pegs.pop();

        vars.audio.playSound('liftPiece');
        this.animatePieceYPosition(this.liftY);

        // is this the first move? if so, create a new timer
        if (!this.timer) { this.timer = new Timer(); };
    }

    saveGame() {
        let timer = this.timer;
        let piecesCount = this.piecesCount;

        let bestScore = vars.game.checkForBest('score', piecesCount, this.moveCount);
        let bestTime  = vars.game.checkForBest('time', piecesCount, timer.totalTime/1000);

        if (bestScore || bestTime) {
            let lV = vars.localStorage;

            let saveData = {
                movesTaken: this.moveCount,
                startPeg: this.startPeg,
                time: timer.totalTime,
                moves: this.moves
            };

            if (bestScore) { lV.savedGames[piecesCount].score = saveData; };
            if (bestTime)  { lV.savedGames[piecesCount].time  = saveData; };

            lV.saveBests();
            return bestScore && bestTime ? 'BOTH' : bestScore ? 'SCORE' : 'TIME';
        };

        return false;

    }

    showWinScreen() {
        let winScreen = vars.game.winScreen;
        winScreen.show(true);
    }

    update() {
        if (!this.timer) return false;

        this.timer.update();
    }

    updateMoves(_move) {
        this.moveCount++;
        this.moves.push(_move);
        this.movesCountText.setText(`MOVES TAKEN SO FAR: ${this.moveCount}`);
    }

    win() {
        vars.input.enabled=false;
        vars.game.winScreen.generateMiddleString();
        // set the win state, stop the timer and update the timer ui
        this.winState=true;
        this.timer.stop();
        this.timer.updateUI();

        // save the game if weve set any new records (faster time/less moves)
        let newBest = this.saveGame();

        // if new best comes back as "TIME" we show the new best time to the player
        (newBest==='TIME' || newBest==='BOTH') && vars.game.winScreen.addTimeString(this.timer.totalTime/1000);

        // start the sparklers
        this.fireworksEnable();

        let n = this.piecesCount;
        let delay = 0;
        if (Math.pow(2,n)-1===this.moveCount) {
            delay = vars.game.puzzle.perfectScore.show();
        };

        scene.tweens.addCounter({
            from: 0, to: 1, duration: 1500+delay, onComplete: ()=> { vars.audio.sparklerSetVolume(0.5); vars.game.puzzle.perfectScore.show(false); vars.game.puzzle.showWinScreen(); }
        });
    }
    
};