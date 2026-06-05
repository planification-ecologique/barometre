<template>
  <div
    v-if="visible"
    id="fr-feedback-modal"
    class="feedback-modal__backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="fr-feedback-modal-title"
    tabindex="-1"
    @click.self="onClose"
    @keydown.esc.prevent="onClose"
  >
    <div class="fr-container fr-container--fluid fr-container-md feedback-modal__panel-wrap">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div class="fr-modal__body fr-scroll-divider feedback-modal__body" @click.stop>
            <div class="fr-modal__header">
              <button
                type="button"
                aria-controls="fr-feedback-modal"
                class="fr-btn fr-btn--close"
                title="Fermer"
                @click="onClose"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="fr-feedback-modal-title" class="fr-modal__title fr-mb-1w">
                Signaler un problème
              </h1>
              <p class="fr-text--sm fr-mb-2w">
                Donnée incorrecte, bug ou idée d'amélioration — dites-nous ce qui ne va pas.
              </p>
              <p
                v-if="indicatorLabel"
                class="fr-text--sm fr-text--bold fr-p-1w fr-background-alt--grey fr-mb-2w"
              >
                {{ indicatorLabel }}
              </p>

              <div v-if="status === 'success'" class="feedback-modal__success">
                <p class="fr-alert fr-alert--success fr-alert--sm">
                  Merci&nbsp;! Votre signalement a bien été transmis.
                </p>
                <button type="button" class="fr-btn" @click="onClose">Fermer</button>
              </div>

              <form v-else class="feedback-form" @submit.prevent="onSubmit">
                <fieldset class="fr-fieldset">
                  <legend class="fr-fieldset__legend fr-text--bold fr-mb-1w">
                    Nature du signalement
                  </legend>
                  <div class="fr-btns-group fr-btns-group--inline-md fr-btns-group--icon-left">
                    <button
                      v-for="option in reasonOptions"
                      :key="option.value"
                      type="button"
                      class="fr-btn fr-btn--secondary fr-btn--sm"
                      :class="{ 'fr-btn--primary': reason === option.value }"
                      :aria-pressed="reason === option.value"
                      @click="reason = option.value"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </fieldset>

                <div class="fr-input-group">
                  <label class="fr-label" for="feedback-comment">Votre message</label>
                  <textarea
                    id="feedback-comment"
                    ref="commentField"
                    class="fr-input"
                    rows="5"
                    maxlength="2000"
                    required
                    v-model="comment"
                  />
                  <p class="fr-hint-text fr-mt-1v">{{ comment.length }}/2000</p>
                </div>

                <div class="fr-input-group">
                  <label class="fr-label" for="feedback-email">E-mail</label>
                  <input
                    id="feedback-email"
                    class="fr-input"
                    type="email"
                    autocomplete="email"
                    required
                    v-model="email"
                  />
                </div>

                <div class="feedback-form__honeypot" aria-hidden="true">
                  <label for="feedback-website">Ne pas remplir</label>
                  <input
                    id="feedback-website"
                    type="text"
                    tabindex="-1"
                    autocomplete="off"
                    v-model="website"
                  />
                </div>

                <p v-if="status === 'error' && errorMessage" class="fr-error-text">
                  {{ errorMessage }}
                </p>

                <p class="fr-text--xs fr-text-mention--grey fr-mb-2w">
                  Votre e-mail servira uniquement au suivi de votre signalement.
                </p>

                <button
                  type="submit"
                  class="fr-btn"
                  :disabled="status === 'sending' || !comment.trim() || !email.trim()"
                >
                  {{ status === 'sending' ? 'Envoi…' : 'Envoyer' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { submitFeedback } from '@/services/feedbackService.js'

const REASON_OPTIONS = [
  { value: 'donnee_fausse', label: 'Donnée fausse' },
  { value: 'bug', label: 'Bug' },
  { value: 'suggestion', label: 'Suggestion' },
]

export default {
  name: 'FeedbackFormModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    indicatorId: {
      type: String,
      default: '',
    },
    indicatorLabel: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      reason: 'donnee_fausse',
      comment: '',
      email: '',
      website: '',
      status: 'idle',
      errorMessage: null,
      reasonOptions: REASON_OPTIONS,
    }
  },
  watch: {
    visible(open) {
      if (open) {
        this.resetForm()
        this.$nextTick(() => {
          const field = this.$refs.commentField
          if (field) field.focus()
        })
      }
    },
  },
  methods: {
    resetForm() {
      this.reason = 'donnee_fausse'
      this.comment = ''
      this.email = ''
      this.website = ''
      this.status = 'idle'
      this.errorMessage = null
    },
    onClose() {
      this.$emit('close')
    },
    async onSubmit() {
      if (!this.comment.trim() || this.status === 'sending') return

      const trimmedEmail = this.email.trim()
      if (!trimmedEmail) {
        this.status = 'error'
        this.errorMessage = 'Un e-mail est obligatoire.'
        return
      }

      this.status = 'sending'
      this.errorMessage = null

      const result = await submitFeedback({
        raison: this.reason,
        type: 'utilisateur',
        commentaire: this.comment.trim(),
        email: trimmedEmail,
        id_indicateur: this.indicatorId || undefined,
        libelle_indicateur: this.indicatorLabel || undefined,
        url_page: typeof window !== 'undefined' ? window.location.href : undefined,
        website: this.website,
      })

      if (result.ok) {
        this.status = 'success'
      } else {
        this.status = 'error'
        this.errorMessage = result.error || 'Envoi impossible pour le moment.'
      }
    },
  },
}
</script>

<style scoped>
.feedback-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
  background: rgba(0, 0, 0, 0.45);
  overflow-y: auto;
}

.feedback-modal__panel-wrap {
  width: 100%;
}

.feedback-modal__body {
  background: var(--background-default-grey, #fff);
}

.feedback-form__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.feedback-modal__success {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
</style>
