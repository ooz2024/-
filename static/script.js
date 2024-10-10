// 获取页面中的元素
const fileInput = document.getElementById('fileInput');
const pendingList = document.getElementById('pending-list');
const uploadArea = document.getElementById('upload-area');
let selectedFiles = [];

// 文件选择器选择文件时
fileInput.addEventListener('change', (event) => {
    handleFiles(event.target.files);
});

// 拖拽文件到上传区域
uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.classList.add('dragging');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragging');
});

uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadArea.classList.remove('dragging');
    handleFiles(event.dataTransfer.files);
});

// 处理选中的文件
function handleFiles(files) {
    selectedFiles = [...files];
    pendingList.innerHTML = '';
    selectedFiles.forEach((file) => {
        const li = document.createElement('li');
        li.textContent = file.name;
        pendingList.appendChild(li);
    });
}

// 转换按钮点击事件
const convertBtn = document.getElementById('convertBtn');
convertBtn.addEventListener('click', () => {
    if (selectedFiles.length === 0) {
        alert('请选择文件或拖拽文件！');
        return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
        formData.append('file', file);
    });
    
    // 添加选择的格式
    const format = document.getElementById('format').value;
    formData.append('format', format);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
        const convertedList = document.getElementById('converted-list');
        convertedList.innerHTML = '';
        data.converted_files.forEach((file) => {
            const li = document.createElement('li');
            li.textContent = file;
            li.dataset.filename = file; // 保存文件名到数据属性中
            convertedList.appendChild(li);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// 保存功能
const saveBtn = document.getElementById('saveBtn');
saveBtn.addEventListener('click', () => {
    const convertedFiles = Array.from(document.querySelectorAll('#converted-list li')).map(li => li.dataset.filename);
    if (convertedFiles.length === 0) {
        alert('没有文件可以保存！');
        return;
    }

    convertedFiles.forEach((filename) => {
        const link = document.createElement('a');
        link.href = `/download/${filename}`; // 使用 Flask 路由下载文件
        link.download = filename; // 设置下载的文件名
        document.body.appendChild(link);
        link.click(); // 触发点击事件
        document.body.removeChild(link); // 移除链接
    });

    alert('保存成功！');
});
