
fetch('tree_data_with_fields.json')
  .then(response => response.json())
  .then(dataArray => {
    const width = 1000;
    const spacing = 100;

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
      const treeLayout = d3.tree().nodeSize([60, 180]);

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
          d3.select("#tree").selectAll("*").remove();  // 再描画
          academicTreeRedraw();
        });

      node.append("rect")
        .attr("x", -80)
        .attr("y", -25)
        .attr("width", 160)
        .attr("height", 50)
        .attr("fill", d => d.data.active ? "#f0f8ff" : "#f5f5f5")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);

      node.append("a")
        .attr("xlink:href", d => d.data.link || "#")
        .append("text")
        .attr("x", 0)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("font-family", "Noto Serif JP, serif")
        .attr("font-weight", "bold")
        .text(d => d.data.name);

      node.append("text")
        .attr("x", 0)
        .attr("y", 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-family", "Noto Serif JP, serif")
        .text(d => `${d.data.field}｜${d.data.affiliation}`);

      currentOffset += treeHeight + spacing;
    });

    svg.attr("width", width)
       .attr("height", d3.sum(allHeights) + spacing * dataArray.length);

    // 再描画関数（折りたたみ対応用）
    function academicTreeRedraw() {
      d3.select("svg").remove();
      fetch('tree_named_card_academic.js')
        .then(() => {
          eval(academic_tree_js);
        });
    }
  });
