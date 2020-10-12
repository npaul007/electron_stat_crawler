(function(){
    const axios = require('axios');
    const swal = require('sweetalert');
    global.currentPagStarterGames = 1;
    global.lastPagNumberGames = 12;
    global.currentPagStarterGamesList = 1;
    global.lastPagNumberGamesList = 12;
    global.teamsList = [];

   let elVisible = function  (el) {
        let rect = el.getBoundingClientRect();
        let elemTop = rect.top;
        let elemBottom = rect.bottom;

        // Only completely visible elements return true:
        let isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
        // Partially visible elements return true:
        //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
        return isVisible;
    }

    let initTeamsList = function () {
        axios.get(`https://www.balldontlie.io/api/v1/teams?per_page=31`)
        .then((response) => {
            if( response && response.data ) {
                global.teamsList = response.data.data;
            }
        })
        .catch((error) => {
            swal(error.toString());
        });
    }
    
    let appendPages = function (pagPrev,totalPages,currentPage,query) {
        let numAppended = 0;
    
        if( global.lastPagNumberGames < currentPage && currentPage <= totalPages) {
            global.currentPagStarterGames = currentPage  - 12 + 1;
        }
        else if ( global.lastPagNumberGames > currentPage && currentPage < global.currentPagStarterGames ) {
            global.currentPagStarterGames -= 1;
        }
        else if ( currentPage > totalPages ) {
            currentPage = totalPages;
        }
    
        for(let c = global.currentPagStarterGames; c <= totalPages && numAppended < 12; c++) {
            let pageItem = document.createElement('li');
            pageItem.classList.add("page-item", "page-number");
            if( c == currentPage ) {
                pageItem.classList.add('pag-selected');
            }
            
            let pageLink = document.createElement('a');
            pageLink.classList.add("page-link");
            pageItem.setAttribute("search",(query ? query : null ));
            pageItem.setAttribute('pageNum',c);
            pageItem.addEventListener("click",function() {
                populateSearchGamesTable(this.attributes.search.value,this.attributes.pageNum.value);
            });
    
            pageLink.textContent = c;
            global.lastPagNumberGames = c;
            pageItem.appendChild(pageLink);
    
            if( c == 1 ) {
                pagPrev.parentElement.insertBefore(pageItem,pagPrev.nextSibling);
            }
            else {
                pagPrev.parentElement.insertBefore(pageItem,pagPrev.parentElement.querySelector(' li.search-games-pag-next'));
            }
    
            numAppended++;
    
        }
    }
    
    let populateSearchPlayerPagination = function (currentPage,totalPages,query) {
        let pagPrevs = [
            document.querySelector('div[name="search-games-pag-1"] ul li.search-games-pag-prev'),
            document.querySelector('div[name="search-games-pag-2"] ul li.search-games-pag-prev')
        ];
        let pagNexts = [
            document.querySelector('div[name="search-games-pag-1"] ul li.search-games-pag-next'),
            document.querySelector('div[name="search-games-pag-2"] ul li.search-games-pag-next')
        ]
    
        let pages = document.querySelectorAll('div[name="games-page" ] .page-number');
        if( pages !== null ) {
            pages.forEach(page => {
                page.remove();
            });
        }
    
        pagPrevs.forEach(pagPrev => {
            appendPages(pagPrev,totalPages,currentPage,query);
            pagPrev.setAttribute("maxPages",totalPages);
        });
    }

    let appendGamePages = function (pagPrev,totalPages,currentPage,season) {
        let numAppended = 0;
    
        if( global.lastPagNumberGamesList < currentPage && currentPage <= totalPages) {
            global.currentPagStarterGames = currentPage  - 12 + 1;
        }
        else if ( global.lastPagNumberGamesList > currentPage && currentPage < global.currentPagStarterGames ) {
            global.currentPagStarterGames -= 1;
        }
        else if ( currentPage > totalPages ) {
            currentPage = totalPages;
        }
    
        for(let c = global.currentPagStarterGames; c <= totalPages && numAppended < 12; c++) {
            let pageItem = document.createElement('li');
            pageItem.classList.add("page-item", "page-number");
            if( c == currentPage ) {
                pageItem.classList.add('pag-selected');
            }
            
            let pageLink = document.createElement('a');
            pageLink.classList.add("page-link");
            pageItem.setAttribute("season",season);
            pageItem.setAttribute('pageNum',c);
            pageItem.addEventListener("click",function() {
                let playerObj =  JSON.parse(document.querySelector('div[name="games-list-select" ]').attributes.playerobj.value);
                populateSearchGamesDisplay(
                    playerObj,
                    this.attributes.season.value,
                    this.attributes['pageNum'].value
                );
            });
    
            pageLink.textContent = c;
            global.lastPagNumberGamesList = c;
            pageItem.appendChild(pageLink);
    
            if( c == 1 ) {
                pagPrev.parentElement.insertBefore(pageItem,pagPrev.nextSibling);
            }
            else {
                pagPrev.parentElement.insertBefore(pageItem,pagPrev.parentElement.querySelector(' li.game-list-pag-next'));
            }
    
            numAppended++;
    
        }
    }

    let populateGameListPagination = function (currentPage,totalPages,season) {
        let pagPrevs = [
            document.querySelector('div[name="game-list-pag-1"] ul li.game-list-pag-prev'),
            document.querySelector('div[name="game-list-pag-2"] ul li.game-list-pag-prev')
        ];
    
        let pages = document.querySelectorAll('div[name="games-list-select"] .page-number');
        if( pages !== null ) {
            pages.forEach(page => {
                page.remove();
            });
        }
    
        pagPrevs.forEach(pagPrev => {
            appendGamePages(pagPrev,totalPages,currentPage,season);
            pagPrev.setAttribute("maxPages",totalPages);
        });
    }

    let populateSearchGamesDisplay = function (playerObj, season = null, pageNumber = null) {
        if( season === null ) {
            let date = new Date();
            season = date.getFullYear().toString();
        }

        if( pageNumber === null ) {
            pageNumber = 1;
        }
        
        query = `?seasons[]=${season}&player_ids[]=${playerObj.playerid}&per_page=100&page=${pageNumber}`;
        
        document.querySelector('div[name="games-list-select" ]').setAttribute('playerobj',JSON.stringify(playerObj));

        axios.get(`https://www.balldontlie.io/api/v1/stats${query}`)
            .then((response) => {
                 if( response && response.data ) {
                    let games = response.data.data;
                    let totalPages = response.data.meta.total_pages;
                    let currentPage = response.data.meta.current_page;

                    populateGameListPagination(currentPage,totalPages,season);

                    games.forEach(g => {
                        let date = g.game.date.split("T")[0]
                        digits = date.split("-");
                        g.game.date =`${digits[1]}-${digits[2]}-${digits[0]}`;
                    });

                    //sort games by date
                    games = games.sort((a,b) => {
                        return new Date(b.game.date ) - new Date(a.game.date);
                    });

                    document.querySelector('div[name="games-list-select"]').style.display ="block";

                    document.querySelector('h3[name="search-games-name"]').innerHTML = playerObj.name;
                    document.querySelector('h4[name="search-games-team"]').textContent = `${playerObj.position} on the ${playerObj.team}`;

                    let gamesTable = document.querySelector('table[name="games-display-list"]');
                    let tableData = gamesTable.querySelectorAll('td');
                    ( tableData && tableData !==  null ) && tableData.forEach(td => td.parentElement.remove() ); 

                    if( games.length > 0 ) {
                        games.forEach(g => {    
                            let awayTeam = global.teamsList.find(t => t && t.id == g.game.visitor_team_id);
                            let homeTeam = global.teamsList.find(t => t && t.id == g.game.home_team_id);
                            let tr = document.createElement('tr');
                            let tr1Inner = `
                                <td>
                                    <button class="compare-add game-add">+Compare</button>
                                </td>
                                <td>${g.game.date.split("T")[0]} ${awayTeam.abbreviation} @ ${homeTeam.abbreviation}</td>
                                <td>${(g.min !== null) ? g.min : 'no data'}</td>
                                <td>${(g.fgm !== null) ? g.fgm : 'no data'}</td>
                                <td>${(g.fga !== null) ? g.fga : 'no data'}</td>
                                <td>${(g.fg3m !== null) ? g.fg3m : 'no data'}</td>
                                <td>${(g.fg3a !== null) ? g.fg3a : 'no data'}</td>
                                <td>${(g.ftm !== null) ? g.ftm : 'no data'}</td>
                                <td>${(g.fta !== null) ? g.fta : 'no data'}</td>
                                <td>${(g.reb !== null) ? g.oreb : 'no data'}</td>
                                <td>${(g.dreb !== null) ? g.dreb : 'no data'}</td>
                                <td>${(g.reb !== null) ? g.reb : 'no data'}</td>
                                <td>${(g.ast !== null) ? g.ast : 'no data'}</td>
                                <td>${(g.stl !== null) ? g.stl : 'no data'}</td>
                                <td>${(g.blk !== null) ? g.blk : 'no data'}</td>
                                <td>${(g.turnover !== null) ? g.turnover : 'no data'}</td>
                                <td>${(g.pts !== null) ? g.pts : 'no data'}</td>
                                <td>${(g.fg_pct !== null) ? g.fg_pct : 'no data'}</td>
                                <td>${(g.fg3_pct !== null) ? g.fg3_pct : 'no data'}</td>
                                <td>${(g.ft_pct !== null) ? g.ft_pct : 'no data'}</td>
                            `;
                            tr.innerHTML = tr1Inner;

                            tr.setAttribute('gameobj',JSON.stringify(g));
                            
                            tr.querySelector('button').addEventListener("click",function(){
                                let thisTR = this.closest('tr');
                                let gameobj = JSON.parse(thisTR.attributes.gameobj.value);

                                if( window.compare.setListAtMax() === true ) {
                                    swal('dataset list has reached max of 6 datasets');
                                }
                                else if (  window.compare.setExists(gameobj) === true ) {
                                    swal('dataset already exists in dataset list');
                                }
                                else {
                                    window.compare.updateCharts(gameobj,"game");
                                    swal('dataset added');
                                }
                            });
                            
                            gamesTable.appendChild(tr);
                        });

                        document.querySelector('p[name="games-found-status"]').style.display = "none";
                        document.querySelector('table[name="games-display-list"]').style.display = "block";
                    }
                    else {
                        document.querySelector('p[name="games-found-status"]').style.display = "block";
                        document.querySelector('table[name="games-display-list"]').style.display = "none";
                    } 

                    document.querySelectorAll('.game-search-player').forEach(row => {
                        row.style.display = "none";
                    });
                 }
                 else {
                    document.querySelectorAll('.game-search-player').forEach(row => {
                        row.style.display = "block";
                    });
                    document.querySelector('p[name="games-found-status"]').style.display = "block";
                    document.querySelector('table[name="games-display-list"]').style.display = "none";
                 }
            })
            .catch((error) => {
                swal(error.toString());
            });
    }
    
    let populateSearchGamesTable = function (query, pageNumber = null ) {
        let searchQuery = "";
        if( query ) {
            query  = (query == "null")  ? "" : query;
            searchQuery = '?search=' + query;
        }
    
        if( pageNumber !== null ) {
            searchQuery += '&page=' + pageNumber;
        }
    
        axios.get(`https://www.balldontlie.io/api/v1/players${searchQuery}`)
            .then((response) => {
                if( response.data.data && response.data.meta ) {
                    let table = document.querySelector('table[name="search-games-table"]');
                    let trListedForDel = table.querySelectorAll('tr[playerid]');
                    if( trListedForDel !== null ) {
                        trListedForDel.forEach(tr => tr.remove());
                    }
    
                    let totalPages = response.data.meta.total_pages;
                    let currentPage = response.data.meta.current_page;            
                    let players =response.data.data;
        
                    populateSearchPlayerPagination(currentPage,totalPages,query);
        
                    players && players.forEach(player => {
                        let tableRow = document.createElement('tr');
                        tableRow.setAttribute("playerid",player.id);
                        tableRow.setAttribute("position",player.position);
                        tableRow.setAttribute("name",`${player.first_name} ${player.last_name}`);
                        tableRow.setAttribute("team",player.team.full_name)
                        tableRow.style.cursor = "pointer";
                        tableRow.addEventListener("click",function() {
                           let playerObj = {
                               playerid:this.attributes.playerid.value,
                               position:this.attributes.position.value,
                               name:this.attributes.name.value,
                               team:this.attributes.team.value,
                               abbreviation:player.team.abbreviation
                           };                    
    
                           let year = new Date();                           
                           document.querySelector('select[name="select-games-season"]').value = year.getFullYear().toString();
                           
                           populateSearchGamesDisplay(playerObj);
                        });
    
                        let name = document.createElement('td');
                        let team = document.createElement('td');
                        let position = document.createElement('td');
        
                        name.textContent= player.first_name + " " + player.last_name;
                        team.textContent= player.team.full_name;
                        position.textContent= player.position;
        
                        tableRow.appendChild(name);
                        tableRow.appendChild(team);
                        tableRow.appendChild(position);
        
                        table.appendChild(tableRow);
                    });
                }
            })
            .catch((error) => {
                swal(error.toString());
            });
    }
    
    let prevCB = function () {
        let pagItem = document.querySelector(' li.search-games-pag-next').previousElementSibling;
        let curPageItem = document.querySelectorAll('div[name="games-page"] .pag-selected');
        populateSearchGamesTable(pagItem.attributes.search.value,Number(curPageItem[0].textContent) - 1);
    };
    
    let nextCB = function () {
        let pagItem = document.querySelector(' li.search-games-pag-prev').nextElementSibling;
        let curPageItem = document.querySelectorAll('div[name="games-page"] .pag-selected');
    
        if( Number(curPageItem[0].textContent) <  Number( document.querySelector('div[name="search-games-pag-1"] ul li.search-games-pag-prev').attributes.maxpages.value ) ) {
            populateSearchGamesTable(pagItem.attributes.search.value,Number(curPageItem[0].textContent) + 1);
        }
    };
    
    let initEventListeners = function () {
        // search form listener
        document.querySelector('form[name="search-games-form"]').addEventListener("submit",(e) => {
            event.preventDefault();
            global.currentPagStarterGames = 1;
            let query = document.querySelector('input[name="search-games-text-input"]').value;
            populateSearchGamesTable(query);
        });
    
        // events for previous pagination button
        document.querySelector('div[name="search-games-pag-1"] ul li.search-games-pag-prev').addEventListener("click",prevCB);
        document.querySelector('div[name="search-games-pag-2"] ul li.search-games-pag-prev').addEventListener("click",prevCB);
        // events for next pagination button
        document.querySelector('div[name="search-games-pag-1"] ul li.search-games-pag-next').addEventListener("click",nextCB);
        document.querySelector('div[name="search-games-pag-2"] ul li.search-games-pag-next').addEventListener("click",nextCB);
    
        let date = new Date();
        let year = date.getFullYear().toString();
        let yearSelect = document.querySelector('select[name="select-games-season"]');
        for(let k = year; k >= 1946; k--) {
            let option = document.createElement('option');
            option.attributes.value = k;
            option.textContent = k;
    
            yearSelect.appendChild(option);
        }

        yearSelect.addEventListener("change",function () {
            let year = this.value;
            let playerObj = JSON.parse(document.querySelector('div[name="games-list-select" ]').attributes.playerObj.value);
            populateSearchGamesDisplay(playerObj,year);
        });

        let backButtons = [
            document.querySelector('button[name="games-list-back-1"]'),
            document.querySelector('button[name="games-list-back-2"]')
        ];
        
        backButtons.forEach(backButton => {
            backButton.addEventListener("click",() => {
                document.querySelectorAll('.game-search-player').forEach(row => {
                    row.style.display = "block";
                });
    
                document.querySelector('div[name="games-list-select"]').style.display ="none";
            });
        });

        let tableHeaderResizeFunc = function() {
            let table =  document.querySelector('table[name="games-display-list"]');
            let tableHeader = document.querySelector('table[name="games-display-list-navbar"]');
            
            if( table.style.display !== "none"  && elVisible(table.querySelector('tr')) === false ) {
                tableHeader.style.display="block";
                tableHeader.querySelectorAll('th').forEach((th,i) => {
                    th.style.width = table.querySelector(`th:nth-child(${i+1})`).offsetWidth + "px";
                });
            }
            else {
                tableHeader.style.display="none";
            }
        }

        window.addEventListener("scroll", tableHeaderResizeFunc);
        window.addEventListener("resize", tableHeaderResizeFunc);
    }
    
    window.searchGames = {
        initEventListeners:initEventListeners,
        populateSearchGamesTable:populateSearchGamesTable,
        initTeamsList:initTeamsList
    }
})();