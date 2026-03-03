<template>
  <div class="card overflow-hidden">
    <div v-if="$slots.header" class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
      <slot name="header" />
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="table-header"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr
            v-for="(row, idx) in rows"
            :key="idx"
            class="hover:bg-slate-50 transition-colors"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="table-cell"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '-' }}
              </slot>
            </td>
          </tr>
          <tr v-if="!rows || rows.length === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center">
              <slot name="empty">
                <EmptyState />
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="$slots.pagination" class="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
      <slot name="pagination" />
    </div>
  </div>
</template>

<script setup>
import EmptyState from './EmptyState.vue'

defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
})
</script>
