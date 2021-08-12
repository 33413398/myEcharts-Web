<template>
  <div class="com-container">
    <div class="com-chart" ref="rankBar"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";
export default {
  name: "Rank",
  data() {
    return {
      // 初始echarts对象
      myEcharts: null,
      // x数据
      xData: [],
      yData: [],
      allData: [],
      // 柱形图 区域缩放起点值
      startValue: 0,
      // 柱形图结 区域缩放终点值
      endValue: 9,
      // 定时器
      timerId: null,
    };
  },
  computed: {
    ...mapState(["theme"]),
    axisPointerColor() {
      return getThemeValue(this.theme).sellerAxisPointerColor;
    },
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
    // this.$socket.unRegisterCallBack("sellerData");
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
  methods: {
    initEcharts() {
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = this.$echarts.init(this.$refs.rankBar, this.theme);
      let initOption = {
        title: {
          text: "▎地区销售排行",
          left: 20,
          top: 20,
        },
        grid: {
          top: "40%",
          left: "5%",
          right: "5%",
          bottom: "5%",
          // 把x轴和y轴纳入 grid
          containLabel: true,
        },
        tooltip: {
          show: true,
        },
        xAxis: {
          type: "category",
        },
        yAxis: {
          value: "value",
        },
        series: [
          {
            type: "bar",
            itemStyle: {
              barBorderRadius: [20, 20, 0, 0],
            },
            label: {
              show: true,
              position: "top",
              color: "white",
              rotate: 30,
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
      let res = await this.$axios.get("/data/rank.json");
      this.allData = res.data.sort((a, b) => b.value - a.value);
      this.allData.forEach((item) => {
        this.xData.push(item.name);
        this.yData.push(item.value);
      });
      this.setEcharts();
      this.startInterval();
    },
    // 设置数据
    setEcharts() {
      // 渐变色数组
      const colorArr = [
        ["#0BA82C", "#4FF778"],
        ["#2E72BF", "#23E5E5"],
        ["#5052EE", "#AB6EE5"],
      ];
      let dataOption = {
        xAxis: {
          data: this.xData,
        },
        dataZoom: {
          // 区域缩放组件
          show: false,
          startValue: this.startValue,
          endValue: this.endValue,
        },
        series: [
          {
            data: this.yData,
            itemStyle: {
              color: (arg) => {
                let targetColorArr = null;

                if (arg.value > 300) {
                  targetColorArr = colorArr[0];
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1];
                } else {
                  targetColorArr = colorArr[2];
                }

                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  // 0%
                  { offset: 0, color: targetColorArr[0] },
                  // 100%
                  { offset: 1, color: targetColorArr[1] },
                ]);
              },
            },
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(dataOption);
    },
    // 设置响应式
    screenAdapter() {
      const titleFontSzie = (this.$refs.rankBar.offsetWidth / 100) * 3.6;
      let sizeOption = {
        title: {
          textStyle: {
            fontSize: titleFontSzie,
          },
        },
        series: [
          {
            barWidth: titleFontSzie,
            itemStyle: {
              barBorderRadius: [titleFontSzie / 2, titleFontSzie / 2, 0, 0],
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
        this.startValue++;
        this.endValue++;
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0;
          this.endValue = 9;
        }
        this.setEcharts();
      }, 3000);
    },
  },
};
</script>

<style>
</style>
