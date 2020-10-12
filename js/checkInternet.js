(function(){
    const noInternet = require('no-internet');
    const swal = require('sweetalert');

    window.connectionStatus = 'online';

    noInternet({
        milliseconds:5000,
        url:'https://www.balldontlie.io',
        callback:function(offline) {
            if( offline ) {
                swal('Failed to access server, please check your internet connection.');
                window.connectionStatus = 'offline';
            }
            else if( window.connectionStatus === 'offline' ) {
                window.connectionStatus = 'online';
                window.searchGames.initTeamsList();
            }
        }
    })
})();