import os
from flask import Flask, render_template, request, redirect, url_for, session, flash

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# 上传文件存储路径
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 模拟的用户数据
users = {'Alice': '010128'}

# 模拟的文章数据
articles = []

# 确保上传文件夹存在
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 首页路由
@app.route('/')
def index():
    return render_template('index.html')

# 投资组合页面
@app.route('/portfolio')
def portfolio():
    user_is_logged_in = 'username' in session
    return render_template('portfolio.html', user_is_logged_in=user_is_logged_in, articles=articles)

# 登录页面
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users and users[username] == password:
            session['username'] = username
            return redirect(url_for('portfolio'))
        else:
            return '登录失败，请检查用户名和密码。'
    return '''
    <form method="post">
        用户名: <input type="text" name="username">
        密码: <input type="password" name="password">
        <button type="submit">登录</button>
    </form>
    '''

# 退出登录
@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('portfolio'))

# 上传 PDF 文件
@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    if 'username' not in session:
        return redirect(url_for('login'))

    # 获取上传的文件
    file = request.files['pdf_file']
    if file and file.filename.endswith('.pdf'):
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # 保存文件信息
        articles.append({'filename': filename, 'author': session['username']})

        flash('文件上传成功！')
    else:
        flash('上传失败：只允许上传 PDF 文件。')
    
    return redirect(url_for('portfolio'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
