let authorization = "app_id=708dd5af&app_key=9c4a6fe58a057bde3f78a34e26f82844";
let base_ulr = "https://api.tmb.cat/v1";

let metro_lines_url = base_ulr + "/transit/linies/metro?" + authorization;
let lines_json_cache = "";

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.NOM_ESTACIO) {
        layer.bindPopup(feature.properties.NOM_ESTACIO);
    }
}


function UpdateMetroStations(ddlLines) {
    // var selectedText = ddlLines.options[ddlLines.selectedIndex].innerHTML;
    var selectedValue = ddlLines.value;
    let metro_stations_url = base_ulr + "/transit/linies/metro/" + selectedValue + "/estacions?" + authorization;



    fetch(metro_stations_url)
        .then(res => res.json())
        // .then(console.log)
        .then(data => {
            let StopListElement = document.getElementById("stopList");
            
            // if (oldStopList!=null) oldStopList.remove();
            // oldStopList.remove();
            // Create the list element:
            // var list = document.createElement('div');
            // list.setAttribute("id", "stopList");
            let StopList = "";
            for (var i = 0; i < data.features.length; i++) {
                // var item = document.createElement('li');
                // item.appendChild(document.createTextNode(data.features[i].properties.NOM_ESTACIO));
                // list.appendChild(item);
                StopList = StopList + data.features[i].properties.NOM_ESTACIO + " ➜ ";
            }
            StopListElement.innerHTML = StopList

            for (let i = 0; i < lines_json_cache.features.length; i++) {
                if (lines_json_cache.features[i].properties.CODI_LINIA == selectedValue) {
                    console.log(lines_json_cache.features[i].geometry);

                    L.geoJSON(lines_json_cache.features[i].geometry).addTo(mymap);
                }
            }
            //L.geoJSON(data, {
            //onEachFeature: onEachFeature
            //}).addTo(mymap);

        }
        );

}





let dropdown = document.getElementById('locality-dropdown');

dropdown.length = 0;

let defaultOption = document.createElement('option');
defaultOption.text = 'Choose Metro line';

dropdown.add(defaultOption);
dropdown.selectedIndex = 0;

fetch(metro_lines_url)
    .then(res => res.json())
    //.then(console.log)
    .then(data => {
        lines_json_cache = data;
        // dropdown.length = 0;
        // console.log(data.features.length);
        let option;

        for (let i = 0; i < data.features.length; i++) {
            // console.log(data.features[i])
            option = document.createElement('option');
            option.text = data.features[i].properties.NOM_LINIA + " - " + data.features[i].properties.DESC_LINIA;
            option.value = data.features[i].properties.CODI_LINIA;
            dropdown.add(option);
        }
        dropdown.selectedIndex = 0;
        // UpdateMetroStations();
    }
    );


//////////////////////////////////////////////////////


var mymap = L.map('mapid').setView([41.3888, 2.15899], 14);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);