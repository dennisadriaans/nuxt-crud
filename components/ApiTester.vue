<template>
  <div class="api-tester">
    <h1>API Tester</h1>
    
    <div class="endpoint-selector">
      <label for="endpoint-select">Select Endpoint:</label>
      <select id="endpoint-select" v-model="selectedEndpoint" @change="handleEndpointChange">
        <option value="">-- Select an endpoint --</option>
        <option v-for="endpoint in endpoints" :key="endpoint.path" :value="endpoint">
          {{ endpoint.method }} {{ endpoint.path }}
        </option>
      </select>
    </div>
    
    <div v-if="selectedEndpoint" class="request-form">
      <h2>{{ selectedEndpoint.method }} {{ selectedEndpoint.path }}</h2>
      
      <!-- URL Parameters -->
      <div v-if="urlParams.length > 0" class="params-section">
        <h3>URL Parameters</h3>
        <div v-for="param in urlParams" :key="param" class="form-group">
          <label :for="`param-${param}`">{{ param }}:</label>
          <input :id="`param-${param}`" v-model="paramValues[param]" type="text">
        </div>
      </div>
      
      <!-- Query Parameters -->
      <div v-if="queryParams.length > 0" class="params-section">
        <h3>Query Parameters</h3>
        <div v-for="param in queryParams" :key="param" class="form-group">
          <label :for="`query-${param}`">{{ param }}:</label>
          <input :id="`query-${param}`" v-model="queryValues[param]" type="text">
        </div>
      </div>
      
      <!-- Request Body -->
      <div v-if="bodyFields.length > 0" class="params-section">
        <h3>Request Body</h3>
        <div v-for="field in bodyFields" :key="field.name" class="form-group">
          <label :for="`body-${field.name}`">{{ field.name }}{{ field.required ? '*' : '' }}:</label>
          <input 
            :id="`body-${field.name}`" 
            v-model="bodyValues[field.name]" 
            :type="field.type === 'number' ? 'number' : 'text'"
          >
        </div>
      </div>
      
      <button @click="sendRequest" class="send-button">Send Request</button>
      
      <!-- Response -->
      <div v-if="response" class="response-section">
        <h3>Response</h3>
        <div class="response-status">Status: {{ responseStatus }}</div>
        <pre class="response-body">{{ JSON.stringify(response, null, 2) }}</pre>
      </div>
      
      <!-- Error -->
      <div v-if="error" class="error-section">
        <h3>Error</h3>
        <div class="error-message">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Available endpoints
const endpoints = ref([
  { method: 'GET', path: '/api/v1/products', handler: 'getAll', params: [], query: ['page', 'limit'], body: [] },
  { method: 'GET', path: '/api/v1/products/:id', handler: 'getOne', params: ['id'], query: [], body: [] },
  { method: 'POST', path: '/api/v1/products', handler: 'create', params: [], query: [], body: [
    { name: 'title', type: 'string', required: true },
    { name: 'content', type: 'string', required: true }
  ]},
  { method: 'PUT', path: '/api/v1/products/:id', handler: 'update', params: ['id'], query: [], body: [
    { name: 'title', type: 'string', required: true },
    { name: 'content', type: 'string', required: true }
  ]},
  { method: 'DELETE', path: '/api/v1/products/:id', handler: 'delete', params: ['id'], query: [], body: [] }
])

// Form state
const selectedEndpoint = ref('')
const paramValues = ref({})
const queryValues = ref({})
const bodyValues = ref({})
const response = ref(null)
const responseStatus = ref('')
const error = ref('')

// Computed properties for form fields
const urlParams = computed(() => {
  if (!selectedEndpoint.value) return []
  return selectedEndpoint.value.params || []
})

const queryParams = computed(() => {
  if (!selectedEndpoint.value) return []
  return selectedEndpoint.value.query || []
})

const bodyFields = computed(() => {
  if (!selectedEndpoint.value) return []
  return selectedEndpoint.value.body || []
})

// Handle endpoint selection change
function handleEndpointChange() {
  // Reset form values
  paramValues.value = {}
  queryValues.value = {}
  bodyValues.value = {}
  response.value = null
  error.value = ''
}

// Build the request URL
function buildUrl() {
  let url = selectedEndpoint.value.path
  
  // Replace URL params
  urlParams.value.forEach(param => {
    url = url.replace(`:${param}`, paramValues.value[param] || '')
  })
  
  // Add query parameters
  const queryParts = []
  Object.entries(queryValues.value).forEach(([key, value]) => {
    if (value) {
      queryParts.push(`${key}=${encodeURIComponent(value)}`)
    }
  })
  
  if (queryParts.length > 0) {
    url += `?${queryParts.join('&')}`
  }
  
  return url
}

// Send the API request
async function sendRequest() {
  try {
    error.value = ''
    response.value = null
    
    const url = buildUrl()
    const method = selectedEndpoint.value.method
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    // Add request body for POST, PUT methods
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(bodyValues.value)
    }
    
    const res = await fetch(url, options)
    responseStatus.value = `${res.status} ${res.statusText}`
    
    const data = await res.json()
    response.value = data
  } catch (e) {
    error.value = e.message
    console.error('API request error:', e)
  }
}
</script>

<style scoped>
.api-tester {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1, h2, h3 {
  margin-bottom: 16px;
}

.endpoint-selector {
  margin-bottom: 24px;
}

select {
  padding: 8px 12px;
  width: 100%;
  font-size: 16px;
}

.params-section {
  margin-bottom: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  background-color: #f8f8f8;
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.send-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 8px 0 24px;
  cursor: pointer;
  border-radius: 4px;
}

.response-section, .error-section {
  margin-top: 24px;
  padding: 16px;
  border-radius: 4px;
}

.response-section {
  background-color: #f0f8ff;
  border: 1px solid #b8d0e8;
}

.error-section {
  background-color: #fff0f0;
  border: 1px solid #e8b8b8;
  color: #d9534f;
}

.response-status {
  margin-bottom: 12px;
  font-weight: bold;
}

.response-body {
  background-color: #fff;
  padding: 12px;
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
  white-space: pre-wrap;
  font-family: monospace;
}
</style>