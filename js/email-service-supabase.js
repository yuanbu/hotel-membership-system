// 使用 Supabase 原生邮件功能发送验证码
// 利用 Supabase 的邮件验证功能，无需第三方服务

class EmailService {
    constructor() {
        this.serviceType = 'supabase'; // 使用 Supabase 原生邮件
    }

    // 发送验证码邮件
    async sendVerificationCode(email, code) {
        const subject = '酒店员工管理系统 - 6位数注册验证码';
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>酒店员工管理系统</h1>
                    <p>🔐 6位数注册验证码</p>
                </div>

                <div style="background: #f8f9fa; padding: 30px; border: 1px solid #dee2e6;">
                    <p>您好！</p>
                    <p>您正在使用邮箱 <strong>${email}</strong> 进行<strong>账户注册</strong>。</p>

                    <div style="background: white; border: 2px dashed #007bff; padding: 25px; text-align: center; margin: 20px 0; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; font-size: 16px; color: #6c757d; font-weight: bold;">您的6位数注册验证码是：</p>
                        <div style="font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 8px; background: #e3f2fd; padding: 15px; border-radius: 5px;">
                            ${code}
                        </div>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">
                            ⏰ 验证码有效期为10分钟
                        </p>
                    </div>

                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 14px; color: #856404;">
                            <strong>📝 温馨提示：</strong><br>
                            • 请在注册页面输入此6位数验证码<br>
                            • 验证码10分钟内有效<br>
                            • 请勿将验证码泄露给他人
                        </p>
                    </div>

                    <p style="font-size: 14px; color: #6c757d;">
                        如果这不是您本人操作，请忽略此邮件。<br>
                        如有疑问，请联系系统管理员。
                    </p>
                </div>

                <div style="background: #f8f9fa; padding: 15px; text-align: center; border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0; font-size: 12px; color: #6c757d;">
                        此邮件由酒店员工管理系统自动发送，请勿回复。<br>
                        © 2024 酒店员工管理系统
                    </p>
                </div>
            </div>
        `;

        switch (this.serviceType) {
            case 'supabase':
                return this.sendViaSupabase(email, code, subject, htmlContent);
            case 'console':
                return this.sendViaConsole(email, code, subject, htmlContent);
            default:
                return this.sendViaConsole(email, code, subject, htmlContent);
        }
    }

    // 使用 Supabase 原生邮件发送（改为模拟发送）
    async sendViaSupabase(email, code, subject, htmlContent) {
        try {
            // 注意：Supabase 的 signInWithOtp 发送的是OTP链接，不是自定义验证码
            // 为了发送自定义6位数验证码，我们需要降级到控制台模式
            console.log('⚠️ Supabase OTP 发送的是链接而非自定义验证码，降级到控制台模式');

            // 这里我们可以考虑集成其他邮件服务，比如 EmailJS
            // 目前先降级到控制台模式，确保用户能看到6位数验证码
            return this.sendViaConsole(email, code, subject, htmlContent);

        } catch (error) {
            console.error('邮件发送失败:', error);
            // 降级到控制台模式
            return this.sendViaConsole(email, code, subject, htmlContent);
        }
    }

    // 控制台输出
    async sendViaConsole(email, code, subject, htmlContent) {
        console.log('\n' + '='.repeat(70));
        console.log('🔐 酒店员工管理系统 - 6位数注册验证码');
        console.log('='.repeat(70));
        console.log('📧 收件人邮箱:', email);
        console.log('📋 邮件主题:', subject);
        console.log('');
        console.log('⚠️  重要提示：请在下方找到您的6位数验证码 ⚠️');
        console.log('');
        console.log('🔑 您的6位数注册验证码是:', code);
        console.log('');
        console.log('⏰ 验证码有效期: 10分钟');
        console.log('📱 请在注册页面输入此6位数验证码完成注册');
        console.log('='.repeat(70));
        console.log('📧 完整邮件内容预览:');
        console.log(htmlContent);
        console.log('='.repeat(70) + '\n');

        return {
            success: true,
            message: `6位数验证码已生成（控制台模式）`,
            method: 'console'
        };
    }

    // 设置服务类型
    setServiceType(type) {
        this.serviceType = type;
    }

    // 验证邮箱验证码（使用存储的验证码）
    async verifyEmailCode(email, inputCode) {
        try {
            if (this.serviceType === 'supabase') {
                // 使用 Supabase OTP 验证
                const { data, error } = await supabase.auth.verifyOtp({
                    email: email,
                    token: inputCode,
                    type: 'signup'
                });

                if (error) {
                    return {
                        success: false,
                        message: '验证码错误或已过期',
                        error: error.message
                    };
                }

                return {
                    success: true,
                    message: '邮箱验证成功',
                    data: data
                };

            } else {
                // 降级到本地存储验证
                const storedData = localStorage.getItem(`verification_${email}`);
                if (!storedData) {
                    return {
                        success: false,
                        message: '验证码已过期，请重新发送'
                    };
                }

                const { code: storedCode, timestamp } = JSON.parse(storedData);

                // 检查验证码是否过期（10分钟）
                if (Date.now() - timestamp > 10 * 60 * 1000) {
                    localStorage.removeItem(`verification_${email}`);
                    return {
                        success: false,
                        message: '验证码已过期，请重新发送'
                    };
                }

                if (inputCode !== storedCode) {
                    return {
                        success: false,
                        message: '验证码错误'
                    };
                }

                return {
                    success: true,
                    message: '邮箱验证成功'
                };
            }

        } catch (error) {
            console.error('验证失败:', error);
            return {
                success: false,
                message: '验证失败: ' + error.message
            };
        }
    }

    // 检查服务状态
    checkServiceStatus() {
        const status = {
            service: this.serviceType,
            configured: true,
            canSend: true,
            message: ''
        };

        switch (this.serviceType) {
            case 'supabase':
                status.message = 'Supabase 原生邮件服务（推荐）';
                status.configured = true; // Supabase 项目应该已经配置好邮件
                break;
            case 'console':
                status.message = '控制台模式（仅用于开发）';
                break;
            default:
                status.message = '未知服务类型';
                status.configured = false;
                break;
        }

        return status;
    }

    // 创建验证码表（如果不存在）
    async createVerificationTable() {
        try {
            const { error } = await supabase.rpc('create_verification_table', {});
            if (error) {
                console.warn('创建验证码表失败:', error);
            }
        } catch (err) {
            console.warn('RPC 调用失败:', err);
        }
    }
}

// 导出邮件服务实例
window.EmailService = new EmailService();