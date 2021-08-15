<template>
  <div class="com-container">
    <div class="com-chart" ref="stockPai"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Stock",
  data() {
    return {
      // 初始echarts对象
      myEcharts: null,
      // 定时器
      timerId: null,
      // 当前显示数据的页数
      currentIndex: 1,
    };
  },
  computed: {
    ...mapState(["theme"]),
  },
  watch: {
    theme() {
      // 销毁当前的图表
      this.myEcharts.dispose();
      // 以最新主题初始化图表对象
      this.initEcharts();
      // 渲染数据
      this.setEcharts();
      // 屏幕适配
      this.screenAdapter();
    },
  },
  mounted() {
    this.initEcharts();
    this.getList();
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    // 在组件销毁的时候，把监听器取消掉
    window.removeEventListener("resize", this.screenAdapter);
    clearInterval(this.timerId);
  },
  methods: {
    initEcharts() {
      this.myEcharts = this.$echarts.init(this.$refs.stockPai, this.theme);
      let initOption = {
        title: {
          text: "▎库存和销量分析",
          left: 20,
          top: 20,
        },
      };
      this.myEcharts.setOption(initOption);
      this.myEcharts.on("mouseover", () => {
        this.timerId && clearInterval(this.timerId);
      });
      this.myEcharts.on("mouseout", () => {
        this.startInterval();
      });
    },
    async getList() {
      let { data: res } = await this.$axios.get("/data/stock.json");
      this.allData = res;
      this.setEcharts();
      this.startInterval();
    },
    // 设置数据
    setEcharts() {
      // 圆环坐标
      const centerArr = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["34%", "75%"],
        ["66%", "75%"],
      ];
      // 圆环渐变色
      const colorArr = [
        ["#4FF778", "#0BA82C"],
        ["#E5DD45", "#E8B11C"],
        ["#E8821C", "#E55445"],
        ["#5052EE", "#AB6EE5"],
        ["#23E5E5", "#2E72BF"],
      ];
      // 每次显示5个
      let start = (this.currentIndex - 1) * 5;
      let end = start + 5;
      const seriesData = this.allData.slice(start, end);
      let seriesDataArr = seriesData.map((item, index) => {
        return {
          type: "pie",
          // 饼图的位置
          center: centerArr[index],
          // 关闭鼠标移入到饼图的动画效果
          hoverAnimation: false,
          // 隐藏指示线条
          labelLine: {
            show: false,
          },
          label: {
            position: "center",
            color: colorArr[index][0],
          },
          data: [
            // 销量
            {
              name: item.name + "\n\n" + item.sales,
              value: item.sales,
              label: {
                show: true,
              },
              itemStyle: {
                // 创建线性渐变的颜色 从下往上
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  // 0%
                  { offset: 0, color: colorArr[index][0] },
                  // 100%
                  { offset: 1, color: colorArr[index][1] },
                ]),
              },
              // 内部的提示框 c数值 d百分比
              tooltip: {
                formatter: `${item.name} <br/>销量：{c} <br/>占比：{d}%`,
              },
            },
            // 库存
            {
              value: item.stock,
              label: {
                show: false,
              },
              itemStyle: {
                color: "#bbb",
              },
              // 内部的提示框
              tooltip: {
                formatter: `${item.name} <br/>库存：{c} <br>占比：{d}%`,
              },
            },
          ],
        };
      });
      let upOption = {
        tooltip: {
          // 这里为item 可以为内部的数据开启 单独的 tooltip
          trigger: "item",
        },
        series: seriesDataArr,
      };
      this.myEcharts.setOption(upOption);
    },
    // 设置响应式
    screenAdapter() {
      const titleFontSize = (this.$refs.stockPai.offsetWidth / 100) * 3.6;
      // 圆的内院半径和 外圆半径
      const innerRadius = titleFontSize * 2.8;
      const outerRadius = innerRadius * 1.2;

      const setOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
        ],
      };
      this.myEcharts.setOption(setOption);
      this.myEcharts.resize();
    },
    // 定时器
    startInterval() {
      this.timerId && clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        this.currentIndex++;
        if (this.currentIndex > 2) {
          this.currentIndex = 1;
        }
        this.setEcharts();
      }, 3000);
    },
  },
};
</script>

<style>
</style>
