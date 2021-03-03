// Global variables
let totalCookies = 0;
let growthRate = 1.15;
let clickMultiplier = 1;
let cpsClicks = 0.00;
let buildings = {};
let totalBuildings = 0;
let cps = 0;
let upgrades = [];
let findCps;
let images = {};

window.onload = function() {
    // Semi-global variables
    let totalCookiesLabel = document.getElementById("totalCookiesLabel");
    let cpsLabel = document.getElementById("cpsLabel");
    let bigCookieClickable = document.getElementById("clickable-div-bigCookie");
    let bigCookieAnimationTimer = 1000;

    // Canvas Setup
    let canvas = document.getElementById("cookieCanvas"),
        ctx  = canvas.getContext("2d");
    setupCanvas();
    let anSmallCookies = [];
    let anBigClick = 0;

    // Global function setup
    findCps = function() {
        let r = 0;
        for (let b in buildings) {
            buildings[b].determineCost();
            r += buildings[b].production;
        }
        cps = r;
    }

    function setupCanvas() {
        canvas.style.width='100%';
        canvas.style.height='60%';
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }


    // Buildings Setup
    buildings['cursor'] = new Building(10, 0.1, "Cursor");
    buildings['grandma'] = new Building(100, 1, "Grandma");
    buildings['farm'] = new Building(1000, 10, "Farm");
    buildings['mine'] = new Building(10000, 100, "Mine");

    // Upgrades
    upgradeData.forEach(function(value) {
        upgrades.push(new Upgrade(value.name, value.type, value.tier, value.description))
    })

    // Runs when big cookie is clicked
    function onBigCookieClick() {
        totalCookies += clickMultiplier + (cps * cpsClicks);
    }

    // Runs once every 10 milliseconds
    function gameLoop() {setInterval(function() {
        totalCookiesLabel.innerText = parseInt(totalCookies.toFixed()).toLocaleString() + " cookies";
        if (cps > 0 && cps < 1)
            cpsLabel.innerText = "per second: " + cps.toFixed(1);
        else
            cpsLabel.innerText = "per second: " + parseInt(cps.toFixed()).toLocaleString();
        totalCookies += (cps / 100);

        if (bigCookieAnimationTimer >= 4000)
            anBigClick = 1;
        bigCookieAnimationTimer += 100;

        // Drawing function
        cookieCanvas();
    }, 10)}


    function onWindowResize() {
        setupCanvas();
    }

    function cookieCanvas() {
        // Clear Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Big Cookie
        let img = images["cookie.png"];
        let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        // Click animation
        if (anBigClick <= -1) {
            if (anBigClick >= -1000)
                scale -= rangeConvert(anBigClick, -1, -1000, 0, scale / 10);
            else
                scale -= rangeConvert(-1000, -1, -1000, 0, scale / 10);
            anBigClick -= 100;
        }
        let width = img.width * scale;
        let height = img.height * scale;
        let x = (canvas.width / 2) - (width / 2);
        let y = (canvas.height / 2) - (height / 2);
        ctx.drawImage(img, x, y, width, height);

        let clickableDivBigCookie = document.getElementById("clickable-div-bigCookie");
        clickableDivBigCookie.style.height = width.toString() + "px";
        clickableDivBigCookie.style.width = height.toString() + "px";
        // Centering
        clickableDivBigCookie.style.marginLeft = ((canvas.width - (x + width))).toString() + "px";
        clickableDivBigCookie.style.marginRight = ((canvas.width - (x + width))).toString() + "px";
        clickableDivBigCookie.style.marginTop = ((canvas.height - (y + height))).toString() + "px";
        clickableDivBigCookie.style.marginBottom = ((canvas.height - (y + height))).toString() + "px";

        // Small cookies
        anSmallCookies.forEach(function(el, index) {
            let timeLeft = el['timeLeft'];
            if (timeLeft <= 0) {
                anSmallCookies.splice(index, 1);
            } else {
                el['timeLeft'] = timeLeft - 10;
                let image = images[el['image']];
                let x = el['size'][0];
                let y = el['size'][1];
                let w = el['size'][2];
                let h = el['size'][3];

                ctx.globalAlpha = rangeConvert(timeLeft, el['maxTime'], 0, 1, 0);
                ctx.drawImage(image, x, y, w, h);
                ctx.globalAlpha = 1
            }
        })
    }

    // Convert between number ranges
    function rangeConvert(oldValue, oldMax, oldMin, newMax, newMin) {
        let oldRange = (oldMax - oldMin)
        let newRange = (newMax - newMin)
        return ((((oldValue - oldMin) * newRange) / oldRange) + newMin)
    }


    function drawSmallCookie(x, y) {
        let smallCookieImage = images["smallcookie.png"];
        let rect = canvas.getBoundingClientRect();

        let scale = Math.min(canvas.width / smallCookieImage.width, canvas.height / smallCookieImage.height);
        let width = (canvas.width * scale) / 6;
        let height = (canvas.height * scale) / 6;

        return([(x - rect.left) - (width / 2), (y - rect.top) - (height / 2), width, height]);
    }


    function onDocumentClick(event) {
        if (event.target === bigCookieClickable) {
            onBigCookieClick();
            let time = 1000;
            let x = event.clientX;
            let y = event.clientY;
            x += Math.floor((Math.random() * 20)) + 1;
            y += Math.floor((Math.random() * 20)) + 1;
            anSmallCookies.push({'timeLeft': time, 'maxTime': time, 'image': 'smallcookie.png', 'size': drawSmallCookie(x, y)});
        }
    }

    function onDocumentMouseDown(event) {
        if (event.target === bigCookieClickable) {
            anBigClick = -1;
        }
    }
    function onDocumentMouseUp(event) {
        if (event.target === bigCookieClickable && bigCookieAnimationTimer >= 1000) {
            anBigClick = 1;
            bigCookieAnimationTimer = 0;
        }
    }

    function loadImages(callback) {
        let loadedImageCount = 0;

        for (let i = 0; i < imageData.length; i++){
            let img = new Image();
            img.onload = imageLoaded;
            img.src = "images/" + imageData[i];
            images[imageData[i]] = img;
        }

        function imageLoaded() {
            loadedImageCount++;
            if (loadedImageCount >= imageData.length) {
                callback();
            }
        }
    }


    window.onresize = onWindowResize;
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('mouseup', onDocumentMouseUp);
    loadImages(gameLoop);
}

class Building {
    name;
    baseCost;
    baseProduction;
    currentCost;
    buyButton;
    ownedButton;
    amount;
    production;
    multiplier = 1;

    constructor(baseCost, baseProduction, name) {
        this.baseCost = baseCost;
        this.currentCost = baseCost;
        this.buyButton = document.getElementById("buy" + name);
        this.ownedButton = document.getElementById("owned" + name);
        this.name = name;
        this.amount = 0;
        this.baseProduction = baseProduction;

        this.buyButton.onclick = () => this.buyBuilding();
        this.buyBuilding()

    }

    buyBuilding() {
        let currentCost = this.currentCost;
        let amount = this.amount;
        if (totalCookies >= currentCost) {
            totalCookies -= currentCost;
            amount++;
            totalBuildings++;
        }
        this.amount = amount;
        this.determineCost();
        findCps();
    }

    determineCost() {
        this.currentCost = this.baseCost * (growthRate ** this.amount); // Formula for determining cost
        if (this.name === "Cursor")
            this.production = (clickMultiplier + (cps * cpsClicks)) / 10
        this.production = (this.baseProduction * this.amount) * this.multiplier; // Formula for determining production
        this.buyButton.innerText = `Buy ${this.name}: ${parseInt(this.currentCost.toFixed()).toLocaleString()} Cookies`;
        this.ownedButton.innerText = this.amount.toString();
    }
}

class Upgrade {
    cost;
    name;
    type;
    tier;
    htmlTag;
    description;
    bought = false;

    constructor(name, type, tier, description) {
        this.name = name;
        this.type = type;
        this.tier = tier;
        this.description = description;

        switch (this.type){
            case 'cursor': {
                this.cost = (buildings['cursor'].baseCost * 10) * (growthRate ** tier);
                break;
            }
            case 'mouse': {
                this.cost = 50000 * (growthRate ** (tier * 100));
                break;
            }
            case 'fingers': {
                // The mouse and cursors gain +0.1 cookies for every non-cursor object owned
                break;
            }
            case 'specialGrandmas': {
                // The mouse and cursors gain +0.1 cookies for every non-cursor object owned
                break;
            }
            default: {
                this.cost = (buildings[type].baseCost * 10) * (growthRate ** tier);
            }
        }
        this.makeHtml();
    }

    makeHtml() {
        let upgrade = document.createElement("button");
        let upgradeRows = document.getElementById("upgradeRows");
        upgrade.classList.add("upgradeButton");
        upgrade.innerText = this.name;
        upgrade.onclick = () => this.buyUpgrade();
        this.htmlTag = upgrade;
        upgradeRows.append(upgrade);
    }

    deleteHtml() {
        this.htmlTag.remove();
    }

    buyUpgrade() {
        if (this.bought || totalCookies < this.cost)
            return;
        totalCookies -= this.cost;
        if (this.type === 'cursor') {
            clickMultiplier *= 2;
        } else if (this.type === 'mouse') {
            cpsClicks += 0.01;
        } else if (this.type === 'fingers') {
        } else if (this.type === 'specialGrandmas') {
        } else {
            buildings[this.type].multiplier *= 2;
        }
        console.log("bought!")
        this.bought = true;
        this.deleteHtml();
        findCps();
    }
}
