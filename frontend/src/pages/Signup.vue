<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-2xl">
      <!-- Card -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <!-- Logo/Title -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Attendex</h1>
          <p class="text-gray-600 mt-2">Create your account</p>
        </div>

        <!-- User Type Grid -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">Sign up as:</label>
          <div class="grid grid-cols-2 gap-2 md:grid-cols-3">
            <button
              v-for="type in signupTypes"
              :key="type.value"
              type="button"
              @click="signupType = type.value"
              :class="[
                'py-3 px-4 rounded-lg text-sm font-medium transition border-2',
                signupType === type.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-400'
              ]"
            >
              <div class="text-base mb-1">{{ type.icon }}</div>
              {{ type.label }}
            </button>
          </div>
        </div>

        <!-- Type Description -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-700">{{ getTypeDescription(signupType) }}</p>
        </div>

        <!-- Employee Form -->
        <form v-if="signupType === 'Employee'" @submit.prevent="handleSignup('Employee')" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input v-model="form.firstName" type="text" required placeholder="John"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input v-model="form.lastName" type="text" required placeholder="Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input v-model="form.email" type="email" required placeholder="you@example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
            <input v-model="form.department" type="text" placeholder="Engineering, Sales, HR..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-2.5 text-gray-500">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
            <p class="text-xs text-gray-500 mt-1">Min 8 chars, uppercase, lowercase, number, special char</p>
          </div>
          <div class="flex items-start">
            <input v-model="form.agreeTerms" id="terms" type="checkbox"
              class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            <label for="terms" class="ml-2 text-xs font-medium text-gray-700">
              I agree to the <a href="#" class="text-blue-600">Terms of Service</a>
            </label>
          </div>
          <p v-if="errors.agreeTerms" class="text-red-500 text-xs">{{ errors.agreeTerms }}</p>
          <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {{ errors.general }}
          </div>
          <button type="submit" :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition">
            <span v-if="!loading">Create Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Creating...
            </span>
          </button>
        </form>

        <!-- Organization Admin Form -->
        <form v-if="signupType === 'Org_Admin'" @submit.prevent="handleSignup('Org_Admin')" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
            <input v-model="form.orgName" type="text" required placeholder="Your Company"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            <p v-if="errors.orgName" class="text-red-500 text-xs mt-1">{{ errors.orgName }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Admin First Name *</label>
              <input v-model="form.firstName" type="text" required placeholder="John"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Admin Last Name *</label>
              <input v-model="form.lastName" type="text" required placeholder="Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
            <input v-model="form.email" type="email" required placeholder="admin@company.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <input v-model="form.phone" type="tel" placeholder="+1 (555) 000-0000"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-2.5 text-gray-500">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>
          <div class="flex items-start">
            <input v-model="form.agreeTerms" id="org-terms" type="checkbox"
              class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            <label for="org-terms" class="ml-2 text-xs font-medium text-gray-700">
              I agree to the <a href="#" class="text-blue-600">Terms of Service</a>
            </label>
          </div>
          <p v-if="errors.agreeTerms" class="text-red-500 text-xs">{{ errors.agreeTerms }}</p>
          <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {{ errors.general }}
          </div>
          <button type="submit" :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition">
            <span v-if="!loading">Create Organization</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Creating...
            </span>
          </button>
        </form>

        <!-- Manager Form -->
        <form v-if="signupType === 'Manager'" @submit.prevent="handleSignup('Manager')" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input v-model="form.firstName" type="text" required placeholder="John"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input v-model="form.lastName" type="text" required placeholder="Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input v-model="form.email" type="email" required placeholder="manager@company.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <input v-model="form.department" type="text" required placeholder="Sales, Engineering, HR..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-2.5 text-gray-500">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>
          <div class="flex items-start">
            <input v-model="form.agreeTerms" id="manager-terms" type="checkbox"
              class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            <label for="manager-terms" class="ml-2 text-xs font-medium text-gray-700">
              I agree to the <a href="#" class="text-blue-600">Terms of Service</a>
            </label>
          </div>
          <p v-if="errors.agreeTerms" class="text-red-500 text-xs">{{ errors.agreeTerms }}</p>
          <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {{ errors.general }}
          </div>
          <button type="submit" :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition">
            <span v-if="!loading">Create Manager Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Creating...
            </span>
          </button>
        </form>

        <!-- Contractor Form -->
        <form v-if="signupType === 'Contractor'" @submit.prevent="handleSignup('Contractor')" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input v-model="form.firstName" type="text" required placeholder="John"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input v-model="form.lastName" type="text" required placeholder="Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input v-model="form.email" type="email" required placeholder="you@example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Specialization (Optional)</label>
            <input v-model="form.specialization" type="text" placeholder="e.g., Software Development, Design..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-2.5 text-gray-500">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>
          <div class="flex items-start">
            <input v-model="form.agreeTerms" id="contractor-terms" type="checkbox"
              class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            <label for="contractor-terms" class="ml-2 text-xs font-medium text-gray-700">
              I agree to the <a href="#" class="text-blue-600">Terms of Service</a>
            </label>
          </div>
          <p v-if="errors.agreeTerms" class="text-red-500 text-xs">{{ errors.agreeTerms }}</p>
          <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {{ errors.general }}
          </div>
          <button type="submit" :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition">
            <span v-if="!loading">Create Contractor Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Creating...
            </span>
          </button>
        </form>

        <!-- Intern Form -->
        <form v-if="signupType === 'Intern'" @submit.prevent="handleSignup('Intern')" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input v-model="form.firstName" type="text" required placeholder="John"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input v-model="form.lastName" type="text" required placeholder="Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input v-model="form.email" type="email" required placeholder="you@example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">University/School (Optional)</label>
            <input v-model="form.school" type="text" placeholder="University Name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-2.5 text-gray-500">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>
          <div class="flex items-start">
            <input v-model="form.agreeTerms" id="intern-terms" type="checkbox"
              class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            <label for="intern-terms" class="ml-2 text-xs font-medium text-gray-700">
              I agree to the <a href="#" class="text-blue-600">Terms of Service</a>
            </label>
          </div>
          <p v-if="errors.agreeTerms" class="text-red-500 text-xs">{{ errors.agreeTerms }}</p>
          <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {{ errors.general }}
          </div>
          <button type="submit" :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition">
            <span v-if="!loading">Create Intern Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Creating...
            </span>
          </button>
        </form>

        <!-- Super Admin Form -->
        <form v-if="signupType === 'Super_Admin'" @submit.prevent="handleSignup('Super_Admin')" class="space-y-4">
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-purple-700">
              <strong>Super Admin Setup:</strong> Requires administrator approval code
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input v-model="form.firstName" type="text" required placeholder="John"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input v-model="form.lastName" type="text" required placeholder="Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input v-model="form.email" type="email" required placeholder="admin@attendex.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Admin Approval Code *</label>
            <input v-model="form.adminCode" type="password" required placeholder="Enter approval code"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            <p v-if="errors.adminCode" class="text-red-500 text-xs mt-1">{{ errors.adminCode }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-2.5 text-gray-500">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>
          <div class="flex items-start">
            <input v-model="form.agreeTerms" id="admin-terms" type="checkbox"
              class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            <label for="admin-terms" class="ml-2 text-xs font-medium text-gray-700">
              I agree to the <a href="#" class="text-blue-600">Terms of Service</a> and understand Super Admin responsibilities
            </label>
          </div>
          <p v-if="errors.agreeTerms" class="text-red-500 text-xs">{{ errors.agreeTerms }}</p>
          <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {{ errors.general }}
          </div>
          <button type="submit" :disabled="loading"
            class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 rounded-lg transition">
            <span v-if="!loading">Create Super Admin Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Creating...
            </span>
          </button>
        </form>
          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                v-model="employeeForm.firstName"
                type="text"
                required
                placeholder="John"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                v-model="employeeForm.lastName"
                type="text"
                required
                placeholder="Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              v-model="employeeForm.email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                v-model="employeeForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
            <p class="text-xs text-gray-500 mt-1">At least 8 characters, uppercase, lowercase, number, special character</p>
          </div>

          <!-- Terms -->
          <div class="flex items-start">
            <input
              id="terms"
              v-model="employeeForm.agreeTerms"
              type="checkbox"
              class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label for="terms" class="ml-2 text-xs font-medium text-gray-700">
              I agree to the <a href="#" class="text-blue-600 hover:text-blue-700">Terms of Service</a>
            </label>
          </div>
          <p v-if="errors.agreeTerms" class="text-red-500 text-xs">{{ errors.agreeTerms }}</p>

          <!-- Error Message -->
          <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {{ errors.general }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loadingEmployee"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition duration-200"
          >
            <span v-if="!loadingEmployee">Create Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          </button>
        </form>

        <!-- Organization Form -->
        <form v-if="signupType === 'organization'" @submit.prevent="handleOrgSignup" class="space-y-4">
          <!-- Organization Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input
              v-model="orgForm.orgName"
              type="text"
              required
              placeholder="Your Company"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <p v-if="errors.orgName" class="text-red-500 text-xs mt-1">{{ errors.orgName }}</p>
          </div>

          <!-- Admin Name -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                v-model="orgForm.firstName"
                type="text"
                required
                placeholder="John"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                v-model="orgForm.lastName"
                type="text"
                required
                placeholder="Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              v-model="orgForm.email"
              type="email"
              required
              placeholder="admin@company.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                v-model="orgForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              v-model="orgForm.phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
          </div>

          <!-- Terms -->
          <div class="flex items-start">
            <input
              id="org-terms"
              v-model="orgForm.agreeTerms"
              type="checkbox"
              class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label for="org-terms" class="ml-2 text-xs font-medium text-gray-700">
              I agree to the <a href="#" class="text-blue-600 hover:text-blue-700">Terms of Service</a>
            </label>
          </div>
          <p v-if="errors.agreeTerms" class="text-red-500 text-xs">{{ errors.agreeTerms }}</p>

          <!-- Error Message -->
          <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {{ errors.general }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loadingOrg"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition duration-200"
          >
            <span v-if="!loadingOrg">Create Organization</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          </button>
        </form>

        <!-- Sign In Link -->
        <p class="text-center text-gray-600 text-sm mt-6">
          Already have an account?
          <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import authService from '@/services/authService'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const signupTypes = [
  { value: 'Employee', label: 'Employee', icon: '👤' },
  { value: 'Org_Admin', label: 'Organization', icon: '🏢' },
  { value: 'Manager', label: 'Manager', icon: '👔' },
  { value: 'Contractor', label: 'Contractor', icon: '🔧' },
  { value: 'Intern', label: 'Intern', icon: '🎓' },
  { value: 'Super_Admin', label: 'Super Admin', icon: '🔐' }
]

const signupType = ref<string>('Employee')
const showPassword = ref(false)
const loading = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  orgName: '',
  phone: '',
  department: '',
  specialization: '',
  school: '',
  adminCode: '',
  agreeTerms: false
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  orgName: '',
  phone: '',
  department: '',
  agreeTerms: '',
  adminCode: '',
  general: ''
})

const getTypeDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    'Employee': 'Standard employee account with access to personal attendance and shift information',
    'Org_Admin': 'Organization admin account with full management capabilities for your organization',
    'Manager': 'Manager account with team and department management access',
    'Contractor': 'Contractor account with limited access to assigned projects and timesheet tracking',
    'Intern': 'Intern account with restricted access and supervision capabilities',
    'Super_Admin': 'System super administrator account - requires approval code'
  }
  return descriptions[type] || 'Select a user type'
}

const validatePassword = (password: string): boolean => {
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const isLongEnough = password.length >= 8
  return hasUppercase && hasLowercase && hasNumber && hasSpecial && isLongEnough
}

const handleSignup = async (userType: string) => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  // Common validation
  if (!form.firstName) {
    errors.firstName = 'First name is required'
    return
  }
  if (!form.lastName) {
    errors.lastName = 'Last name is required'
    return
  }
  if (!form.email) {
    errors.email = 'Email is required'
    return
  }
  if (!form.password) {
    errors.password = 'Password is required'
    return
  }
  if (!validatePassword(form.password)) {
    errors.password = 'Password must have 8+ chars, uppercase, lowercase, number, and special character'
    return
  }
  if (!form.agreeTerms) {
    errors.agreeTerms = 'You must agree to the terms'
    return
  }

  // Type-specific validation
  if (userType === 'Org_Admin' && !form.orgName) {
    errors.orgName = 'Organization name is required'
    return
  }

  if (userType === 'Manager' && !form.department) {
    errors.department = 'Department is required'
    return
  }

  if (userType === 'Super_Admin' && !form.adminCode) {
    errors.adminCode = 'Admin approval code is required'
    return
  }

  loading.value = true

  try {
    const payload: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      userType: userType
    }

    // Add type-specific fields
    if (userType === 'Org_Admin') {
      payload.orgName = form.orgName
      payload.phone = form.phone || undefined
    } else if (userType === 'Manager') {
      payload.department = form.department
    } else if (userType === 'Contractor') {
      payload.specialization = form.specialization || undefined
    } else if (userType === 'Intern') {
      payload.school = form.school || undefined
    } else if (userType === 'Super_Admin') {
      payload.adminCode = form.adminCode
    }

    const response = await authService.register(payload)

    notificationStore.success('Account created successfully! Redirecting to login...')

    // Clear form
    form.firstName = ''
    form.lastName = ''
    form.email = ''
    form.password = ''
    form.orgName = ''
    form.phone = ''
    form.department = ''
    form.specialization = ''
    form.school = ''
    form.adminCode = ''
    form.agreeTerms = false

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error: any) {
    console.error('Signup error:', error)
    const message = error.response?.data?.message || error.message || 'Registration failed'
    errors.general = message
    notificationStore.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
input:focus {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}
</style>
