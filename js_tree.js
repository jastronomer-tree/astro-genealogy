
const data = {
  "name": "湯川 秀樹",
  "children": [
    {
      "name": "林 忠四郎",
      "children": [
        {
          "name": "蓬茨 霊運",
          "children": [
            {
              "name": "野本 憲一",
              "link": "person_nomoto.html",
              "children": [
                {"name": "橋本 正章"},
                {"name": "橘 孝博"},
                {"name": "茂山 俊和"},
                {"name": "辻本 拓司"},
                {"name": "熊谷 紫麻見"},
                {"name": "山岡 均"},
                {"name": "鈴木 知治"},
                {"name": "牧野 淳一郎"}
              ]
            }
          ]
        }
      ]
    }
  ]
};

const width = 800, height = 600;
const treeLayout = d3.tree().size([height, width - 160]);
const root = d3.hierarchy(data);
treeLayout(root);

const svg = d3.select("#tree")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(80,0)");

svg.selectAll(".link")
  .data(root.links())
  .enter()
  .append("path")
  .attr("class", "link")
  .attr("d", d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x));

const node = svg.selectAll(".node")
  .data(root.descendants())
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", d => `translate(${d.y},${d.x})`);

node.append("circle")
  .attr("r", 4.5);

node.append("a")
  .attr("xlink:href", d => d.data.link || "#")
  .append("text")
  .attr("dy", 3)
  .attr("x", d => d.children ? -8 : 8)
  .style("text-anchor", d => d.children ? "end" : "start")
  .text(d => d.data.name);
