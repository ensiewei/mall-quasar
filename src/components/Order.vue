<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-tabs
        v-model="tab"
        @click="onOrder()"
      >
        <q-tab name="all" label="全部" />
        <q-tab name="pending" label="待付款" />
        <q-tab name="received" label="待收货" />
        <q-tab name="completed" label="已完成" />
        <q-tab name="canceled" label="已取消" />
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
      <q-icon name="o_arrow_back" size="xl" style="margin-bottom:100px" color="primary" class="fixed-bottom-right q-ma-md bg-grey-4 rounded-borders" @click="$router.back"/>
    </q-page-container>

    <q-footer>
      <div v-if="this.$q.cookies.get('token') === null" class="bg-grey-5">
        <span>&emsp;你还没登录呢&emsp;</span>
        <q-btn to="login" color="green">去登陆 >></q-btn>
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
        title: '我的订单'
      }
    })
  ],
  data () {
    return {
      login: false,
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
    onOrder () {
      switch (this.tab) {
        case 'pending':
          this.$router.replace('order?status=0').then(() => this.initOrder())
          break
        case 'canceled':
          this.$router.replace('order?status=1').then(() => this.initOrder())
          break
        case 'received':
          this.$router.replace('order?status=2').then(() => this.initOrder())
          break
        case 'completed':
          this.$router.replace('order?status=3').then(() => this.initOrder())
          break
        default:
          this.$router.replace('order').then(() => this.initOrder())
          break
      }
    },
    initOrder () {
      if (this.$q.cookies.get('token') === null) return
      this.$axios({
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/order/order/all`,
        params: {
          userToken: this.$q.cookies.get('token'),
          status: this.$route.query.status
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
  mounted () {
    switch (this.$route.query.status - 0) {
      case 0:
        this.tab = 'pending'
        break
      case 1:
        this.tab = 'canceled'
        break
      case 2:
        this.tab = 'received'
        break
      case 3:
        this.tab = 'completed'
        break
      default:
        this.tab = 'all'
        break
    }
    this.initOrder()
  }
}
</script>
