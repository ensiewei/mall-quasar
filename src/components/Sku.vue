<template>
  <q-layout view="hHh lpR fFf">

    <q-drawer :model-value="rightDrawerOpen" side="right" bordered overlay @hide="this.rightDrawerOpen = false">
      <q-item clickable v-ripple v-if="sku.skuImage">
        <q-item-section thumbnail>
          <img :src="sku.skuImage[0]">
        </q-item-section>
        <q-item-section v-html="'￥ ' + sku.price / 100" ></q-item-section>
      </q-item>
      <div class="q-pa-md" v-for="(value, name, index) in group" :key="index">
        <div class="text-subtitle2" >{{ name }}</div>
        <q-tabs
          v-model="tab[name]"
          inline-label
          class="text-white shadow-2"
          @click="redirect"
        >
          <q-tab :name="v" :label="v" v-for="(v, index) of value" :key="index" :class="fetchCountByGroup(name, v) > 0 ? 'bg-purple' : 'bg-grey'" :disable="!fetchCountByGroup(name, v) > 0" />
        </q-tabs>
      </div>
      <div class="q-pa-md">
        <q-input
          type="number"
          v-model="count"
          lazy-rules
          :rules="[
            val => val > 0  || '不可以少于 1',
            val => val <= fetchCount() || `超过现有库存(现有： ${fetchCount()})`
          ]"
        />
        <q-btn-group spread>
          <q-btn color="red" :label="fetchCount() > 0 ? '确定' : '暂时缺货'" :disable="!(fetchCount() > 0)" @click="submit" />
        </q-btn-group>
      </div>
    </q-drawer>

    <q-page-container>
      <div class="q-pa-md">
        <q-carousel
          animated
          v-model="slide"
          arrows
          navigation
          infinite
          swipeable
        >
          <q-carousel-slide :name="index" :img-src="img" v-for="(img, index) of sku.skuImage" :key="index" />
        </q-carousel>
      </div>
      <div class="text-h6 q-pa-md">{{ sku.title }}</div>
      <div class="q-pa-md">
        <q-table
          title="属性"
          :rows="rows"
          :columns="columns"
          hide-bottom
          row-key="name"
        />
      </div>
      <div class="q-pa-md q-gutter-sm">
        <q-img
          :src="img"
          v-for="(img, index) of sku.spuImage"
          :key="index"
        />
      </div>
    </q-page-container>

    <q-footer class="bg-white text-white">
      <div class="q-pa-md">
        <q-btn-group spread>
          <q-btn color="primary" label="购物车" to="/cart" />
          <q-btn color="purple" label="加入购物车" @click="(rightDrawerOpen = true) && (submitType = 0)" />
          <q-btn color="red" label="立即购买" @click="(rightDrawerOpen = true) && (submitType = 1)" />
        </q-btn-group>
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import { createMetaMixin } from 'quasar'
export default {
  mixins: [
    createMetaMixin(function () {
      return {
        title: this.sku.title ? this.sku.title : '商品'
      }
    })
  ],
  data () {
    return {
      login: false,
      slide: 0,
      rightDrawerOpen: false,
      sku: {},
      group: {},
      skus: {},
      columns: [
        {
          name: '属性名',
          align: 'left',
          field: row => row.name
        },
        {
          name: '属性值',
          field: row => row.value
        }
      ],
      rows: undefined,
      tab: {},
      count: 1,
      submitType: 0 // 0: 加入购物车, 1: 立即购买
    }
  },
  created () {
    if (this.$q.cookies.get('token') !== null) this.login = true
    this.fetchData()
  },
  updated () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.$axios({
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        url: `http://49.234.30.114:88/api/commodity/sku/detail/${this.$route.params.id}`
      }).then(res => {
        this.sku = res.data.sku
        this.rows = this.sku.groupDetail
        this.group = {}
        this.sku.group.forEach(ele => {
          this.group[ele.name] = this.group[ele.name] || new Set()
          this.group[ele.name].add(ele.value)
        })
        this.skus = {}
        this.sku.group.forEach(ele => {
          this.skus[ele.skuId] = this.skus[ele.skuId] || {}
          this.skus[ele.skuId][ele.name] = ele.value
          this.skus[ele.skuId].count = ele.count
        })
        this.tab = {}
        for (const id in this.skus) {
          if (id === this.$route.params.id) {
            for (const name in this.skus[id]) {
              if (name !== 'count') this.tab[name] = this.skus[id][name]
            }
          }
        }
      }).catch(e => {
        console.log(e)
      })
    },
    redirect () {
      for (const id in this.skus) {
        let flag = true
        for (const t in this.tab) {
          if (this.skus[id][t] !== this.tab[t]) flag = false
        }
        if (flag) this.$router.replace(id)
      }
    },
    fetchCountByGroup (name, value) {
      const temp = {}
      for (const key in this.tab) {
        temp[key] = this.tab[key]
      }
      temp[name] = value
      for (const id in this.skus) {
        let flag = true
        for (const t in temp) {
          if (this.skus[id][t] !== temp[t]) flag = false
        }
        if (flag) return this.skus[id].count
      }
    },
    fetchCount () {
      return this.skus[this.$route.params.id] ? this.skus[this.$route.params.id].count : 0
    },
    submit () {
      if (this.count > this.fetchCount()) {
        this.$q.notify({
          timeout: 1000,
          color: 'red',
          position: 'top',
          textColor: 'white',
          icon: 'warning',
          message: `超过现有库存，现有(${this.fetchCount()})`
        })
        return
      }
      if (!this.login) {
        this.$q.notify({
          timeout: 1000,
          color: 'primary',
          position: 'top',
          textColor: 'white',
          icon: 'warning',
          message: '你还没登录呢',
          actions: [
            { label: '点我去登录', color: 'green', handler: () => this.$router.push('login') }
          ]
        })
        return
      }
      if (this.submitType === 0) {
        this.$axios({
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          url: 'http://49.234.30.114:88/api/cart/cart/add',
          params: {
            userToken: this.$q.cookies.get('token'),
            skuId: this.$route.params.id,
            count: this.count
          }
        }).then(res => {
          if (res.data.code === 0) {
            this.$q.notify({
              timeout: 1000,
              color: 'green-4',
              textColor: 'white',
              position: 'top',
              icon: 'cloud_done',
              message: '添加到购物车成功！'
            })
          } else {
            this.$q.notify({
              timeout: 1000,
              color: 'red-5',
              position: 'top',
              textColor: 'white',
              icon: 'warning',
              message: res.data.msg
            })
          }
        }).catch(e => console.log(e))
      } else if (this.submitType === 1) {
        this.$router.push({
          name: 'Submit',
          query: {
            id: this.$route.params.id,
            count: this.count
          }
        })
      }
    }
  }
}
</script>
