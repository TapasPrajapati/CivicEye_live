const cityData = {
  Agra: {
    violentCrimes: {
      "attempt to commit murder": 4.6,
      "culpable homicide not amounting to murder": 2,
      "kidnapped & abduction": 9.8,
      "murder": 4.4,
      "riots": 12.9,
    },
    crimesAgainstWomen: {
      "cruelty by husband or his relatives": 7,
      "dowry deaths": 2,
      "rape": 4.5,
      "sexual harassment and molestation of women": 6.2,
    },
    propertyCrimes: {
      "arson": 3,
      "auto theft": 6,
      "burglary": 7.5,
      "dacoity": 4,
      "other theft": 8,
      "robbery": 5,
    },
    economicCrimes: {
      "cheating": 6,
      "counterfeiting": 2.5,
      "criminal breach of trust": 4,
      "forgery": 3.5,
    },
  },
  Delhi: {
    violentCrimes: {
      "attempt to commit murder": 5.2,
      "culpable homicide not amounting to murder": 1.8,
      "kidnapped & abduction": 10.5,
      "murder": 5.0,
      "riots": 14.2,
    },
    crimesAgainstWomen: {
      "cruelty by husband or his relatives": 8,
      "dowry deaths": 2.2,
      "rape": 5.0,
      "sexual harassment and molestation of women": 7.0,
    },
    propertyCrimes: {
      "arson": 3.5,
      "auto theft": 7.0,
      "burglary": 8.0,
      "dacoity": 4.5,
      "other theft": 9.0,
      "robbery": 5.5,
    },
    economicCrimes: {
      "cheating": 6.5,
      "counterfeiting": 3.0,
      "criminal breach of trust": 4.5,
      "forgery": 4.0,
    },
  },
  Mumbai: {
    violentCrimes: {
      "attempt to commit murder": 4.8,
      "culpable homicide not amounting to murder": 1.5,
      "kidnapped & abduction": 8.5,
      "murder": 4.0,
      "riots": 11.5,
    },
    crimesAgainstWomen: {
      "cruelty by husband or his relatives": 6.5,
      "dowry deaths": 1.8,
      "rape": 4.0,
      "sexual harassment and molestation of women": 5.5,
    },
    propertyCrimes: {
      "arson": 2.8,
      "auto theft": 5.5,
      "burglary": 7.0,
      "dacoity": 3.8,
      "other theft": 7.5,
      "robbery": 4.5,
    },
    economicCrimes: {
      "cheating": 5.8,
      "counterfeiting": 2.2,
      "criminal breach of trust": 3.8,
      "forgery": 3.2,
    },
  },
};

const nationalAverage = {
  violentCrimes: {
    "attempt to commit murder": 5.0,
    "culpable homicide not amounting to murder": 1.8,
    "kidnapped & abduction": 9.0,
    "murder": 4.8,
    "riots": 12.0,
  },
  crimesAgainstWomen: {
    "cruelty by husband or his relatives": 7.5,
    "dowry deaths": 2.0,
    "rape": 4.8,
    "sexual harassment and molestation of women": 6.5,
  },
  propertyCrimes: {
    "arson": 3.2,
    "auto theft": 6.5,
    "burglary": 7.8,
    "dacoity": 4.2,
    "other theft": 8.5,
    "robbery": 5.2,
  },
  economicCrimes: {
    "cheating": 6.2,
    "counterfeiting": 2.8,
    "criminal breach of trust": 4.2,
    "forgery": 3.8,
  },
};
const margin = { top: 70, right: 120, bottom: 80, left: 70 }; // Adjusted margins
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

function createChart(container, title, data, subCategories, colors, nationalData) {
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand().domain(subCategories).range([0, width]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max([
        ...Object.values(data),
        ...Object.values(nationalData)
    ])]).nice().range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0).tickFormat(d => d))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y).ticks(5));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30) // Adjusted y position
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(title);

    // City Bars
    svg.selectAll(".bar-city")
        .data(subCategories)
        .enter().append("rect")
        .attr("class", "bar bar-city")
        .attr("x", d => x0(d))
        .attr("y", d => y(data[d]))
        .attr("width", x0.bandwidth() / 2)
        .attr("height", d => height - y(data[d]))
        .attr("fill", d => colors[d])
        .append("title").text(d => `${d}: ${data[d].toFixed(2)}`); //tooltip

    // National Bars
    svg.selectAll(".bar-national")
        .data(subCategories)
        .enter().append("rect")
        .attr("class", "bar bar-national")
        .attr("x", d => x0(d) + x0.bandwidth() / 2)
        .attr("y", d => y(nationalData[d]))
        .attr("width", x0.bandwidth() / 2)
        .attr("height", d => height - y(nationalData[d]))
        .attr("fill", d => colors[d])
        .attr("opacity", 0.6)
        .append("title").text(d => `${d}: ${nationalData[d].toFixed(2)}`); //tooltip


    // Legend (Improved positioning and layout)
    const legend = svg.selectAll(".legend")
        .data(subCategories)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 10},${i * 20})`); // Positioned to the right


    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => colors[d]);

    legend.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .text(d => d.toUpperCase())
        .attr("class", "axis-label");

        // Add y-axis label
        svg.append("text")             
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Crime Rate");  
}

function updateCharts(city) {
  const container = d3.select("#charts-container");
  container.html(""); // Clear previous charts

  Object.keys(cityData[city]).forEach(crimeType => {
      const data = cityData[city][crimeType];
      const nationalData = nationalAverage[crimeType];
      const subCategories = Object.keys(data);

      const chartContainer = container.append("div").attr("class", "chart-container").node(); // Create container for each chart

      createChart(
          chartContainer,
          crimeType.replace(/([A-Z])/g, ' $1').toUpperCase(),
          data,
          subCategories,
      { "attempt to commit murder": "#89CFF0", "culpable homicide not amounting to murder": "#A9A9A9", "kidnapped & abduction": "#90EE90", "murder": "#FFA07A", "riots": "#B19CD9", "cruelty by husband or his relatives": "#F08080", "dowry deaths": "#FFDAB9", "rape": "#FFB6C1", "sexual harassment and molestation of women": "#E6E6FA", "arson": "#FFD700", "auto theft": "#DAA520", "burglary": "#FF7F50", "dacoity": "#87CEEB", "other theft": "#40E0D0", "robbery": "#FF4500", "cheating": "#00FA9A", "counterfeiting": "#98FB98", "criminal breach of trust": "#32CD32", "forgery": "#1E90FF" },
      nationalData
    );
  });
}

d3.select("#city-select").on("change", function () {
  updateCharts(this.value);
});

updateCharts("Agra"); // Default city