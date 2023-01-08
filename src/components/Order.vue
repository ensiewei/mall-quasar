<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-tabs
        v-model="tab"
      >
        <q-tab name="all" label="全部" @click="initOrder(null)" />
        <q-tab name="pending" label="待付款" @click="initOrder(0)" />
        <q-tab name="received" label="待收货" @click="initOrder(2)" />
        <q-tab name="completed" label="已完成" @click="initOrder(3)" />
        <q-tab name="cancled" label="已取消" @click="initOrder(1)" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <div class="q-pa-md">
        <q-list bordered padding v-for="(v, i) of order" :key="i" @click="toDetail(v.serialNumber)">
          <q-item>{{ computeStatus(v.status) }}</q-item>
          <q-item tag="label" v-for="(value, index) of v.sku" :key="index">

            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="value.skuImage">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ value.skuTitle }}</q-item-label>
              <q-item-label caption>{{ value.skuGroup }}</q-item-label>
              <q-item-label>{{ '￥' + (value.skuPrice / 100) }} &emsp; {{ 'x' + value.skuCount }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-page-container>

  </q-layout>
</template>

<script>
export default {
  data () {
    return {
      tab: 'all',
      order: undefined
    }
  },
  methods: {
    toDetail (serialNumber) {
      this.$router.push({
        path: 'orderDetail',
        query: {
          serialNumber
        }
      })
    },
    initOrder (status) {
      this.$axios({
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://49.234.30.114:88/api/order/order/all',
        params: {
          userToken: this.$q.cookies.get('token'),
          status
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.order = res.data.order
        }
      })
    },
    computeStatus (status) {
      if (status === 0) {
        return '待支付'
      } else if (status === 1) {
        return '已取消'
      } else if (status === 2) {
        return '已支付'
      } else if (status === 3) {
        return '已完成'
      } else {
        return ''
      }
    }
  },
  beforeCreate () {
    const token = this.$q.cookies.get('token')
    if (token === null) {
      this.$q.notify({
        color: 'red-5',
        textColor: 'white',
        icon: 'warning',
        message: '请先登录'
      })
      this.$router.push('login')
    }
  },
  mounted () {
    this.initOrder(null)
  }
}
</script>
