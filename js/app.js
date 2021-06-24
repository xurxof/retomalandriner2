let authorization = "app_id=708dd5af&app_key=9c4a6fe58a057bde3f78a34e26f82844";
let base_ulr = "https://api.tmb.cat/v1";

let metro_lines_url = base_ulr + "/transit/linies/metro?" + authorization;
let bus_stops_url = base_ulr + "/transit/parades?" + authorization;
// bus_stops_url = base_ulr + "/transit/estacions?" + authorization;
// let bus_time_url = base_ulr + "/transit/parades?" + authorization;
let lines_json_cache = "";
let lastpolygon = null;


function whenClicked(e) {
    // e = event
    console.log(e);
    // You can make your ajax call declaration here
    //$.ajax(... 
    selectedFeature = e.target;
    selectedFeature.setOpacity(1);
    console.log(selectedFeature);
    // fetch(metro_time_url)
    //     .then(res => res.json())
    //     .then(data => {

    //     });
}


function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    // if (feature.properties && feature.properties.NOM_PARADA) {
    //     layer.bindPopup(feature.properties.NOM_PARADA);
    // }
    layer.setOpacity(0);
    // layer.on({
    //     click: whenClicked
    // });
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
            if (lastpolygon != null) { lastpolygon.remove(); }
            for (let i = 0; i < lines_json_cache.features.length; i++) {
                if (lines_json_cache.features[i].properties.CODI_LINIA == selectedValue) {
                    console.log(lines_json_cache.features[i].geometry);

                    polygon = L.geoJSON(lines_json_cache.features[i].geometry);
                    polygon.addTo(mymap);
                    lastpolygon = polygon;

                    mymap.fitBounds(polygon.getBounds());


                }
            }
            //L.geoJSON(data, {
            //onEachFeature: onEachFeature
            //}).addTo(mymap);



            // let controlSearch = new L.Control.Search({
            //     layer: markers,
            //     zoom: 14,
            //     marker: false,
            //     moveToLocation: function(latlng, title, map) {
            //       map.flyTo(latlng, 18);

            //       map.once('moveend', function(){
            //         latlng.layer.openPopup();
            //       })
            //     }

            //   });

        }
        );

}

function SetBusStationData(marker, codi_parada, description) {
    let bus_times_url = base_ulr + "/ibus/stops/" + codi_parada + "?" + authorization;

    let res = fetch(bus_times_url)
        .then(res => res.json())
        .then(json_data => {
            // latlng.layer.bindPopup( + '<p></p>' + time_data);
            let stop_data = "";
            console.log(json_data);
            for (var i = 0; i < json_data.data.ibus.length; i++) {
                stop_data = stop_data +  "<br>Linea: " + json_data.data.ibus[i].line + " / Tiempo:  "+   json_data.data.ibus[i]["text-ca"] + " / Dest.:  "+   json_data.data.ibus[i].destination;
            }
            marker.bindPopup("<b>" + description + "</b>" + stop_data);
            marker.openPopup();
            marker.setOpacity(1);
        });

}

//////////////////////////

let dropdown = document.getElementById('locality-dropdown');

dropdown.length = 0;

let defaultOption = document.createElement('option');
defaultOption.text = 'Choose Metro line';

dropdown.add(defaultOption);
dropdown.selectedIndex = 0;



//////////////////////////////////////////////////////


var mymap = L.map('mapid').setView([41.3888, 2.15899], 14);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);



let busLayer = null;
let lastBusMarker = null;
fetch(bus_stops_url)
    .then(res => res.json())
    .then(data => {
        busLayer = L.geoJSON(data, {
            onEachFeature: onEachFeature
        });

        busLayer.addTo(mymap);

        var searchControl = new L.Control.Search({
            position:'topright',	
            layer: busLayer,
            initial: false,
            propertyName: 'CODI_PARADA',
            marker: false,
            zoom: 12,

            moveToLocation: function (latlng, title, map) {
                map.flyTo(latlng, 13);

                map.once('moveend', function () {
                    bus_stop_description = latlng.layer.feature.properties.CODI_PARADA + ' - ' + latlng.layer.feature.properties.NOM_PARADA;
                    bus_stop_cod = latlng.layer.feature.properties.CODI_PARADA;
                    SetBusStationData(latlng.layer, bus_stop_cod, bus_stop_description);

                    if (lastBusMarker != null) {
                        lastBusMarker.setOpacity(0);
                    }
                    lastBusMarker = latlng.layer;

                    // find next time
                })
            }
        });


        mymap.addControl(searchControl);
    });


// searchControl.on('search:locationfound', function(e) {

// 	//console.log('search:locationfound', );

// 	//map.removeLayer(this._markerSearch)

// 	e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
// 	if(e.layer._popup)
// 		e.layer.openPopup();

// }).on('search:collapsed', function(e) {

// 	featuresLayer.eachLayer(function(layer) {	//restore feature color
// 		featuresLayer.resetStyle(layer);
// 	});	
// });



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

        // search

    });
