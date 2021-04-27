<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="bg-primary text-white" height-hint="98">
      <q-toolbar class="bg-primary text-white rounded-borders">
        <q-input dark dense standout class="q-ml-md" @click="search" >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-white">
      <div class="q-pa-md">
        <q-btn-group spread>
          <q-btn color="primary" label="首页" to="/" />
          <q-btn color="primary" label="购物车" to="/cart" />
          <q-btn color="primary" label="我的" to="/mine" />
        </q-btn-group>
      </div>
    </q-footer>

  </q-layout>
</template>

<script>
export default {
  methods: {
    search () {
      this.$router.push('/search')
    }
  }
}
</script>
