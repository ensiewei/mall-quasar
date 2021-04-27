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
      <div class="q-pa-md" style="max-width: 400px">
        <q-form
          @submit="onSubmit"
          class="q-gutter-md"
        >
          <q-input
            filled
            v-model="address.name"
            label="收货人"
            lazy-rules
            :rules="[ val => val && val.length >= 2 && val.length <= 16 || 'Please type something (length range [2,16])']"
          />

          <q-input
            filled
            type="number"
            v-model="address.phone"
            label="手机号码"
            lazy-rules
            :rules="[
              val => val && val !== '' || 'Please type your phone',
              val => val > 0 && val < 20000000000 || 'Please type a real phone'
            ]"
          />

          <q-input
            filled
            v-model="areaText"
            label="所在地区"
            readonly
            lazy-rules
            :rules="[ val => val && val !== '' || 'Please type something (length range [2,16])']"
            @click="rightDrawerOpen = true"
          />

          <q-input
            filled
            type="textarea"
            v-model="address.detailAddress"
            label="详细地址"
            lazy-rules
            :rules="[ val => val && val.length >= 6 && val.length <= 16 || 'Please type something (length range[6,16])']"
          />

          <div>
            <q-btn color="red" label="保存并使用" type="submit" />
          </div>
        </q-form>
      </div>
    </q-page-container>

  </q-layout>

</template>

<script>
export default {
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
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: '请先登录'
        })
        this.$router.push('login')
        return
      }
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Submitted'
      })
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://106.55.156.192:5797/api/order/address/add',
        data: this.address,
        params: {
          userToken: token
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'added success'
          })
          this.$router.go(-1)
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
    },

    back () {
      this.$router.go(-1)
    },
    initArea () {
      this.$axios({
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://106.55.156.192:5797/api/order/area/list1'
      }).then(res => {
        if (res.data.code === 0) {
          this.area = res.data.area
        } else {
          this.$q.notify({
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
          url: 'http://106.55.156.192:5797/api/order/area/list2',
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
  created () {
    this.initArea()
  }
}
</script>
