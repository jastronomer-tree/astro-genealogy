
// tree.js - 折りたたみ式ツリー + 現役色分け付き
fetch('tree_data.json')
  .then(response => response.json())
  .then(data => {
    const width = 800, height = 600;
    const treeLayout = d3.tree().size([height, width - 160]);
    const root = d3.hierarchy(data);
    root.x0 = height / 2;
    root.y0 = 0;

    const svg = d3.select("#tree").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(80,0)");

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

      node.append("circle")
        .attr("r", 6)
        .style("fill", d => d.data.active ? "steelblue" : "#aaa");

      node.append("a")
        .attr("xlink:href", d => d.data.link || "#")
        .append("text")
        .attr("dy", 3)
        .attr("x", d => d.children || d._children ? -10 : 10)
        .style("text-anchor", d => d.children || d._children ? "end" : "start")
        .text(d => d.data.name);

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
