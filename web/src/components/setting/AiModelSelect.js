import { Button, Empty, Radio, Select, Space, Spin, Typography } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  clearCatalogCache,
  fetchOrcaCatalog,
  isChatModelWithModality,
  isTextChatModel,
  notifyCatalogError,
} from "../../common/orcarouter";

const { Text } = Typography;

// A model picker whose options are the *real* OrcaRouter catalog. It is used for
// the AI audit engine configuration when the OrcaRouter provider is selected.
//
// Capability filtering (fail closed):
//  - content type "text"  -> chat models (capability=chat; non-text endpoints excluded).
//  - content type "image" -> chat models that explicitly declare image input in
//    `architecture.input_modalities`. Models without declared modalities are never shown.
//
// No OrcaRouter model id is hard-coded anywhere; on catalog failure the selector
// shows an error/empty state with a refresh button (never a hand-written fallback).

const AiModelSelect = ({ value, onChange }) => {
  const [contentType, setContentType] = useState('text');
  const [options, setOptions] = useState([]);
  const [catalogSize, setCatalogSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const mountedRef = useRef(true);
  const valueRef = useRef(value);
  valueRef.current = value;

  const loadCatalog = async ({ forceRefresh } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const models = await fetchOrcaCatalog({ capability: 'chat' }, { forceRefresh });
      if (!mountedRef.current) {
        return;
      }
      setOptions(models);
      setCatalogSize(models.length);
    } catch (err) {
      if (!mountedRef.current) {
        return;
      }
      setError(err);
      notifyCatalogError(err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadCatalog();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOptions = useMemo(() => {
    // Filtering happens on the real catalog response only.
    if (contentType === 'image') {
      return options.filter((m) => isChatModelWithModality(m, 'image'));
    }
    return options.filter(isTextChatModel);
  }, [options, contentType]);

  const currentCompatible = useMemo(() => {
    if (!value) {
      return false;
    }
    return filteredOptions.some((m) => m.id === value);
  }, [value, filteredOptions]);

  // When the content-type/attachment requirement changes, a previously selected
  // model that is no longer compatible must be cleared rather than silently kept.
  useEffect(() => {
    if (value && !currentCompatible && filteredOptions.length > 0 && !loading) {
      onChange && onChange(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCompatible, filteredOptions, loading]);

  const handleRefresh = async () => {
    clearCatalogCache();
    await loadCatalog({ forceRefresh: true });
  };

  const handleContentTypeChange = (next) => {
    setContentType(next);
    // options recompute via useMemo; incompatible value is cleared by effect.
  };

  const selectOptions = filteredOptions.map((m) => ({
    value: m.id,
    label: `${m.name || m.id} (${m.id})`,
    title: m.description || m.id,
  }));

  const emptyText = error
    ? 'OrcaRouter 模型目录加载失败'
    : '当前筛选条件下没有可用模型';

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Radio.Group
        value={contentType}
        onChange={(e) => handleContentTypeChange(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        size="small"
        options={[
          { label: '文本内容审计', value: 'text' },
          { label: '图片/多模态内容审计', value: 'image' },
        ]}
      />
      <Space.Compact style={{ width: '100%' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择 OrcaRouter 模型（来自真实模型目录）"
          value={value}
          onChange={onChange}
          showSearch
          virtual={false}
          filterOption={(input, option) =>
            String(option.value).toLowerCase().includes(input.toLowerCase()) ||
            String(option.label).toLowerCase().includes(input.toLowerCase())
          }
          loading={loading}
          onDropdownVisibleChange={(visible) => setOpen(visible)}
          open={open}
          notFoundContent={
            loading ? (
              <Spin size="small" />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={emptyText}
                style={{ padding: 8 }}
              >
                {error && (
                  <Button size="small" onClick={handleRefresh}>
                    刷新
                  </Button>
                )}
              </Empty>
            )
          }
          options={selectOptions}
        />
      </Space.Compact>
      <Space split={<span style={{ color: '#ccc' }}>·</span>} size={4}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          目录模型 {catalogSize} 个
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          当前筛选 {filteredOptions.length} 个
        </Text>
        {!loading && (
          <Button
            type="link"
            size="small"
            style={{ fontSize: 12, padding: 0 }}
            onClick={handleRefresh}
          >
            刷新目录
          </Button>
        )}
      </Space>
    </Space>
  );
};

export default AiModelSelect;
