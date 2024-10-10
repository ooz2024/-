from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
from PIL import Image  # 用于图像处理
from moviepy.editor import VideoFileClip  # 用于视频处理

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi'}

# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    uploaded_files = request.files.getlist('file')
    format_choice = request.form.get('format')
    uploaded_file_names = []
    converted_files = []

    for file in uploaded_files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            uploaded_file_names.append(filename)

            # 调试：输出文件保存的路径
            print(f"Uploaded file saved at: {file_path}")

            # 实际转换逻辑
            converted_filename = f"{os.path.splitext(filename)[0]}.{format_choice}"  # 生成转换后的文件名
            converted_file_path = os.path.join(app.config['UPLOAD_FOLDER'], converted_filename)

            if filename.lower().endswith(('png', 'jpg', 'jpeg', 'gif')):
                # 图像转换
                img = Image.open(file_path)
                img.convert('RGB').save(converted_file_path, format=format_choice.upper())
            elif filename.lower().endswith(('mp4', 'avi')):
                # 视频转换
                video = VideoFileClip(file_path)
                video.write_videofile(converted_file_path, codec='libx264')

            converted_files.append(converted_filename)

            # 调试：输出转换后的文件路径
            print(f"Converted file saved at: {converted_file_path}")

    return jsonify({'uploaded_files': uploaded_file_names, 'converted_files': converted_files})

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
