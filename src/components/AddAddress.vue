<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="back" />
        <q-toolbar-title>
          新建收货地址
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <div class="q-pa-md" style="max-width: 350px">
        <q-list bordered separator>
          <q-item clickable v-ripple v-for="(value, index) of area" :key="index">
            <q-item-section @click="fetchArea(value)">{{ value.name }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <div class="q-pa-md">
        <q-form
          @submit="onSubmit"
        >
          <q-input
            outlined
            v-model="address.name"
            label="收货人"
            lazy-rules
            :rules="[ val => val && val.length >= 2 && val.length <= 16 || '长度应为2到16位']"
          />

          <q-input
            outlined
            type="number"
            v-model="address.phone"
            label="手机号码"
            lazy-rules
            :rules="[
              val => val > 10000000000 && val < 20000000000 || '手机号输入不正确'
            ]"
          />

          <q-input
            outlined
            v-model="areaText"
            label="所在地区"
            readonly
            lazy-rules
            :rules="[ val => val && val !== '' || '请选择所在地址']"
            @click="rightDrawerOpen = true"
          />

          <q-input
            outlined
            type="textarea"
            v-model="address.detailAddress"
            label="详细地址"
            lazy-rules
            :rules="[ val => val && val.length >= 4 && val.length <= 32 || '请输入你的详细地址(长度应为4到32位)']"
          />

          <q-btn-group spread>
            <q-btn color="primary" label="保存并使用" type="submit" />
          </q-btn-group>
        </q-form>
      </div>
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
        title: '添加地址'
      }
    })
  ],
  data () {
    return {
      rightDrawerOpen: false,
      area: undefined,
      level: 1,
      areaText: undefined,
      areaTextTemp: '',
      address: {
        name: undefined,
        phone: undefined,
        areaId: undefined,
        detailAddress: undefined
      }
    }
  },
  methods: {
    onSubmit () {
      const token = this.$q.cookies.get('token')
      if (token === null) {
        this.$q.notify({
          timeout: 1000,
          color: 'primary',
          textColor: 'white',
          icon: 'warning',
          message: '你还没登录呢',
          actions: [
            { label: '点我去登录 >>', color: 'yellow', handler: () => this.$router.push('login') }
          ]
        })
        return
      }
      this.$q.notify({
        position: 'top',
        timeout: 1000,
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: '提交成功'
      })
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/order/address/add`,
        data: this.address,
        params: {
          userToken: token
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.$q.notify({
            position: 'top',
            timeout: 1000,
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: '添加成功'
          })
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
    },

    back () {
      this.$router.go(-1)
    },
    initArea () {
      this.$axios({
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/order/area/list1`
      }).then(res => {
        if (res.data.code === 0) {
          this.area = res.data.area
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
    fetchArea (area) {
      if (this.level === 1 || this.level === 2) {
        this.$axios({
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
          url: `http://${window.location.hostname}:88/api/order/area/list2`,
          params: {
            id: area.id
          }
        }).then(res => {
          if (res.data.code === 0) {
            this.area = res.data.area
            this.areaTextTemp += area.name
            this.level += 1
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
      } else if (this.level === 3) {
        this.address.areaId = area.id
        this.areaTextTemp += area.name
        this.areaText = this.areaTextTemp
        this.areaTextTemp = ''
        this.rightDrawerOpen = false
        this.level = 1
        this.initArea()
      }
    }
  },
  created () {
    this.initArea()
  }
}
</script>
