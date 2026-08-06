import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/ds:game/:type',
      name: 'ItemCatalog',
      component: () => import('@/views/ItemCatalog.vue'),
      props: true
    },
    {
      path: '/ds:game/:type/:id',
      name: 'ItemDetail',
      component: () => import('@/views/ItemDetail.vue'),
      props: true
    },
    {
      path: '/ds:game/dialogue',
      name: 'DialogueList',
      component: () => import('@/views/DialogueList.vue'),
      props: true
    },
    {
      path: '/ds:game/dialogue/:npc',
      name: 'DialogueView',
      component: () => import('@/views/DialogueView.vue'),
      props: true
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: () => import('@/views/FavoriteView.vue')
    }
  ]
})

export default router
