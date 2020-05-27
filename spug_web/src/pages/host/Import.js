/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { Modal, Form, Input, Upload, Icon, Button, Tooltip, Alert } from 'antd';
import http from 'libs/http';
import store from './store';

@observer
class ComImport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      password: null,
      fileList: [],
    }
  }

  handleSubmit = () => {
    this.setState({loading: true});
    const formData = new FormData();
    formData.append('file', this.state.fileList[0]);
    formData.append('password', this.state.password);
    http.post('/api/host/import/', formData)
      .then(res => {
        Modal.info({
          title: '导入结果',
          content: <Form labelCol={{span: 5}} wrapperCol={{span: 14}}>
            <Form.Item style={{margin: 0}} label="导入成功">{res.success.length}</Form.Item>
            {res['fail'].length > 0 && <Form.Item style={{margin: 0, color: '#1890ff'}} label="验证失败">
              <Tooltip title={`相关行：${res['fail'].join(', ')}`}>{res['fail'].length}</Tooltip>
            </Form.Item>}
            {res['skip'].length > 0 && <Form.Item style={{margin: 0, color: '#1890ff'}} label="重复数据">
              <Tooltip title={`相关行：${res['skip'].join(', ')}`}>{res['skip'].length}</Tooltip>
            </Form.Item>}
            {res['invalid'].length > 0 && <Form.Item style={{margin: 0, color: '#1890ff'}} label="无效数据">
              <Tooltip title={`相关行：${res['invalid'].join(', ')}`}>{res['invalid'].length}</Tooltip>
            </Form.Item>}
          </Form>
        })
      })
      .finally(() => this.setState({loading: false}))
  };

  beforeUpload = (file) => {
    this.setState({fileList: [file]});
    return false
  };

  render() {
    return (
      <Modal
        visible
        width={800}
        maskClosable={false}
        title="批量导入"
        okText="导入"
        onCancel={() => store.importVisible = false}
        confirmLoading={this.state.loading}
        okButtonProps={{disabled: !this.state.fileList.length}}
        onOk={this.handleSubmit}>
        <Alert closable showIcon type="info" message={null}
               style={{width: 600, margin: '0 auto 20px', color: '#31708f !important'}}
               description="导入或输入的密码仅作首次验证使用，并不会存储密码。"/>
        <Form labelCol={{span: 6}} wrapperCol={{span: 14}}>
          <Form.Item label="模板下载" help="请下载使用该模板填充数据后导入">
            <a href="/resource/主机导入模板.xlsx">主机导入模板.xlsx</a>
          </Form.Item>
          <Form.Item label="默认密码" help="如果excel中密码为空则使用该密码">
            <Input
              value={this.state.password}
              onChange={e => this.setState({password: e.target.value})}
              placeholder="请输入默认主机密码"/>
          </Form.Item>
          <Form.Item required label="导入数据">
            <Upload name="file" accept=".xls, .xlsx" fileList={this.state.fileList} beforeUpload={this.beforeUpload}>
              <Button>
                <Icon type="upload"/> 点击上传
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default ComImport
