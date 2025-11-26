# EmailJS 配置指南

## 📋 EmailJS 介绍

EmailJS 是一个免费的邮件服务，可以直接在前端发送邮件，无需后端服务器。

## 🚀 快速配置

### 步骤1：注册 EmailJS 账户
1. 访问 [EmailJS 官网](https://www.emailjs.com/)
2. 点击 "Sign Up Free" 注册免费账户
3. 验证邮箱（会收到验证邮件）

### 步骤2：创建邮件服务
1. 登录 EmailJS 控制台
2. 点击 "Add New Email Service"
3. 选择邮件提供商（推荐 Gmail）：
   - Gmail: 免费，需要配置应用密码
   - Outlook: 免费
   - 其他自定义 SMTP: 可能需要付费

### 步骤3：配置 Gmail（推荐）

#### 3.1 启用两步验证
1. 登录您的 Google 账户
2. 前往 [安全性设置](https://myaccount.google.com/security)
3. 启用两步验证（如果未启用）

#### 3.2 生成应用密码
1. 前往 [应用密码页面](https://myaccount.google.com/apppasswords)
2. 选择 "选择应用" → "其他（自定义名称）"
3. 输入应用名称：`酒店员工管理系统`
4. 点击 "生成" 获取16位应用密码
5. **重要：复制生成的密码**

#### 3.3 在 EmailJS 中配置 Gmail
1. 在 EmailJS 中选择 "Gmail" 服务
2. 输入您的 Gmail 地址
3. 输入刚才生成的应用密码（不是您的登录密码）
4. 测试连接

### 步骤4：创建邮件模板
1. 在 EmailJS 中点击 "Email Templates"
2. 创建新模板：
   - **模板ID**: `verification_template`
   - **模板名称**: `验证码邮件`
   - **主题**: `酒店员工管理系统 - 验证码`

#### 模板内容（HTML）：
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1>酒店员工管理系统</h1>
        <p>邮箱验证码</p>
    </div>

    <div style="background: #f8f9fa; padding: 30px; border: 1px solid #dee2e6;">
        <p>您好！</p>
        <p>您正在使用邮箱 <strong>{{to_email}}</strong> 进行身份验证。</p>

        <div style="background: white; border: 2px dashed #007bff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d;">您的验证码是：</p>
            <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">
                {{verification_code}}
            </div>
        </div>

        <p style="font-size: 14px; color: #6c757d;">
            验证码有效期为 <strong>10分钟</strong>，请及时使用。<br>
            如果这不是您本人操作，请忽略此邮件。
        </p>
    </div>

    <div style="background: #f8f9fa; padding: 15px; text-align: center; border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 12px; color: #6c757d;">
            此邮件由酒店员工管理系统自动发送，请勿回复。<br>
            如有疑问，请联系系统管理员。
        </p>
    </div>
</div>
```

### 步骤5：获取配置信息
1. 在 EmailJS 控制台中找到：
   - **Service ID**: 类似 `service_xxxxxxx`
   - **Template ID**: 类似 `template_xxxxxxx`
   - **Public Key**: 类似 `xxxxxxxxxxxxxxxxxxxxxxxx`

## ⚙️ 配置代码

### 修改配置文件
编辑 `js/email-service-real.js` 中的配置：

```javascript
this.emailjsConfig = {
    serviceID: 'service_xxxxxxx',        // 替换为您的 Service ID
    templateID: 'template_xxxxxxx',      // 替换为您的 Template ID
    publicKey: 'your_public_key_here'      // 替换为您的 Public Key
};
```

### 更新HTML文件引用
在 `auth-new.html` 中将邮件服务引用改为：

```html
<script src="js/email-service-real.js"></script>
```

## 📧 测试配置

### 本地测试
1. 配置完成后，刷新页面
2. 输入您的邮箱地址
3. 输入正确的验证码
4. 点击发送，检查是否收到邮件

### 测试清单
- [ ] Gmail 配置正确
- [ ] 应用密码生成成功
- [ ] EmailJS 模板创建成功
- [ ] 代码配置正确
- [ ] 本地测试发送成功

## 🔒 安全注意事项

### Gmail 应用密码
- 这是应用专用密码，不是您的登录密码
- 只在 EmailJS 中使用，不要告诉他人
- 可以随时撤销，重新生成

### API 密钥保护
- Public Key 可以在前端公开使用
- 不要将 Service ID 和 Template ID 硬编码在公共仓库中
- 考虑使用环境变量管理敏感信息

## 🆘 故障排除

### 常见问题

1. **Gmail 连接失败**
   - 检查是否启用了两步验证
   - 确认使用应用密码，不是登录密码
   - 检查 Gmail 限制（每天发送限制）

2. **邮件发送失败**
   - 检查 EmailJS 配置是否正确
   - 查看浏览器控制台错误信息
   - 确认模板变量名称正确

3. **收不到邮件**
   - 检查垃圾邮件文件夹
   - 确认邮箱地址正确
   - 查看 EmailJS 发送历史

## 💡 替代方案

如果不想使用 EmailJS，可以考虑：

1. **Supabase Edge Functions**
   - 需要部署云函数
   - 可以使用更多邮件服务
   - 配置更复杂

2. **第三方 SMTP 服务**
   - Resend.com（推荐）
   - SendGrid.com
   - AWS SES

3. **后端邮件服务**
   - Node.js + Nodemailer
   - PHP + PHPMailer
   - 需要服务器部署

## 📞 技术支持

如果配置遇到问题：
1. 查看浏览器开发者工具控制台
2. 检查 EmailJS 文档
3. 联系开发团队

---

**配置完成后，您的系统就可以发送真实的验证邮件了！**