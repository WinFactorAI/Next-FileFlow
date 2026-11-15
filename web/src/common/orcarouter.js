/**
 * OrcaRouter catalog client.
 *
 * OrcaRouter is an OpenAI-compatible AI gateway (https://www.orcarouter.ai).
 * When a user picks OrcaRouter as the AI provider, the model picker must be
 * driven by the live model catalog instead of a hand-written model list. This
 * module fetches `GET /v1/models` and applies strict, metadata-based capability
 * filtering. The only hard-coded values are the gateway base URL and the
 * endpoint-type tokens exposed by the catalog API itself.
 *
 * Key boundary: the catalog endpoint is a public model directory (no API key is
 * required to list models, and it answers CORS `*`), so the browser can fetch it
 * without ever holding the OrcaRouter API key. The key itself stays in the
 * backend `/properties` store, exactly as before.
 */
import { message } from 'antd';

// Fixed gateway base URL for the OrcaRouter first-class provider.
export const ORCAROUTER_BASE_URL = 'https://api.orcarouter.ai/v1';

// Chat-capable endpoint types accepted for the text audit entry point. A model is
// shown in a chat selector only when its catalog `supported_endpoint_types`
// intersects this set (mirrors the OpenAI-compatible call the backend performs).
export const CHAT_ENDPOINT_TYPES = ['openai', 'anthropic', 'gemini', 'openai-response'];

// Endpoint types that are NOT text chat (image/video generation, rerank, and the
// embedding endpoint). Used to fail closed so non-text models never leak into the
// text model dropdown.
export const NON_CHAT_ENDPOINT_TYPES = [
  'image-generation',
  'openai-video',
  'embeddings',
  'jina-rerank',
];

// True when the model advertises the given input modality in its architecture.
// A model that does not declare any architecture/modalities fails closed.
// Accepts both raw catalog objects (architecture.input_modalities) and the
// normalized shape returned by fetchOrcaCatalog (inputModalities).
export const supportsInputModality = (model, modality) => {
  const arch = model && model.architecture;
  const modalities = model && Array.isArray(model.inputModalities)
    ? model.inputModalities
    : (arch && Array.isArray(arch.input_modalities) ? arch.input_modalities : []);
  return modalities.includes(modality);
};

// Endpoint types advertised by a model (raw supported_endpoint_types or the
// normalized `endpoints` field).
const modelEndpointTypes = (model) => {
  if (!model) {
    return [];
  }
  if (Array.isArray(model.endpoints)) {
    return model.endpoints;
  }
  if (Array.isArray(model.supported_endpoint_types)) {
    return model.supported_endpoint_types;
  }
  return [];
};

// Text-chat filter used by the sensitive-rule AI audit entry point (text only).
export const isTextChatModel = (model) => {
  const endpoints = modelEndpointTypes(model);
  if (!endpoints.some((e) => CHAT_ENDPOINT_TYPES.includes(e))) {
    return false;
  }
  // A chat model may not be a generation/video/rerank/embedding model.
  if (endpoints.some((e) => NON_CHAT_ENDPOINT_TYPES.includes(e))) {
    return false;
  }
  return true;
};

// Multimodal (image-input) chat filter: must first satisfy text chat, then
// explicitly declare the requested input modality. Undeclared models fail closed.
export const isChatModelWithModality = (model, modality) =>
  isTextChatModel(model) && supportsInputModality(model, modality);

// Strict endpoint matching for non-chat capabilities (embedding / image / video /
// rerank). Only catalog metadata may prove compatibility; names are never guessed.
export const hasEndpointType = (model, endpointType) =>
  modelEndpointTypes(model).includes(endpointType);

export const isEmbeddingModel = (model) => hasEndpointType(model, 'embeddings');
export const isImageGenerationModel = (model) => hasEndpointType(model, 'image-generation');
export const isVideoGenerationModel = (model) => hasEndpointType(model, 'openai-video');
export const isRerankModel = (model) => hasEndpointType(model, 'jina-rerank');

/**
 * Normalize a raw catalog response into an array of display models:
 *   { id, name, description, owned_by, endpoints, inputModalities }
 */
export const normalizeCatalog = (json) => {
  const data = json && Array.isArray(json.data) ? json.data : [];
  return data
    .filter((m) => m && typeof m.id === 'string' && m.id.length > 0)
    .map((m) => ({
      id: m.id,
      name: m.name || m.id,
      description: m.description || '',
      owned_by: m.owned_by || '',
      endpoints: Array.isArray(m.supported_endpoint_types) ? m.supported_endpoint_types : [],
      inputModalities: (m.architecture && Array.isArray(m.architecture.input_modalities))
        ? m.architecture.input_modalities
        : [],
    }));
};

export const byId = (model) => model && model.id;

// Minimal in-memory cache keyed by request URL. It only ever caches real API
// responses; it never falls back to a hand-written list.
const catalogCache = new Map();

export const clearCatalogCache = () => catalogCache.clear();

export const fetchOrcaCatalog = async (params = {}, options = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
  });
  const suffix = query.toString();
  const url = `${ORCAROUTER_BASE_URL}/models${suffix ? `?${suffix}` : ''}`;

  if (!options.forceRefresh && catalogCache.has(url)) {
    return catalogCache.get(url);
  }

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: options.signal,
  });
  if (!response.ok) {
    throw new Error(`OrcaRouter catalog request failed (HTTP ${response.status})`);
  }
  const json = await response.json();
  const models = normalizeCatalog(json);
  // The server may still return success without a list; surface that as empty
  // instead of fabricating content.
  catalogCache.set(url, models);
  return models;
};

// Message helper kept injectable for tests.
export const notifyCatalogError = (err) => {
  if (err && err.name === 'AbortError') {
    return;
  }
  message.error('无法获取 OrcaRouter 模型目录，请稍后重试');
};
