// Global variables
let totalCookies = 0;
let growthRate = 1.15;
let clickMultiplier = 1;
let cpsClicks = 0.00;
let cpc = 0;
let buildings = {};
let totalBuildings = 0;
let cps = 0;
let upgrades = [];
let findCps;
let images = {};

window.onload = function() {
    // Semi-global variables
    let bigCookieClickable = document.getElementById("clickable-div-bigCookie");
    let newsDiv = document.getElementById("newsDiv");
    let newsTimer = 10000;
    let currTooltip;

    // Canvas Setup
    let canvas;
    let ctx;
    let rect;
    let textLabelsSize;
    let anSmallCookies = [{'timeLeft': 0, 'maxTime': 0, 'image': 'smallcookie.png', 'size': [0, 0, 0, 0]}];
    let anBigClick = 0;
    let anBigHover = false;

    // Tooltip canvas setup
    let ttcanvas;
    let ttctx;
    let ttrect;

    // News setup
    newsDiv.onclick = function() {
        generateNews();
    }

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
        // Tooltip canvas
        ttcanvas = document.getElementById("tooltipCanvas");
        ttctx = ttcanvas.getContext("2d");
        ttrect = ttcanvas.getBoundingClientRect();
        ttcanvas.style.width ='100%';
        ttcanvas.style.height='99%';
        ttcanvas.width = ttcanvas.offsetWidth;
        ttcanvas.height = ttcanvas.offsetHeight;
        let scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
        ttcanvas.width = Math.floor(ttcanvas.width * scale);
        ttcanvas.height = Math.floor(ttcanvas.height * scale);
        ttctx.scale(scale, scale);
    }


    // Buildings Setup

    buildingsData.forEach(function(el) {
        buildings[el['name'].toLowerCase()] = new Building(el['baseCost'], el['baseProduction'], el['name'], el['description']);
    })

    // Upgrades
    upgradeData.forEach(function(value) {
        upgrades.push(new Upgrade(value.name, value.type, value.tier, value.description))
    })

    // Runs when big cookie is clicked
    function onBigCookieClick(clientX, clientY) {
        cpc = clickMultiplier + (cps * cpsClicks);
        totalCookies += cpc;
        let time = 1000;
        let x = clientX;
        let y = clientY;
        x += getRandomInt(-1 * window.innerWidth * 0.005, window.innerWidth * 0.005);
        y += getRandomInt(-1 * window.innerWidth * 0.005, window.innerWidth * 0.005);
        anSmallCookies.push({'timeLeft': time, 'maxTime': time, 'image': 'smallcookie.png', 'size': drawSmallCookie(x, y)})
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
        ttctx.clearRect(0, 0, ttcanvas.width, ttcanvas.height);
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
        scale /= 1.45;

        let yOffset = 0;

        if(anBigHover) {
            scale *= 1.04;
            yOffset -= scale * 30;
        }

        // Click animation
        if (anBigClick <= -1) {
            let scaleMinus;
            if (anBigClick >= -1000)
                scaleMinus = rangeConvert(anBigClick, -1, -1000, 0, scale / 10);
            else
                scaleMinus = rangeConvert(-1000, -1, -1000, 0, scale / 10);
            anBigClick -= 100;
            scale -= scaleMinus;
            yOffset += scaleMinus * 900;
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
            // Click bonus
            ctx.fillStyle = "white";

            ctx.font = "20px 'Kavoon'"
            let numEarned = "+" + cpc.toLocaleString();
            ctx.fillText(numEarned, x + w + window.innerWidth * 0.005, y + h / 2);


            ctx.globalAlpha = 1;

            if (timeLeft <= 0)
                anSmallCookies.splice(Math.abs(c - anSmallCookies.length), 1);
            c--;
        }
        // Tooltip
        if (currTooltip) {
            let upgrade = currTooltip['upgrade']

            if (upgrade instanceof Building) {
                let w = ttcanvas.width * 0.4;
                let x = ttcanvas.width - w - 1;
                let y = currTooltip['y'] - ttrect.top - 20;
                let marg = 15;

                // Measure text size beforehand
                let nameSizeMeasure = ttctx.measureText(upgrade.name);
                let nameSize = nameSizeMeasure.actualBoundingBoxAscent;
                let ownedText = "[Owned: " + upgrade.amount + "]";
                let ownedSizeMeasure = ttctx.measureText(ownedText);
                let ownedSize = ownedSizeMeasure.actualBoundingBoxAscent;
                let descSizeMeasure = ttctx.measureText(upgrade.description);
                let descSize = descSizeMeasure.actualBoundingBoxAscent;

                // Tooltip box
                drawBorder(x, y, w, nameSize + ownedSize + descSize + marg * 4, 1)
                ttctx.fillStyle = 'saddlebrown';
                ttctx.fillRect(x, y, w, nameSize + ownedSize + descSize + marg * 4)

                // Name
                ttctx.fillStyle = 'white';
                ttctx.font = "20px 'Open Sans'"
                nameSize += marg;
                ttctx.fillText(upgrade.name, x + marg, y + nameSize);

                // Owned
                ttctx.fillStyle = 'lightgray';
                ttctx.font = "15px 'Open Sans'"
                nameSize += marg;

                ttctx.fillText(ownedText, x + marg, y + nameSize + ownedSize);

                // Description
                ttctx.fillStyle = 'gray';
                ttctx.font = "15px 'Open Sans'"
                nameSize += marg;

                ttctx.fillText(upgrade.description, x + marg, y + nameSize + ownedSize + descSize);
            } else if (upgrade instanceof Upgrade) {
                let w = ttcanvas.width * 0.4;
                let x = ttcanvas.width - w - 1;
                let y = 1;
                let marg = 15;

                // Measure text size beforehand
                let nameSizeMeasure = ttctx.measureText(upgrade.name);
                let nameSize = nameSizeMeasure.actualBoundingBoxAscent;
                let ownedSizeMeasure = ttctx.measureText("[Upgrade]");
                let ownedSize = ownedSizeMeasure.actualBoundingBoxAscent;
                let infoSizeMeasure = ttctx.measureText(upgrade.info);
                let infoSize = infoSizeMeasure.actualBoundingBoxAscent
                let descSizeMeasure = ttctx.measureText('“' + upgrade.description + '”');
                let descSize = descSizeMeasure.actualBoundingBoxAscent

                // Draw box/border
                drawBorder(x, y, w, nameSize + ownedSize + infoSize + descSize + marg * 5, 1)
                ttctx.fillStyle = 'saddlebrown';
                ttctx.fillRect(x, y, w, nameSize + ownedSize + infoSize + descSize + marg * 5)

                // Name
                ttctx.fillStyle = 'white';
                ttctx.font = "20px 'Open Sans'";
                nameSize += marg;
                ttctx.fillText(upgrade.name, x + marg, y + nameSize);

                // Cost
                ttctx.fillStyle = 'gold';
                ttctx.font = "20px 'Open Sans'"
                let costSizeMeasure = ttctx.measureText("$" + parseInt(upgrade.cost.toFixed()).toLocaleString());
                let costSize = costSizeMeasure.actualBoundingBoxRight;
                ttctx.fillText("$" + parseInt(upgrade.cost.toFixed()).toLocaleString(), x + w - costSize - 10, y + nameSize);

                // Owned
                ttctx.fillStyle = 'lightgray';
                ttctx.font = "15px 'Open Sans'"
                nameSize += marg;

                ttctx.fillText("[Upgrade]", x + marg, y + nameSize + ownedSize);

                // Info
                ttctx.fillStyle = 'navajowhite';
                ttctx.font = "15px 'Open Sans'"
                nameSize += marg;

                ttctx.fillText(upgrade.info, x + marg, y + nameSize + ownedSize + infoSize);

                // Description
                ttctx.fillStyle = 'gray';
                ttctx.font = "15px 'Open Sans'"
                let descWidth = descSizeMeasure.actualBoundingBoxRight;
                nameSize += marg;

                ttctx.fillText('“' + upgrade.description + '”', x + w - descWidth - 10, y + nameSize + ownedSize + infoSize + descSize);
            }
        }
    }

    // Draw border around tooltips
    function drawBorder(xPos, yPos, width, height, thickness = 1) {
        ttctx.fillStyle = 'white';
        ttctx.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
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
        scale /= 15;
        let width = img.width * scale;
        let height = img.height * scale;

        return([x - rect.left - (width / 2), y - rect.top - (height / 2), width, height]);
    }


    function onDocumentClick(event) {
        if (event.target === bigCookieClickable) {
            onBigCookieClick(event.clientX, event.clientY);
        }
    }

    function onDocumentHover(event) {
        let target = event.target;
        anBigHover = target === bigCookieClickable;
        if (target.className !== "buyBuilding" && target.className !== "upgradeButton") {
            for (let depth = 0; depth < 2; depth++) {
                target = target.parentElement;
                if (target.className === "buyBuilding" || target.className === "upgradeButton") {
                    break;
                }
            }
        }
        if (target.className === "buyBuilding") {
            let b = buildings[target.id.substr(3).toLowerCase()];
            if (b === currTooltip)
                return;
            currTooltip = {"x": event.clientX, "y": event.clientY, "upgrade": b};
        } else if (target.className === "upgradeButton") {
            let b = upgrades[parseInt(target.id.substr(7))];
            if (b === currTooltip)
                return;
            currTooltip = {"x": event.clientX, "upgrade": b};
        }
    }

    function onDocumentMouseLeave(event) {
        let target = event.target;
        if (target.className === "buyBuilding" || target.className === "upgradeButton") {
            currTooltip = null;
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
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateNews() {
        const newsLabel = document.getElementById("newsText");
        let news = newsData[Math.floor(Math.random() * newsData.length)];
        while (news === newsLabel.innerText)
            news = newsData[Math.floor(Math.random() * newsData.length)];
        newsLabel.innerText = news;
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
    document.addEventListener('mouseover', onDocumentHover);
    document.addEventListener('mouseout', onDocumentMouseLeave);
    document.addEventListener('mousemove', onDocumentHover);
    loadImages(gameLoop);
    setupCanvas();
    cookieCanvas();
    setupCanvas();
}

class Building {
    name;
    description;
    baseCost;
    baseProduction;
    currentCost;
    buyButton;
    priceButton;
    ownedButton;
    amount;
    production;
    multiplier = 1;

    constructor(baseCost, baseProduction, name, description) {
        this.baseCost = baseCost;
        this.currentCost = baseCost;
        this.buyButton = document.getElementById("buy" + name);
        this.priceButton = document.getElementById("price" + name);
        this.ownedButton = document.getElementById("owned" + name);
        this.name = name;
        this.description = description;
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
        this.priceButton.innerText = "$ " + this.currentCost.toLocaleString();
        this.ownedButton.innerText = this.amount.toLocaleString();
    }
}

class Upgrade {
    cost;
    name;
    type;
    tier;
    htmlTag;
    description;
    uid;
    info;
    bought = false;

    constructor(name, type, tier, description) {
        this.name = name;
        this.type = type;
        this.tier = tier;
        this.description = description;
        this.uid = upgrades.length;

        switch (this.type){
            case 'cursor': {
                this.cost = (buildings['cursor'].baseCost * 10) * (growthRate ** tier);
                this.info = "The mouse and cursors are twice as efficient."
                break;
            }
            case 'mouse': {
                this.cost = 50000 * (growthRate ** (tier * 100));
                this.info = "Clicking gains 1% of your cps."
                break;
            }
            case 'fingers': {
                break;
            }
            case 'specialGrandmas': {
                break;
            }
            default: {
                this.cost = (buildings[type].baseCost * 10) * (growthRate ** tier);
                this.info = this.type.charAt(0).toUpperCase() + this.type.slice(1) + "s are twice as efficient."
            }
        }
        this.makeHtml();
    }

    makeHtml() {
        let upgrade = document.createElement("button");
        let upgradeRows = document.getElementById("upgradeRows");
        upgrade.classList.add("upgradeButton");
        upgrade.id = "upgrade" + this.uid;
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
        this.bought = true;
        this.deleteHtml();
        findCps();
    }
}
