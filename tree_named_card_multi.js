
fetch('tree_data_with_fields.json')
  .then(response => response.json())
  .then(dataArray => {
    const width = 2000;
    const treeHeight = 600;
    const spacing = 100;

    const totalHeight = dataArray.length * (treeHeight + spacing);

    const svg = d3.select("#tree").append("svg")
      .attr("width", width)
      .attr("height", totalHeight)
      .append("g")
      .attr("transform", "translate(100,0)");

    dataArray.forEach((data, index) => {
      const yOffset = index * (treeHeight + spacing);
      const treeLayout = d3.tree().size([treeHeight, width - 200]);
      const root = d3.hierarchy(data);
      root.x0 = treeHeight / 2;
      root.y0 = 0;

      function collapse(d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }
      if (root.children) {
        root.children.forEach(collapse);
      }

      update(root, yOffset);

      function update(source, offsetY) {
        treeLayout(root);
        const nodes = root.descendants();
        const links = root.links();

        const node = svg.selectAll(`g.node-${index}`)
          .data(nodes, d => d.data.id)
          .enter().append("g")
          .attr("class", `node-${index}`)
          .attr("transform", d => `translate(${d.y},${d.x + offsetY})`)
          .on("click", function (event, d) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d, offsetY);
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

        svg.selectAll(`path.link-${index}`)
          .data(links)
          .enter().append("path")
          .attr("class", `link-${index}`)
          .attr("fill", "none")
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.5)
          .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x + offsetY));
      }
    });
  });
