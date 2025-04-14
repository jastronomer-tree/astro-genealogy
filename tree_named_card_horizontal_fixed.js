
fetch('tree_data_with_fields.json')
  .then(response => response.json())
  .then(dataArray => {
    const width = 1200;
    const spacing = 100;

    const container = d3.select("#tree").append("div")
      .style("overflow", "auto")
      .style("width", width + "px")
      .style("max-height", "1000px");

    const svg = container.append("svg");
    const g = svg.append("g").attr("transform", "translate(150,20)");

    let currentOffset = 0;

    dataArray.forEach((data, index) => {
      const root = d3.hierarchy(data);
      root.x0 = 0;
      root.y0 = 0;

      const treeLayout = d3.tree().size([600, width - 300]);

      function collapse(d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }

      root.children?.forEach(collapse);
      update(root);

      function update(source) {
        treeLayout(root);
        const nodes = root.descendants();
        const links = root.links();

        g.selectAll("g.node").remove();
        g.selectAll("path.link").remove();

        const node = g.selectAll("g.node")
          .data(nodes, d => d.data.id)
          .enter().append("g")
          .attr("class", "node")
          .attr("transform", d => `translate(${d.y},${d.x + currentOffset})`)
          .on("click", function(event, d) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d);
          });

        const boxWidth = 180;
        const boxHeight = 60;

        node.append("rect")
          .attr("x", -boxWidth / 2)
          .attr("y", -boxHeight / 2)
          .attr("width", boxWidth)
          .attr("height", boxHeight)
          .attr("rx", 10)
          .attr("ry", 10)
          .attr("fill", d => d.data.active ? "#e3f2fd" : "#eeeeee")
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.2);

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

        g.selectAll("path.link")
          .data(links)
          .enter().append("path")
          .attr("class", "link")
          .attr("fill", "none")
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.2)
          .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x + currentOffset));
      }

      currentOffset += treeLayout(root).size()[0] + spacing;
    });

    svg.attr("width", width).attr("height", currentOffset + 100);
  });
