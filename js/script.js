
/* Utlize Google Street API, NYT API and WIKI API to collect news and info based on address and city input*/

"use strict";


//loadData
document.getElementById("form-container").onsubmit = function() {
    loadData();
    return false;
};

function loadData() {
    var wikiElem = document.getElementById('wikipedia-links');
    var wikiHeader = document.getElementById('wikipedia-header');
    var nytHeaderElem = document.getElementById('nytimes-header');
    var nytElem = document.getElementById('nytimes-articles');
    var city = document.getElementById('city').value;
    var street = document.getElementById('street').value;
    var address = city+','+street;
    var source ='https://maps.googleapis.com/maps/api/streetview?size=600x400&location='+address;
    var nytimesAPI ='http://api.nytimes.com/svc/search/v2/articlesearch.json?q='+city+'&sort=newest&api-key=1ac10106955053261890691c92ae6847:12:72971373';
    var backgroungImg= document.getElementsByTagName('img')[0];
    
    // clear out old data before new request
    wikiElem.innerHTML = "";
    nytElem.innerHTML = "" ;

    // google streetview API
    backgroungImg.src = source; 

    // newyork time API use getJSON
    $.getJSON(nytimesAPI, function(data) {
        var items = data.response.docs.slice(5);
        var text, title, news;
        var allNews = '';
        nytHeaderElem.innerHTML='New York Times Article Abourt '+city.toUpperCase();
        items.forEach(function(item) {
            console.log(item);
            if (item["headline"]["main"].length<=100){
                title ='<a href="' + item["web_url"] + '">' + item["headline"]["main"].toUpperCase()+"</a>";
                text = '<p>' + item["pub_date"].slice(0,10) + '<br>' + item["snippet"] + '</p>';
                news = '<li class="article">'+ title + text +'</li>';
            };
            allNews+=news;
        });
        nytElem.innerHTML= allNews;
    }).error(function(){
        nytHeaderElem.text('New York Times Cannot Be Load');
    });
    //wiki API use Ajax

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