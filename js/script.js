d3.dsv(";", "file:///C:/Users/kopyt/Documents/CODE/video-data-overlay/data.csv", function (d) {
  return {
    time: +d.time,
    var1: +d.var1,
    var2: +d.var2
  }
}).then(function (data) {

  time_arr = [];
  var1_arr = [];
  for (i = 0; i < data.length; i++) {
    time_arr.push(data[i].time)
    var1_arr.push(data[i].var1)
  }

  window.data = { time: time_arr, var1: var1_arr };


  var originalLineDraw = Chart.controllers.line.prototype.draw;
  Chart.helpers.extend(Chart.controllers.line.prototype, {
    draw: function () {
      originalLineDraw.apply(this, arguments);

      var chart = this.chart;
      var ctx = chart.chart.ctx;

      var index = chart.config.data.lineAtIndex;
      if (index) {
        var xaxis = chart.scales['x-axis-0'];
        var yaxis = chart.scales['y-axis-0'];

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xaxis.getPixelForValue(undefined, index), yaxis.top);
        ctx.strokeStyle = '#ff0000';
        ctx.lineTo(xaxis.getPixelForValue(undefined, index), yaxis.bottom);
        ctx.stroke();
        ctx.restore();
      }
    }
  });

  var ctx = document.getElementById('myChart').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: window.data.time,
      datasets: [{
        label: 'Velocity',
        backgroundColor: 'rgba(0, 0, 0,0)',
        borderColor: 'rgb(255, 99, 132)',
        data: window.data.var1
      }],
      lineAtIndex: 0
    },

    // Configuration options go here
    options: {
      responsive: false,
      title: {
        display: true,
        text: 'Velocity'
      }
    }
  });

  function displayTime(event) {
    t = document.getElementById("video").currentTime

    idx = d3.minIndex(window.data.time.map(x => Math.abs(x-t)));

    //console.log(t);
    //chart.options.title.text = 'sample title: ' + t + "s";
    chart.data.lineAtIndex = idx;
    chart.update();

    document.getElementById("var1").innerHTML = Number(window.data.var1[idx]).toFixed(2) + "m/s";
    //document.getElementById("time").innerHTML =  Number(t).toFixed(0) + "s";
  }

  //document.getElementById("video").addEventListener("playing", displayTime);
  window.setInterval(displayTime, 100)

});

