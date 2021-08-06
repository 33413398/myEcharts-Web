<template>
  <div class="com-container">
    <div class="com-chart" ref="sellerBar"></div>
  </div>
</template>

<script>
import { sellerBarList } from "../assets/api/api";
export default {
  name: "seller",
  data() {
    return {
      // 初始echarts对象
      myEcharts: null,
      // x数据
      xData: [],
      yData: [],
      allData: [],
      // 当前页
      currentPage: 1,
      // 总页数
      totalPage: 0,
      // 定时器
      timerId: null,
    };
  },
  mounted() {
    this.initEcharts();
    this.getList();
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    clearInterval(this.timerId);
    // 在组件销毁的时候，把监听器取消掉
    window.removeEventListener("resize", this.screenAdapter);
  },
  methods: {
    initEcharts() {
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = this.$echarts.init(this.$refs.sellerBar, "chalk");
      let initOption = {
        title: {
          text: "▎商家销售统计",
          textStyle: {
            color: "#fff",
          },
          left: 20,
          top: 20,
        },
        grid: {
          top: "10%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          // 默认grid不包含坐标轴文字，改为true
          containLabel: true,
        },
        xAxis: {
          type: "value",
          // 轴标签
          axisLabel: {
            show: true,
            color: "#9296A1",
            fontWeight: "500",
            fontSize: "15",
          },
          // 轴线
          axisLine: {
            show: true,
            lineStyle: {
              color: "#474D56",
              width: "2",
            },
          },
          // 区域分割线
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: "category",
          // 轴标签
          axisLabel: {
            show: true,
            color: "#9296A1",
            fontWeight: "500",
            fontSize: "15",
          },
          // 轴线
          axisLine: {
            show: true,
            lineStyle: {
              color: "#474D56",
              width: "2",
            },
          },
          // 刻度线
          axisTick: {
            show: false,
          },
        },
        tooltip: {
          // 当鼠标移入axis(坐标轴)时展示 底层的背景色
          trigger: "axis",
          axisPointer: {
            show: true,
            // 展示的类型是线条类型
            type: "line",
            // 相等于 z-index 将层级调低
            z: 0,
            lineStyle: {
              type: "solid",
              color: "#2D3443",
            },
          },
        },
        series: [
          {
            type: "bar",
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: "#5052EE", // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "#AB6EE5", // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
            label: {
              show: true,
              position: "right",
              textStyle: {
                color: "white",
              },
            },
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(initOption);
      this.myEcharts.on("mouseover", () => {
        this.timerId && clearInterval(this.timerId);
      });
      this.myEcharts.on("mouseout", () => {
        this.startInterval();
      });
    },
    async getList() {
      let res = await sellerBarList({}, "get");
      this.allData = res.data.sort((a, b) => b.value - a.value);
      this.totalPage = Math.ceil(this.allData.length / 5);
      this.allData.forEach((item) => {
        this.xData.push(item.value);
        this.yData.push(item.name);
      });
      this.setEcharts();
      this.startInterval();
    },
    // 设置数据
    setEcharts() {
      // 动态从数组中取出5条数据
      const start = (this.currentPage - 1) * 5;
      const end = this.currentPage * 5;
      let dataOption = {
        yAxis: {
          data: this.yData.slice(start, end),
        },
        series: [
          {
            data: this.xData.slice(start, end),
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(dataOption);
    },
    // 设置响应式
    screenAdapter() {
      const titleFontSize = (this.$refs.sellerBar.offsetWidth / 100) * 3.6;
      let sizeOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
            },
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(sizeOption);
      this.myEcharts.resize();
    },
    // 定时器
    startInterval() {
      this.timerId && clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        this.setEcharts();
      }, 3000);
    },
  },
};
</script>
