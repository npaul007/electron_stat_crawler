(function() {
    const fs = require('fs');
    const swal = require('sweetalert');

    const defaultSettingsObj = {
        darkTheme:false,
        font:"arial"
    }

    window.settingsObj = defaultSettingsObj;

    let darkThemeOn = function (bool) {
        let body = document.querySelector('body');

        if( bool === true ) {
            body.classList.add('darkTheme');
        }
        else if ( bool ===  false ) {
            body.classList.remove('darkTheme');
        }
    }

    let loadFont = function (value) {
        let body = document.querySelector('body');
        let fonts = [];
        let selectFont = document.querySelector('select[name="select-font"]');
        selectFont.querySelectorAll('option').forEach(option => {
           option.value && fonts.push(option.value);
        });

        fonts.forEach(font => {
            body.classList.remove(font);

            let tables = document.querySelectorAll('table');
            tables.forEach(table => {
                table.classList.remove(font);
                table.classList.add(value);
            });
        });

        body.classList.add(value);

        window.Chart.defaults.global.defaultFontFamily = value;
        window.compare.updateCharts();
    }

    let initEventListeners = function() {
        document.querySelector('form[name="settings-form"]').addEventListener("submit",function (event) {
            event.preventDefault();
            
            const darkTheme = this['onoffswitch-darktheme'].checked;
            const font = this["select-font"].value;

            window.settingsObj.darkTheme = darkTheme;
            window.settingsObj.font = font;
            writeSettings();
        });

        document.querySelector('select[name="select-font"]').addEventListener("change",function() {
            loadFont(this.value);
        });

        document.querySelector('input[name="onoffswitch-darktheme"]').addEventListener("change",function() {
           darkThemeOn(this.checked);
        });
    }

    let loadSettings = function () {
        document.querySelector('select[name="select-font"]').value = window.settingsObj.font;
        document.querySelector('input[name="onoffswitch-darktheme"]').checked = window.settingsObj.darkTheme;

        darkThemeOn(window.settingsObj.darkTheme);
        loadFont(window.settingsObj.font);
    }
    
    let writeSettings = function () {
        fs.writeFile(`${require('os').tmpdir()}/statcrawler_settings.json`, JSON.stringify(window.settingsObj),'utf-8',function(error,data) {
            if( error ) {
                console.log(`Failed to write settings file ${error}`);
                swal('Failed to save settings due to error:'+error);
            }
            else {
                console.log("Settings file written successfully");
                swal('Settings saved');
            }
        });
    }

    let initSettings = function (_callback) {
        let errorCB = (error) => {
            console.log(error);
            console.log("Failed to parse settings, generating settings file");
            window.settingsObj = defaultSettingsObj;
            writeSettings();
            loadSettings();
        }

        fs.readFile(`${require('os').tmpdir()}/statcrawler_settings.json`, (error, data) => {
            if (error){
                errorCB(error);
            }
            else {
                try {
                    console.log('Settings exist parsing now.');
                    window.settingsObj = JSON.parse(data);
                    loadSettings();
                }
                catch(err) {
                    errorCB(err);
                }
            }
            _callback && _callback();
        });
    }

    window.settings = {
        initEventListeners:initEventListeners,
        initSettings:initSettings
    };
})();