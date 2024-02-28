<template>
    <div>
        <h1>Styles </h1>
           <ErrorPage :serieObj="dataError"></ErrorPage>
    </div>
</template>
<script>
import ErrorPage from '../components/ErrorPage.vue'
export default {
   name:'Error',
  components: {
   
    ErrorPage
    
  },
  data() {
    return {
        dataError : {
            title:"Test",
            errorType:"Test 2 "
        }
    }
  },
}
</script>
<style>

</style>