
fetch('tree_data_with_fields.json')
  .then(response => response.json())
  .then(data => {
    const width = 1000, height = 800;
    const treeLayout = d3.tree().size([height, width - 200]);
    const root = d3.hierarchy(data);
    root.x0 = height / 2;
    root.y0 = 0;

    const svg = d3.select("#tree").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(100,0)");

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    root.children.forEach(collapse);
    update(root);

    function update(source) {
      treeLayout(root);
      const nodes = root.descendants();
      const links = root.links();

      svg.selectAll("g.node").remove();
      svg.selectAll("path.link").remove();

      const node = svg.selectAll("g.node")
        .data(nodes, d => d.data.id)
        .enter().append("g")
        .attr("class", "node")
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

      // 名前（大きめ）
      node.append("a")
        .attr("xlink:href", d => d.data.link || "#")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", -5)
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .text(d => d.data.name);

      // 研究分野と所属（小さめ）
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 10)
        .attr("font-size", "10px")
        .text(d => `${d.data.field}｜${d.data.affiliation}`);

      svg.selectAll("path.link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1.5)
        .attr("d", d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x));
    }
  });
