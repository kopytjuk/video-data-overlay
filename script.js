console.log("Hello world!")

var video_file = null
var data_file = null
var config = null

$("#inputVideoFile").change(function () {
    video_file = this.files[0];
    $("#inputVideoFileName").html(video_file.name);
    var fileURL = URL.createObjectURL(video_file);
    $("#video").attr('src', fileURL);
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
    str_arr = [];
    for (var key in cfg) {

        elem = cfg[key];

        // write id
        str_elem = '<div class="overlay-element" id="' + key + '"';

        if (elem["style"].length > 0) {

            str_elem += ' style="'

            // iterate over style properties
            for (var s in elem["style"]) {
                //
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

    config_str_arr = config_to_html(config);
    for (i = 0; i < config_str_arr.length; i++){
        $("#overlay-area").append(config_str_arr[i]);
    }

    var data_reader = new FileReader();
    data_reader.onload = function () {
        //Txt file output
        var txtRes = data_reader.result;
        // Init the "SSV" parser, which splits data on semi-colons
        var parser = d3.dsvFormat(';')
        data = parser.parse(txtRes, function (d) {
            mapping = {time: +d.time}
            for (var key in config) {
                mapping[key] = +d[key]
            }
            return mapping
        })

        // fill data arrays
        window.data["time"] = []
        for (var key in config) {
            window.data[key] = []
        }
        for (i = 0; i < data.length; i++) {
            window.data["time"].push(data[i].time)
            for (var key in config) {
                window.data[key].push(data[i][key])
            }
        }
        console.log("Found " + data.length + " entries.")
    };
    data_reader.readAsText(data_file);

    //$("#overlay-area").append('<div id="var1" class="overlay-element" style="left: 50px; top: 100px"><br></div>');
    //$("#overlay-area").append('<div id="var2" class="overlay-element" style="left: 50px"><br></div>');
    function displayTime(event) {
        t = document.getElementById("video").currentTime
  
        idx = d3.minIndex(window.data.time.map(x => Math.abs(x - t)));
        for (var key in config) {
            //console.log(key)
            //console.log(window.data[key])
            $("#" + key).html("" + Number(window.data[""+key][idx]).toFixed(2));
        }
      }
  
      //document.getElementById("video").addEventListener("playing", displayTime);
      window.setInterval(displayTime, 100)
});
