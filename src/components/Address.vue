<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="back" />
        <q-toolbar-title>
          选择你的收货地址
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-list bordered separator>
        <q-item v-for="(value, index) of address" :key="index" >
          <q-item-section top @click="setDefault(value.id)">
            <q-item-label lines="1">
              {{ value.areaString }}
              <span v-if="value.isDefault === 1" class="text-primary">(默认地址)</span>
            </q-item-label>
            <q-item-label lines="1">
              <span>{{ value.detailAddress }}</span>
            </q-item-label>
            <q-item-label lines="1">
              <span>{{ value.name }}</span>
              <span>&emsp;</span>
              <span>{{ value.phone }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section top side>
            <div>
              <q-btn size="12px" flat dense round icon="border_color" :to="'modifyAddress?id=' + value.id " />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-page-container>

    <q-footer class="bg-white">
      <div v-if="this.$q.cookies.get('token') === null" class="bg-grey-5">
        <span>&emsp;你还没登录呢&emsp;</span>
        <q-btn to="login" color="green">去登陆 >></q-btn>
      </div>
      <div class="q-pa-md" v-else>
        <q-btn-group spread>
          <q-btn color="primary" label="新建收货地址" icon-right="add" to="addAddress" />
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
        title: '我的地址'
      }
    })
  ],
  data () {
    return {
      address: undefined
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    setDefault (id) {
      if (this.$q.cookies.get('token') === null) return

      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/order/address/setDefault`,
        params: {
          userToken: this.$q.cookies.get('token'),
          id: id
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.$router.go(-1)
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
    const token = this.$q.cookies.get('token')
    if (token === null) {
      return
    }
    this.$axios({
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
      url: `http://${window.location.hostname}:88/api/order/address/list`,
      params: {
        userToken: token
      }
    }).then(res => {
      if (res.data.code === 0) {
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
  }
}
</script>
