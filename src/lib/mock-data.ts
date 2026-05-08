import { ProductionLine } from "./types";

export const productionLines: ProductionLine[] = [
  {
    id: "requirement",
    name: "需求产线",
    opc: "陈",
    function: "Spec 产出与审核",
    wip: 12,
    completed: 47,
    anomaly: "—",
    status: "NOMINAL",
  },
  {
    id: "coding",
    name: "编码产线",
    opc: "林",
    function: "代码实现与评审",
    wip: 8,
    completed: 35,
    anomaly: "F-2341 Silent Gap",
    status: "ATTENTION",
  },
  {
    id: "testing",
    name: "测试产线",
    opc: "王",
    function: "测试执行与缺陷管理",
    wip: 5,
    completed: 28,
    anomaly: "—",
    status: "NOMINAL",
  },
  {
    id: "sre",
    name: "SRE产线",
    opc: "张",
    function: "部署与监控运维",
    wip: 3,
    completed: 15,
    anomaly: "—",
    status: "NOMINAL",
  },
];
