// ==UserScript==
// @name         Neptun kérdőív script
// @namespace    http://tampermonkey.net/
// @version      2020/21/1
// @downloadURL  https://github.com/kovapatrik/neptun_ohv_kitolto/raw/master/neptun_ohv_script.user.js
// @description  Kérdőív kitöltő
// @include      https://unipoll.neptun.elte.hu/Survey.aspx?FillOutId*
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    var heading = document.getElementsByClassName('surveyHeading')[0];
    var title = heading.getElementsByClassName('surveyTitle')[0].innerText;
    var started = GM_getValue('questionnaire_started');
    if (title.includes('OHV')) {
        var types = ['Csaktöltsedki', 'Jó', 'Közepes', 'Rossz'];
        for (const [i, value] of types.entries()) {
            var btn = document.createElement('button');
            btn.innerHTML = value + ' értékelés';
            btn.onclick = (e) => check(e, i);
            heading.appendChild(btn);
        }
    }

    if (started && started[0]) {
        check(null, started[1], started[2]);
    }

    function check(e, type) {
        if (e) {
            e.preventDefault();
        }
        GM_setValue('questionnaire_started', [true, type]);

        var nextBtn = document.getElementById("btnNext");
        var percent = parseFloat(document.getElementsByClassName("processbar-text")[1].innerText);
        var tables = document.getElementsByClassName('surveytable');
        var new_tables = document.getElementsByClassName('selectlist-table'); // Új táblák, eddig nem voltak :(

        function survey_table(type) { // szokásos táblák kitöltése
            for (let i = 0; i < tables.length; i++) {
                var table = tables[i];
                for (let j = 1; j < table.rows.length; j++) {
                    var row = table.rows[j];
                    var question = row.cells[0].innerText;
                    if (question.includes('tiszteletteljes')) {
                        row.cells[1].click();
                    } else if (question.includes('eszköz rendelkezésemre') || question.includes('elvárt tudást megszerezzem')) {
                        row.cells[2].click();
                    } else if (question.includes('kreditértékét')) {
                        row.cells[3].click();
                    } else {
                        row.cells[type].click();
                    }
                }
            }
        }

        var end_of_questionnaire = (tables.length + new_tables.length < 1);
        if (!end_of_questionnaire) {

            if (tables.length > 0) {
                survey_table(type);
            }

            if (percent == 0) { // első kérdés
                var ind;
                if (type == 0){
                    ind = 1; // egy órán sem vettem részt
                } else {
                    ind = 4; // legalább az órák háromnegyedén, de nem mindegyiken
                }
                new_tables[0].childNodes[ind].click();
            } else if (type == 0 && new_tables.length > 0) {
                new_tables[0].childNodes[4].childNodes[0].click(); // a kurzust óralátogatás nélkül is teljesíthetőnek tartottam
            } else {
                if (new_tables.length > 0 && percent != 0) {
                    new_tables[0].childNodes[6].childNodes[0].checked = true; // Canvas
                    new_tables[0].childNodes[15].childNodes[0].checked = true; // MS Teams

                    // new_tables[1].childNodes[type-1].childNodes[0].click();

                    // new_tables[2].childNodes[1].childNodes[0].click();
                }
            }

            nextBtn.click();
        } else {
            GM_setValue('questionnaire_started', [false, null]);
            window.close();
        }
        return false;
    }
})
();
