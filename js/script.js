
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');
    var address = $('#city').val()+','+$('#street').val();
    var city = $('#city').val();
    var source ='https://maps.googleapis.com/maps/api/streetview?size=600x400&location='+address;
    var nytimesAPI ='http://api.nytimes.com/svc/search/v2/articlesearch.json?q='+city+'&sort=newest&api-key=1ac10106955053261890691c92ae6847:12:72971373';

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // load streetview

    // YOUR CODE GOES HERE!
    $body.append('<img class="bgimg" src="'+source+'">');
    $.getJSON(nytimesAPI, function(data) {
        var items = data.response.docs;
        var text;
        var title;
        var wiklink;
        $nytHeaderElem.text('New York Times Article Abourt '+city.toUpperCase());
        $.each(items, function(item) {
            if (items[item]["headline"]["main"].length<=100){
                title ='<a href="' + items[item]["web_url"] + '">' + items[item]["headline"]["main"].toUpperCase()+"</a>";
                text = '<p>' + items[item]["pub_date"].slice(0,10) + '<br>' + items[item]["snippet"] + '</p>';
                $("<li/>", {
                    "class": "article",
                    html: title+text
                }).appendTo($nytElem);
         }
        });
    }).error(function(){
        $nytHeaderElem.text('New York Times Cannot Be Load');
    });

    var wikiRequestTimeout = setTimeout(function(){
        $wikiElem.text("failed to get wikipedia resources");
    },3000)
    $.ajax({
        url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+city+'&format=json&callback=wikiCallback',
        dataType: 'jsonp',
        success: function (items) {
            $.each(items[1], function(item){
                wiklink = '<a href ="' +items[3][item] +'">' + items[1][item] +"</a>";
                $("<li/>",{
                    html: wiklink
                }).appendTo($wikiElem);
            })
            clearTimeout(wikiRequestTimeout);
        }
    });

    return false;
};


$('#form-container').submit(loadData);

// loadData();
