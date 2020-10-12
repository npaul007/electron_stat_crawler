(function(){
    window.Chart = require('chart.js');

    const removeItem = (items, i) => {
        items.slice(0, i-1).concat(items.slice(i, items.length));
    }

    const keylabels = {
        "ast":"Assists", 
        "blk":"Blocks", 
        "dreb":"Defensive Rebounds", 
        "fg3_pct":"Three point percentage", 
        "fg3a":"Three point attempts", 
        "fg3m":"Three pointers made", 
        "fg_pct":"Field goal percentage", 
        "fga":"Field goal attempts", 
        "fgm":"Field goals made", 
        "ft_pct":"Free throw percentage", 
        "fta":"Free throw attempts", 
        "ftm":"Free throws made", 
        "min":"Minutes played", 
        "oreb":"Offensive rebounds", 
        "pf":"Player efficiency",  
        "pts":"Points", 
        "reb":"Rebounds", 
        "stl":"Steals", 
        "turnover":"Turnovers"
    };

    const setKeys = [
        "pts", 
        "reb", 
        "ast", 
        "blk", 
        "dreb", 
        "fg3_pct", 
        "fg3a", 
        "fg_pct", 
        "fga", 
        "fgm", 
        "ft_pct", 
        "fta", 
        "ftm", 
        "min", 
        "oreb", 
        "pf",  
        "stl", 
        "turnover"
    ];

    let DataSetObjList = [];
    
    let datasetList = [];

    let chartList = [];

    let setExists = function (gameobj) {
       return datasetList.find(d => d && d.id == gameobj.id) !== undefined;
    }

    let setListAtMax = function () {
        return datasetList.length === 6;
    }

    let addDataset = function (dataset,type) {

        datasetList.push(dataset);
        
        setKeys.forEach(key => {
            if( dataset[key] === null ||  dataset[key] === undefined ) {
                dataset[key] = 0;
            }

            if( key == "min" && dataset.min && dataset.min !== null ) {
                let minutes = dataset.min.replace(/:/g,'.');
                let minNumber = Number(minutes.split('.')[0]);
                let remainder = Number(minutes.split('.')[1]) / 60;
                dataset[key] = minNumber + remainder;
            }

            let foundDataSetObj = DataSetObjList.find( obj => obj.name === key );
            if( foundDataSetObj ) {
                let data = dataset[key];
                let label; 
                
                if( type == "game" ) {
                    label = `${dataset.player.first_name.substring(0,1)}.${dataset.player.last_name} ${dataset.game.date.split("T")[0]}`;
                }
                else if ( type == "season" ) {
                    label = `${dataset.playerObj.name.split(" ")[0].substring(0,1)} . ${dataset.playerObj.name.split(" ")[1] }-${dataset.season}`;
                }

                foundDataSetObj.labels.push(label);
                foundDataSetObj.data.push(data);
                foundDataSetObj.ids.push(dataset.id);
            }                
        });
        
    }

    let removeDataset = function (_id) {
        let dataSetInd = datasetList.findIndex(d => d && d.id == _id );
        datasetList.splice(dataSetInd,1);

        DataSetObjList.forEach(obj => {
            let index = obj.ids.findIndex(id => id == _id);
            if( index > -1 ) {
                obj.data.splice(index,1);
                obj.labels.splice(index,1);
                obj.ids.splice(index,1);
            }
        });
    }

    const DataSet = function (name) {
        this.name = name;
        this.data = [];
        this.labels = [];
        this.ids = [];

        this.addData = function (item) {
            this.data.push(item);
        }
    }

    let initDataSets  = function () {
        setKeys.forEach(key => {
            DataSetObjList.push(new DataSet(key));
        });
    }

    let resetDataSetsAndCharts = function () {

    }

    let clearCanvas = function (canvas) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    let createChart = function (ctx,name,labels,data) {
        return new window.Chart(ctx, {
             type: 'bar',
             data: {
                 labels: labels,
                 datasets: [{
                     data: data,
                     backgroundColor: [
                         'rgba(255, 99, 132, 0.2)',
                         'rgba(54, 162, 235, 0.2)',
                         'rgba(255, 206, 86, 0.2)',
                         'rgba(75, 192, 192, 0.2)',
                         'rgba(153, 102, 255, 0.2)',
                         'rgba(255, 159, 64, 0.2)'
                     ],
                     borderColor: [
                         'rgba(255, 99, 132, 1)',
                         'rgba(54, 162, 235, 1)',
                         'rgba(255, 206, 86, 1)',
                         'rgba(75, 192, 192, 1)',
                         'rgba(153, 102, 255, 1)',
                         'rgba(255, 159, 64, 1)'
                     ],
                     borderWidth: 1
                 }]
             },
             options: {
                 scales: {
                     yAxes: [{
                         ticks: {
                             beginAtZero: true
                         }
                     }]
                 },
                 legend:{
                    display:false
                },
                title:{
                    text:name,
                    display:true,

                }
             }
         });
     }

    let updateDataSetListDisplay = function () {
        let datasetListUL = document.querySelector('div[name="compare-dataset-list"] ul ');
        datasetListUL.querySelectorAll('li').forEach( li => li.remove() );

        datasetList.forEach(dataset => {
            let label;
            if( dataset.player ) {
                label = `${dataset.player.first_name.substring(0,1)}.${dataset.player.last_name} ${dataset.game.date.split("T")[0]}`;
            }
            else if( dataset.playerObj )  {
                label = `${dataset.playerObj.name.split(" ")[0].substring(0,1)} . ${dataset.playerObj.name.split(" ")[1] } - ${dataset.season}`;
            }

            let li = document.createElement('li');
            li.textContent = label;
            li.setAttribute('id',dataset.id);
            li.addEventListener("dblclick",function () {
                removeDataset(li.attributes.id.value);
                updateCharts();
                li.remove();
            });
            datasetListUL.appendChild(li);
        });
    }

    let updateCharts = function (dataset,type) {
      chartList.forEach(chartInstance => {
        chartInstance && chartInstance.destroy();
      });

      chartList = [];

       dataset && addDataset(dataset,type);  
       updateDataSetListDisplay();      

        document.querySelectorAll('.chart').forEach((chart,i) => {
            clearCanvas(chart);
            let ctx = chart.getContext('2d');
            let datasetObj = DataSetObjList[i];
            
            if( datasetObj ) {
                chartList.push(
                    createChart(
                        ctx,
                        keylabels[datasetObj.name],
                        datasetObj.labels,
                        datasetObj.data
                    )
                );
            }
        });
    }

    window.compare = {
        updateCharts:updateCharts,
        initDataSets:initDataSets,
        setExists:setExists,
        setListAtMax:setListAtMax
    }
})();