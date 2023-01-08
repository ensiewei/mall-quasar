<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="back" />
        <q-toolbar-title>
          {{ computeStatus }} {{ timer }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="q-pa-md">
        <q-list bordered class="rounded-borders" style="max-width: 600px">
          <q-item v-if="address">
            <q-item-section top>
              <q-item-label caption lines="1">
                {{ address.areaString }}
              </q-item-label>
              <q-item-label lines="1">
                <span class="text-weight-bold">{{ address.detailAddress }}</span>
              </q-item-label>
              <q-item-label lines="1">
                <span class="text-grey-8">{{ address.name }}</span>
                <span>&emsp;</span>
                <span class="text-grey-8">{{ address.phone }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="q-pa-md">
        <q-list bordered padding>
          <q-item tag="label" v-for="(value, index) of sku" :key="index">

            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="value.skuImage">
              </q-avatar>
            </q-item-section>

            <q-item-section @click="toSku(value.skuId)">
              <q-item-label>{{ value.skuTitle }}</q-item-label>
              <q-item-label caption>{{ value.skuGroup }}</q-item-label>
              <q-item-label>{{ '￥' + (value.skuPrice / 100) }} &emsp; {{ 'x' + value.skuCount }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="q-pa-md">
        <q-list bordered separator>
          <q-item>
            <q-item-section>订单编号:&nbsp;{{ order.serialNumber }}</q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>创建时间:&nbsp;{{ computeTime }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-page-container>

    <q-footer elevated class="bg-white" v-if="order.status === 0">
      <q-toolbar>
        <q-btn push color="primary" label="取消" @click="cancel" />
        <q-btn push color="red" label="支付" @click="pay" />
      </q-toolbar>
    </q-footer>

    <q-footer elevated class="bg-white" v-if="order.status === 2">
      <q-toolbar>
        <q-btn push color="primary" label="确认收货" @click="confirm" />
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
import { createMetaMixin } from 'quasar'
export default {
  mixins: [
    createMetaMixin(function () {
      return {
        title: '订单详情'
      }
    })
  ],
  data () {
    return {
      order: {},
      sku: {},
      address: {},
      timer: undefined
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    initOrder () {
      this.$axios({
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://49.234.30.114:88/api/order/order/detail',
        params: {
          userToken: this.$q.cookies.get('token'),
          serialNumber: this.$route.query.serialNumber
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.order = res.data.order
          this.initSku()
          this.initAddress()
          if (this.order.status === 0) {
            this.initTimer()
          }
        }
      })
    },
    initSku () {
      this.sku = this.order.sku
    },
    initAddress () {
      this.$axios({
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://49.234.30.114:88/api/order/address/fetch',
        params: {
          userToken: this.$q.cookies.get('token'),
          id: this.order.addressId
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.address = res.data.address
        } else {
          this.$q.notify({
            timeout: 1000,
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: res.data.msg
          })
        }
      }).catch(e => {
        console.log(e)
      })
    },
    cancel () {
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://49.234.30.114:88/api/order/order/cancel',
        params: {
          userToken: this.$q.cookies.get('token'),
          serialNumber: this.$route.query.serialNumber
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.$router.go(0)
        }
      })
    },
    pay () {
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://49.234.30.114:88/api/order/order/pay',
        params: {
          userToken: this.$q.cookies.get('token'),
          serialNumber: this.$route.query.serialNumber
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.$router.go(0)
        }
      })
    },
    confirm () {
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://49.234.30.114:88/api/order/order/confirm',
        params: {
          userToken: this.$q.cookies.get('token'),
          serialNumber: this.$route.query.serialNumber
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.$router.go(0)
        }
      })
    },
    toSku (id) {
      this.$router.push(String(id))
    },
    initTimer () {
      const end = this.order.created + 15 * 60 * 1000
      setInterval(() => {
        const second = Math.floor((end - new Date().getTime()) / 1000)
        if (second <= 0) this.$router.go(0)
        const m = Math.floor(second / 60)
        const s = Math.floor(second % 60)
        this.timer = m + ' : ' + s
      }, 1000)
    }
  },
  computed: {
    computeStatus () {
      if (this.order.status === 0) {
        return '待支付'
      } else if (this.order.status === 1) {
        return '已取消'
      } else if (this.order.status === 2) {
        return '已支付'
      } else if (this.order.status === 3) {
        return '已完成'
      } else {
        return ''
      }
    },
    computeTime () {
      return new Date(this.order.created).toLocaleString()
    }
  },
  beforeCreate () {
    if (!this.$route.query.serialNumber) {
      this.$router.go(-1)
      return
    }
    const token = this.$q.cookies.get('token')
    if (token === null) {
      this.$q.notify({
        timeout: 1000,
        color: 'red-5',
        textColor: 'white',
        icon: 'warning',
        message: '请先登录'
      })
      this.$router.push('login')
    }
  },
  mounted () {
    this.initOrder()
  }
}
</script>
