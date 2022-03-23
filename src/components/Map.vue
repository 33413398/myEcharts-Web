<template>
  <div class="com-container" @dblclick="chinaMap">
    <div class="com-chart" ref="map"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getProvinceMapInfo } from "@/utils/map_utils";
export default {
  name: "Map",
  data() {
    return {
      // 初始echarts对象
      myEcharts: null,
      // 中国地图数据
      chinaMapData: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 获取省份矢量地图数据缓存
      cityMapData: {}
    };
  },
  computed: {
    ...mapState(["theme"])
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
    }
  },
  methods: {
    async initEcharts() {
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = this.$echarts.init(this.$refs.map, this.theme);
      // 开始请求中国地图数据
      this.myEcharts.showLoading();
      let res = await this.$axios.get("/data/map/china.json");
      this.chinaMapData = res.data;
      this.$echarts.registerMap("china", res.data);

      this.myEcharts.hideLoading();
      let initOption = {
        title: {
          text: "▎商家分布",
          left: 20,
          top: 20
        },
        geo: {
          type: "map",
          map: "china",
          top: "5%",
          bottom: "5%",
          // center: [103.823557, 36.058039],
          // 允许拖动及缩放
          roam: true,
          itemStyle: {
            // 地图的填充色
            areaColor: "#2E72BF",
            // 省份的边框色
            borderColor: "#333"
          },
          label: {
            show: true,
            color: "white",
            formatter: `{a}`
          }
        }
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(initOption);
      // 点击事件
      this.myEcharts.on("click", async e => {
        // 通过工具函数拿到点击的地图对应的中文拼音(key),和拼接出需要的文件路径(path)
        const ProvinceInfo = getProvinceMapInfo(e.name);
        // 若未找到地图下一级数据则终止后面操作
        if (!ProvinceInfo.key) return;
        // 地图数据不存在请求，存在则不请求
        if (!this.cityMapData[ProvinceInfo.key]) {
          let { data: res } = await this.$axios.get(
            "/data" + ProvinceInfo.path
          );
          // 把请求到的数据保存下来
          this.cityMapData[ProvinceInfo.key] = res;
          // 注册点击的地图
          this.$echarts.registerMap(ProvinceInfo.key, res, {});
        }

        // 设置最新的配置项
        const changeOption = {
          geo: {
            map: ProvinceInfo.key
          }
        };
        // 赋值给 echarts实例
        this.myEcharts.setOption(changeOption);
      });
    },
    async getList() {
      let { data: res } = await this.$axios.get("/data/map.json");
      this.allData = res;
      this.setEcharts();
    },
    // 设置数据
    setEcharts() {
      // 图例的数据
      const legendArr = this.allData.map(item => {
        return item.name;
      });
      let seriesArr = this.allData.map(item => {
        return {
          type: "effectScatter",
          // 图例的name需要与series的name相同
          name: item.name,
          data: item.children,
          // 让散点图使用地图坐标系统
          coordinateSystem: "geo",
          // 涟漪动画效果配置
          rippleEffect: {
            // 涟漪效果直径
            scale: 10,
            // 空心的涟漪动画效果
            brushType: "stroke"
          }
        };
      });
      let dataOption = {
        legend: {
          left: "2%",
          bottom: "5%",
          // 图例的方向
          orient: "verticle",
          data: legendArr.reverse()
        },
        series: seriesArr
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(dataOption);
    },
    // 设置响应式
    screenAdapter() {
      const titleFontSize = (this.$refs.map.offsetWidth / 100) * 3.6;
      let sizeOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          // 图例宽度
          itemWidth: titleFontSize / 2,
          // 图例高度
          itemHeight: titleFontSize / 2,
          // 间隔
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      };
      // 使用刚指定的配置项和数据显示图表。
      this.myEcharts.setOption(sizeOption);
      this.myEcharts.resize();
    },
    // 回到中国地图
    chinaMap() {
      const chinaMapOption = {
        geo: {
          map: "china"
        }
      };
      this.myEcharts.setOption(chinaMapOption);
    }
  }
};
</script>

<style></style>
