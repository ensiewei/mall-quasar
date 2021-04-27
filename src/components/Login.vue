<template>
  <div class="q-pa-md" style="max-width: 400px">

    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >

      <q-input
        filled
        type="number"
        v-model="user.phone"
        label="Your phone *"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || 'Please type your phone',
          val => val > 0 && val < 20000000000 || 'Please type a real phone'
        ]"
      />

      <q-input
        filled
        type="password"
        v-model="user.password"
        label="Your password *"
        lazy-rules
        :rules="[ val => val && val.length >= 4 && val.length <= 16 || 'Please type something (length range[4,16])']"
      />

      <div>
        <q-btn label="Submit" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        <q-btn label="Register >" color="green" flat class="q-ml-sm" to="register" />
      </div>
    </q-form>

  </div>
</template>

<script>
export default {
  data () {
    return {
      user: {}
    }
  },
  methods: {
    onSubmit () {
      this.$q.notify({
        color: 'green-4',
        position: 'center',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Submitted'
      })
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://106.55.156.192:5797/api/user/user/login?phone=${this.user.phone}&key=${this.user.password}`
      }).then(res => {
        if (res.data.code === 0) {
          this.$q.cookies.set('token', res.data.token, { expires: '1d' })
          this.$q.notify({
            color: 'green-4',
            position: 'center',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'login successful'
          })
          this.$router.go(-1)
        } else {
          this.$q.notify({
            color: 'red-5',
            position: 'center',
            textColor: 'white',
            icon: 'warning',
            message: res.data.msg
          })
        }
      }).catch(e => {
        console.log(e)
      })
    },
    onReset () {
      this.user = {}
    }
  }
}
</script>
