<template>
    <ul class="fr-tags-group">
        <!-- <button v-for="tag in tags" class="fr-tag" :aria-pressed="tag['selected']" :value="tag['value']" :key="tag['id']" v-on:click="selectTag($event, tag)"> {{ tag['label'] }}</button> -->
        <li v-for="tag in tags">
            <p class="fr-tag fr-tag--sm">{{ tag['label'] }}</p>
        </li>
    </ul>
</template>

<script>
export default {
    name: 'Tags',
    data() {
        return {
            tags: [],
        }
    },
    methods: {
        selectTag (tag_name, selectedTag) {
            if (selectedTag.selected === true) {
                selectedTag.selected = false
            } 
            else selectedTag.selected = true

            var selected_tags = this.get_selected_tags()
            this.$emit('tags', selected_tags)
        },
        get_tags () {
            this.tags = [
                {value:'attenuation', label:'Atténuation', selected:true},
                // {value:'emissions', label:'Emissions', selected:false},
                {value:'biodiversite', label:'Biodiversité', selected:false},
                {value:'ressouces', label:'Ressources', selected:false},
                {value:'adaptation', label:'Adaptation', selected:false},
                {value:'sante', label:'Santé', selected:false}
            ]
        },
        get_selected_tags () {
            return this.tags.filter(item => item.selected === true).map(item => item.value)
        }
    },
    mounted () {
        this.get_tags()
    }
}

</script>

<style></style>
