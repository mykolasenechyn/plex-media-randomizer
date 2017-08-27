(function (){

    window.Application = function(params){
        var app = this;
		app.name = 'plexrandom';
        app.version = '1.1';

		// Application parameters
        app.param = {
            generate: $('.generate-container'),
			movies: [],
			tvshows: [],
			checkbox: $('#media-type'),
			checked: false
        }

		app.savedata = {
			setup: false,
			plex_ip: '',
			plex_port: ''
		}

       // Extend defaults with parameters
        for (var param in param) {
            app.param[param] = param[param];
        }

		//---------------------------------------------------------------------[ startup ]
		if((window.localStorage.getItem(app.name) === null)){
			setup();
		} else {
			app.savedata = JSON.parse(window.localStorage.getItem(app.name));
			get_data(media_type());
		}


		//-----------------------------------------------------------------------[ setup ]
		function setup(){
			// show settings modal
			$('.settings-container').addClass('active');

			settings_box();
		}

		//------------------------------------------------------------------------[ save ]
		function save_settings(){
			window.localStorage.setItem(app.name, JSON.stringify(app.savedata));
		}

		//--------------------------------------------------------------------[ settings ]

		$('.settings').on('click', function() {
			$('.settings-container').addClass('active');
			settings_box();
		});

		function settings_box(){
			$('.settings-container #ip').val(app.savedata.plex_ip);
			$('.settings-container #port').val(app.savedata.plex_port);

			// save settings
			$('#save').on('click', function() {
				if(app.savedata.setup === false){
					$('.settings-container').removeClass('active');
				}

				// get settings input
				app.savedata.plex_ip = $('.settings-container #ip').val();
				app.savedata.plex_port = $('.settings-container #port').val();


				app.savedata.setup = true;

				save_settings();

				$('.settings-container .modal.success').addClass('active');
				setTimeout(function(){
					$('.settings-container .modal.success').removeClass('active');
				}, 1500);

				get_data(media_type());
			});

			// close settings modal
			$('.settings-container .close').on('click', function() {
				$('.settings-container').removeClass('active');
			});
		}

		//--------------------------------------------------------[ get plex server data ]
		function get_data(type){

			// Reset 'generate' container settings
 			app.param.generate.removeClass('ready');
			$('.generate-container .thumb').html('<i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>');

			// Set vars
			var section_key, tag_id;

			if(type === 'movies'){
				if(app.param.movies.length === 0){ // Check 'movies' array is empty to continue
					// Set type of content to get
					section_key = 1;
					tag_id = 'Video';
					request_data(type);
				} else {
					ready_content();
					refresh_content();
				}
			} else if(type === 'tvshows'){
				if(app.param.tvshows.length === 0){  // Check 'tvshows' array is empty to continue
					// Set type of content to get
					section_key = 2;
					tag_id = 'Directory';
					request_data(type);
				} else {
					ready_content();
					refresh_content();
				}
			}


			//------------------------------------------------------------[ ajax request ]
			function request_data(media_type){
				$.ajax({
				type: "GET",
				dataType: "xml",
				url: "https://"+app.savedata.plex_ip+":"+app.savedata.plex_port+"/library/sections/"+section_key+"/all",
				success: function(xml){
					$(xml).find(tag_id).each(function(){
						if(media_type === 'movies'){
							app.param.movies.push({
							   "title":$(this).attr("title"),
							   "id":$(this).attr("ratingKey"),
							   "time":$(this).attr("duration"),
							   "year":$(this).attr("year"),
							   "cr":$(this).attr("contentRating"),
							   "summary":$(this).attr("summary")
							});
						} else if(media_type == 'tvshows'){
							app.param.tvshows.push({
							   "title":$(this).attr("title"),
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
					ready_content();
					refresh_content();
				});
			}

		}


		//-----------------------------------------[ checkbox media type movies/tv shows ]
        function media_type(){

			$('.switch-container label').on('click', function() {
				if(app.param.checked == true){
					app.param.checkbox.prop('checked', false);
					$('label').removeClass('switch');
					app.param.checked = false;
					get_data('movies');
					return 'movies';
				} else if(app.param.checked == false){
					app.param.checkbox.prop('checked', true);
					$('label').addClass('switch');
					app.param.checked = true;
					get_data('tvshows');
					return 'tvshows';
				}
			});
			
			return 'movies';
		}

		//----------------------------------------------------[ content ready to display ]
		function ready_content() {
			app.param.generate.addClass('ready');
			$('.generate-container .thumb').html('<i class="fa fa-check fa-2x" aria-hidden="true"></i>');
			(!app.param.checkbox.prop('checked') ? media = 'Movie' : media = '<br>TV Show');
			$('.generate-container .header').html('See Random '+media+' <i class="fa fa-angle-right" aria-hidden="true"></i>');

			app.param.generate.on('click', function() {
				if($(this).hasClass('ready')) {
					show_content();
					$('.container').addClass('active');
					app.param.generate.hide();
					$('.switch-container').hide();
				}
			});
		}


		//-------------------------------------------------------------[ display content ]
		function show_content(){
			$('.flex-container .container .loading').fadeIn();
			if(!app.param.checkbox.prop('checked')){
				f = app.param.movies[Math.floor(Math.random()*app.param.movies.length)];
				d = {
					h: parseInt(f.time / (60 * 60 * 1000)),
					m: parseInt(f.time / (60 * 1000) % 60)
				}
			} else {
				f = app.param.tvshows[Math.floor(Math.random()*app.param.tvshows.length)];
				d = {
					h: parseInt(f.time / (60 * 60 * 1000)),
					m: parseInt(f.time / (60 * 1000) % 60)
				}
			}

			$('.container .header .title').html(f.title);
			$('img').attr('src','https://'+app.savedata.plex_ip+':'+app.savedata.plex_port+'/library/metadata/'+f.id+'/thumb').load(function(){ $('.flex-container .container .loading').fadeOut(); });
			$('.content-rating').html(f.cr);
			$('.year').html(f.year);
			$('.duration').html(d.h+'h '+d.m+'m');
			$('.summary').html('<strong>Summary:</strong><br>'+f.summary);

			$('.close').on('click', function() {
				if($('.container').hasClass('active')) {
					$('.container').removeClass('active');
					app.param.generate.show();
					$('.switch-container').show();
				}
			});
		}

		//-------------------------------------------------------------[ refresh content ]
		function refresh_content(){
			$('.refresh').on('click', function() {
				show_content();
			});
		}


		return app;
	}

})();
