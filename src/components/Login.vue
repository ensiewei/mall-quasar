<template>
  <div class="q-pa-md">

    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >

      <q-input
        outlined
        type="number"
        v-model="user.phone"
        label="手机号 *"
        lazy-rules
        :rules="[
          val => val > 10000000000 && val < 20000000000 || '手机号输入不正确'
        ]"
      />

      <q-input
        outlined
        type="password"
        v-model="user.password"
        label="密码 *"
        lazy-rules
        :rules="[ val => val && val.length >= 6 && val.length <= 16 || '密码长度应为6到16位' ]"
      />

      <q-btn-group spread>
        <q-btn label="提交" type="submit" color="primary"/>
        <q-btn label="重置" color="primary" type="reset" />
        <q-btn label="注册 >>" color="primary" to="register" />
      </q-btn-group>
    </q-form>

  </div>
</template>

<script>
import { createMetaMixin } from 'quasar'
export default {
  mixins: [
    createMetaMixin(function () {
      return {
        title: '登录'
      }
    })
  ],
  data () {
    return {
      user: {}
    }
  },
  methods: {
    onSubmit () {
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
        url: `http://${window.location.hostname}:88/api/user/user/login?phone=${this.user.phone}&key=${this.user.password}`
      }).then(res => {
        if (res.data.code === 0) {
          this.$q.cookies.set('token', res.data.token, { expires: '1d' })
          this.$q.notify({
            position: 'top',
            timeout: 1000,
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: '登录成功'
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
    onReset () {
      this.user = {}
    }
  }
}
</script>
