import { Checkbox, Form, Input, Modal, Select, Table, Transfer } from "antd";
import difference from 'lodash/difference';
import React, { useEffect, useState } from 'react';
import dictDataApi from "../../api/dict-data";
import sensitiveRuleApi from "../../api/sensitive-rule";
import sensitiveRuleGroupApi from "../../api/sensitive-rule-group";
import sensitiveRuleGroupMembersApi from "../../api/sensitive-rule-group-members";
const api = sensitiveRuleGroupApi;
const { TextArea } = Input;

const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
  <Transfer {...restProps}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;
      const rowSelection = {
        getCheckboxProps: (item) => ({
          disabled: listDisabled || item.disabled,
        }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };
      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          style={{
            pointerEvents: listDisabled ? 'none' : undefined,
          }}
          onRow={({ key, disabled: itemDisabled }) => ({
            onClick: () => {
              if (itemDisabled || listDisabled) return;
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);

const SensitiveRuleModal = ({
  visible,
  handleOk,
  handleCancel,
  confirmLoading,
  id,
  worker,
}) => {
  const [targetKeys, setTargetKeys] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [mockData, setMockData] = useState([]);
  const [form] = Form.useForm();



  const [fileExtensionOptions, setFileExtensionOptions] = useState([]);
  useEffect(() => {
    dictDataApi.list("file_extension").then(res => {
      setFileExtensionOptions(res)
    })
  }, [])


  const formItemLayout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 20 },
  };

  const leftTableColumns = [
    {
      dataIndex: 'title',
      title: '名称',
    },
    // {
    //   dataIndex: 'tag',
    //   title: 'Tag',
    //   render: (tag) => <Tag>{tag}</Tag>,
    // },
    {
      dataIndex: 'description',
      title: '规则表达式',
    },
  ];
  const rightTableColumns = [
    {
      dataIndex: 'title',
      title: '名称',
    },
    // {
    //     dataIndex: 'tag',
    //     title: 'Tag',
    //     render: (tag) => <Tag>{tag}</Tag>,
    // },
    {
      dataIndex: 'description',
      title: '规则表达式',
    },
  ];


  // 获取选中的敏感命令
  const getSelectCommandIs = async (size) => {
    if (id) {
      let queryParams = {
        type: "rule",
        status: "enabled",
        pageIndex: 1,
        pageSize: size,
        ruleGroupId: id,
      };
      await sensitiveRuleGroupMembersApi.getPaging(queryParams).then((res) => {
        const ruleIds = res.items.map((item) => item.ruleId);
        form.setFieldsValue({
          ruleIds: ruleIds, // 确保字段名一致
        });
        setTargetKeys(ruleIds);
      })
    }
  }

  // 获取可选敏感命令
  const getSRules = async () => {
    let queryParams = {
      type: "rule",
      status: "enabled",
      pageIndex: 1,
      pageSize: 1000,
    };
    await sensitiveRuleApi.getPaging(queryParams).then((res) => {
      const transformedData = res.items.map((item, i) => ({
        key: item.id,
        title: item.name || `content${i + 1}`,
        description: item.content || `description of content${i + 1}`,
        tag: item.tag || `Tag${i % 3}`,
      }));
      setMockData(transformedData);
      setTargetKeys([]);
      getSelectCommandIs(transformedData.length)
    });
  };

  useEffect(() => {
    const getItem = async () => {
      let data = await api.getById(id);
      if (data) {
        const safeSplit = (str) =>
          String(str || '').split(',').filter(Boolean);

        form.setFieldsValue(data);
        form.setFieldsValue({
          fileExte: safeSplit(data.fileExte),
          engine: safeSplit(data.engine),
        });
        getSRules();
      }
    };

    if (visible) {
      if (id) {
        getItem();
      } else {
        form.setFieldsValue({});
        getSRules();
      }
    } else {
      form.resetFields();
    }
  }, [visible, id, worker, form]);


  const [isMini, setIsMini] = useState(true);

  // 动态更新宽度
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) { // 判断屏幕宽度
        setIsMini(true);
        // document.body.style.overflow = 'hidden';
      } else {
        setIsMini(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始时执行一次

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleChange = (value) => {
    // console.log(`selected ${value}`);
  };
  const onChange = (checkedValues) => {
    // console.log('checked = ', checkedValues);
  };
  const plainOptions = ['敏感规则引擎', 'AI大模型引擎'];

  return (
    <Modal
      width={isMini ? '100%' : '60%'}
      title={id ? '更新敏感策略' : '新建敏感策略'}
      visible={visible}
      maskClosable={false}
      destroyOnClose={true}
      onOk={() => {

        form
          .validateFields()
          .then(async (values) => {

            values.fileExte = Array.isArray(values.fileExte) ? values.fileExte.join(",") : "";
            values.engine = Array.isArray(values.engine) ? values.engine.join(",") : "";

            let ok = await handleOk(values);
            if (ok) {
              form.resetFields();
            }
          });
      }}
      onCancel={() => {
        form.resetFields();
        handleCancel();
      }}
      confirmLoading={confirmLoading}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} {...formItemLayout}>
        <Form.Item name="id" noStyle>
          <Input hidden={true} />
        </Form.Item>

        <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="请输入名称" />
        </Form.Item>

        <Form.Item label="内容" name="content">
          <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder="说明解释敏感策略" />
        </Form.Item>

        <Form.Item label="敏感引擎" name="engine" rules={[{ required: true, message: '请输入名称' }]} help="AI大模型需要先在设置中配置后使用">
          <Checkbox.Group options={plainOptions} defaultValue={['敏感规则引擎']} onChange={onChange} />
        </Form.Item>

        <Form.Item label="文件类型" name="fileExte">
          <Select
            mode="tags"
            style={{ width: '100%', }}
            placeholder="请选择包含的文件类型"
            onChange={handleChange}
            options={fileExtensionOptions}
          />
        </Form.Item>


        <Form.Item label="敏感规则" name="ruleIds" rules={[{ required: true, message: '请输入选择敏感规则' }]}>
          <TableTransfer
            dataSource={mockData}
            targetKeys={targetKeys}
            disabled={disabled}
            showSearch={true}
            onChange={setTargetKeys}
            filterOption={(inputValue, item) =>
              item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
            }
            leftColumns={leftTableColumns}
            rightColumns={rightTableColumns}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SensitiveRuleModal;