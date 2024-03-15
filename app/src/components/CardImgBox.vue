<template>
    <div class="fr-card fr-card--lg fr-enlarge-link fr-card--horizontal card--hpadding" :style="{backgroundColor: cardObject.bgcolor}">
        <div class="fr-card__body card-margin">
            <div class="fr-card__content card--content">
                <h2 class="view-data"> {{ cardObject.title }}
                </h2>

                <div class="fr-card__start">
                    <p class="fr-text--lg fr-text--black">
                        {{ cardObject.description }}
                    </p>
                    <button class="fr-btn" v-if="cardObject.databtn"><a :href=dashboard_link></a>Consulter toutes les données</button>
                </div>
            </div>
        </div>
        <div class="fr-card__header right-image" :is="cardObject.image">
        </div>
    </div>
</template>
    
<script>

import ChartBarImg from './components_sgv/ChartBarImg'
import FranceImg from './components_sgv/FranceImg.vue'

export default {
    name: 'CardImgBox',
    components: {
        ChartBarImg,
        FranceImg
    },
    data() {
        return {
            dashboard_link: "/dashboard"
        }
    },
    props: {
        cardObject: {
            type: Object,
            required: true
        }
    },
    methods: {
        set_link () {
            let base = process.env.VUE_APP_PREFIX_PATH
            if (base) {
                this.dashboard_link = base +"/dashboard/transverse/emissions--puits"
            }
        }
    },
    mounted(){
        this.set_link()
    }
}
</script>

<style scoped>

.fr-card:hover {
    box-shadow: none !important; 
    transform: none !important; 
}
.fr-link{
    margin-top: 10px;
    color: #040091;
    text-decoration: underline;
}
.right-image {
    order:2;
    display: flex;
    align-items: center;
    justify-content: center;
}
.card-margin {
    padding-right: 3rem;
}
.card--hpadding {
    padding: 0 5rem !important;
    padding-top: 0.5rem !important;
    background-color: #FFFFFF;
    white-space: pre-line;
}
.card--content {
    padding-top : 4rem !important;
}
.fr-text--black {
    color: #000000;
}
.view-data {
    display: flex;
    justify-content: space-between;
}
</style>
