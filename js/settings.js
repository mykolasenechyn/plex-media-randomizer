var plex = {
  ip: '192.168.1.80',
  port: '32400'
}

var ip_input = $('#ip');
var port_input = $('#port');

ip_input.val(plex.ip);
port_input.val(plex.port);

$('.settings').on('click', function() {
  $('.settings-container').addClass('active');
});

$('.settings-container .close').on('click', function() {
  $('.settings-container').removeClass('active');
});

$('#save').on('click', function() {
  localStorage.setItem('ip', ip_input.val());
  localStorage.setItem('port', port_input.val());
  $('.settings-container .modal.success').addClass('active');
  setTimeout(function() {
    $('.settings-container .modal.success').removeClass('active');
  }, 1500);
});

if (localStorage.getItem('ip') != null && localStorage.getItem('port') != null) {
  plex.ip = localStorage.getItem('ip');
  plex.port = localStorage.getItem('port');
  ip_input.val(localStorage.getItem('ip'));
  port_input.val(localStorage.getItem('port'));
}
