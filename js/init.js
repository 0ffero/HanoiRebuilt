vars.DEBUG && console.log('Initialising...');
var config = {
    title: vars.name,
    type: Phaser.CANVAS,
    version: vars.version,
    banner: false,

    backgroundColor: '#999999',
    disableContextMenu: true,

    height: consts.canvas.height,
    width: consts.canvas.width,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: consts.canvas.width,
        height: consts.canvas.height,
    },

    scene: {
        preload: preload,
        create: create,
        update: update,
        pack: {
            files: [
                { type: 'image', key: 'loadingScreen', url: 'assets/images/loadingScreen.png' }
            ]
        }
    }
};

var clamp = Phaser.Math.Clamp;
var game = new Phaser.Game(config);

/*
█████ ████  █████ █      ███  █████ ████  
█   █ █   █ █     █     █   █ █   █ █   █ 
█████ ████  ████  █     █   █ █████ █   █ 
█     █   █ █     █     █   █ █   █ █   █ 
█     █   █ █████ █████  ███  █   █ ████  
*/
function preload() {
    scene = this;
    let cC = consts.canvas;
    let lS = vars.phaserObjects.loadingScreen = scene.add.image(cC.cX,cC.cY,'loadingScreen').setDepth(consts.depths.loadingScreen);
    lS.setScale(cC.width/lS.width);
    vars.init('PRELOAD');
}



/*
█████ ████  █████ █████ █████ █████ 
█     █   █ █     █   █   █   █     
█     ████  ████  █████   █   ████  
█     █   █ █     █   █   █   █     
█████ █   █ █████ █   █   █   █████ 
*/
function create() {
    vars.init('CREATE'); // build the phaser objects, scenes etc
    vars.init('STARTAPP'); // start the app

    // fade out the loading screen
    let pO = vars.phaserObjects;
    let lS = pO.loadingScreen;
    scene.tweens.add({ targets: lS, delay: 1000, duration: 500, alpha: 0, onComplete: ()=> { lS.destroy(); vars.input.enabled=true; delete(pO.loadingScreen); } });
}