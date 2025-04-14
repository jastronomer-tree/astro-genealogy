
fetch('tree_data_with_fields.json')
  .then(response => response.json())
  .then(dataArray => {
    const width = 1000;
    const spacing = 120;

    const container = d3.select("#tree").append("div")
      .style("overflow", "auto")
      .style("width", width + "px")
      .style("max-height", "1000px");

    const svg = container.append("svg");

    let currentOffset = 0;
    const allHeights = [];

    dataArray.forEach((data, index) => {
      const root = d3.hierarchy(data);
      const treeHeight = 100 * root.descendants().length;
      const treeLayout = d3.tree().nodeSize([70, 200]);

      treeLayout(root);
      allHeights.push(treeHeight);

      const g = svg.append("g")
        .attr("transform", `translate(100,${currentOffset})`);

      const link = g.selectAll("path.link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1.2)
        .attr("d", d3.linkVertical()
          .x(d => d.x)
          .y(d => d.y));

      const node = g.selectAll("g.node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .style("cursor", "pointer")
        .on("click", function(event, d) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          d3.select("#tree").selectAll("*").remove();  // Redraw
          materialTreeRedraw();
        });

      const boxWidth = 180;
      const boxHeight = 60;

      node.append("rect")
        .attr("x", -boxWidth / 2)
        .attr("y", -boxHeight / 2)
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("rx", 12)
        .attr("ry", 12)
        .attr("fill", d => d.data.active ? "#e3f2fd" : "#eeeeee")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1.2)
        .attr("filter", "url(#shadow)");

      node.append("a")
        .attr("xlink:href", d => d.data.link || "#")
        .append("text")
        .attr("x", 0)
        .attr("y", -6)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-family", "Roboto, sans-serif")
        .attr("font-weight", "bold")
        .text(d => d.data.name);

      node.append("text")
        .attr("x", 0)
        .attr("y", 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-family", "Roboto, sans-serif")
        .attr("fill", "#555")
        .text(d => `${d.data.field}｜${d.data.affiliation}`);

      currentOffset += treeHeight + spacing;
    });

    svg.attr("width", width)
       .attr("height", d3.sum(allHeights) + spacing * dataArray.length);

    svg.append("defs").append("filter")
      .attr("id", "shadow")
      .html('<feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#aaa"/>');

    function materialTreeRedraw() {
      d3.select("svg").remove();
      fetch('tree_named_card_material.js')
        .then(() => {
          eval(material_tree_js);
        });
    }
  });
