
fetch('tree_data_with_fields.json')
  .then(response => response.json())
  .then(dataArray => {
    const width = 1200;
    const spacing = 80;

    const svg = d3.select("#tree").append("svg")
      .attr("width", width)
      .attr("height", 2000);

    let currentOffset = 20;

    dataArray.forEach((data, index) => {
      const root = d3.hierarchy(data);
      const treeLayout = d3.tree().size([600, width - 300]);

      root.x0 = 0;
      root.y0 = 0;

      collapseAll(root);
      update(root);

      function collapseAll(d) {
        if (d.children) {
          d.children.forEach(collapseAll);
          d._children = d.children;
          d.children = null;
        }
      }

      function update(source) {
        treeLayout(root);

        const nodes = root.descendants();
        const links = root.links();

        svg.selectAll(`.node-${index}`).remove();
        svg.selectAll(`.link-${index}`).remove();

        const g = svg.append("g").attr("transform", `translate(100,${currentOffset})`);

        const node = g.selectAll("g")
          .data(nodes)
          .enter().append("g")
          .attr("class", `node-${index}`)
          .attr("transform", d => `translate(${d.y},${d.x})`)
          .on("click", function (event, d) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d);
          });

        const boxWidth = 180, boxHeight = 50;

        node.append("rect")
          .attr("x", -boxWidth / 2)
          .attr("y", -boxHeight / 2)
          .attr("width", boxWidth)
          .attr("height", boxHeight)
          .attr("rx", 8)
          .attr("ry", 8)
          .attr("fill", d => d.data.active ? "#d0eaff" : "#eeeeee")
          .attr("stroke", "#999");

        node.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -6)
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
          .attr("class", `link-${index}`)
          .attr("fill", "none")
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.2)
          .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

        currentOffset += treeLayout(root).size()[0] + spacing;
      }
    });
  });
