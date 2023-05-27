<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="back" />
        <q-toolbar-title>
          填写订单
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="q-pa-md">
        <q-list bordered class="rounded-borders" >
          <q-item to="address" v-if="address">
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

            <q-item-section top side>
              <div class="text-grey-8 q-gutter-xs">
                <q-btn size="12px" flat dense round icon="arrow_forward_ios" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="q-pa-md">
        <q-list bordered padding>
          <q-item tag="label" v-for="(value, index) of sku" :key="index">

            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="value.image">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ value.title }}</q-item-label>
              <q-item-label caption>{{ value.group }}</q-item-label>
              <q-item-label>
                {{ '￥' + (value.price / 100) }}
                <q-btn size="xs" @click="changeCount(value, value.count - 1)">-</q-btn>
                <q-btn size="xs" disable unelevated>{{ value.count }}</q-btn>
                <q-btn size="xs" @click="changeCount(value, value.count + 1)">+</q-btn>
                <q-item-label v-if="value.stock < value.count" class="text-red">库存暂时仅剩:{{ value.stock }}</q-item-label>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-page-container>

    <q-footer elevated class="bg-white">
      <div v-if="this.$q.cookies.get('token') === null" class="bg-grey-5">
        <span>&emsp;你还没登录呢&emsp;</span>
        <q-btn to="login" color="green">去登陆 >></q-btn>
      </div>
      <q-toolbar>
        <q-toolbar-title class="text-red">
          {{ '￥' + price }}
        </q-toolbar-title>
        <q-btn push color="primary" label="提交订单" @click="submit" />
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
        title: '提交订单'
      }
    })
  ],
  data () {
    return {
      address: undefined,
      sku: undefined,
      price: 0.00
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    initAddress () {
      if (this.$q.cookies.get('token') === null) return

      this.$axios({
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/order/address/fetchDefault`,
        params: {
          userToken: this.$q.cookies.get('token')
        }
      }).then(res => {
        if (res.data.code === 0) {
          if (res.data.address === null) {
            this.$q.notify({
              timeout: 1000,
              color: 'primary',
              textColor: 'white',
              icon: 'warning',
              message: '你的收货地址还是空的呢',
              actions: [
                { label: '点我去创建一个 >>', color: 'yellow', handler: () => this.$router.push('address') }
              ]
            })
          }
          this.address = res.data.address
        } else {
          this.$q.notify({
            position: 'top',
            timeout: 1000,
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: res.data.msg
          })
        }
      })
    },
    initSku () {
      if (this.$q.cookies.get('token') === null) return

      if (this.$route.query.cart) {
        this.$axios({
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          url: `http://${window.location.hostname}:88/api/cart/cart/miniList`,
          params: {
            userToken: this.$q.cookies.get('token')
          },
          data: [].concat(this.$route.query.cart)
        }).then(res => {
          if (res.data.code === 0) {
            this.sku = res.data.sku
            this.computePrice()
          } else {
            this.$q.notify({
              position: 'top',
              timeout: 1000,
              color: 'red-5',
              textColor: 'white',
              icon: 'warning',
              message: res.data.msg
            })
            this.$router.go(-1)
          }
        }).catch(e => {
          this.$q.notify({
            position: 'center',
            timeout: 1000,
            color: 'red',
            textColor: 'white',
            icon: 'cloud_done',
            message: '服务器好像走丢了，待会儿再试试吧~'
          })
        })
      } else if (this.$route.query.id) {
        this.$axios({
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          url: `http://${window.location.hostname}:88/api/commodity/sku/miniList`,
          params: {
            userToken: this.$q.cookies.get('token')
          },
          data: [].concat(this.$route.query.id)
        }).then(res => {
          if (res.data.code === 0) {
            this.sku = [].concat(res.data.sku)
            this.sku[0].stock = this.sku[0].count
            this.sku[0].count = parseInt(this.$route.query.count)
            this.computePrice()
          } else {
            this.$q.notify({
              position: 'top',
              timeout: 1000,
              color: 'red-5',
              textColor: 'white',
              icon: 'warning',
              message: res.data.msg
            })
            this.$router.go(-1)
          }
        }).catch(e => {
          this.$q.notify({
            position: 'center',
            timeout: 1000,
            color: 'red',
            textColor: 'white',
            icon: 'cloud_done',
            message: '服务器好像走丢了，待会儿再试试吧~'
          })
        })
      }
    },
    computePrice () {
      let temp = 0
      for (const s of this.sku) {
        temp += s.price / 100 * s.count
      }
      this.price = temp
    },
    changeCount (sku, count) {
      if (this.$q.cookies.get('token') === null) return

      if (count < 1) {
        this.$q.notify({
          position: 'top',
          timeout: 1000,
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: '数量不可以少于 1'
        })
      } else if (sku.stock < count) {
        this.$q.notify({
          position: 'top',
          timeout: 1000,
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: `现有库存(${sku.stock})`
        })
      } else {
        if (this.$route.query.cart) {
          this.$axios({
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            url: `http://${window.location.hostname}:88/api/cart/cart/modifyCount`,
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
                position: 'top',
                timeout: 1000,
                color: 'red-5',
                textColor: 'white',
                icon: 'warning',
                message: res.data.msg
              })
            }
          }).catch(e => {
            this.$q.notify({
              position: 'center',
              timeout: 1000,
              color: 'red',
              textColor: 'white',
              icon: 'cloud_done',
              message: '服务器好像走丢了，待会儿再试试吧~'
            })
          })
        } else if (this.$route.query.id) {
          sku.count = count
        }
      }
    },
    submit () {
      if (this.$q.cookies.get('token') === null) return

      if (!this.address) {
        this.$q.notify({
          timeout: 1000,
          color: 'primary',
          textColor: 'white',
          icon: 'warning',
          message: '你的收货地址还是空的呢',
          actions: [
            { label: '点我去创建一个 >>', color: 'yellow', handler: () => this.$router.push('address') }
          ]
        })
        return
      }
      const sku = {}
      for (const s of this.sku) {
        sku[s.id] = s.count
      }
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/order/order/add`,
        params: {
          userToken: this.$q.cookies.get('token'),
          addressId: this.address.id
        },
        data: sku
      }).then(res => {
        if (res.data.code === 0) {
          if (this.$route.query.cart) {
            const cart = []
            for (const s of this.sku) {
              cart.push(s.cartId)
            }
            this.$axios({
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              url: `http://${window.location.hostname}:88/api/cart/cart/delete`,
              params: {
                userToken: this.$q.cookies.get('token')
              },
              data: cart
            }).then(res => {
              if (res.data.code !== 0) {
                this.$q.notify({
                  position: 'top',
                  timeout: 1000,
                  color: 'red-5',
                  textColor: 'white',
                  icon: 'warning',
                  message: res.data.msg
                })
              }
            }).catch(e => {
              this.$q.notify({
                position: 'center',
                timeout: 1000,
                color: 'red',
                textColor: 'white',
                icon: 'cloud_done',
                message: '服务器好像走丢了，待会儿再试试吧~'
              })
            })
          }
          // =====
          this.$router.replace({
            path: 'orderDetail',
            query: {
              serialNumber: res.data.serialNumber
            }
          })
        } else {
          this.$q.notify({
            position: 'top',
            timeout: 1000,
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: res.data.msg
          })
        }
      })
    }
  },
  beforeCreate () {
    if (this.$route.query.id && this.$route.query.cart) this.$router.go(-1)
    if (!(this.$route.query.id || this.$route.query.cart)) this.$router.go(-1)
  },
  mounted () {
    this.initAddress()
    this.initSku()
  }
}
</script>
