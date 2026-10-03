import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import AiModelSelect from '../AiModelSelect';
import { clearCatalogCache } from '../../../common/orcarouter';
import chatTextImageFixture from './fixtures/chat_text_image.json';

const { data: chatTextImage } = chatTextImageFixture;

const hasImageModality = (m) =>
  ((m.architecture && m.architecture.input_modalities) || []).includes('image');

const imageCapableIds = chatTextImage.filter(hasImageModality).map((m) => m.id);
const nonImageTextChatIds = chatTextImage.filter((m) => !hasImageModality(m)).map((m) => m.id);

let container;
let root;

const setFetch = (payload) => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => payload,
  });
};

const setFetchError = () => {
  global.fetch = jest.fn().mockRejectedValueOnce(new Error('network down'));
};

const flush = () => act(async () => {});

const mountSelect = async (props = {}) => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(<AiModelSelect {...props} />);
  });
  await flush();
  await flush();
};

const unmountSelect = async () => {
  if (root) {
    await act(async () => {
      root.unmount();
    });
  }
  if (container) {
    container.remove();
  }
  root = null;
  container = null;
};

const isOpen = () =>
  document.querySelector('.ant-select')?.getAttribute('aria-expanded') === 'true' ||
  Array.from(document.querySelectorAll('.ant-select')).some(
    (s) => s.getAttribute('aria-expanded') === 'true'
  );

const openDropdown = async () => {
  if (isOpen()) {
    return;
  }
  const selector = document.querySelector('.ant-select-selector');
  await act(async () => {
    selector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  });
  await flush();
};

const queryOptionTexts = () =>
  Array.from(document.querySelectorAll('.ant-select-item-option')).map(
    (el) => el.textContent
  );

const switchContentType = async (labelText) => {
  const wrapper = Array.from(document.querySelectorAll('.ant-radio-button-wrapper')).find(
    (el) => el.textContent.includes(labelText)
  );
  expect(wrapper).toBeTruthy();
  const input = wrapper.querySelector('input[type="radio"]');
  expect(input).toBeTruthy();
  await act(async () => {
    // jsdom: setting checked natively then firing change is what rc-radio reacts to.
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'checked'
    ).set;
    nativeSetter.call(input, true);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('click', { bubbles: true }));
  });
  await flush();
};

describe('AiModelSelect (OrcaRouter real-catalog model picker)', () => {
  afterEach(async () => {
    await unmountSelect();
    clearCatalogCache();
    jest.restoreAllMocks();
  });

  test('options are loaded from the real catalog API (capability=chat), not hard-coded', async () => {
    setFetch(chatTextImageFixture);
    await mountSelect();

    const allText = Array.from(document.querySelectorAll('span')).map((el) => el.textContent || '');
    expect(allText.some((t) => t.includes('目录模型 4 个'))).toBe(true);

    await openDropdown();
    const options = queryOptionTexts();
    expect(options.length).toBeGreaterThan(0);
    // Every fixture model id must be present as an option (labels show "name (id)").
    for (const id of chatTextImage.map((m) => m.id)) {
      expect(options.some((t) => t.includes(id))).toBe(true);
    }
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url] = global.fetch.mock.calls[0];
    expect(String(url)).toMatch(/capability=chat/);
  });

  test('image-content mode keeps only chat models that declare image input; incompatible current value clears', async () => {
    setFetch(chatTextImageFixture);
    const onChange = jest.fn();
    await mountSelect({ value: 'deepseek/deepseek-chat', onChange });

    // Default text mode: the text-only model is valid, not cleared.
    expect(onChange).not.toHaveBeenCalled();

    // User switches to image content -> only image-declaring chat models remain.
    await switchContentType('图片/多模态');

    expect(imageCapableIds.length).toBeGreaterThan(0);
    expect(nonImageTextChatIds).toContain('deepseek/deepseek-chat');

    // The previously selected text-only model must be cleared, not silently kept.
    expect(onChange).toHaveBeenCalledWith(undefined);

    await openDropdown();
    const options = queryOptionTexts();
    for (const id of imageCapableIds) {
      expect(options.some((t) => t.includes(id))).toBe(true);
    }
    for (const id of nonImageTextChatIds) {
      expect(options.some((t) => t.includes(id))).toBe(false);
    }
  });

  test('a selected model compatible with the current mode is NOT cleared', async () => {
    setFetch(chatTextImageFixture);
    const onChange = jest.fn();
    await mountSelect({ value: 'anthropic/claude-haiku-4.5', onChange });

    await switchContentType('图片/多模态');

    // claude-haiku-4.5 declares image input, so it survives the mode switch.
    expect(onChange).not.toHaveBeenCalled();
  });

  test('catalog failure shows error/empty with refresh; no hand-written models and no free-text input', async () => {
    setFetchError();
    await mountSelect();

    // The antd Select is searchable but only over fetched options — it is not a
    // free-text model input (option-based Select, allowClear not free typing).
    const searchInput = document.querySelector('.ant-select-selection-search-input');
    expect(searchInput).toBeTruthy();

    await openDropdown();
    const empty = document.querySelector('.ant-empty-description');
    expect(empty && empty.textContent).toContain('加载失败');
    const refreshButton = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent.includes('刷新')
    );
    expect(refreshButton).toBeTruthy();

    // No option can come from a fallback list: there are zero dropdown options.
    expect(queryOptionTexts()).toHaveLength(0);

    // Recovery path: refresh triggers a successful re-fetch and options appear.
    setFetch(chatTextImageFixture);
    await act(async () => {
      refreshButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flush();
    await flush();

    // Dropdown still open; options now come from the real catalog.
    const options = queryOptionTexts();
    expect(options.length).toBeGreaterThan(0);
    for (const m of chatTextImage) {
      expect(options.some((t) => t.includes(m.id))).toBe(true);
    }
  });

  test('all dropdown option values are catalog model ids (never user-typed or examples)', async () => {
    setFetch(chatTextImageFixture);
    await mountSelect({ value: 'anthropic/claude-haiku-4.5' });
    await openDropdown();
    const optionEls = Array.from(document.querySelectorAll('.ant-select-item-option'));
    expect(optionEls.length).toBeGreaterThan(0);
    const catalogIds = chatTextImage.map((m) => m.id);
    for (const el of optionEls) {
      // Each option label is rendered as "<name> (<catalog-id>)".
      const text = el.textContent;
      const match = text && text.match(/\(([^)]+)\)\s*$/);
      expect(match).toBeTruthy();
      expect(catalogIds).toContain(match[1]);
    }
  });
});
