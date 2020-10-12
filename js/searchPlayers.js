(function() {
    const axios = require('axios');
global.currentPagStarter = 1;
global.lastPagNumber = 12;

let appendPages = function (pagPrev,totalPages,currentPage,query) {
    let numAppended = 0;

    if( global.lastPagNumber < currentPage && currentPage <= totalPages) {
        global.currentPagStarter = currentPage  - 9 + 1;
    }
    else if ( global.lastPagNumber > currentPage && currentPage < global.currentPagStarter ) {
        global.currentPagStarter -= 1;
    }
    else if ( currentPage > totalPages ) {
        currentPage = totalPages;
    }

    for(let c = global.currentPagStarter; c <= totalPages && numAppended < 9; c++) {
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
            populateSearchPlayersTable(this.attributes.search.value,this.attributes.pageNum.value);
        });

        pageLink.textContent = c;
        global.lastPagNumber = c;
        pageItem.appendChild(pageLink);

        if( c == 1 ) {
            pagPrev.parentElement.insertBefore(pageItem,pagPrev.nextSibling);
        }
        else {
            pagPrev.parentElement.insertBefore(pageItem,pagPrev.parentElement.querySelector(' li.search-players-pag-next'));
        }

        numAppended++;

    }
}

let populateSearchPlayerPagination = function (currentPage,totalPages,query) {
    let pagPrevs = [
        document.querySelector('div[name="search-players-pag-1"] ul li.search-players-pag-prev'),
        document.querySelector('div[name="search-players-pag-2"] ul li.search-players-pag-prev')
    ];
    let pagNexts = [
        document.querySelector('div[name="search-players-pag-1"] ul li.search-players-pag-next'),
        document.querySelector('div[name="search-players-pag-2"] ul li.search-players-pag-next')
    ]

    let pages = document.querySelectorAll('div[name="search-page"] .page-number');
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

let populateSearchPlayerDisplayTables = function (playerObj,data) {
    document.querySelector('div[name="search-display"]').setAttribute('playerobj',JSON.stringify(playerObj));

    document.querySelector('h3[name="search-display-name"]').textContent = playerObj.name;
    document.querySelector('h4[name="search-display-team"]').textContent = `${playerObj.position} on the ${playerObj.team}`;
    document.querySelector('div[name="search-display-stat-header"]').style.display = "block";

   let dataTable1 =  document.querySelector('table[name="search-display-1"]');
    dataTable1.querySelectorAll('tr td').forEach(td => {
        td.parentElement.remove();
    });

    let dataTable2 =  document.querySelector('table[name="search-display-2"]');
    dataTable2.querySelectorAll('tr td').forEach(td => {
        td.parentElement.remove();
    });

    let dataTable3 =  document.querySelector('table[name="search-display-3"]');
    dataTable3.querySelectorAll('tr td').forEach(td => {
        td.parentElement.remove();
    });

    document.querySelector('div[name="search-display-data-container"]').setAttribute('searchdataobj',JSON.stringify(data));

    if( data !== undefined ) {
        dataTable1.style.display = "block";
        document.querySelector('table[name="search-display-2"]').style.display = "block";
        document.querySelector('table[name="search-display-3"]').style.display = "block";
        document.querySelector('button[name="season-add" ]').style.display = "block";

        let tr1 = document.createElement('tr');
        let tr1Inner = `
            <td>${data.games_played}</td>
            <td>${data.min}</td>
            <td>${data.fgm}</td>
            <td>${data.fga}</td>
            <td>${data.fg3m}</td>
            <td>${data.fg3a}</td>
            <td>${data.ftm}</td>
            <td>${data.fta}</td>
        `;
        tr1.innerHTML = tr1Inner;
        dataTable1.appendChild(tr1);

        let tr2 = document.createElement('tr');
        let tr2Inner = `
            <td>${data.oreb}</td>
            <td>${data.dreb}</td>
            <td>${data.reb}</td>
            <td>${data.ast}</td>
            <td>${data.stl}</td>
            <td>${data.blk}</td>
            <td>${data.turnover}</td>
        `;
        tr2.innerHTML = tr2Inner;
        dataTable2.appendChild(tr2);

        let tr3 = document.createElement('tr');
        let tr3Inner = `
            <td>${data.pts}</td>
            <td>${data.fg_pct}</td>
            <td>${data.fg3_pct}</td>
            <td>${data.ft_pct}</td>
        `;
        tr3.innerHTML = tr3Inner;
        dataTable3.appendChild(tr3);

        document.querySelector('p[name="search-games-no-found"]').style.display = "none";
    }
    else {
        dataTable1.style.display = "none";
        document.querySelector('table[name="search-display-2"]').style.display = "none";
        document.querySelector('table[name="search-display-3"]').style.display = "none";
        document.querySelector('button[name="season-add" ]').style.display = "none";
        
        document.querySelector('p[name="search-games-no-found"]').style.display = "block";

    }
}

let populateSearchPlayerDisplay = function (playerObj,season = null) {
    if( season === null ) {
        let date = new Date();
        season = date.getFullYear().toString();
    }

    axios.get(`https://www.balldontlie.io/api/v1/season_averages?season=${season}&player_ids[]=${playerObj.playerid}`)
        .then((response) => {
             if( response && response.data ) {
                let data = response.data.data[0];
                populateSearchPlayerDisplayTables(playerObj,data);
             }
        })
        .catch((error) => {
            swal(error.toString());
        });
}

let populateSearchPlayersTable = function (query, pageNumber = null ) {
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
                let table = document.querySelector('table[name="search-players-table"]');
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
                           team:this.attributes.team.value
                       };                    

                       let year = new Date();
                       document.querySelector('select[name="search-display-stat-year"]').value = year.getFullYear().toString();
                       
                        populateSearchPlayerDisplay(playerObj);
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
    let pagItem = document.querySelector(' li.search-players-pag-next').previousElementSibling;
    let curPageItem = document.querySelectorAll('div[name="search-page"] .pag-selected');
    populateSearchPlayersTable(pagItem.attributes.search.value,Number(curPageItem[0].textContent) - 1);
};

let nextCB = function () {
    let pagItem = document.querySelector(' li.search-players-pag-prev').nextElementSibling;
    let curPageItem = document.querySelectorAll('div[name="search-page"] .pag-selected');

    if( Number(curPageItem[0].textContent) <  Number( document.querySelector('div[name="search-players-pag-1"] ul li.search-players-pag-prev').attributes.maxpages.value ) ) {
        populateSearchPlayersTable(pagItem.attributes.search.value,Number(curPageItem[0].textContent) + 1);
    }
};

let initEventListeners = function () {
    // search form listener
    document.querySelector('form[name="search-players-form"]').addEventListener("submit",(e) => {
        event.preventDefault();
        global.currentPagStarter = 1;
        let query = document.querySelector('input[name="search-players-text-input"]').value;
        populateSearchPlayersTable(query);
    });

    // events for previous pagination button
    document.querySelector('div[name="search-players-pag-1"] ul li.search-players-pag-prev').addEventListener("click",prevCB);
    document.querySelector('div[name="search-players-pag-2"] ul li.search-players-pag-prev').addEventListener("click",prevCB);
    // events for next pagination button
    document.querySelector('div[name="search-players-pag-1"] ul li.search-players-pag-next').addEventListener("click",nextCB);
    document.querySelector('div[name="search-players-pag-2"] ul li.search-players-pag-next').addEventListener("click",nextCB);

    // date cahnge listener for player stat display
    let date = new Date();
    let year = date.getFullYear().toString();
    let yearSelect = document.querySelector('select[name="search-display-stat-year"]');
    for(let k = year; k >= 1946; k--) {
        let option = document.createElement('option');
        option.attributes.value = k;
        option.textContent = k;

        yearSelect.appendChild(option);
    }

    yearSelect.addEventListener("change",function(){
        let selectYear = this.value;
        let playerObj = JSON.parse(document.querySelector('div[name="search-display"]').attributes.playerObj.value);

        populateSearchPlayerDisplay(playerObj,selectYear);
    });

    document.querySelector('div[name="search-display-data-container"]').addEventListener("click",function () {
        let dataset = JSON.parse(this.attributes.searchdataobj.value);
        let playerObj = JSON.parse(document.querySelector('div[name="search-display"]').attributes.playerObj.value);
        dataset.playerObj = playerObj;
        dataset.id = `${playerObj.name}-${String(dataset.season)}`;
        
        if( window.compare.setListAtMax() === true ) {
            swal('dataset list has reached max of 6 datasets');
        }
        else if (  window.compare.setExists(dataset) === true ) {
            swal('dataset already exists in dataset list');
        }
        else {
            window.compare.updateCharts(dataset,"season");
            swal('dataset added');
        }
    });
}

window.searchPlayers = {
    initEventListeners:initEventListeners,
    populateSearchPlayersTable:populateSearchPlayersTable
}
})();