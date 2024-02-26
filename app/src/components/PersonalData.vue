<template>
    <div>
        <h4>Styles P</h4>
        <p>{{dataObject.description}}</p>
    </div>
</template>
<script>
export default {
name:'Personal Data',
data(){
    return
},
    props:{
          dataObject: {
            type: Object,
            required: true
        }
    },
    methods:{

    }
}
</script>
<style>

</style>