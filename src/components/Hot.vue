<template>
  <div class="com-container">
    <div class="com-chart" ref="hotPie"></div>
    <i class="iconfont icon-left" @click="toLeft" :style="themeStyle">&#xe6ef;</i>
    <i class="iconfont icon-right" @click="toRight" :style="themeStyle">&#xe6ed;</i>
    <span class="cate-name" :style="themeStyle">{{ currentTitle }}</span>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";
export default {
  name: "Hot",
  data() {
    return {
      // 初始echarts对象
      myEcharts: null,
      allData: null,
      // 当前索引项
      currentIndex: 0,
      titleFontSize: 0,
      // 定时器
      timerId: null,
    };
  },
  computed: {
    ...mapState(["theme"]),
    currentTitle() {
      return this.allData && this.allData[this.currentIndex].name;
    },
    themeStyle() {
      if (!this.titleFontSize) {
        return { color: getThemeValue(this.theme).titleColor };
      }
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
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
      this.myEcharts = this.$echarts.init(this.$refs.hotPie, this.theme);
      let initOption = {
        title: {
          text: "▎热销商品占比",
          left: 20,
          top: 20,
        },
        legend: {
          top: "15%",
          // 图例的icon类型
          icon: "circle",
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            // 拿到三级分类的数据
            const thirdCategory = arg.data.children;
            // 计算所有三级分类的数值总和，才能计算出百分比
            let total = 0;
            thirdCategory.forEach((item) => {
              total += item.value;
            });
            // 显示的文本
            let showStr = "";
            thirdCategory.forEach((item) => {
              showStr += `
                ${item.name}：${parseInt((item.value / total) * 100)}% <br/>
              `;
            });
            return showStr;
          },
          extraCssText:
            "background-color: rgba(000, 000, 000, .7);color: #fff;border-width: 3px;",
        },
        series: [
          {
            type: "pie",
            label: {
              show: true,
              formatter: `{b}{d}%`,
              // 默认颜色为黑色或者白色，需要设置为inherit颜色继承
              color: "inherit",
            },
            // 高亮状态下的样式
            emphasis: {
              labelLine: {
                // 连接文字的线条
                show: true,
              },
            },
          },
        ],
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
      let { data: res } = await this.$axios.get("/data/hotproduct.json");
      this.allData = res;
      this.setEcharts();
      this.startInterval();
    },
    // 设置数据
    setEcharts() {
      // 图例数据
      let legendData = this.allData[this.currentIndex].children.map((item) => {
        return item.name;
      });
      const seriesDataArr = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            children: item.children,
          };
        }
      );
      let upOption = {
        legend: {
          data: legendData,
        },
        series: [
          {
            data: seriesDataArr,
          },
        ],
      };
      this.myEcharts.setOption(upOption);
    },
    // 设置响应式
    screenAdapter() {
      this.titleFontSize = (this.$refs.hotPie.offsetWidth / 100) * 3.6;
      let setOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          // 间距
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 1.2,
          },
        },
        series: [
          {
            // 饼图的大小 半径
            radius: this.titleFontSize * 4.5,
            // 控制饼图的位置 x,y
            center: ["50%", "60%"],
          },
        ],
      };
      this.myEcharts.setOption(setOption);
      this.myEcharts.resize();
    },
    // 点击左侧按钮
    toLeft() {
      this.currentIndex--;
      // 已到达最左边
      if (this.currentIndex < 0) this.currentIndex = this.allData.length - 1;
      this.setEcharts();
    },
    // 点击右侧按钮
    toRight() {
      this.currentIndex++;
      // 已到达最右边
      if (this.currentIndex > this.allData.length - 1) this.currentIndex = 0;
      this.setEcharts();
    },
    // 定时器
    startInterval() {
      this.timerId && clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        this.currentIndex++;
        if (this.currentIndex > this.allData.length - 1) {
          this.currentIndex = 0;
        }
        this.setEcharts();
      }, 3000);
    },
  },
};
</script>
<style lang="less" scoped>
.com-container {
  i {
    z-index: 999;
    position: absolute;
    transform: translateY(-50%);
    top: 50%;
    cursor: pointer;
  }
  i.icon-left {
    left: 10%;
  }
  i.icon-right {
    right: 10%;
  }
  .cate-name {
    position: absolute;
    right: 10%;
    bottom: 20px;
    z-index: 999;
  }
}
</style>
