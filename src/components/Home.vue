<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="bg-primary text-white" height-hint="98">
      <q-toolbar class="bg-primary text-white rounded-borders">
        <q-input dark dense standout @click="search" placeholder="手机" >
          <template v-slot:append>
            <q-icon name="search" @click="search" />
          </template>
        </q-input>
      </q-toolbar>
      <div>
        <q-tabs
        v-model="tab"
        inline-label
        class="bg-white text-primary shadow-2 text-bold"
        @click="onTab"
      >
        <q-tab name="recommend" label="推荐" />
        <q-tab name="phone" label="手机" />
        <q-tab name="computer" label="电脑" />
        <q-tab name="tablet" label="平板" />
      </q-tabs>
      </div>
    </q-header>

    <q-page-container>
      <div class="q-pa-md" style="max-width: 100%">
        <q-infinite-scroll @load="onLoad" :offset="250" v-if="skus.length > 0">
          <q-list>
          <q-item clickable v-ripple v-for="(v, i) of skus" :key="i" @click="openNewPage(v.id)">
            <q-item-section thumbnail>
              <img :src="v.image">
            </q-item-section>
            <q-item-section class="q-pa-md">
              <span v-html="v.title"></span>
            </q-item-section>
            <q-item-section v-html="'￥ ' + (v.price / 100)" class="text-bold" ></q-item-section>
          </q-item>
          </q-list>
          <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
          </template>
        </q-infinite-scroll>
      </div>
      <q-icon name="o_arrow_drop_up" style="margin-bottom:100px" size="xl" color="primary" class="fixed-bottom-right q-ma-md bg-grey-4 rounded-borders" @click="onScroll" v-if="skus.length > 0"/>
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
import { createMetaMixin } from 'quasar'
export default {
  mixins: [
    createMetaMixin(function () {
      return {
        title: '首页'
      }
    })
  ],
  data () {
    return {
      tab: 'recommend',
      skus: [],
      categories: []
    }
  },
  methods: {
    search () {
      this.$router.push('/search')
    },
    onTab () {
      switch (this.tab) {
        case 'recommend':
          break
        case 'phone':
          this.categories = [225]
          break
        case 'computer':
          this.categories = [449, 454]
          break
        case 'tablet':
          this.categories = [452]
          break
        default:
          break
      }
      this.skus = []
      if (this.updateSku() < 20) this.canLoad = false
      else this.canLoad = true
    },
    updateSku () {
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/commodity/sku/queryCategoriesRandom`,
        data: this.categories
      }).then(res => {
        this.skus = this.skus.concat(res.data.skus)
      }).catch(e => {
        console.log(e)
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
    onLoad (index, done) {
      this.updateSku()
      done()
    },
    onScroll () {
      window.scrollTo(0, 0)
    },
    openNewPage (id) {
      const url = this.$router.resolve(String(id))
      window.open(url.href, '_blank')
    }
  },
  mounted () {
    this.updateSku()
  }
}
</script>
