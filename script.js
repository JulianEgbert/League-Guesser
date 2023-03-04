var version;
var champions;
var championNames;
var realChampionNames;
var parsedChampionNames;

let currentChampion;
let currentSkin;
let score = 0;
let highscore = 0;

function getChampionList() {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;
    sendRequest(url, handleChampionList);
}

function handleChampionList(response) {
    champions = response.data;
    championNames = Object.keys(champions);
    
    realChampionNames = Object.values(champions).map(champion => champion.name);
    parsedChampionNames = realChampionNames.map((name) => parseName(name));
    setupSuggestions();
    newChampion();
}

function setupSuggestions() {
    const optionList = document.getElementById("champion-names");
  
    realChampionNames.forEach((champion) => {
        const optionElement = document.createElement("option");
        optionElement.value = champion;
        optionList.appendChild(optionElement);
    });

    const input = document.getElementById("input");
    
    input.addEventListener("input", () => {
        if (input.value.length >= 2) {
            input.setAttribute("list", "champion-names");
        } else {
            input.setAttribute("list", "none");
        }
    });
}

function sendRequest(url, callback, additionalInformation = null) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            const json = JSON.parse(xmlHttp.responseText);
            if (additionalInformation)
                callback(json, additionalInformation);
            else
                callback(json);
        }
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

function getVersion() {
    sendRequest("https://ddragon.leagueoflegends.com/api/versions.json", handleVersionResponse);
}

function handleVersionResponse(response) {
    version = response[0];
    getChampionList();
}

function newChampion() {
    const championCount = championNames.length;
    const randomIndex = random(championCount);
    const champion = champions[championNames[randomIndex]];
    getChampionDetails(champion.id);
}

function getChampionDetails(championId) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${championId}.json`;
    sendRequest(url, handleChampionDetails);
}

function handleChampionDetails(response) {
    const data = response.data;
    const championId = Object.keys(data)[0];
    const champion = data[championId];
    const skins = champion.skins;
    const skinIndex = random(skins.length);
    const randomSkin = skins[skinIndex];
    updateImage(championId, randomSkin.num);
    currentChampion = champion;
    currentSkin = randomSkin;
}

function updateImage(championId, skinId) {
    const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_${skinId}.jpg`;
    document.getElementById("championImage").src = url;
}

function random(max) {
    return Math.floor(Math.random() * max);
}

function checkInput(event) {
    event.preventDefault(); // Prevent page from reloading when form is submitted.
    const input = document.getElementById("input");
    const value = input.value;
    if (!parsedChampionNames.includes(parseName(value))) {
        console.warn("Invalid champion"); // TODO: Give user feedback on his input
        return;
    }
    document.getElementById("input").value = "";
    input.setAttribute("list", "none");
    const correct = evaluateInput(value);
    updateScore(correct, value);
    newChampion();
}

function parseName(name) {
    return name.toLowerCase().replaceAll(/(\.| |\'|\-|\&)/ig, "");
}

function evaluateInput(input) {
    return (parseName(input) == parseName(currentChampion.name));
}

function updateScore(isCorrect, input) {
    if (isCorrect) {
        score++;
        if (score > highscore) {
            highscore = score;
            updateHighscore();
        }
        // Hack to trigger animation
        const element = document.getElementById("game");
        element.classList.remove("animationCorrect");
        element.offsetWidth
        element.classList.add("animationCorrect");
    } else {
        window.alert(`That was incorrect. The champion was '${currentChampion.name}' (you guessed '${input}'). Your score: ${score}`);
        score = 0;
    }
    document.getElementById("score").innerHTML = ("00" + score).slice (-3);
}

function updateHighscore() {
    localStorage.setItem("highscore", highscore);
    document.getElementById("highscore").innerHTML = ("00" + highscore).slice (-3);
}

function loadHighscore() {
    if (!localStorage.getItem("highscore"))
        return;
    highscore = localStorage.getItem("highscore");
    updateHighscore();
}

getVersion();
loadHighscore();
