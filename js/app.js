let authorization = "app_id=708dd5af&app_key=9c4a6fe58a057bde3f78a34e26f82844";
let base_ulr = "https://api.tmb.cat/v1";

let metro_lines_url = base_ulr + "/transit/linies/metro?" + authorization;
let bus_stops_url = base_ulr + "/transit/parades?" + authorization;
let lines_json_cache = "";
let lastpolygon = null;




function onEachFeature(feature, layer) {
    layer.setOpacity(0);
}

// this function is called when the user select a dropdown option
function ShowMetroLines(ddlLines) {
    var selectedValue = ddlLines.value;
    let metro_stations_url = base_ulr + "/transit/linies/metro/" + selectedValue + "/estacions?" + authorization;

    fetch(metro_stations_url)
        .then(res => res.json())
        .then(data => {
            // show the list of metro station in "stopList" div
            let StopListElement = document.getElementById("stopList");
            let StopList = "";
            for (var i = 0; i < data.features.length; i++) {
                StopList = StopList + data.features[i].properties.NOM_ESTACIO + " ➜ ";
            }
            StopListElement.innerHTML = StopList
            // remove the last showed line
            if (lastpolygon != null) { lastpolygon.remove(); }
            // get metro line geodata, and show in the map
            for (let i = 0; i < lines_json_cache.features.length; i++) {
                if (lines_json_cache.features[i].properties.CODI_LINIA == selectedValue) {
                    console.log(lines_json_cache.features[i].geometry);

                    polygon = L.geoJSON(lines_json_cache.features[i].geometry);
                    polygon.addTo(mymap);
                    lastpolygon = polygon;
                    mymap.fitBounds(polygon.getBounds());
                }
            }
        });

}

// set the data of the popup of a marker
function SetBusStationData(marker, codi_parada, description) {
    let bus_times_url = base_ulr + "/ibus/stops/" + codi_parada + "?" + authorization;

    let res = fetch(bus_times_url)
        .then(res => res.json())
        .then(json_data => {
            
            let stop_data = "";
            // concatenate time prediction data in string
            for (var i = 0; i < json_data.data.ibus.length; i++) {
                stop_data = stop_data + "<br>Linea: " + json_data.data.ibus[i].line + " / Tiempo:  " + json_data.data.ibus[i]["text-ca"] + " / Dest.:  " + json_data.data.ibus[i].destination;
            }
            marker.bindPopup("<b>" + description + "</b>" + stop_data);
            marker.openPopup();
            // unhide the marker!
            marker.setOpacity(1);
        });

}

// fill dropdown with default option

let dropdown = document.getElementById('buslines-dropdown');
let defaultOption = document.createElement('option');
defaultOption.text = 'Choose Metro line';
dropdown.add(defaultOption);

// fill dropdow with metro line names

fetch(metro_lines_url)
    .then(res => res.json())
    .then(data => {
        // save data: when we need show the lines in the map, we dont need call the api again
        lines_json_cache = data;
        let option;
        // fill dropdown
        for (let i = 0; i < data.features.length; i++) {
            option = document.createElement('option');
            option.text = data.features[i].properties.NOM_LINIA + " - " + data.features[i].properties.DESC_LINIA;
            option.value = data.features[i].properties.CODI_LINIA;
            dropdown.add(option);
        }

    });



// configure base map
var mymap = L.map('mapid').setView([41.3888, 2.15899], 14);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);


// fill map with bus stops marker (hidden)
let busLayer = null;
let lastBusMarker = null;
fetch(bus_stops_url)
    .then(res => res.json())
    .then(data => {
        busLayer = L.geoJSON(data, {
            onEachFeature: onEachFeature
        });

        busLayer.addTo(mymap);
        // after create layer, configure search box
        var searchControl = new L.Control.Search({
            position: 'topright',
            layer: busLayer,
            propertyName: 'CODI_PARADA',
            marker: false,
            zoom: 12,
            // configure action after find bus stio
            moveToLocation: function (latlng, title, map) {
                map.flyTo(latlng, 13);
                // after move view to marker, configure popup (set popup data, and eventually set opacity = 1)
                map.once('moveend', function () {
                    bus_stop_description = latlng.layer.feature.properties.CODI_PARADA + ' - ' + latlng.layer.feature.properties.NOM_PARADA;
                    bus_stop_cod = latlng.layer.feature.properties.CODI_PARADA;
                    SetBusStationData(latlng.layer, bus_stop_cod, bus_stop_description);
                    // hide the previous mark
                    if (lastBusMarker != null) {
                        lastBusMarker.setOpacity(0);
                    }
                    // set previus mark as curren mark
                    lastBusMarker = latlng.layer;
                })
            }
        });


        mymap.addControl(searchControl);
    });

