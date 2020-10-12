let onLoad = function () {
    try {
        window.settings.initEventListeners();
        window.settings.initSettings();

        window.searchPlayers.initEventListeners();
        window.searchPlayers.populateSearchPlayersTable();
        
        window.searchGames.initEventListeners();
        window.searchGames.populateSearchGamesTable();
        window.searchGames.initTeamsList();

        window.compare.initDataSets();

        window.navbar.addNavbarEventListeners();

        window.compare.updateCharts();

        document.querySelector('a[name="latest"]').click();
    }
    catch(err) {
        console.log(err);
    }
}

window.addEventListener("load", onLoad);