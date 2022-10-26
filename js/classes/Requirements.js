let Requirements = class {
    constructor(_defaults) {
        // the browser list
        this.browserList = {
            chrome : { valid: true },
            edge: { valid: true },
            firefox: { valid: true },
            opera: { valid: true }
        };
        // update the browser list
        if (_defaults) {
            _defaults.chrome && (this.browserList.chrome = _defaults.chrome);
            _defaults.edge &&  (this.browserList.edge = _defaults.edge);
            _defaults.firefox && (this.browserList.firefox = _defaults.firefox);
            _defaults.opera && (this.browserList.opera = _defaults.opera);
        };
        this.colours = { good: '#4dff4d', bad: '#ff0000' };

        this.init();
    }

    init() {
        let cC = consts.canvas;
        let font = { ...vars.fonts.default, ...{ fontSize: '48px' } };
        this.container = scene.containers.requirements = scene.add.container().setName('requirements').setDepth(consts.depths.requirements);
        
        let bg = scene.add.image(cC.cX, cC.cY, 'blackpixel').setScale(cC.width, cC.height).setName('requirements').setInteractive();
        this.container.add(bg);

        let xMod = cC.width/(Object.keys(this.browserList).length+1);
        let x = xMod;
        let xInc = xMod;
        let y = cC.height * 0.33;
        for (let _b in this.browserList) {
            let browser = this.browserList[_b];
            let browserIcon = scene.add.image(x,y,'ui',_b).setName(`rec_browser_icon`).setInteractive();
            browser.reason && (browserIcon.info = browser.reason);
            let good = browser.valid;

            let colour = good ? this.colours.good : this.colours.bad;
            let msg = good ? 'RECOMMENDED' : 'NOT RECOMMENDED';
            let recommendedText = scene.add.text(x, y+200, msg, font).setColor(colour).setOrigin(0.5);
            if (!good) {
                recommendedText.setAlpha(0.25);
                browserIcon.setAlpha(0.25);
            };
            this.container.add([browserIcon,recommendedText]);
            x+=xInc;
        };

        let smallFont = { ...font, ...{ fontSize: '32px'} };
        y = cC.height*0.75;
        this.moreinfo = scene.add.text(cC.cX, y,'', smallFont).setOrigin(0.5).setLineSpacing(20).setVisible(false);
        this.container.add(this.moreinfo);

        y = cC.height*0.9;
        let cTC = this.clickToContinue = scene.add.text(cC.cX, y, 'Click anywhere to continue', font).setOrigin(0.5).setAlpha(0);
        this.container.add(cTC);

        scene.tweens.addCounter({
            from: 0, to: 1, duration: 5000,
            onComplete: ()=> {
                if (vars.UI.requirements && vars.UI.requirements.container) {
                    scene.tweens.add({ targets: cTC, alpha: 1, duration: 500 });
                };
            }
        });
    }

    destroy() {
        this.container.destroy(true);
    }

    hideMoreInfo() {
        this.moreinfo.setVisible(false);
    }

    showMoreInfo(_gameObject) {
        !this.moreinfo.visible && this.moreinfo.setVisible(true);
        let info = _gameObject.info;
        this.moreinfo.setText(info);
    }
};