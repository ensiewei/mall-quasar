<template>
  <q-layout view="hhh lpR fFf">

    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          购物车
        </q-toolbar-title>
        <q-btn v-if="login" dense flat round @click="isSubmit = !isSubmit">{{ isSubmit ? '编辑' : '完成'}}</q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer :model-value="rightDrawerOpen" side="right" bordered overlay @hide="this.rightDrawerOpen = false">
      <q-item clickable v-ripple v-if="drawerSku.skuImage">
        <q-item-section thumbnail>
          <img :src="drawerSku.skuImage[0]">
        </q-item-section>
        <q-item-section v-html="'￥ ' + drawerSku.price / 100" ></q-item-section>
      </q-item>
      <div class="q-pa-md" v-for="(value, name, index) in drawerGroup" :key="index">
        <div class="text-subtitle2" >{{ name }}</div>
        <q-tabs
          v-model="tab[name]"
          inline-label
          class="text-white shadow-2"
        >
          <q-tab :name="v" :label="v" v-for="(v, index) of value" :key="index" @click="computeId" :class="fetchDrawerSkuStockCountByGroup(name, v) > 0 ? 'bg-purple' : 'bg-grey'" :disable="!fetchDrawerSkuStockCountByGroup(name, v) > 0" />
        </q-tabs>
      </div>
      <div class="q-pa-md">
        <q-btn-group spread>
          <q-btn color="red" :label="fetchDrawerSkuStockCount() > 0 ? '确定' : '暂时缺货'" :disable="!(fetchDrawerSkuStockCount() > 0)" @click="updateItem" />
        </q-btn-group>
      </div>
    </q-drawer>

    <q-page-container>
      <div v-if="login" class="q-pa-md">
        <q-list bordered padding>
          <q-item-label header>购物车</q-item-label>

          <q-item tag="label" v-for="(value, index) of sku" :key="index">
            <q-item-section side top>
              <q-checkbox v-model="id[value.id]" @click="computeCountAndPrice" />
            </q-item-section>

            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="value.skuImage[0]">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label @click="openSku(value.id)">{{ value.title }}</q-item-label>
              <q-btn size="xs" class="bg-grey-1 text-grey-6" icon-right="expand_more" no-wrap @click="openRightDrawer(value)" >{{ value.groupText }}</q-btn>
              <q-item-label>
                {{ '￥' + (value.price / 100) }}
                <q-btn size="xs" @click="changeCount(value, value.count - 1)">-</q-btn>
                <q-btn size="xs" disable unelevated>{{ value.count }}</q-btn>
                <q-btn size="xs" @click="changeCount(value, value.count + 1)">+</q-btn>
              </q-item-label>
              <q-item-label v-if="value.stockCount < value.count" class="text-red">库存暂时仅剩:{{ value.stockCount }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-page-container>

    <q-footer class="bg-white q-pa-md">
      <div v-if="!login" class="bg-grey-5">
        <span>&emsp;你还没登录呢&emsp;</span>
        <q-btn to="login" color="red">去登陆 ></q-btn>
      </div>
      <q-toolbar v-else class="bg-grey-5">
        <q-checkbox v-model="all" @click="selectAll" />
        <span>全选</span>
        <span>&emsp;</span>
        <span>合计:￥</span>
        <span>{{ price }}</span>
        <span>&emsp;</span>
        <q-btn color="red" @click="submit">{{ isSubmit ? '去结算' : '删除'}}({{ count }})</q-btn>
      </q-toolbar>
      <div >
        <q-btn-group spread>
          <q-btn color="primary" label="首页" to="/" />
          <q-btn color="primary" label="购物车" to="/cart" />
          <q-btn color="primary" label="我的" to="/mine" />
        </q-btn-group>
      </div>
    </q-footer>

  </q-layout>
</template>

<script>
export default {
  data () {
    return {
      login: false,
      rightDrawerOpen: false,
      drawerSku: {},
      drawerSkus: undefined,
      tab: {},
      drawerGroup: {},
      id: {},
      sku: {},
      all: false,
      count: 0,
      price: 0.00,
      isSubmit: true // true: submit, false: delete
    }
  },
  methods: {
    selectAll () {
      for (const id in this.id) {
        this.id[id] = this.all
      }
      this.computeCountAndPrice()
    },
    computeCount () {
      let temp = 0
      for (const id in this.id) {
        if (this.id[id]) temp++
      }
      this.count = temp
    },
    computePrice () {
      let temp = 0
      for (const s of this.sku) {
        if (this.id[s.id]) {
          temp += s.price / 100 * s.count
        }
      }
      this.price = temp
    },
    computeCountAndPrice () {
      this.computeCount()
      this.computePrice()
    },
    openSku (id) {
      const routeData = this.$router.resolve({
        path: String(id)
      })
      window.open(routeData.href, '_blank')
    },
    changeCount (sku, count) {
      if (count < 1) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: '数量不可以少于 1'
        })
      } else if (sku.stockCount < count) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: `现有库存(${sku.stockCount})`
        })
      } else {
        this.$axios({
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          url: 'http://106.55.156.192:5797/api/cart/cart/modifyCount',
          params: {
            userToken: this.$q.cookies.get('token'),
            cartId: sku.cartId,
            count: count
          }
        }).then(res => {
          if (res.data.code === 0) {
            sku.count = count
            this.computePrice()
          } else {
            this.$q.notify({
              color: 'red-5',
              textColor: 'white',
              icon: 'warning',
              message: res.data.msg
            })
          }
        }).catch(e => {
          console.log(e)
        })
      }
    },
    openRightDrawer (sku) {
      this.rightDrawerOpen = true
      this.drawerSku = sku
      this.drawerGroup = {}
      sku.group.forEach(ele => {
        this.drawerGroup[ele.name] = this.drawerGroup[ele.name] || new Set()
        this.drawerGroup[ele.name].add(ele.value)
      })
      this.drawerSkus = {}
      sku.group.forEach(ele => {
        this.drawerSkus[ele.skuId] = this.drawerSkus[ele.skuId] || {}
        this.drawerSkus[ele.skuId][ele.name] = ele.value
        this.drawerSkus[ele.skuId].count = ele.count
      })
      this.tab = {}
      for (const id in this.drawerSkus) {
        if (id === String(sku.id)) {
          for (const name in this.drawerSkus[id]) {
            if (name !== 'count') this.tab[name] = this.drawerSkus[id][name]
          }
        }
      }
    },
    submit () {
      if (this.count === 0) {
        this.$q.notify({
          color: 'red-5',
          position: 'top',
          textColor: 'white',
          icon: 'warning',
          message: '你还没有选择商品'
        })
        return
      }
      const item = []
      for (const s of this.sku) {
        if (this.id[s.id]) {
          item.push(s.cartId)
        }
      }
      if (this.isSubmit) {
        this.$router.push({
          path: 'submit',
          query: {
            cart: item
          }
        })
      } else {
        this.$axios({
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          url: 'http://106.55.156.192:5797/api/cart/cart/delete',
          params: {
            userToken: this.$q.cookies.get('token')
          },
          data: item
        }).then(res => {
          if (res.data.code === 0) {
            this.$router.go(0)
          } else {
            this.$q.notify({
              color: 'red-5',
              textColor: 'white',
              icon: 'warning',
              message: res.data.msg
            })
          }
        }).catch(e => {
          console.log(e)
        })
      }
    },
    fetchDrawerSkuStockCount () {
      return this.drawerSku.stockCount || 0
    },
    fetchDrawerSkuStockCountByGroup (name, value) {
      const temp = {}
      for (const key in this.tab) {
        temp[key] = this.tab[key]
      }
      temp[name] = value
      for (const id in this.drawerSkus) {
        let flag = true
        for (const t in temp) {
          if (this.drawerSkus[id][t] !== temp[t]) flag = false
        }
        if (flag) return this.drawerSkus[id].count
      }
    },
    computeId () {
      for (const id in this.drawerSkus) {
        let flag = true
        for (const t in this.tab) {
          if (this.drawerSkus[id][t] !== this.tab[t]) flag = false
        }
        if (flag) return id
      }
    },
    updateItem () {
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://106.55.156.192:5797/api/cart/cart/modifyItem',
        params: {
          userToken: this.$q.cookies.get('token'),
          cartId: this.drawerSku.cartId,
          newSkuId: this.computeId()
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.$router.go(0)
        } else {
          this.$q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: res.data.msg
          })
        }
      }).catch(e => {
        console.log(e)
      })
    }
  },
  beforeCreate () {
    const token = this.$q.cookies.get('token')
    if (token !== null) {
      this.login = true
    }
  },
  created () {
    if (!this.login) return
    this.$axios({
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      url: 'http://106.55.156.192:5797/api/cart/cart/list',
      params: {
        userToken: this.$q.cookies.get('token')
      }
    }).then(res => {
      if (res.data.code === 0) {
        this.sku = res.data.sku
        for (const s of this.sku) {
          for (const item of s.group) {
            if (item.skuId === s.id) {
              s.groupText = s.groupText ? s.groupText + ', ' + item.value : item.value
              s.stockCount = item.count
            }
          }
        }
        for (const id in this.sku) {
          this.id[this.sku[id].id] = false
        }
      } else {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: res.data.msg
        })
      }
    }).catch(e => {
      console.log(e)
    })
  }
}
</script>
