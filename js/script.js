
/* Utlize Google Street API, NYT API and WIKI API to collect news and info based on address and city input*/

"use strict";


//invoke loadData after submit form
document.getElementById("form-container").onsubmit = function() {
    loadData();
    return false;
};
// modify DOM
function loadData() {   
    var greetingMsg = document.getElementById('greeting');
    greetingMsg.innerHTML = "";//clear out old data before new request
    var city = document.getElementById('city').value;
    var street = document.getElementById('street').value;
    var address;

    //update greeting message
    function getUserInput(street, city, callback) {
        address = street + " , " + city;
        // Make sure the callback is a function​
        if (typeof callback === "function") {
            callback(address);
        }
    }

    function greetUser(address) {
        greetingMsg.innerHTML =  '<h2 class="greeting">Welcome to '+ address + '</h2>';
    }

    getUserInput(street, city, greetUser);


    // google streetview API
    var backgroungImg= document.getElementsByTagName('img')[0];
    var source ='https://maps.googleapis.com/maps/api/streetview?size=600x400&location='+address;
    backgroungImg.src = source; 

    // newyork time API use getJSON
    var nytHeaderElem = document.getElementById('nytimes-header');
    var nytElem = document.getElementById('nytimes-articles');
    nytElem.innerHTML = "";
    var nytimesAPI ='http://api.nytimes.com/svc/search/v2/articlesearch.json?q='+city+'&sort=newest&api-key=1ac10106955053261890691c92ae6847:12:72971373';
    $.getJSON(nytimesAPI, function(data) {
        var items = data.response.docs.slice(5);
        var text, title, news;
        var allNews = '';
        nytHeaderElem.innerHTML='New York Times Article Abourt '+city.toUpperCase();
        items.forEach(function(item) {
            console.log(item);
            if (item["headline"]["main"].length <= 100){
                title ='<a href="' + item["web_url"] + '">' + item["headline"]["main"].toUpperCase()+"</a>";
                text = '<p>' + item["pub_date"].slice(0,10) + '<br>' + item["snippet"] + '</p>';
                news = '<li class="article">'+ title + text +'</li>';
            };
            allNews+=news;
        });
        nytElem.innerHTML= allNews;
    }).error(function(){
        nytHeaderElem.innerHTML='New York Times Cannot Be Load';
    });
    //wiki API use Ajax
    var wikiElem = document.getElementById('wikipedia-links');
    var wikiHeader = document.getElementById('wikipedia-header');
    wikiElem.innerHTML = "";
    var wikiRequestTimeout = setTimeout(function(){
        wikiHeader.innerHTML='Wikipedia Cannot Be Load';
    },3000);

    function successCallback(items) {
        var links='';
        items[1].forEach(function(item, index){ 
            var wikilink = '<p><br><a href ="' +items[3][index]+'">' + item +"</a></p>";
            links+=wikilink;
        });
        wikiElem.innerHTML=links;
        clearTimeout(wikiRequestTimeout);
    }

    function completeCallback(){
        console.log("wiki data complete");
    }


    $.ajax({
        url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+city+'&format=json&callback=wikiCallback',
        dataType: 'jsonp',
        success: successCallback,
        complete: completeCallback

    });

    return false;
}