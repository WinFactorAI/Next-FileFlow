import {
  CHAT_ENDPOINT_TYPES,
  NON_CHAT_ENDPOINT_TYPES,
  isTextChatModel,
  isChatModelWithModality,
  isEmbeddingModel,
  isImageGenerationModel,
  isVideoGenerationModel,
  isRerankModel,
  supportsInputModality,
  normalizeCatalog,
  fetchOrcaCatalog,
  clearCatalogCache,
} from '../../../common/orcarouter';

import chatTextImageFixture from './fixtures/chat_text_image.json';
import chatTextOnlyMixFixture from './fixtures/chat_text_only_mix.json';
import embeddingFixture from './fixtures/embedding_models.json';
import imageGenFixture from './fixtures/image_generation_models.json';
import videoFixture from './fixtures/video_models.json';
import rerankFixture from './fixtures/rerank_models.json';

const { data: chatTextImage } = chatTextImageFixture;
const { data: chatTextOnlyMix } = chatTextOnlyMixFixture;
const { data: embeddingModels } = embeddingFixture;
const { data: imageGenModels } = imageGenFixture;
const { data: videoModels } = videoFixture;
const { data: rerankModels } = rerankFixture;

describe('OrcaRouter endpoint constants', () => {
  test('chat endpoint types include openai/anthropic/gemini/openai-response', () => {
    expect(CHAT_ENDPOINT_TYPES).toEqual(
      expect.arrayContaining(['openai', 'anthropic', 'gemini', 'openai-response'])
    );
  });

  test('non-chat endpoint types exclude image-generation, openai-video, embeddings, jina-rerank', () => {
    expect(NON_CHAT_ENDPOINT_TYPES).toEqual(
      expect.arrayContaining([
        'image-generation',
        'openai-video',
        'embeddings',
        'jina-rerank',
      ])
    );
  });
});

describe('isTextChatModel (text chat capability filter)', () => {
  test('accepts chat models (openai/anthropic/gemini/openai-response)', () => {
    for (const m of chatTextImage) {
      if (m.id === 'deepseek/deepseek-chat') {
        // text-only chat model
        expect(isTextChatModel(m)).toBe(true);
      } else {
        // multimodal chat models are still text-chat capable
        expect(isTextChatModel(m)).toBe(true);
      }
    }
  });

  test('rejects embedding models', () => {
    for (const m of embeddingModels) {
      expect(isTextChatModel(m)).toBe(false);
    }
  });

  test('rejects image-generation models', () => {
    for (const m of imageGenModels) {
      expect(isTextChatModel(m)).toBe(false);
    }
  });

  test('rejects video-generation (openai-video) models', () => {
    for (const m of videoModels) {
      expect(isTextChatModel(m)).toBe(false);
    }
  });

  test('rejects rerank (jina-rerank) models', () => {
    for (const m of rerankModels) {
      expect(isTextChatModel(m)).toBe(false);
    }
  });

  test('fails closed for models without declared endpoints', () => {
    expect(isTextChatModel({ id: 'unknown/no-endpoints' })).toBe(false);
    expect(isTextChatModel(null)).toBe(false);
  });
});

describe('isChatModelWithModality (multimodal fail-closed)', () => {
  test('declared image-input chat models are accepted for image content', () => {
    const claude = chatTextImage.find((m) => m.id === 'anthropic/claude-haiku-4.5');
    const gptMini = chatTextImage.find((m) => m.id === 'openai/gpt-4.1-mini');
    expect(isChatModelWithModality(claude, 'image')).toBe(true);
    expect(isChatModelWithModality(gptMini, 'image')).toBe(true);
  });

  test('text-only chat models are rejected for image content (no declared image modality)', () => {
    const deepseek = chatTextOnlyMix.find((m) => m.id === 'orcarouter/free');
    expect(isChatModelWithModality(deepseek, 'image')).toBe(false);
  });

  test('models with no declared modalities fail closed for multimodal content', () => {
    const noArch = chatTextOnlyMix.find((m) => m.id === 'orcarouter/free');
    expect(supportsInputModality(noArch, 'image')).toBe(false);
    expect(isChatModelWithModality(noArch, 'image')).toBe(false);
  });

  test('non-chat models (even with image endpoints) are rejected for image chat', () => {
    const gptImage = imageGenModels.find((m) => m.id === 'openai/gpt-image-1');
    expect(isChatModelWithModality(gptImage, 'image')).toBe(false);
  });

  test('image chat still requires a text-chat endpoint, never guessed by name', () => {
    const fakeByName = { id: 'some/vision', supported_endpoint_types: ['embeddings'], architecture: { input_modalities: ['image', 'text'] } };
    expect(isChatModelWithModality(fakeByName, 'image')).toBe(false);
  });
});

describe('capability helpers', () => {
  test('embedding/image/video/rerank detected only via endpoint metadata', () => {
    const emb = embeddingModels[0];
    const img = imageGenModels[0];
    const vid = videoModels[0];
    const rr = rerankModels[0];
    expect(isEmbeddingModel(emb)).toBe(true);
    expect(isImageGenerationModel(img)).toBe(true);
    expect(isVideoGenerationModel(vid)).toBe(true);
    expect(isRerankModel(rr)).toBe(true);

    expect(isEmbeddingModel(img)).toBe(false);
    expect(isImageGenerationModel(emb)).toBe(false);
    expect(isVideoGenerationModel(emb)).toBe(false);
    expect(isRerankModel(emb)).toBe(false);
  });
});

describe('normalizeCatalog', () => {
  test('maps catalog response to display model shape', () => {
    const normalized = normalizeCatalog(chatTextImageFixture);
    expect(normalized).toHaveLength(4);
    const claude = normalized.find((m) => m.id === 'anthropic/claude-haiku-4.5');
    expect(claude.name).toBeTruthy();
    expect(claude.endpoints).toContain('anthropic');
    expect(claude.inputModalities).toContain('image');
  });

  test('handles garbage/empty responses without throwing', () => {
    expect(normalizeCatalog({})).toEqual([]);
    expect(normalizeCatalog(null)).toEqual([]);
    expect(normalizeCatalog({ data: null })).toEqual([]);
    expect(normalizeCatalog({ data: [{ id: '', name: 'x' }] })).toEqual([]);
  });
});

describe('fetchOrcaCatalog', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    clearCatalogCache();
  });

  afterEach(() => {
    global.fetch = realFetch;
    clearCatalogCache();
  });

  test('caches real API responses and does not fabricate content on error', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => chatTextImageFixture,
    });

    const first = await fetchOrcaCatalog({ capability: 'chat' });
    expect(first).toHaveLength(4);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call served from cache — no extra network request.
    const second = await fetchOrcaCatalog({ capability: 'chat' });
    expect(second).toBe(first);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('rejects on HTTP error so the UI can show an error state (never a fallback list)', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchOrcaCatalog({ capability: 'chat' })).rejects.toThrow(/HTTP 500/);
  });

  test('request URL contains capability=chat and the OrcaRouter base URL', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => chatTextImageFixture,
    });
    await fetchOrcaCatalog({ capability: 'chat' });
    const [url] = global.fetch.mock.calls[0];
    expect(String(url)).toMatch(/^https:\/\/api\.orcarouter\.ai\/v1\/models\?capability=chat$/);
  });
});
