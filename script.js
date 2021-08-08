// ==UserScript==
// @name         hmmm
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Use lbry-sdk to view videos on Odysee
// @author       You
// @match        https://odysee.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

var lastSrc=""
var server = "http://localhost:5279/";
var isLooping = false;
function setVideoSource(){
    try {
        isLooping = true;
        var src = player.children_[0].src;

        //Get good enough url to claim
        const url = document.URL.split("/",5)[4].split("?",1)[0];

        if ( lastSrc != src && url){
           const data = '{"method":"get","params":{"uri": "lbry://'+url+'"}}';
            //Send "get" command to local daemon, and get streaming_url from output.
           GM_xmlhttpRequest({method: "POST", url: server, data: data, onload: (response) => {
               let obj = JSON.parse(response.response);
               let streaming_url = obj.result.streaming_url;
               player.children_[0].src = streaming_url;
               console.log("Current player source: " + streaming_url);
               lastSrc = streaming_url;}});
               isLooping = false;
            return;
        }
        console.log("looping")
        //Does some looping sometimes so page won't need to be refreshed.(I hope)
        setTimeout(setVideoSource, 2000);
    // Retry on error, player may not always be available.
    } catch {
        console.log("looping from catch")
        setTimeout(setVideoSource, 2000);
    }

 }

//Call setVideSource() when title of the page changes, un-less it's already looping.  
var titleObserver = new MutationObserver(() => { if (!isLooping) {setVideoSource();} });
function setTitleObserver(){
    let title = document.querySelector("title");
    if (!title){
        setTimeout(setTitleObserver, 200);
        return;
    }
    titleObserver.observe(title, {childList: true});
}
// Execution Starts here, observer is used so the player status won't need to be checked all the time. 
setTitleObserver();
})();
