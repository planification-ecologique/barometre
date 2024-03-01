<template>
    <ul class="fr-tags-group">
        <li v-for="tag in tags" :key="tag.value">
            <p class="fr-tag fr-tag--sm">{{ tag['label'] }}</p>
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
        get_uniqueTags () {
            return this.tagsIndicateurs.split(',').filter((value, index, self) => {
                return self.indexOf(value) === index
            })
        },
        get_tags () {
            const distinctTags = this.get_uniqueTags() // remove duplicates
            try {
                this.tags = distinctTags.map(item => {
                    return {
                        value: item,
                        label: item[0].toUpperCase()+item.slice(1)
                    }
                })
            } catch (error) {
                console.log("Erreur sur la liste des tags", error)
            }
        },
    },
    mounted () {
        // this.get_tags()
        this.get_tags()
    }
}

</script>

<style></style>
