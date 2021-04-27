<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="back" />
        <q-toolbar-title>
          收货地址
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-list bordered class="rounded-borders" style="max-width: 600px">
        <q-item v-for="(value, index) of address" :key="index">
          <q-item-section top @click="setDefault(value.id)">
            <q-item-label caption lines="1">
              {{ value.areaString}}
            </q-item-label>
            <q-item-label lines="1">
              <span class="text-weight-bold">{{ value.detailAddress }}</span>
            </q-item-label>
            <q-item-label lines="1">
              <span class="text-grey-8">{{ value.name }}</span>
              <span>&emsp;</span>
              <span class="text-grey-8">{{ value.phone }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section top side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn size="12px" flat dense round icon="border_color" :to="'modifyAddress?id=' + value.id " />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-page-container>

    <q-footer class="bg-white">
      <div class="q-pa-md">
        <q-btn-group spread>
          <q-btn color="red" label="新建收货地址" icon-right="add" to="addAddress" />
        </q-btn-group>
      </div>
    </q-footer>

  </q-layout>
</template>

<script>
export default {
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
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://106.55.156.192:5797/api/order/address/setDefault',
        params: {
          userToken: this.$q.cookies.get('token'),
          id: id
        }
      }).then(res => {
        console.log(res)
        if (res.data.code === 0) {
          this.$router.go(-1)
        } else {
          this.$q.notify({
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
      this.$router.push('login')
      return
    }
    this.$axios({
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
      url: 'http://106.55.156.192:5797/api/order/address/list',
      params: {
        userToken: token
      }
    }).then(res => {
      console.log(res)
      if (res.data.code === 0) {
        this.address = res.data.address
      } else {
        this.$q.notify({
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
