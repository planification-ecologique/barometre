<template>
   <ul class="fr-tags-group">
        <li v-for="tag in tags" :key="tag.value">
            <p class="fr-tag fr-tag--sm">{{ tag.label }}</p>
        </li>
    </ul>
</template>

<script>
export default {
    name: 'tagsCard',
    data() {
        return {
            tags: [],
        }
    },
    props: {
        tagsIndicateurs: {
            type: String,
            required: true,
        }
    },
    methods: {
        get_tags () {
            console.log('list tags :', this.tagsIndicateurs)
            this.tags = this.tagsIndicateurs.split(',').map(item => {
                return {
                    value: item,
                    label: item[0].toUpperCase()+item.slice(1)
                }
            })
        },
    },
    mounted () {
        // this.get_tags()
        this.get_tags()
    }
}

</script>

<style></style>
