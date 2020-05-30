// ==UserScript==
// @name         Neptun kérdőív script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      https://unipoll.neptun.elte.hu/Survey.aspx?FillOutId*
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    var btn = document.createElement('button');
    btn.innerHTML = 'Kérdőív automatikus kitöltése';

    var heading = document.getElementsByClassName('surveyHeading')[0];
    var title = heading.getElementsByClassName('surveyTitle')[0].innerText;
    var started = GM_getValue('questionnaire_started');

    if (title.includes('OHV')) {
        heading.appendChild(btn);
    }

    btn.onclick = (e) => check(e);

    if (started) {
        btn.click();
    }

    function check(e) {

        e.preventDefault();
        GM_setValue('questionnaire_started', true);

        var nextBtn = document.getElementById("btnNext");
        var percent = parseFloat(document.getElementsByClassName("processbar-text")[1].innerText);
        var tables = document.getElementsByClassName('surveytable');
        var new_tables = document.getElementsByClassName('selectlist-table'); // Új táblák, eddig nem voltak :(

        var end_of_questionnaire = (tables.length + new_tables.length < 1)

        function survey_table() { // szokásos táblák kitöltése
            for (let i = 0; i < tables.length; i++) {
                var table = tables[i];
                for (let j = 1; j < table.rows.length; j++) {
                    var row = table.rows[j];
                    row.cells[2].click();
                }
            }
        }
        if (!end_of_questionnaire) {
            if (percent == 0) {
                new_tables[0].childNodes[2].click();
            }
            else if (tables.length > 0 && new_tables.length < 1) {
                survey_table();

                if (tables[tables.length-1].rows[1].cells[0].innerHTML.includes('tiszteletteljes')) {
                    tables[tables.length-1].rows[1].cells[1].click();
                }
            }
            else if (tables.length > 0 && new_tables.length > 0) {
                survey_table();

                new_tables[0].childNodes[1].childNodes[0].click(); //Távoktatás - felület
                new_tables[0].childNodes[4].childNodes[0].click(); //Távoktatás - felület

                new_tables[1].childNodes[1].childNodes[0].click(); //Távoktatás - elégedettség

                new_tables[2].childNodes[1].childNodes[0].click(); //Távoktatás - teher
            }
            nextBtn.click();
        }
        else {
            GM_setValue('questionnaire_started', false);
            window.close();
        }
        return false;
    }
})
();