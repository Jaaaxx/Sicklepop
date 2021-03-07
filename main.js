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
    let bigCookieClickable = document.getElementById("clickable-div-bigCookie");
    let newsTimer = 10000;

    // Canvas Setup
    let canvas;
    let ctx;
    let rect;
    let textLabelsSize;
    setupCanvas();
    let anSmallCookies = [{'timeLeft': 0, 'maxTime': 0, 'image': 'smallcookie.png', 'size': [0, 0, 0, 0]}];
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
        canvas = document.getElementById("cookieCanvas");
        ctx  = canvas.getContext("2d");
        rect = canvas.getBoundingClientRect();
        // Make it visually fill the positioned parent
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Text Labels Setup
        ctx.font = "40px 'Kavoon'"
        let totalCookiesString = parseInt(totalCookies.toFixed()).toLocaleString() + " cookies";
        let thmTCS = ctx.measureText(totalCookiesString);

        ctx.font = "26px 'Kavoon'"
        let cpsString = "per second: " + cps.toFixed(1)
        let thmCPS = ctx.measureText(cpsString);

        // Get height of text for spacing
        textLabelsSize = thmTCS.actualBoundingBoxAscent + thmTCS.actualBoundingBoxDescent +
            thmCPS.actualBoundingBoxAscent + thmCPS.actualBoundingBoxDescent;
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
        totalCookies += (cps / 100);
        newsTimer += 10;
        if (newsTimer >= 10000) {
            newsTimer = 0;
            generateNews();
        }
        // Drawing function
        cookieCanvas();
    }, 10)}


    function onWindowResize() {
        setupCanvas();
    }

    function cookieCanvas() {
        // Clear Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Cookies Text
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        ctx.font = "40px 'Kavoon'"
        let totalCookiesString = parseInt(totalCookies.toFixed()).toLocaleString() + " cookies";
        ctx.fillText(totalCookiesString, canvas.width / 2, rect.top + canvas.height * 0.01);

        ctx.font = "26px 'Kavoon'"
        let cpsString = (cps < 10 && cps !== 0) ? "per second: " + cps.toFixed(1) : "per second: " + cps.toFixed(0);
        ctx.fillText(cpsString, canvas.width / 2, rect.top + canvas.height * 0.01 + textLabelsSize * 1.25);

        // Big Cookie
        let img = images["cookie.png"];
        let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        scale /= 1.5;

        let yOffset = 0;

        // Click animation
        if (anBigClick <= -1) {
            let scaleMinus;
            if (anBigClick >= -1000)
                scaleMinus = rangeConvert(anBigClick, -1, -1000, 0, scale / 10);
            else
                scaleMinus = rangeConvert(-1000, -1, -1000, 0, scale / 10);
            anBigClick -= 100;
            scale -= scaleMinus;
            yOffset = scaleMinus * 1000;
        }
        let width = img.width * scale;
        let height = img.height * scale;

        let bcMargin = (canvas.height * 0.08) + yOffset;

        let x = (canvas.width / 2) - (width / 2);
        let y = textLabelsSize + rect.top + bcMargin;
        ctx.drawImage(img, x, y, width, height);

        let clickableDivBigCookie = document.getElementById("clickable-div-bigCookie");
        clickableDivBigCookie.style.height = height.toString() + "px";
        clickableDivBigCookie.style.width = width.toString() + "px";
        // Centering
        clickableDivBigCookie.style.marginLeft = ((canvas.width - (x + width))).toString() + "px";
        clickableDivBigCookie.style.marginRight = ((canvas.width - (x + width))).toString() + "px";
        clickableDivBigCookie.style.marginTop = (rect.top + textLabelsSize + bcMargin).toString() + "px";
        clickableDivBigCookie.style.marginBottom = (canvas.height - (height + rect.top + textLabelsSize + bcMargin)).toString() + "px";

        // Small cookies
        let c = anSmallCookies.length - 1;

        while(anSmallCookies[c] && c > 0) {
            let el = anSmallCookies[Math.abs(c - anSmallCookies.length)];
            let timeLeft = el['timeLeft'];

            el['timeLeft'] = timeLeft - 10;
            let image = images[el['image']];
            let x = el['size'][0];
            let y = el['size'][1];
            let w = el['size'][2];
            let h = el['size'][3];

            ctx.globalAlpha = rangeConvert(timeLeft, el['maxTime'], 0, 1, 0);
            ctx.drawImage(image, x, y, w, h);
            ctx.globalAlpha = 1;

            if (timeLeft <= 0)
                anSmallCookies.splice(Math.abs(c - anSmallCookies.length), 1);
            c--;
        }
    }

    // Convert between number ranges
    function rangeConvert(oldValue, oldMax, oldMin, newMax, newMin) {
        let oldRange = (oldMax - oldMin)
        let newRange = (newMax - newMin)
        return ((((oldValue - oldMin) * newRange) / oldRange) + newMin)
    }


    function drawSmallCookie(x, y) {
        let img = images["smallcookie.png"];

        let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        scale /= 8;
        let width = img.width * scale;
        let height = img.height * scale;

        return([x - width * 1.25, y - rect.top - height / 2, width, height]);
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
        if (event.target === bigCookieClickable) {
            anBigClick = 1;
        }
    }

    function generateNews() {
        const newsLabel = document.getElementById("newsText");
        newsLabel.innerText = newsData[Math.floor(Math.random() * newsData.length)];
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
        this.currentCost = parseInt((this.baseCost * (growthRate ** this.amount)).toFixed()); // Formula for determining cost
        if (this.name === "Cursor")
            this.production = (clickMultiplier + (cps * cpsClicks)) / 10;
        this.production = (this.baseProduction * this.amount) * this.multiplier; // Formula for determining production
        this.buyButton.innerText = `Buy ${this.name}: ${this.currentCost.toLocaleString()} Cookies`;
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
