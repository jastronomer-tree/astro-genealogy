fetch('tree_data_with_fields.json')
  .then(response => response.json())
  .then(dataArray => {
    const width = 1000;
    const spacing = 100;

    const container = d3.select("#tree").append("div")
      .style("overflow", "auto")
      .style("width", width + "px")
      .style("max-height", "1000px")
      .style("border", "1px solid #ccc");

    const svg = container.append("svg");

    let currentOffset = 0;
    const allHeights = [];

    dataArray.forEach((data, index) => {
      const root = d3.hierarchy(data);
      const treeHeight = 100 * root.descendants().length;
      const treeLayout = d3.tree().size([treeHeight, width - 200]);

      treeLayout(root);
      allHeights.push(treeHeight);

      const nodes = root.descendants();
      const links = root.links();

      const g = svg.append("g")
        .attr("transform", `translate(100,${currentOffset})`);

      const node = g.selectAll("g")
        .data(nodes)
        .enter().append("g")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .on("click", function (event, d) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
        });

      const boxWidth = 160;
      const boxHeight = 50;

      node.append("rect")
        .attr("x", -boxWidth / 2)
        .attr("y", -boxHeight / 2)
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", d => d.data.active ? "#d0eaff" : "#eeeeee")
        .attr("stroke", "#999");

      node.append("a")
        .attr("xlink:href", d => d.data.link || "#")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", -5)
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .text(d => d.data.name);

      node.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 10)
        .attr("font-size", "10px")
        .text(d => `${d.data.field}｜${d.data.affiliation}`);

      g.selectAll("path")
        .data(links)
        .enter().append("path")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1.5)
        .attr("d", d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x));

      currentOffset += treeHeight + spacing;
    });

    svg.attr("width", width)
       .attr("height", d3.sum(allHeights) + spacing * dataArray.length);
  });
