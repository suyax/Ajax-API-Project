/* Utlize Google Street API, NYT API and WIKI API to collect news and info based on address and city input*/

// Make sure it is strict mode
"use strict";

/* Load data and modifiy DOM elements */
function loadData() {   
    var address;
    // Get city and street values from form
    var city = document.getElementById('city').value;
    var street = document.getElementById('street').value;

    /* Update greeting message */
    // Get Information from forms 
    function getUserInput(street, city, callback) {
        address = street + " , " + city;
        // Make sure the callback is a function​
        if (typeof callback === "function") {
            callback(address);
        }
    }
    // Replace greeting message with new data
    function greetUser(address) {
        var greetingMsg = document.getElementById('greeting');
        greetingMsg.innerHTML = ""; // Clear out old data before new request
        greetingMsg.innerHTML =  '<h2 class="greeting">Welcome to '+ address + '</h2>';
    }
    // Call the getuserInput function
    getUserInput(street, city, greetUser);


    /* Google streetview API */
    var backgroundImg = document.getElementsByTagName('img')[0];
    // Request img size based on window's size for better performance
    var imgWidth = window.innerWidth;
    var imgHeight = window.innerHeight;
    var imgSize = imgWidth + 'x' +imgHeight;
    // Replace background img with img of current address
    backgroundImg.src = 'https://maps.googleapis.com/maps/api/streetview?size=' + imgSize + '&location='
                        + address; 

    /* Newyork time API use getJSON */
    var nytHeaderElem = document.getElementById('nytimes-header');
    var nytElem = document.getElementById('nytimes-articles');
    nytElem.innerHTML = ""; // Clear out old data before new request
    var nytimesAPI = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q='
                     + city + '&sort=newest&api-key=1ac10106955053261890691c92ae6847:12:72971373';
    // Higher order function betterData to filter raw data from NYtimes
    function betterData (items, filter) {
        var passed = [];
        items.forEach(function(item){
            if (filter(item)) {
              passed.push(item);
            }
        });
        return passed;
    }
    // Use JQuery to request JSON file 
    $.getJSON(nytimesAPI, function(data) {
        var items = data.response.docs;
        var text, title, news;
        var allNews = '';
        nytHeaderElem.innerHTML = 'New York Times Article About ' + city.toUpperCase(); // Make city data to uppercase

        // Call betterData pass in anonymous function to set specific requirments this dataset 
        var nyPure = betterData(items, function(item){
            return item["headline"]["main"].length > 0 && item["headline"]["main"].length <= 100 
                && item["snippet"].length >0 && item["snippet"].length <= 500;
        });
        // Based on puerer data modify DOM accordingly
        nyPure.forEach(function(item) {
        // Organize data for title and text for each news accordingly
            title = '<a href="' + item["web_url"] + '">' + item["headline"]["main"].toUpperCase() + "</a>";
            text = '<p>' + item["pub_date"].slice(0,10) + '<br>' + item["snippet"] + '</p>';
            news = '<li class="article">' + title + text + '</li>';
        // concat all the organized data together
        allNews += news;
        });
        // replace ny container with new formatted data
        nytElem.innerHTML = allNews;
    }).error(function(){ // On error handler for getJson request
        nytHeaderElem.innerHTML = 'New York Times Cannot Be Load';
    });

    /* Wiki API use Ajax request */
    var wikiElem = document.getElementById('wikipedia-links');
    var wikiHeader = document.getElementById('wikipedia-header');
    wikiElem.innerHTML = ""; // Clear out old data before new request
    // After 3 second setTimeout will be trigger to take care error of wiki request data 
    var wikiRequestTimeout = setTimeout(function(){
        wikiHeader.innerHTML = 'Wikipedia Cannot Be Load';
    }, 3000);
    // ajax request to get jsonp file from wiki
    $.ajax({
        url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + city + '&format=json&callback=wikiCallback',
        dataType: 'jsonp',
        success: successCallback, 
        complete: completeCallback
    });
    // On success oragnize data and update DOM accordingly
    function successCallback(items) {
        var wikiAllRaw = [];
        // Reorganize data
        var Page = function(name, url, brief){
            this.name = name;
            this.url = url;
            this.brief = brief; 
        };

        items[1].forEach(function(item, index){
           var wikiRaw = new Page(item, items[3][index], items[2][index]);
           wikiAllRaw.push(wikiRaw);
        });

        // Call betterData pass in anonymous function to set specific requirments this dataset 
        var wikiPure = betterData(wikiAllRaw, function(item){
            return item.name.length > 0 && item.url.length > 0 && item.brief.length > 0;
        });

        var links = '';
        wikiPure.forEach(function(item, index){ 
            var wikiLink = '<p><br><a href ="' + item.url + '">' + item.name.toUpperCase() + "</a></p>";
            var wikiBrief = '<p>' + item.brief + '</p>';
            links += wikiLink + wikiBrief;
        });
        wikiElem.innerHTML = links;
        clearTimeout(wikiRequestTimeout); // Since success, timeout function no longer needed
    }
    // On complete, give a sign
    function completeCallback(){
        console.log("wiki data complete");
    }

    return false;
}

//Finally invoke loadData after submit form
document.getElementById("form-container").onsubmit = function() {
    loadData();
    return false;
};