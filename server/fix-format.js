const fs = require('fs');
const path = require('path');

const taskFolderPath = path.join(__dirname, 'task');
const fileFolderPath = path.join(__dirname, 'file');

// Task 폴더 수정
console.log('Task 폴더 파일 수정 중...');
const taskFiles = fs.readdirSync(taskFolderPath).filter(file => file.endsWith('.txt'));

taskFiles.forEach(file => {
  const filePath = path.join(taskFolderPath, file);
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);
    
    // 새로운 포맷으로 변환 (기존 데이터 유지)
    const newData = {
      title: data.title || '',
      subtitle: data.subtitle || '',
      keywords: data.keywords || '',
      content: data.content || '',
      created_at: data.created_at || data.updatedData || new Date().toISOString(),
      updated_at: data.updated_at || data.updatedData || new Date().toISOString(),
      position_x: data.position_x || 0,
      position_y: data.position_y || 0
    };
    
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');
    console.log(`✓ ${file}`);
  } catch (error) {
    console.error(`✗ ${file}: ${error.message}`);
  }
});

// File 폴더 수정
console.log('\nFile 폴더 파일 수정 중...');
const files = fs.readdirSync(fileFolderPath).filter(file => file.endsWith('.txt'));

files.forEach(file => {
  const filePath = path.join(fileFolderPath, file);
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);
    
    // 파일 폴더는 다른 구조이므로 updated_at만 확인
    if (!data.updated_at && data.updatedData) {
      data.updated_at = data.updatedData;
      delete data.updatedData;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`✓ ${file}`);
    } else if (data.updated_at) {
      console.log(`✓ ${file} (이미 수정됨)`);
    } else {
      console.log(`? ${file} (수정 필요 확인)`);
    }
  } catch (error) {
    console.error(`✗ ${file}: ${error.message}`);
  }
});

console.log('\n포맷 수정 완료!');
