<template>
  <div>
    <AppHeader title="Subscription" subtitle="Manage your organization's subscription plan" />

    <div class="p-6 flex flex-col gap-8">
      <!-- Current Plan -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Current Plan</h3>
        <div v-if="subscriptionStore.currentSubscription" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-2xl font-bold text-primary-600">
              {{ subscriptionStore.currentSubscription.planName || subscriptionStore.currentSubscription.name || 'Free' }}
            </p>
            <p class="text-sm text-slate-500 mt-1">
              Max {{ subscriptionStore.currentSubscription.maxUsers || 'unlimited' }} users
            </p>
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold text-slate-900">
              {{ formatCurrency(subscriptionStore.currentSubscription.price || 0) }}
            </p>
            <p class="text-sm text-slate-500">per month</p>
          </div>
        </div>
        <div v-else class="text-sm text-slate-500 py-4">
          Loading subscription details...
        </div>
      </div>

      <!-- Available Plans -->
      <div>
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Available Plans</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="plan in subscriptionStore.plans"
            :key="plan.id"
            :class="isCurrentPlan(plan) ? 'ring-2 ring-primary-600' : 'ring-1 ring-slate-200'"
            class="card p-6 relative"
          >
            <div v-if="isCurrentPlan(plan)" class="absolute -top-3 left-4">
              <span class="inline-flex items-center rounded-full bg-primary-600 px-3 py-0.5 text-xs font-semibold text-white">
                Current Plan
              </span>
            </div>
            <h4 class="text-lg font-semibold text-slate-900">{{ plan.name }}</h4>
            <p class="text-3xl font-bold text-slate-900 mt-2">
              {{ formatCurrency(plan.price || 0) }}
              <span class="text-sm font-normal text-slate-500">/ month</span>
            </p>
            <ul class="mt-4 flex flex-col gap-2">
              <li class="flex items-center gap-2 text-sm text-slate-600">
                <Check class="h-4 w-4 text-accent-600" />
                Up to {{ plan.maxUsers || 'unlimited' }} users
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-600">
                <Check class="h-4 w-4 text-accent-600" />
                {{ plan.duration || 30 }} day billing cycle
              </li>
            </ul>
            <button
              v-if="!isCurrentPlan(plan)"
              @click="handleUpgrade(plan)"
              class="btn-primary w-full mt-6"
            >
              Upgrade
            </button>
            <button
              v-else
              disabled
              class="btn-secondary w-full mt-6 cursor-not-allowed opacity-50"
            >
              Current
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Confirmation Modal -->
    <BaseModal
      :show="showUpgradeModal"
      title="Confirm Plan Upgrade"
      size="sm"
      @close="showUpgradeModal = false"
    >
      <p class="text-sm text-slate-600">
        Upgrade to <strong>{{ selectedPlan?.name }}</strong> for
        <strong>{{ formatCurrency(selectedPlan?.price || 0) }}/month</strong>?
      </p>
      <template #footer>
        <button @click="showUpgradeModal = false" class="btn-secondary">Cancel</button>
        <button @click="confirmUpgrade" :disabled="isUpgrading" class="btn-primary">
          <Loader2 v-if="isUpgrading" class="mr-2 h-4 w-4 animate-spin" />
          Confirm Upgrade
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { formatCurrency } from '@/utils/helpers'
import { Check, Loader2 } from 'lucide-vue-next'

const subscriptionStore = useSubscriptionStore()

const showUpgradeModal = ref(false)
const selectedPlan = ref(null)
const isUpgrading = ref(false)

function isCurrentPlan(plan) {
  const current = subscriptionStore.currentSubscription
  if (!current) return false
  return current.planId === plan.id || current.id === plan.id
}

function handleUpgrade(plan) {
  selectedPlan.value = plan
  showUpgradeModal.value = true
}

async function confirmUpgrade() {
  isUpgrading.value = true
  try {
    await subscriptionStore.upgradePlan(selectedPlan.value.id)
    showUpgradeModal.value = false
  } catch {
    // Error handled by store
  } finally {
    isUpgrading.value = false
  }
}

onMounted(() => {
  subscriptionStore.fetchCurrentSubscription()
  subscriptionStore.fetchPlans()
})
</script>
