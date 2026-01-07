import { FileOutlined, FolderOutlined } from '@ant-design/icons';
import { Spin, TreeSelect } from "antd";
import React, { useEffect, useState } from 'react';
const FileTree = ({ data, lastOwner, open, handleOk, handleCancel }) => {

  let [confirmLoading, setConfirmLoading] = useState(false);
  let [owner, setOwner] = useState(lastOwner);

  const [selectedPath, setSelectedPath] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // 树节点展开回调
  const onTreeExpand = (expandedKeys) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  // 选择节点回调（关键修改）
  const onChange = (value, node, selectItemObj) => {
    if (node) {
      // 获取完整路径（通过 node.props.dataRef.path）
      // console.log('当前路径 selectItemObj :', selectItemObj);
      // console.log('当前路径 value :', value);
      // console.log('当前路径 node :', node);
      const apiResponse = node.join('/');
      const pathArray = apiResponse.split(',');
      const fullPath = pathArray.join('/');
      setSelectedPath(fullPath);
      setTaskType(selectItemObj.triggerNode.props.flag);
      // console.log('选中路径:', fullPath);
      handleOk(fullPath, selectItemObj.triggerNode.props.flag);
    }
  };
  let [taskType, setTaskType] = useState(0);
  let [treeData, setTreeData] = useState([]);
  // 递归格式化函数：处理目录/文件标识和图标
  const formatTreeData = (nodes, parentPath = []) => {
    return nodes.map((node) => {
      // 当前节点路径 = 父路径 + 当前节点名称
      const currentPath = [...parentPath, node.name];

      const formattedNode = {
        title: (
          <span>
            {node.flag === '1' ? (
              <FolderOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            ) : (
              <FileOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            )}
            {node.name}
          </span>
        ),
        value: currentPath.join('/'), // 值改为完整路径
        key: node.flag || node.name,
        isLeaf: node.flag === '2',
        flag: node.flag,
        // 新增 path 字段用于路径追踪
        path: currentPath
      };

      // 目录节点处理逻辑
      if (node.flag === '1') {
        // 确保 children 存在，即使为空数组
        formattedNode.children = node.children?.length
          ? formatTreeData(node.children, currentPath)
          : [];
      }

      return formattedNode;
    });
  };
  useEffect(() => {
    const formattedData = formatTreeData(data);
    setTreeData(formattedData);
  }, [data]);
  
  return (
    <div>
      <div>提示信息:请选择导入信息</div>
      <Spin spinning={false}>
        <TreeSelect
          treeLine
          showSearch
          style={{ width: '100%', }}
          value={selectedPath}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto', }}
          placeholder="Please select"
          allowClear
          treeDefaultExpandAll
          onChange={onChange}
          treeData={treeData}
          treeExpandedKeys={expandedKeys}
          onTreeExpand={onTreeExpand}
          autoExpandParent={autoExpandParent}
          treeNodeLabelProp="path" // 显示完整路径
        />
      </Spin>
    </div>
  );
};

export default FileTree;