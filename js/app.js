
var checked = false;
var movies = [];
var tv = [];
var generate = $('.generate-container');

$(document).ready(function() {
    getData(checkbox());
});


function getData(type){
    generate.removeClass('ready');
    $('.generate-container .thumb').html('<i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>');
    if(movies.length == 0 || tv.length == 0){
        var sectionKey, elem;

        if(type == false) { // Movies
            sectionKey = 1;
            elem = 'Video';
        } else if(type == true) { // TV Shows
            sectionKey = 2;
            elem = 'Directory';
        }

        $.ajax({
        type: "GET",
        dataType: "xml",
        url: "http://"+plex.ip+":"+plex.port+"/library/sections/"+sectionKey+"/all",
        success: function(xml){
            $(xml).find(elem).each(function(){
                if(type == false){
                    movies.push({
                       "movie":$(this).attr("title"),
                       "id":$(this).attr("ratingKey"),
                       "time":$(this).attr("duration"),
                       "year":$(this).attr("year"),
                       "cr":$(this).attr("contentRating"),
                       "summary":$(this).attr("summary")
                    });
                } else if(type == true){
                    tv.push({
                       "movie":$(this).attr("title"),
                       "id":$(this).attr("ratingKey"),
                       "time":$(this).attr("duration"),
                       "year":$(this).attr("year"),
                       "cr":$(this).attr("contentRating"),
                       "summary":$(this).attr("summary")
                    });
                }
            });
        }
        }).done(function(data) {
            readyButton();
            refresh();
        });
    } else {
        readyButton();
        refresh();
    }

}

function checkbox(){
    var checkbox = $('#mediaType');

    $('.switch-container label').on('click', function() {
        if(checked == true){
            checkbox.prop('checked', false);
            $('label').removeClass('switch');
            checked = false;
            getData(false);
        } else if(checked == false){
            checkbox.prop('checked', true);
            $('label').addClass('switch');
            checked = true;
            getData(true);
        }
    });

    return checked;
}

function readyButton() {
    generate.addClass('ready');
    $('.generate-container .thumb').html('<i class="fa fa-check fa-2x" aria-hidden="true"></i>');
    (!$('#mediaType').prop('checked') ? media = 'Movie' : media = '<br>TV Show');
    $('.generate-container .header').html('See Random '+media+' <i class="fa fa-angle-right" aria-hidden="true"></i>');

    generate.on('click', function() {
        if($(this).hasClass('ready')) {
            show();
            $('.container').addClass('active');
            generate.hide();
            $('.switch-container').hide();
        }
    });
}

function refresh() {

    $('.refresh').on('click', function() {
        show();
    });

}

function show() {
        $('.flex-container .container .loading').fadeIn();
        if(!$('#mediaType').prop('checked')){
            f = movies[Math.floor(Math.random()*movies.length)];
            d = {
                h: parseInt(f.time / (60 * 60 * 1000)),
                m: parseInt(f.time / (60 * 1000) % 60)
            }
        } else {
            f = tv[Math.floor(Math.random()*tv.length)];
            d = {
                h: parseInt(f.time / (60 * 60 * 1000)),
                m: parseInt(f.time / (60 * 1000) % 60)
            }
        }

        $('.container .header .title').html(f.movie);
        $('img').attr('src','http://192.168.1.80:32400/library/metadata/'+f.id+'/thumb').load(function(){ $('.flex-container .container .loading').fadeOut(); });
        $('.content-rating').html(f.cr);
        $('.year').html(f.year);
        $('.duration').html(d.h+'h '+d.m+'m');
        $('.summary').html('<strong>Summary:</strong><br>'+f.summary);

        $('.close').on('click', function() {
            if($('.container').hasClass('active')) {
                $('.container').removeClass('active');
                generate.show();
                $('.switch-container').show();
            }
        });
    }
