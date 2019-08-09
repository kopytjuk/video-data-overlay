/*
MIT License

Copyright (c) 2019 Marat Kopytjuk
*/

var video_file = null
var data_file = null
var config = null

$("#inputVideoFile").change(function () {
    video_file = this.files[0];
    $("#inputVideoFileName").html(video_file.name);
})

$("#inputDataFile").change(function () {
    data_file = this.files[0];
    $("#inputDataFileName").html(data_file.name);
})

$("#inputConfigFile").change(function () {
    config_file = this.files[0];
    $("#inputConfigFileName").html(config_file.name);

    var config_reader = new FileReader();
    config_reader.onload = function () {
        //Txt file output
        var txtRes = config_reader.result;

        config = jsyaml.load(txtRes);
    };
    config_reader.readAsText(config_file);
})

function config_to_html(cfg) {
    // given a js-yaml parsed object cosntruct
    // a div element based on the configuration
    str_arr = [];
    for (var key in cfg) {

        elem = cfg[key];

        // write id, which will be referenced later for displaying data
        str_elem = '<div class="overlay-element" id="' + key + '"';

        if (elem["style"].length > 0) {

            str_elem += ' style="'

            // iterate over (CSS-)style properties
            for (var s in elem["style"]) {
                s_val = elem["style"][s];
                str_elem += Object.keys(s_val)[0] + ": " + s_val[Object.keys(s_val)[0]];
                str_elem += ";";
            }
            str_elem += '"'
        }

        str_elem += "><br></div>"
        str_arr.push(str_elem);
    }
    return str_arr;
};

$("#startButton").click(function () {

    // show the video container first
    $("#video-container").css("display", "block");

    // read local video file and display it
    var fileURL = URL.createObjectURL(video_file);
    $("#video").attr('src', fileURL);

    // read config file
    config_str_arr = config_to_html(config);
    for (i = 0; i < config_str_arr.length; i++){
        $("#overlay-area").append(config_str_arr[i]);
    }

    var data_reader = new FileReader();
    // after the data is loaded
    data_reader.onload = function () {
        //Txt file output
        var txtRes = data_reader.result;
        var parser = d3.dsvFormat(';')

        data = parser.parse(txtRes, function (d) {
            // time is converted to a float, because we need
            // it later to synchronize video-time with the data
            mapping_rule = {time: +d.time}
            for (var key in config) {
                mapping_rule[key] = d[key]
            }
            return mapping_rule
        })

        // create fields for time and data arrays in the window object
        window.data["time"] = []
        for (var key in config) {
            window.data[key] = []
        }

        // fill the above mentioned arrays
        for (i = 0; i < data.length; i++) {
            window.data["time"].push(data[i].time)
            for (var key in config) {
                window.data[key].push(data[i][key])
            }
        }
        console.log("Found " + data.length + " entries.")
    };
    data_reader.readAsText(data_file);

    // define a callback function for each 100ms
    function displayTime(event) {
        t = document.getElementById("video").currentTime
        
        // find the closest index in the time array
        idx = d3.minIndex(window.data.time.map(x => Math.abs(x - t)));

        // the index is used to select data values to show on the overlay
        for (var key in config) {
            $("#" + key).html("" + window.data[""+key][idx]);
        }
      }
  
      // fired with 100Hz
      window.setInterval(displayTime, 10)
});
