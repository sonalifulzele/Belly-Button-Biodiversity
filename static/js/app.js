function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${sample}`;
  d3.json(url).then(function(sample){  
    // Use d3 to select the panel with id of `#sample-metadata`
    var sample_metadata = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    sample_metadata.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(sample).forEach(function ([key, value]) {
      var row = sample_metadata.append("panel-body");
      row.text(`${key.toUpperCase()}: ${value}`);
    });
  });
}



function buildCharts(sample) {
  /*
  **************
  BUBBLE CHART
  ************** 
   */

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  
  var url = `/samples/${sample}`;
  d3.json(url).then(function(data) {
    // @TODO: Build a Bubble Chart using the sample data
    var x_values = data.otu_ids;
    var y_values = data.sample_values;
    var bubble_size = data.sample_values;
    var bubble_colors = data.otu_ids; 
    var t_values = data.otu_labels;
    
    var trace1 = {
      x: x_values,
      y: y_values,
      text: t_values,
      mode: 'markers',
      marker: {
        color: bubble_colors,
        size: bubble_size
      } 
    };
  
    var data = [trace1];

    var layout = {
      xaxis: { 
        title: "OTU ID",
        tickmode: "linear",
        tick0: 0,
        dtick: 500,
      },
      title: 'Operational taxonomic unit(OTU) level for sample ' +sample
    };
    
    Plotly.newPlot('bubble', data, layout);
  });

  /* 
  **************
  PIE CHART
  ************** 
   */
  // @TODO: Build a Pie Chart
  // HINT: You will need to use slice() to grab the top 10 sample_values,
  // otu_ids, and labels (10 each).
  d3.json(url).then(function(data) {  
    var pie_values = data.sample_values.slice(0,10);
    var pie_labels = data.otu_ids.slice(0,10);
    var pie_hover = data.otu_labels.slice(0,10);
    // var pie_colors = ['rgba(10, 84, 0, .5)', 'rgba(12, 97, 0, .5)',
    //                 'rgba(13, 113, 0, .5)', 'rgba(14, 127, 0, .5)',
    //                 'rgba(110, 154, 22, .5)', 'rgba(170, 202, 42, .5)',
    //                 'rgba(202, 209, 95, .5)', 'rgba(210, 206, 145, .5)',
    //                 'rgba(232, 226, 202, .5)', 'rgba(255, 255, 255, 0)']
    
    var data = [{
      values: pie_values,
      labels: pie_labels,
      hovertext: pie_hover,
      type: 'pie',
      // marker: { colors: pie_colors }
    }];
    var layout = {
      title: 'Top ten microbes in sample '+sample
    };

    Plotly.newPlot('pie', data, layout);
  });

  /* 
  **************
  GAUGE CHART
  ************** 
  */

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    // d3.json(url).then(function(data){
  
  var url = `/metadata/${sample}`;
  d3.json(url).then(function(data) { 

    //Frequency of scrubs per week is between 1 and 9
    var sampleID = data.sample;
    var scrubs = data.WFREQ;

    //Pointer needle must move between within the 9 sections
    var degrees = 9 - scrubs;
    var radius = .5;
    var radians = degrees * Math.PI / 9;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.035 L .0 0.035 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ 
      type: 'category',
      x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'Scrubs/week',
      title: 'Scrubs per week',
      text: scrubs,
      hoverinfo: 'text+name'
      },
      { 
        values: [ 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',      
        marker: {colors: ['rgba(10, 84, 0, .5)', 'rgba(12, 97, 0, .5)',
                    'rgba(13, 113, 0, .5)', 'rgba(14, 127, 0, .5)',
                    'rgba(110, 154, 22, .5)', 'rgba(170, 202, 42, .5)',
                    'rgba(202, 209, 95, .5)', 'rgba(210, 206, 145, .5)',
                    'rgba(232, 226, 202, .5)', 'rgba(255, 255, 255, 0)']
        },
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title:'BB Washing Frequency for sample ' +sampleID ,
      height: 500,
      width: 600,
      xaxis: {type:'category',zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {type:'category',zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };
    Plotly.newPlot('gauge', data, layout);
  });
}; 

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
