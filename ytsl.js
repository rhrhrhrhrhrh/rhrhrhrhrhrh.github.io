(function () {
var stlServerUrl = "https://ytsubtitleloader.tk";

var stlStrUnsupported = "Run this script in a YouTube video page. (desktop / mobile - iframe, embed, etc are not supported)",
stlStrSelectVttFile = "Select a file",
stlStrSubtitleLoaded = "Subtitle loaded",
stlStrEnterSubtAddr = "Enter a URL",
stlStrLoad = "Load",
stlStrApply = "Apply",
stlStrEmptyAddrAlert = "Enter a valid URL",
stlStrEnterFontSize = "Change font size",
stlStrEnterFontSizeDialog = "Enter desired font size (Default unit: px)",
stlStrFontSizeChanged = "Font size changed",
stlStrLoading = "Loading...",
stlStrRefresh = "Refresh",
stlStrUnload = "Unload",
stlStrUnloaded = "Subtitle unloaded",
stlStrNoSubt = "No subtitles",
stlStrServErr = "Server error",
stlStrReqTimeout = "Request timed out",
stlStrReqErr = "Request error",
stlStrNotSelected = "Not selected",
stlStrNoSubtLoaded = "No subtitles were loaded",
stlStrInvalidUrl = "Invalid subtitle URL";

var userLang = navigator.language || navigator.userLanguage;
if (userLang.includes("ko")) {
    stlStrUnsupported = "유튜브 동영상 페이지(데스크탑/모바일)에서 실행하세요. (iframe, embed 등 미지원)",
    stlStrSelectVttFile = "파일 선택",
    stlStrSubtitleLoaded = "자막 로드됨",
    stlStrEnterSubtAddr = "주소 입력",
    stlStrLoad = "불러오기",
    stlStrApply = "적용",
    stlStrEmptyAddrAlert = "주소를 입력하세요.",
    stlStrEnterFontSize = "글자 크기 변경",
    stlStrEnterFontSizeDialog = "글자 크기 입력 (기본 단위: px)",
    stlStrFontSizeChanged = "글자 크기 변경됨",
    stlStrLoading = "로딩 중...",
    stlStrRefresh = "새로고침",
    stlStrUnload = "자막 제거",
    stlStrUnloaded = "자막 제거됨",
    stlStrNoSubt = "자막 없음",
    stlStrServErr = "서버 오류",
    stlStrReqTimeout = "요청 시간 초과",
    stlStrReqErr = "요청 오류",
    stlStrNotSelected = "선택 안함",
    stlStrNoSubtLoaded = "로드된 자막이 없습니다.",
    stlStrInvalidUrl = "잘못된 자막 URL";
}

var playerType = "desktop";
var playerContainer = document.getElementsByClassName("ytd-player")[0];
if(!playerContainer) {
    playerContainer = document.getElementsByTagName("ytm-app")[0];
    playerType = "mobile";
    if(!playerContainer) {
        playerContainer = document.getElementsByTagName("iframe")[0];
        playerType = "iframe";
        if(!playerContainer) {
            playerContainer = document.getElementsByTagName("embed")[0];
            playerType = "embed";
        };
        alert(stlStrUnsupported);
        return;
    };
};

var video = document.getElementsByTagName("video")[0];
var timer;
var stlDbSubtitles;

var stlStyle = document.createElement("style");
stlStyle.innerHTML = ".stlLabel { float: left; font-size: 16px; margin-left: 2px; margin-right: 2px; } .stlLink { color: black !important; text-decoration: none !important; } .stlButton { background: none !important; border: none; padding: 0 !important; margin-top: 0 !important; margin-bottom: 0 !important; cursor: pointer; }";
document.head.appendChild(stlStyle);

var videoSubtitleStyle = document.createElement("style");
videoSubtitleStyle.innerHTML = "::cue {  }";
document.head.appendChild(videoSubtitleStyle);

var videoSubtitle = document.createElement("track");
videoSubtitle.label = "YTSubtitleLoader";
videoSubtitle.default = true;

var stlContainer = document.createElement("div");
stlContainer.style.display = "block";
playerContainer.appendChild(stlContainer);

var stlStatus = document.createElement("p");
stlStatus.className = "stlLabel";

var stlLabel = document.createElement("p");
stlLabel.className = "stlLabel";
stlLabel.innerHTML = "<b><a href='" + stlServerUrl + "' class='stlLink' target='_blank'>YTSubtitleLoader</a></b> |";
stlContainer.appendChild(stlLabel);

var stlFileInput = document.createElement("input");
stlFileInput.id = "stlFileInput";
stlFileInput.type = "file";
stlFileInput.accept = ".vtt";
stlFileInput.style.display = "none";
stlFileInput.onchange = function () {
    var reader = new FileReader();
    reader.onload = function () {
        stlShowSubtitle(reader.result, true);
    };
    reader.readAsDataURL(this.files[0]);
};
stlContainer.appendChild(stlFileInput);

var stlFileInputBtn = document.createElement("label");
stlFileInputBtn.textContent = stlStrSelectVttFile;
stlFileInputBtn.htmlFor = "stlFileInput";
stlFileInputBtn.className = "stlLabel";
stlFileInputBtn.style.cursor = "pointer";
stlFileInputBtn.style.float = "left";
stlContainer.appendChild(stlFileInputBtn);

var stlSeparator = document.createElement("p");
stlSeparator.className = "stlLabel";
stlSeparator.innerHTML = "|";
stlContainer.appendChild(stlSeparator);

var stlUrlInputBtn = document.createElement("button");
stlUrlInputBtn.textContent = stlStrEnterSubtAddr;
stlUrlInputBtn.className = "stlLabel stlButton";
stlUrlInputBtn.onclick = function () {
    var str = prompt(stlStrEnterSubtAddr);
    if(!str) {
        showMessage(stlStrEmptyAddrAlert);
        return;
    };
    stlLoadSubtitleFromUrl(str, true);
};
stlContainer.appendChild(stlUrlInputBtn);

var stlSeparator2 = stlSeparator.cloneNode(true);
stlContainer.appendChild(stlSeparator2);

var stlFontSizeInputBtn = document.createElement("button");
stlFontSizeInputBtn.textContent = stlStrEnterFontSize;
stlFontSizeInputBtn.className = "stlLabel stlButton";
stlFontSizeInputBtn.onclick = function () {
    var str = prompt(stlStrEnterFontSizeDialog);
    videoSubtitleStyle.innerHTML = "::cue { font-size: " + (isNaN(str) ? str : str + "px") + "; }";
    showMessage(stlStrFontSizeChanged);
};
stlContainer.appendChild(stlFontSizeInputBtn);

var stlDbLabel = document.createElement("p");
stlDbLabel.className = "stlLabel";
stlDbLabel.innerHTML = "| <a href='" + stlServerUrl + "/db' class='stlLink' target='_blank'>YTSL DB</a>:";
stlContainer.appendChild(stlDbLabel);

var stlDbSelect = document.createElement("select");
stlDbSelect.style.float = "left";
stlDbSelect.disabled = true;
stlDbSelect.onchange = stlLoadSubtitleFromDb;
stlContainer.appendChild(stlDbSelect);

var stlDbSelectPlaceholder = document.createElement("option");
stlDbSelectPlaceholder.text = stlStrLoading;
stlDbSelectPlaceholder.disabled = true;
stlDbSelect.appendChild(stlDbSelectPlaceholder);
stlDbSelect.selectedIndex = 0;

var stlDbRefreshBtn = document.createElement("button");
stlDbRefreshBtn.textContent = stlStrRefresh;
stlDbRefreshBtn.className = "stlLabel stlButton";
stlDbRefreshBtn.onclick = function () {
    stlDbSelect.innerHTML = "";
    stlDbSelectPlaceholder.text = stlStrLoading;
    stlDbSelect.disabled = true;
    stlDbSelect.appendChild(stlDbSelectPlaceholder);
    stlLoadDb();
};
stlContainer.appendChild(stlDbRefreshBtn);

var stlSeparator3 = stlSeparator.cloneNode(true);
stlContainer.appendChild(stlSeparator3);

var stlUnloadBtn = document.createElement("button");
stlUnloadBtn.textContent = stlStrUnload;
stlUnloadBtn.className = "stlLabel stlButton";
stlUnloadBtn.onclick = function () {
    try {
        video.textTracks[video.textTracks.length - 1].mode = "hidden";
    } catch (e) {
        console.log(e);
        showMessage(stlStrNoSubtLoaded);
        return;
    }
    videoSubtitle.remove();
    showMessage(stlStrUnloaded);
    stlDbSelect.selectedIndex = 0;
};
stlContainer.appendChild(stlUnloadBtn);

stlContainer.appendChild(stlStatus);

/* Load Subtitles from YTSubtitleLoader DB */
stlLoadDb();

function stlLoadDb() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ytsubtitleloader.tk/db/" + parseVideoId(), true);
    xhr.timeout = 10000;
    xhr.send();
    xhr.onload = function() {
        if (xhr.status == 200) {
            stlDbSelect.disabled = false;
            stlDbSelectPlaceholder.text = stlStrNotSelected;
            stlDbSubtitles = JSON.parse(xhr.response);
            for(var i = 0; i < stlDbSubtitles.length; i++) {
                stlDbSelect[stlDbSelect.options.length] = new Option(stlDbSubtitles[i].langStr, null, stlDbSubtitles[i].default, stlDbSubtitles[i].default);
            }
            stlLoadSubtitleFromDb();
        } else if (xhr.status == 404) {
            stlDbSelectPlaceholder.text = stlStrNoSubt;
        } else {
            stlDbSelectPlaceholder.text = stlStrServErr;
        };
    };
    xhr.ontimeout = function(e) {
        console.log("YTSubtitleLoader: " + e.message);
        stlDbSelectPlaceholder.text = stlStrReqTimeout;
    };
    xhr.onerror = function(e) {
        console.log("YTSubtitleLoader: " + e.message);
        stlDbSelectPlaceholder.text = stlStrReqErr;
    };
};

function stlLoadSubtitleFromUrl(url, unselectDbSelect) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.timeout = 10000;
    xhr.send();
    xhr.onload = function() {
        if (xhr.status == 200) {
            stlShowSubtitle("data:text/vtt," + encodeURI(xhr.response), unselectDbSelect)
        } else if (xhr.status == 404) {
            showMessage(stlStrInvalidUrl);
        } else {
            showMessage(stlStrServErr);
        };
    };
    xhr.ontimeout = function(e) {
        console.log("YTSubtitleLoader: " + e.message);
        showMessage(stlStrReqTimeout);
    };
    xhr.onerror = function(e) {
        console.log("YTSubtitleLoader: " + e.message);
        showMessage(stlStrReqErr);
    };
};

function showMessage(str) {
    stlStatus.innerHTML = "| " + str;
    console.log("YTSubtitleLoader: " + str);
    clearTimeout(timer);
    timer = setTimeout(function() {
        stlStatus.innerHTML = "";
    }, 5000);
};

function parseVideoId() {
    var video_id = window.location.search.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition);
    }
    return video_id;
}

function stlLoadSubtitleFromDb() {
    stlLoadSubtitleFromUrl(stlDbSubtitles[stlDbSelect.selectedIndex - 1].url, false);
};

function stlShowSubtitle(src, unselectDbSelect) {
    videoSubtitle.src = src;
    video.appendChild(videoSubtitle);
    showMessage(stlStrSubtitleLoaded);
    video.textTracks[video.textTracks.length - 1].mode = "showing";
    if (unselectDbSelect) stlDbSelect.selectedIndex = 0;
};

console.log("YTSubtitleLoader: Initialization complete");
})();
