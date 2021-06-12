let authorization = "app_id=708dd5af&app_key=9c4a6fe58a057bde3f78a34e26f82844";
let base_ulr = "https://api.tmb.cat/v1";

let metro_lines_url = base_ulr + "/transit/linies/metro?" + authorization;


function UpdateMetroStations(ddlLines) {

    let ddlStations = document.getElementById('metrostations-dropdown');

    ddlStations.length = 0;

    var selectedText = ddlLines.options[ddlLines.selectedIndex].innerHTML;
    var selectedValue = ddlLines.value;
    let metro_stations_url = base_ulr + "/transit/linies/metro/" + selectedValue + "/estacions?" + authorization;



    fetch(metro_stations_url)
        .then(res => res.json())
        // .then(console.log)
        .then(data => {

            ddlStations.length = 0;
            // console.log(data.features.length);
            let option;

            for (let i = 0; i < data.features.length; i++) {
                console.log(data.features[i])
                option = document.createElement('option');
                option.text = data.features[i].properties.NOM_ESTACIO;
                option.value = data.features[i].properties.CODI_ESTACIO;
                ddlStations.add(option);
            }
        }
        );

}