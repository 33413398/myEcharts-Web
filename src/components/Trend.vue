<template>
  <div class="com-container">
    <div class="title" @click="showMenu = !showMenu" :style="comStyle">
      <span class="before-icon">▎</span>
      <span>{{ showTitle }}</span>
      <span class="iconfont title-icon" :style="comStyle">&#xe6eb;</span>
      <div class="select-con">
        <div class="select-item" v-show="showMenu" @click.prevent="handleSelect(item.key)" v-for="item in selectTypes" :key="item.key">
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trendLine"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "../utils/theme_utils";
export default {
  name: "Trend",
  data() {
    return {
      // 初始echarts对象
      myEcharts: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 是否显示可选项
      showMenu: false,
      // 默认显示的数据类型
      activeName: "map",
      // 指明标题的字体大小
      titleFontSize: 0,
    };
  },
  computed: {
    ...mapState(["theme"]),
    // 点击过后需要显示的数组
    selectTypes() {
      if (!this.allData) return [];
      // 过度掉当前选中的 类别
      return this.allData.type.filter((item) => item.key !== this.activeName);
    },
    // 显示的标题
    showTitle() {
      if (!this.allData) return "";
      return this.allData[this.activeName].title;
    },
    // 设置给标题的样式
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
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
  },
  watch: {
    theme() {
      // 销毁当前的图表
      this.myEcharts.dispose();
      // 以最新主题初始化图表对象
      this.initEcharts();
      // 屏幕适配
      this.screenAdapter();
      // 渲染数据
      this.setEcharts();
    },
  },
  methods: {
    async initEcharts() {
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = this.$echarts.init(this.$refs.trendLine, this.theme);
      this.myEcharts.hideLoading();
      let initOption = {
        tooltip: {
          trigger: "axis",
        },
        grid: {
          left: "3%",
          top: "35%",
          right: "4%",
          bottom: "1%",
          containLabel: true,
        },
        legend: {
          left: "center",
          top: "18%",
          // 图例的icon类型
          icon: "circle",
        },
        xAxis: {
          type: "category",
          // 紧挨边缘
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
        },
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(initOption);
    },
    async getList() {
      let { data: res } = await this.$axios.get("/data/trend.json");
      this.allData = res;
      this.setEcharts();
    },
    // 设置数据
    setEcharts() {
      // 半透明的颜色值
      const colorArr1 = [
        "rgba(11, 168, 44, 0.5)",
        "rgba(44, 110, 255, 0.5)",
        "rgba(22, 242, 217, 0.5)",
        "rgba(254, 33, 30, 0.5)",
        "rgba(250, 105, 0, 0.5)",
      ];
      // 全透明的颜色值
      const colorArr2 = [
        "rgba(11, 168, 44, 0)",
        "rgba(44, 110, 255, 0)",
        "rgba(22, 242, 217, 0)",
        "rgba(254, 33, 30, 0)",
        "rgba(250, 105, 0, 0)",
      ];
      // x轴数据
      const month = this.allData.common.month;
      // y轴数据 series下的数据
      const valueArr = this.allData[this.activeName].data;

      const seriesArr = valueArr.map((item, index) => {
        return {
          // 图例的数据需要和series的name匹配
          name: item.name,
          type: "line",
          data: item.data,
          // 同个类目轴上系列配置相同的stack值后，后一个系列的值会在前一个系列的值上相加。
          stack: this.activeName,
          // 区域填充样式。
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              // 0% 颜色
              {
                offset: 0,
                color: colorArr1[index],
              },
              // 100% 颜色
              {
                offset: 1,
                color: colorArr2[index],
              },
            ]),
          },
        };
      });
      // 准备图例的数据
      const legendArr = valueArr.map((item) => item.name);
      const dataOption = {
        xAxis: {
          data: month,
        },
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(dataOption);
    },
    // 设置响应式
    screenAdapter() {
      this.titleFontSize = (this.$refs.trendLine.offsetWidth / 100) * 3.6;
      let sizeOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          // 间距
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 1.3,
          },
        },
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(sizeOption);
      this.myEcharts.resize();
    },
    // 当前选中的类型
    handleSelect(currentType) {
      this.activeName = currentType;
      this.setEcharts();
    },
  },
};
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  left: 50px;
  top: 20px;
  z-index: 999;
  color: white;
  cursor: pointer;

  .before-icon {
    position: absolute;
    left: -20px;
  }
  .title-icon {
    margin-left: 10px;
  }
}
</style>
