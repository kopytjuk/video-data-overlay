console.log("Hello world!")

var video_file = null
var data_file = null
var config_file = null

$("#inputVideoFile").change(function () {
    video_file = this.files[0];
    $("#inputVideoFileName").html(video_file.name);
    var fileURL = URL.createObjectURL(video_file);
    $("#video").attr('src', fileURL);
})

$("#inputDataFile").change(function () {
    data_file = this.files[0];
    $("#inputDataFileName").html(data_file.name);

    var data_reader = new FileReader();
    data_reader.onload = function () {
        //Txt file output
        var txtRes = data_reader.result;
        console.log(txtRes)
        // Init the "SSV" parser, which splits data on semi-colons
        var parser = d3.dsvFormat(';')
        data = parser.parse(txtRes, function (d) {
            return {
                time: +d.time,
                var1: +d.var1,
                var2: +d.var2
            }
        })

        time_arr = [];
        var1_arr = [];
        for (i = 0; i < data.length; i++) {
            time_arr.push(data[i].time)
            var1_arr.push(data[i].var1)
        }
        console.log("Found " + data.length + " entries.")

        window.data = { time: time_arr, var1: var1_arr };
    };
    data_reader.readAsText(data_file);
})

$("#inputConfigFile").change(function () {
    config_file = this.files[0];
    $("#inputConfigFileName").html(config_file.name);

    var config_reader = new FileReader();
    config_reader.onload = function () {
        //Txt file output
        var txtRes = config_reader.result;

        doc = jsyaml.load(txtRes);
        console.log(doc)
    };
    config_reader.readAsText(config_file);
})

$("#startButton").click(function () {
    $(".overlay-desc").append('<div id="var1" class="overlay-element" style="left: 50px"><br></div>');
    $(".overlay-desc").append('<div id="var2" class="overlay-element" style="left: 50px"><br></div>');

    function displayTime(event) {
        t = document.getElementById("video").currentTime
  
        idx = d3.minIndex(window.data.time.map(x => Math.abs(x - t)));
  
        document.getElementById("var1").innerHTML = Number(window.data.var1[idx]).toFixed(2) + "m/s";
        //document.getElementById("time").innerHTML =  Number(t).toFixed(0) + "s";
      }
  
      //document.getElementById("video").addEventListener("playing", displayTime);
      window.setInterval(displayTime, 100)
});
