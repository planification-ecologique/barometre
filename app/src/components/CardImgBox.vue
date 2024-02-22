<template>
    <div class="fr-card fr-card--lg fr-enlarge-link fr-card--horizontal card--hpadding" :style="{backgroundColor: cardObject.bgcolor}">
        <div class="fr-card__body card-margin">
            <div class="fr-card__content card--content">
                <h2 class="view-data">
                    <a href="#">{{ cardObject.title }}</a>
                    <a class="fr-link fr-icon-arrow-right-line fr-link--icon-right" v-if="cardObject.databtn1">Consulter toutes les données</a>
                </h2>
                <div class="fr-card__start">
                    <p class="fr-text--lg fr-text--black">
                        {{ cardObject.description }}
                    </p>
                    <button class="fr-btn" v-if="cardObject.databtn">Consulter toutes les données</button>
                </div>
            </div>
        </div>
        <div class="fr-card__header right-image" :is="cardObject.image">
        </div>
    </div>
</template>
    
<script>

import ChartBarImg from './components_sgv/ChartBarImg'

export default {
    name: 'CardImgBox',
    components: {
        ChartBarImg
    },
    props: {
        cardObject: {
            type: Object,
            required: true
        }
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
