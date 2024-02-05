<template>
    <div class="fr-grid-row" v-for="(row,index) in grid" :key="index">
        <diV class="fr-col" v-for="(item, columnIndex) in row" :key="columnIndex">
        
        </diV>
    </div>


</template>
    
<script>



export default {
    name: 'AdaptiveDashboard',

    data() {
        return {
            widgetId: '',
            inputData: [1, 2, 3, 4, 5, 6, 7],
            
        }
    },
    props: {
        


    },
    methods: {

    },
    mounted() {
        // this.setWidgetId()
    },
    watch: {

    },
}
</script>
    
<style scoped>

</style>
