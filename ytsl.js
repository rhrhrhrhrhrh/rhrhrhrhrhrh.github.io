// Define strings
var stlServerUrl = "https://ytsubtitleloader.tk",
    stlStrUnsupported = "Run this script in a YouTube video page. (desktop / mobile - iframe, embed, etc are not supported)",
    stlStrSelectVttFile = "Select a file",
    stlStrSubtitleLoaded = "Subtitle loaded",
    stlStrEnterSubtAddr = "Enter URL",
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
    stlStrNoSubtLoaded = "No subtitle was loaded",
    stlStrInvalidUrl = "Invalid subtitle URL",
    stlStrAddSubt = "Add subtitle",
    stlStrInvalidSubtFormat = "Invalid subtitle format",
    stlStrCancel = "Cancel",
    stlStrCanceled = "Canceled",
    stlStrConfirmJs = "Do you want this subtitle to run JavaScript?\nThis allows the text to be styled, but it also poses security risks.",
    stlStrSecondJsAlert = "JavaScripted subtitle was once loaded.\nTo use another JavaScripted subtitle properly, refresh the page.";

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
        stlStrInvalidUrl = "잘못된 자막 URL",
        stlStrAddSubt = "자막 추가",
        stlStrInvalidSubtFormat = "올바르지 않은 자막 형식",
        stlStrCancel = "취소",
        stlStrCanceled = "취소됨",
        stlStrConfirmJs = "이 자막이 자바스크립트를 실행하도록 허용하시겠습니까?\n이는 텍스트에 스타일을 적용할 수 있게 해주지만, 보안 문제를 야기할 수 있습니다.",
        stlStrSecondJsAlert = "자바스크립트 사용 자막이 한번 로드되었습니다.\n다른 자바스크립트 사용 자막을 문제 없이 사용하려면, 페이지를 새로고침 하십시오.";
}

var videoSubtitle = document.createElement("track");
videoSubtitle.label = "YTSubtitleLoader";
videoSubtitle.default = true;

var stlMessage = document.createElement("p"), stlMessageTimer;
var video = document.getElementsByTagName("video")[0];
var stlDbSelect = document.createElement("select");
var stlDbSelectPrevSelect = 0;
var stlRanJsSubtOnce = false;
var videoSubtitleStyle = document.createElement("style");
videoSubtitleStyle.innerHTML = "::cue {  }";

stlInitUi();
console.log("YTSubtitleLoader: Initialization complete");

function stlInitUi() {
    var playerContainer = document.getElementsByClassName("ytd-player")[0];
    var playerType = "desktop";
    if (!playerContainer) {
        playerContainer = document.getElementsByTagName("ytm-app")[0];
        playerType = "mobile";
        if (!playerContainer) {
            playerContainer = document.getElementsByTagName("iframe")[0];
            playerType = "iframe";
            if (!playerContainer) {
                playerContainer = document.getElementsByTagName("embed")[0];
                playerType = "embed";
            };
            alert(stlStrUnsupported);
            return;
        };
    };

    var stlDbSubtitles;

    var stlStyle = document.createElement("style");
    stlStyle.innerHTML = '.stlLabel { float: left; font-size: 16px; margin-left: 2px; margin-right: 2px; } .stlLink { color: black !important; text-decoration: none !important; } .stlButton { background: none !important; border: none; padding: 0 !important; margin-top: 0 !important; margin-bottom: 0 !important; cursor: pointer; } ::cue { display: inline-block; white-space: pre-wrap; background: rgba(8, 8, 8, 0.75) none repeat scroll 0% 0%; font-size: 33.0222px; color: #ffffff; fill: #ffffff; font-family: "YouTube Noto", Roboto, "Arial Unicode Ms", Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif; }';
    if (userLang.includes("ko")) {
        stlStyle.innerHTML += ".stlLabelEngOnly { margin-top: 1px; }";
    }
    document.head.appendChild(stlStyle);

    var videoSubtitleStyleForFontSize = document.createElement("style");
    videoSubtitleStyleForFontSize.innerHTML = "::cue {  }";
    document.head.appendChild(videoSubtitleStyleForFontSize);

    document.head.appendChild(videoSubtitleStyle);

    var stlContainer = document.createElement("div");
    stlContainer.style.display = "block";
    playerContainer.appendChild(stlContainer);

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
            if (reader.result.includes("WEBVTT")) {
                stlShowSubtitle("data:text/vtt," + encodeURI(reader.result.split("YTSLJS")[0]), true);
                if (typeof reader.result.split("YTSLJS")[1] !== 'undefined') {
                    if (stlRanJsSubtOnce) alert(stlStrSecondJsAlert);
                    if (confirm(stlStrConfirmJs)) {
                        eval(reader.result.split("YTSLJS")[1]);
                        stlRanJsSubtOnce = true;
                    }
                } else {
                    setVideoSubtitleStyle("");
                }
            } else {
                stlShowMessage(stlStrInvalidSubtFormat);
            }
        };
        reader.readAsText(this.files[0]);
    }
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
        if (!str) {
            if (str == "") stlShowMessage(stlStrEmptyAddrAlert);
            return;
        };
        if (!str.includes("http://") && !str.includes("https://")) str = "https://ytsubtitleloader.tk/db/" + parseVideoId() + "/" + str;
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
        if (str == null) return;
        videoSubtitleStyleForFontSize.innerHTML = "::cue { font-size: " + (isNaN(str) ? str : str + "px") + "; }";
        stlShowMessage(stlStrFontSizeChanged);
    };
    stlContainer.appendChild(stlFontSizeInputBtn);

    var stlDbLabel = document.createElement("p");
    stlDbLabel.className = "stlLabel stlLabelEngOnly";
    stlDbLabel.innerHTML = "| <a href='" + stlServerUrl + "/db' class='stlLink' target='_blank'>YTSL DB</a>:";
    stlContainer.appendChild(stlDbLabel);

    stlDbSelect.style.float = "left";
    stlDbSelect.disabled = true;
    stlDbSelect.onchange = function () {
        if (stlDbSelect.selectedIndex + 1 == stlDbSelect.length) {
            window.open("https://ytsubtitleloader.tk/db?video=" + parseVideoId(), "_blank");
            stlDbSelect.selectedIndex = stlDbSelectPrevSelect;
        } else {
            stlLoadSubtitleFromDb();
        }
    };
    stlContainer.appendChild(stlDbSelect);

    var stlDbSelectPlaceholder = document.createElement("option");
    stlDbSelectPlaceholder.text = stlStrLoading;
    stlDbSelectPlaceholder.disabled = true;
    stlDbSelect.appendChild(stlDbSelectPlaceholder);
    stlDbSelect.selectedIndex = 0;

    var stlDbSelectAddBtn = document.createElement("option");
    stlDbSelectAddBtn.text = stlStrAddSubt;

    var stlDbRefreshBtn = document.createElement("button");
    stlDbRefreshBtn.textContent = stlStrRefresh;
    stlDbRefreshBtn.className = "stlLabel stlButton";
    stlDbRefreshBtn.onclick = stlDbRefresh;
    stlContainer.appendChild(stlDbRefreshBtn);

    var stlSeparator3 = stlSeparator.cloneNode(true);
    stlContainer.appendChild(stlSeparator3);

    var stlUnloadBtn = document.createElement("button");
    stlUnloadBtn.textContent = stlStrUnload;
    stlUnloadBtn.className = "stlLabel stlButton";
    stlUnloadBtn.onclick = function () {
        if (!isSafari()) {
            try {
                video.textTracks[video.textTracks.length - 1].mode = "hidden";
                console.log("YTSubtitleLoader: video.textTracks.mode = hidden was done");
            } catch (e) {
                console.log(e);
                stlShowMessage(stlStrNoSubtLoaded);
                return;
            }
        }
        videoSubtitle.remove();
        stlShowMessage(stlStrUnloaded);
        stlDbSelect.selectedIndex = 0;
        stlDbSelectPrevSelect = stlDbSelect.selectedIndex;
    };
    stlContainer.appendChild(stlUnloadBtn);

    stlMessage.className = "stlLabel";
    stlContainer.appendChild(stlMessage);

    stlLoadDb();

    function stlLoadDb() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", stlServerUrl + "/db/" + parseVideoId(), true);
        //xhr.timeout = 25000;
        xhr.send();
        stlDbRefreshBtn.textContent = stlStrCancel;
        stlDbRefreshBtn.onclick = function () {
            xhr.abort();
            stlDbSelectPlaceholder.text = stlStrCanceled;
            stlDbRefreshBtn.textContent = stlStrRefresh;
            stlDbRefreshBtn.onclick = stlDbRefresh;
        };
        xhr.onload = function () {
            stlDbRefreshBtn.textContent = stlStrRefresh;
            stlDbRefreshBtn.onclick = stlDbRefresh;
            if (xhr.status == 200) {
                stlDbSelect.disabled = false;
                stlDbSelectPlaceholder.text = stlStrNotSelected;
                stlDbSubtitles = JSON.parse(xhr.response);
                for (var i = 0; i < stlDbSubtitles.length; i++) {
                    stlDbSelect[stlDbSelect.options.length] = new Option(stlDbSubtitles[i].langStr, null, stlDbSubtitles[i].default, stlDbSubtitles[i].default);
                }
                stlDbSelect.appendChild(stlDbSelectAddBtn);
                stlLoadSubtitleFromDb();
            } else if (xhr.status == 404) {
                stlDbSelect.disabled = false;
                stlDbSelectPlaceholder.text = stlStrNoSubt;
                stlDbSelect.appendChild(stlDbSelectAddBtn);
            } else {
                stlDbSelectPlaceholder.text = stlStrServErr;
            };
        };
        xhr.ontimeout = function (e) {
            console.log("YTSubtitleLoader: " + e.message);
            stlDbSelectPlaceholder.text = stlStrReqTimeout;
            stlDbRefreshBtn.textContent = stlStrRefresh;
            stlDbRefreshBtn.onclick = stlDbRefresh;
        };
        xhr.onerror = function (e) {
            console.log("YTSubtitleLoader: " + e.message);
            stlDbSelectPlaceholder.text = stlStrReqErr;
            stlDbRefreshBtn.textContent = stlStrRefresh;
            stlDbRefreshBtn.onclick = stlDbRefresh;
        };
    };

    function parseVideoId() {
        var video_id = window.location.search.split('v=')[1];
        var ampersandPosition = video_id.indexOf('&');
        if (ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
        return video_id;
    }

    function stlLoadSubtitleFromDb() {
        stlLoadSubtitleFromUrl(stlDbSubtitles[stlDbSelect.selectedIndex - 1].url, false);
        stlDbSelectPrevSelect = stlDbSelect.selectedIndex;
    };

    function isSafari() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('safari') != -1) {
            if (ua.indexOf('chrome') > -1) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    function stlDbRefresh() {
        stlDbSelect.innerHTML = "";
        stlDbSelectPlaceholder.text = stlStrLoading;
        stlDbSelect.disabled = true;
        stlDbSelect.appendChild(stlDbSelectPlaceholder);
        stlDbSelect.selectedIndex = 0;
        stlDbSelectPrevSelect = stlDbSelect.selectedIndex;
        stlDbSelectAddBtn.selected = false;
        stlLoadDb();
    }
}

function setVideoSubtitleStyle(style) {
    videoSubtitleStyle.innerText = "::cue { " + style + " };"
}

function stlLoadSubtitleFromUrl(url, unselectDbSelect) {
    stlShowMessage(stlStrLoading);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.timeout = 25000;
    xhr.send();
    xhr.onload = function () {
        if (xhr.status == 200) {
            if (xhr.response.includes("WEBVTT")) {
                stlShowSubtitle("data:text/vtt," + encodeURI(xhr.response.split("YTSLJS")[0]), unselectDbSelect)
                if (typeof xhr.response.split("YTSLJS")[1] !== 'undefined') {
                    if (stlRanJsSubtOnce) alert(stlStrSecondJsAlert);
                    if (confirm(stlStrConfirmJs)) {
                        eval(xhr.response.split("YTSLJS")[1]);
                        stlRanJsSubtOnce = true;
                    }
                } else {
                    setVideoSubtitleStyle("");
                }
            } else {
                stlShowMessage(stlStrInvalidSubtFormat);
            }
        } else if (xhr.status == 404) {
            stlShowMessage(stlStrInvalidUrl);
        } else {
            stlShowMessage(stlStrServErr);
        };
    };
    xhr.ontimeout = function (e) {
        console.log("YTSubtitleLoader: " + e.message);
        stlShowMessage(stlStrReqTimeout);
    };
    xhr.onerror = function (e) {
        console.log("YTSubtitleLoader: " + e.message);
        stlShowMessage(stlStrReqErr);
    };
};

function stlShowSubtitle(src, unselectDbSelect) {
    videoSubtitle.src = src;
    video.appendChild(videoSubtitle);
    stlShowMessage(stlStrSubtitleLoaded);
    video.textTracks[video.textTracks.length - 1].mode = "showing";
    if (unselectDbSelect || typeof unselectDbSelect === 'undefined') {
        stlDbSelect.selectedIndex = 0;
        stlDbSelectPrevSelect = stlDbSelect.selectedIndex;
    }
};

function stlShowMessage(str) {
    stlMessage.innerHTML = "| " + str;
    console.log("YTSubtitleLoader: " + str);
    clearTimeout(stlMessageTimer);
    stlMessageTimer = setTimeout(function () {
        stlMessage.innerHTML = "";
    }, 5000);
};
