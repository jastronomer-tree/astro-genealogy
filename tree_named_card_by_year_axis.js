
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const requestedRootId = getQueryParam("id");

fetch('tree_data_with_years.json')
  .then(response => response.json())
  .then(dataArray => {
    if (!requestedRootId) {
      d3.select("#tree").append("p").text("ツリーIDが指定されていません (?id=xxx)");
      return;
    }

    const rootData = dataArray.find(d => d.id === requestedRootId);
    if (!rootData) {
      d3.select("#tree").append("p").text("指定されたIDのツリーが見つかりませんでした: " + requestedRootId);
      return;
    }

    const width = 1400;
    const height = 1000;
    const margin = { top: 60, right: 50, bottom: 50, left: 100 };
    const yearStart = 1900;
    const yearEnd = 2025;

    const svg = d3.select("#tree").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const root = d3.hierarchy(rootData);

    // 横位置 = 年次
    const xScale = d3.scaleLinear()
      .domain([yearStart, yearEnd])
      .range([0, width]);

    // 縦位置 = 自動並び（重複なく整列）
    const nodes = root.descendants();
    nodes.forEach((d, i) => {
      d.x = i * 60;
      d.y = d.data.year ? xScale(d.data.year) : 0;
    });

    const links = root.links();

    // リンク描画
    g.selectAll("path.link")
      .data(links)
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkVertical()
        .x(d => d.y)
        .y(d => d.x)
      );

    const node = g.selectAll("g.node")
      .data(nodes)
      .enter().append("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    const boxWidth = 180;
    const boxHeight = 50;

    node.append("rect")
      .attr("x", -boxWidth / 2)
      .attr("y", -boxHeight / 2)
      .attr("width", boxWidth)
      .attr("height", boxHeight)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", d => d.data.active ? "#d0eaff" : "#eeeeee")
      .attr("stroke", "#999");

    node.append("a")
      .attr("xlink:href", d => d.data.link || "#")
      .append("text")
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

    // 年次軸を追加
    const axisScale = d3.scaleLinear()
      .domain([yearStart, yearEnd])
      .range([0, width]);

    const axis = d3.axisBottom(axisScale).tickFormat(d3.format("d")).tickValues(d3.range(1900, 2026, 10));
    svg.append("g")
      .attr("transform", `translate(${margin.left},${height + margin.top})`)
      .call(axis);
  });
